import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminProductService } from '../services/product.service';

@Component({
  selector: 'app-product-dialog',
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="productForm" class="product-form">
        <!-- Basic Information -->
        <div class="form-section">
          <h3>Basic Information</h3>
          
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Product Name</mat-label>
              <input matInput formControlName="name" placeholder="Enter product name">
              <mat-error *ngIf="productForm.get('name')?.hasError('required')">
                Product name is required
              </mat-error>
            </mat-form-field>
          </div>
          
          <div class="form-row">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Description</mat-label>
              <textarea matInput formControlName="description" rows="3" placeholder="Enter product description"></textarea>
              <mat-error *ngIf="productForm.get('description')?.hasError('required')">
                Description is required
              </mat-error>
            </mat-form-field>
          </div>
          
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Brand</mat-label>
              <input matInput formControlName="brand" placeholder="Enter brand name">
              <mat-error *ngIf="productForm.get('brand')?.hasError('required')">
                Brand is required
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option *ngFor="let category of categories" [value]="category.value">
                  {{ category.label }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="productForm.get('category')?.hasError('required')">
                Category is required
              </mat-error>
            </mat-form-field>
          </div>
          
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Subcategory</mat-label>
              <mat-select formControlName="subcategory">
                <mat-option *ngFor="let subcategory of getSubcategories()" [value]="subcategory.value">
                  {{ subcategory.label }}
                </mat-option>
              </mat-select>
              <mat-error *ngIf="productForm.get('subcategory')?.hasError('required')">
                Subcategory is required
              </mat-error>
            </mat-form-field>
          </div>
        </div>
        
        <!-- Pricing -->
        <div class="form-section">
          <h3>Pricing</h3>
          
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Price (₹)</mat-label>
              <input matInput type="number" formControlName="price" placeholder="0">
              <mat-error *ngIf="productForm.get('price')?.hasError('required')">
                Price is required
              </mat-error>
              <mat-error *ngIf="productForm.get('price')?.hasError('min')">
                Price must be greater than 0
              </mat-error>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Original Price (₹)</mat-label>
              <input matInput type="number" formControlName="originalPrice" placeholder="0">
            </mat-form-field>
          </div>
          
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Discount (%)</mat-label>
              <input matInput type="number" formControlName="discount" placeholder="0" min="0" max="100">
            </mat-form-field>
          </div>
        </div>
        
        <!-- Product Options -->
        <div class="form-section">
          <h3>Product Options</h3>
          
          <div class="form-row">
            <mat-slide-toggle formControlName="isActive" color="primary">
              Active Product
            </mat-slide-toggle>
          </div>
          
          <div class="form-row">
            <mat-slide-toggle formControlName="isFeatured" color="primary">
              Featured Product
            </mat-slide-toggle>
          </div>
        </div>
      </form>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="productForm.invalid || isLoading"
              (click)="onSave()">
        <mat-spinner *ngIf="isLoading" diameter="20" class="save-spinner"></mat-spinner>
        {{ isEditMode ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styleUrls: ['./product-dialog.component.scss']
})
export class ProductDialogComponent implements OnInit {
  productForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  
  categories = [
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
    { value: 'children', label: 'Children' }
  ];
  
  subcategoriesMap: { [key: string]: any[] } = {
    men: [
      { value: 'shirts', label: 'Shirts' },
      { value: 'pants', label: 'Pants' },
      { value: 'tops', label: 'Tops' },
      { value: 'jackets', label: 'Jackets' },
      { value: 'shoes', label: 'Shoes' }
    ],
    women: [
      { value: 'dresses', label: 'Dresses' },
      { value: 'tops', label: 'Tops' },
      { value: 'pants', label: 'Pants' },
      { value: 'skirts', label: 'Skirts' },
      { value: 'shoes', label: 'Shoes' }
    ],
    children: [
      { value: 'tops', label: 'Tops' },
      { value: 'pants', label: 'Pants' },
      { value: 'dresses', label: 'Dresses' },
      { value: 'shoes', label: 'Shoes' }
    ]
  };

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private productService: AdminProductService,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = !!data;
  }

  ngOnInit(): void {
    this.createForm();
    if (this.isEditMode) {
      this.populateForm();
    }
  }

  createForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      brand: ['', [Validators.required]],
      category: ['', [Validators.required]],
      subcategory: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(1)]],
      originalPrice: [0],
      discount: [0, [Validators.min(0), Validators.max(100)]],
      isActive: [true],
      isFeatured: [false]
    });
  }

  populateForm(): void {
    if (this.data) {
      this.productForm.patchValue({
        name: this.data.name,
        description: this.data.description,
        brand: this.data.brand,
        category: this.data.category,
        subcategory: this.data.subcategory,
        price: this.data.price,
        originalPrice: this.data.originalPrice,
        discount: this.data.discount,
        isActive: this.data.isActive,
        isFeatured: this.data.isFeatured
      });
    }
  }

  getSubcategories(): any[] {
    const category = this.productForm.get('category')?.value;
    return this.subcategoriesMap[category] || [];
  }

  onSave(): void {
    if (this.productForm.valid) {
      this.isLoading = true;
      
      const formData = this.productForm.value;
      
      // Simulate API call
      setTimeout(() => {
        this.isLoading = false;
        this.snackBar.open(
          this.isEditMode ? 'Product updated successfully' : 'Product created successfully',
          'Close',
          { duration: 3000 }
        );
        this.dialogRef.close(formData);
      }, 1000);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
