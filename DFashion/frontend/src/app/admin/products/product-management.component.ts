import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { AdminProductService, Product } from '../services/product.service';
import { ProductDialogComponent } from './product-dialog.component';

@Component({
  selector: 'app-product-management',
  template: `
    <div class="product-management">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Product Management</mat-card-title>
          <mat-card-subtitle>Manage products, inventory, and pricing</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Filters -->
          <div class="filters-section">
            <mat-form-field appearance="outline">
              <mat-label>Search products</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Search by name, brand, or category">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select [formControl]="categoryFilter">
                <mat-option *ngFor="let category of categories" [value]="category.value">
                  {{ category.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [formControl]="statusFilter">
                <mat-option *ngFor="let status of statuses" [value]="status.value">
                  {{ status.label }}
                </mat-option>
              </mat-select>
            </mat-form-field>
            
            <button mat-raised-button color="primary" (click)="openProductDialog()">
              <mat-icon>add</mat-icon>
              Add Product
            </button>
          </div>
          
          <!-- Products Table -->
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <!-- Product Column -->
              <ng-container matColumnDef="product">
                <th mat-header-cell *matHeaderCellDef>Product</th>
                <td mat-cell *matCellDef="let product">
                  <div class="product-cell">
                    <img [src]="getProductImage(product)" [alt]="product.name" class="product-image">
                    <div class="product-info">
                      <div class="product-name">{{ product.name }}</div>
                      <div class="product-brand">{{ product.brand }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>
              
              <!-- Category Column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
                <td mat-cell *matCellDef="let product">
                  <span class="category-text">{{ product.category | titlecase }}</span>
                  <br>
                  <small class="subcategory-text">{{ product.subcategory | titlecase }}</small>
                </td>
              </ng-container>
              
              <!-- Price Column -->
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Price</th>
                <td mat-cell *matCellDef="let product">
                  <div class="price-cell">
                    <span class="current-price">₹{{ product.price }}</span>
                    <span *ngIf="product.originalPrice" class="original-price">₹{{ product.originalPrice }}</span>
                    <span *ngIf="product.discount > 0" class="discount">{{ product.discount }}% OFF</span>
                  </div>
                </td>
              </ng-container>
              
              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let product">
                  <div class="status-indicator">
                    <div class="status-dot" [style.background-color]="getStatusColor(product)"></div>
                    <span class="status-text">{{ getStatusText(product) }}</span>
                  </div>
                </td>
              </ng-container>
              
              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let product">
                  <div class="actions-cell">
                    <button mat-icon-button matTooltip="Edit product" (click)="openProductDialog(product)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button 
                            [matTooltip]="product.isActive ? 'Deactivate product' : 'Activate product'"
                            (click)="toggleProductStatus(product)">
                      <mat-icon>{{ product.isActive ? 'visibility_off' : 'visibility' }}</mat-icon>
                    </button>
                    <button mat-icon-button matTooltip="Delete product" color="warn" (click)="deleteProduct(product)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
            
            <!-- No Data Message -->
            <div *ngIf="dataSource.data.length === 0" class="no-data">
              <mat-icon>inventory_2</mat-icon>
              <h3>No products found</h3>
              <p>Try adjusting your search criteria or add a new product.</p>
            </div>
          </div>
          
          <!-- Paginator -->
          <mat-paginator 
            [length]="totalProducts"
            [pageSize]="10"
            [pageSizeOptions]="[5, 10, 25, 50]"
            (page)="onPageChange()"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrls: ['./product-management.component.scss']
})
export class ProductManagementComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private destroy$ = new Subject<void>();
  
  displayedColumns: string[] = ['product', 'category', 'price', 'status', 'actions'];
  dataSource = new MatTableDataSource<Product>([]);
  isLoading = false;
  totalProducts = 0;
  
  // Filters
  searchControl = new FormControl('');
  categoryFilter = new FormControl('');
  statusFilter = new FormControl('');
  
  categories = [
    { value: '', label: 'All Categories' },
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'children', label: 'Children' }
  ];
  
  statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  constructor(
    private productService: AdminProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.setupFilters();
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupFilters(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.loadProducts();
    });

    [this.categoryFilter, this.statusFilter].forEach(control => {
      control.valueChanges.pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.loadProducts();
      });
    });
  }

  loadProducts(): void {
    this.isLoading = true;

    const filters = {
      search: this.searchControl.value || '',
      category: this.categoryFilter.value || '',
      status: this.statusFilter.value || '',
      page: this.paginator?.pageIndex ? this.paginator.pageIndex + 1 : 1,
      limit: this.paginator?.pageSize || 10
    };

    this.productService.getProducts(filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.dataSource.data = response.data.products;
          this.totalProducts = response.data.pagination.totalProducts;
        } else {
          this.dataSource.data = [];
          this.totalProducts = 0;
          this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.dataSource.data = [];
        this.totalProducts = 0;
        this.isLoading = false;
        this.snackBar.open('Error loading products', 'Close', { duration: 3000 });
      }
    });
  }

  onPageChange(): void {
    this.loadProducts();
  }

  openProductDialog(product?: Product): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '800px',
      data: product ? { ...product } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  toggleProductStatus(product: Product): void {
    const newStatus = !product.isActive;

    this.productService.updateProductStatus(product._id!, newStatus).subscribe({
      next: (response) => {
        if (response.success) {
          product.isActive = newStatus;
          this.snackBar.open(response.message, 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to update product status', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error updating product status:', error);
        this.snackBar.open('Error updating product status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product._id!).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open(response.message, 'Close', { duration: 3000 });
            this.loadProducts();
          } else {
            this.snackBar.open('Failed to delete product', 'Close', { duration: 3000 });
          }
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.snackBar.open('Error deleting product', 'Close', { duration: 3000 });
        }
      });
    }
  }

  getProductImage(product: Product): string {
    return product.images?.[0]?.url || '/assets/images/placeholder-product.jpg';
  }

  getStatusColor(product: Product): string {
    return product.isActive ? '#4caf50' : '#f44336';
  }

  getStatusText(product: Product): string {
    return product.isActive ? 'Active' : 'Inactive';
  }
}
