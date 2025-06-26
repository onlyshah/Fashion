import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-story',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-story.component.html',
  styleUrls: ['./create-story.component.scss']
})
export class CreateStoryComponent implements OnInit {
  storyForm: FormGroup;
  selectedMedia: any = null;
  taggedProducts: any[] = [];
  searchResults: any[] = [];
  uploading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.storyForm = this.fb.group({
      caption: ['', [Validators.maxLength(500)]],
      allowReplies: [true],
      showViewers: [true],
      highlightProducts: [true],
      duration: ['24']
    });
  }

  ngOnInit() {}

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedMedia = {
          file,
          preview: e.target.result,
          type: file.type,
          name: file.name
        };
      };
      reader.readAsDataURL(file);
    }
  }

  removeMedia() {
    this.selectedMedia = null;
  }

  searchProducts(event: any) {
    const query = event.target.value;
    if (query.length > 2) {
      // TODO: Implement actual product search API
      this.searchResults = [
        {
          _id: '1',
          name: 'Summer Dress',
          price: 2999,
          images: [{ url: '/assets/images/product1.jpg' }]
        },
        {
          _id: '2',
          name: 'Casual Shirt',
          price: 1599,
          images: [{ url: '/assets/images/product2.jpg' }]
        }
      ].filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    } else {
      this.searchResults = [];
    }
  }

  addProductTag(product: any) {
    if (!this.taggedProducts.find(p => p._id === product._id)) {
      this.taggedProducts.push(product);
    }
    this.searchResults = [];
  }

  removeProductTag(index: number) {
    this.taggedProducts.splice(index, 1);
  }

  saveDraft() {
    console.log('Saving as draft...');
  }

  onSubmit() {
    if (this.storyForm.valid && this.selectedMedia) {
      this.uploading = true;
      
      const storyData = {
        media: {
          type: this.selectedMedia.type.startsWith('image') ? 'image' : 'video',
          url: this.selectedMedia.preview // In real implementation, upload to server first
        },
        caption: this.storyForm.value.caption,
        products: this.taggedProducts.map(p => ({
          product: p._id,
          position: { x: 50, y: 50 }
        })),
        settings: {
          allowReplies: this.storyForm.value.allowReplies,
          showViewers: this.storyForm.value.showViewers,
          highlightProducts: this.storyForm.value.highlightProducts
        },
        duration: parseInt(this.storyForm.value.duration)
      };

      // Simulate API call
      setTimeout(() => {
        this.uploading = false;
        alert('Story created successfully!');
        this.router.navigate(['/vendor/stories']);
      }, 2000);
    }
  }
}
