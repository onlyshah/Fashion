import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-story-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './story-create.component.html',
  styleUrls: ['./story-create.component.scss']
})
export class StoryCreateComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoPreview') videoPreview!: ElementRef<HTMLVideoElement>;

  selectedMedia: File | null = null;
  mediaPreview: string = '';
  mediaType: 'image' | 'video' = 'image';
  caption: string = '';
  activeTools: string = '';
  uploading: boolean = false;
  
  showProductModal: boolean = false;
  productSearchQuery: string = '';
  searchResults: any[] = [];
  selectedProducts: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {}

  goBack() {
    this.router.navigate(['/social']);
  }

  selectFromGallery() {
    this.fileInput.nativeElement.click();
  }

  takePhoto() {
    // For web, this will open file picker with camera option
    this.fileInput.nativeElement.setAttribute('capture', 'environment');
    this.fileInput.nativeElement.click();
  }

  recordVideo() {
    // For web, this will open file picker with video option
    this.fileInput.nativeElement.setAttribute('accept', 'video/*');
    this.fileInput.nativeElement.setAttribute('capture', 'camcorder');
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedMedia = file;
      this.mediaType = file.type.startsWith('video/') ? 'video' : 'image';
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.mediaPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleTool(tool: string) {
    if (this.activeTools === tool) {
      this.activeTools = '';
    } else {
      this.activeTools = tool;
      
      if (tool === 'product') {
        this.showProductModal = true;
        this.searchProducts();
      }
    }
  }

  closeProductModal() {
    this.showProductModal = false;
    this.activeTools = '';
  }

  searchProducts() {
    // Search products from API
    const query = this.productSearchQuery || '';
    fetch(`http://10.0.2.2:5000/api/products/search?q=${encodeURIComponent(query)}&limit=20`) // Direct IP for testing
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.searchResults = data.products;
        }
      })
      .catch(error => {
        console.error('Error searching products:', error);
      });
  }

  selectProduct(product: any) {
    this.selectedProducts.push(product);
    this.closeProductModal();
    // TODO: Add product tag to story
  }

  shareStory() {
    if (!this.selectedMedia) return;

    this.uploading = true;

    const formData = new FormData();
    formData.append('media', this.selectedMedia);
    formData.append('caption', this.caption);
    formData.append('products', JSON.stringify(this.selectedProducts));

    fetch('http://localhost:5000/api/stories', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      this.uploading = false;
      if (data.success) {
        this.router.navigate(['/social']);
      } else {
        alert('Failed to share story. Please try again.');
      }
    })
    .catch(error => {
      this.uploading = false;
      console.error('Error sharing story:', error);
      alert('Failed to share story. Please try again.');
    });
  }
}
