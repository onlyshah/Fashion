import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.page.html',
  styleUrls: ['./create-post.page.scss'],
})
export class CreatePostPage implements OnInit {
  postForm: FormGroup;
  selectedMedia: any[] = [];
  taggedProducts: any[] = [];
  hashtags: string[] = [];
  searchResults: any[] = [];
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.postForm = this.fb.group({
      caption: ['', [Validators.required, Validators.maxLength(2000)]],
      allowComments: [true],
      allowSharing: [true]
    });
  }

  ngOnInit() {}

  async presentMediaActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Add Media',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            this.takePicture(CameraSource.Camera);
          }
        },
        {
          text: 'Photo Library',
          icon: 'images',
          handler: () => {
            this.takePicture(CameraSource.Photos);
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async takePicture(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source
      });

      if (image.dataUrl) {
        this.selectedMedia.push({
          type: 'image',
          url: image.dataUrl,
          preview: image.dataUrl
        });
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      this.presentToast('Error accessing camera', 'danger');
    }
  }

  removeMedia(index: number) {
    this.selectedMedia.splice(index, 1);
  }

  searchProducts(event: any) {
    const query = event.target.value;
    if (query && query.length > 2) {
      // Search products from API
      this.searchResults = [];
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

  addHashtag(event: any) {
    const tag = event.target.value.trim().replace('#', '');
    if (tag && !this.hashtags.includes(tag)) {
      this.hashtags.push(tag);
      event.target.value = '';
    }
  }

  removeHashtag(index: number) {
    this.hashtags.splice(index, 1);
  }

  async saveDraft() {
    const toast = await this.toastController.create({
      message: 'Draft saved successfully',
      duration: 2000,
      color: 'success'
    });
    toast.present();
  }

  async onSubmit() {
    if (this.postForm.valid && this.selectedMedia.length > 0) {
      const loading = await this.loadingController.create({
        message: 'Publishing post...'
      });
      await loading.present();

      this.isUploading = true;

      // TODO: Implement actual post creation API
      const postData = {
        caption: this.postForm.value.caption,
        media: this.selectedMedia,
        products: this.taggedProducts.map(p => ({
          product: p._id,
          position: { x: 50, y: 50 }
        })),
        hashtags: this.hashtags,
        settings: {
          allowComments: this.postForm.value.allowComments,
          allowSharing: this.postForm.value.allowSharing
        }
      };

      // Simulate API call
      setTimeout(async () => {
        this.isUploading = false;
        await loading.dismiss();
        
        const toast = await this.toastController.create({
          message: 'Post published successfully!',
          duration: 3000,
          color: 'success'
        });
        toast.present();
        
        this.router.navigate(['/vendor/posts']);
      }, 2000);
    } else {
      this.presentToast('Please add media and caption', 'warning');
    }
  }

  async presentToast(message: string, color: string = 'medium') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }

  goBack() {
    this.router.navigate(['/vendor']);
  }
}
