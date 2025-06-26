import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-create-story',
  templateUrl: './create-story.page.html',
  styleUrls: ['./create-story.page.scss'],
})
export class CreateStoryPage implements OnInit {
  storyForm: FormGroup;
  selectedMedia: any = null;
  taggedProducts: any[] = [];
  searchResults: any[] = [];
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private loadingController: LoadingController,
    private toastController: ToastController
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

  async presentMediaActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Add Story Media',
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
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source
      });

      if (image.dataUrl) {
        this.selectedMedia = {
          type: 'image',
          url: image.dataUrl,
          preview: image.dataUrl
        };
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      this.presentToast('Error accessing camera', 'danger');
    }
  }

  removeMedia() {
    this.selectedMedia = null;
  }

  searchProducts(event: any) {
    const query = event.target.value;
    if (query && query.length > 2) {
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

  async saveDraft() {
    const toast = await this.toastController.create({
      message: 'Draft saved successfully',
      duration: 2000,
      color: 'success'
    });
    toast.present();
  }

  async onSubmit() {
    if (this.storyForm.valid && this.selectedMedia) {
      const loading = await this.loadingController.create({
        message: 'Publishing story...'
      });
      await loading.present();

      this.isUploading = true;

      // TODO: Implement actual story creation API
      const storyData = {
        media: this.selectedMedia,
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
      setTimeout(async () => {
        this.isUploading = false;
        await loading.dismiss();
        
        const toast = await this.toastController.create({
          message: 'Story published successfully!',
          duration: 3000,
          color: 'success'
        });
        toast.present();
        
        this.router.navigate(['/vendor/stories']);
      }, 2000);
    } else {
      this.presentToast('Please add media for your story', 'warning');
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
