import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Platform, ActionSheetController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-content-modal',
  templateUrl: './create-content-modal.component.html',
  styleUrls: ['./create-content-modal.component.scss']
})
export class CreateContentModalComponent implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() createPost = new EventEmitter<any>();
  @Output() addStory = new EventEmitter<any>();
  @Output() createReel = new EventEmitter<any>();
  @Output() goLive = new EventEmitter<void>();
  @Output() moreOptions = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cameraVideo') cameraVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('cameraCanvas') cameraCanvas!: ElementRef<HTMLCanvasElement>;

  showCamera = false;
  flashEnabled = false;
  currentStream: MediaStream | null = null;
  facingMode: 'user' | 'environment' = 'user';

  // Mock drafts data
  drafts = [
    {
      id: '1',
      type: 'post',
      title: 'Summer Collection Preview',
      thumbnail: '/assets/images/default-post.svg',
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: '2',
      type: 'story',
      title: 'Behind the Scenes',
      thumbnail: '/assets/images/default-post.svg',
      updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
    }
  ];

  get isMobile(): boolean {
    return this.platform.is('mobile') || this.platform.is('mobileweb');
  }

  constructor(
    private platform: Platform,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    console.log('📱 Create Content Modal: Initialized');
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  onClose() {
    console.log('📱 Create Content Modal: Closing');
    this.stopCamera();
    this.close.emit();
  }

  onDismiss() {
    this.onClose();
  }

  // Create Options
  async onCreatePost() {
    console.log('📱 Create Content: Create Post');
    
    if (this.isMobile) {
      const actionSheet = await this.actionSheetController.create({
        header: 'Create Post',
        buttons: [
          {
            text: 'Take Photo',
            icon: 'camera',
            handler: () => this.onTakePhoto()
          },
          {
            text: 'Choose from Gallery',
            icon: 'images',
            handler: () => this.onSelectFromGallery()
          },
          {
            text: 'Cancel',
            icon: 'close',
            role: 'cancel'
          }
        ]
      });
      await actionSheet.present();
    } else {
      this.onSelectFromGallery();
    }
  }

  async onAddStory() {
    console.log('📱 Create Content: Add Story');
    
    if (this.isMobile) {
      const actionSheet = await this.actionSheetController.create({
        header: 'Add Story',
        buttons: [
          {
            text: 'Take Photo',
            icon: 'camera',
            handler: () => this.onTakePhoto('story')
          },
          {
            text: 'Record Video',
            icon: 'videocam',
            handler: () => this.onRecordVideo('story')
          },
          {
            text: 'Choose from Gallery',
            icon: 'images',
            handler: () => this.onSelectFromGallery('story')
          },
          {
            text: 'Cancel',
            icon: 'close',
            role: 'cancel'
          }
        ]
      });
      await actionSheet.present();
    } else {
      this.onSelectFromGallery('story');
    }
  }

  async onCreateReel() {
    console.log('📱 Create Content: Create Reel');
    
    if (this.isMobile) {
      const actionSheet = await this.actionSheetController.create({
        header: 'Create Reel',
        buttons: [
          {
            text: 'Record Video',
            icon: 'videocam',
            handler: () => this.onRecordVideo('reel')
          },
          {
            text: 'Choose from Gallery',
            icon: 'images',
            handler: () => this.onSelectFromGallery('reel')
          },
          {
            text: 'Cancel',
            icon: 'close',
            role: 'cancel'
          }
        ]
      });
      await actionSheet.present();
    } else {
      this.onSelectFromGallery('reel');
    }
  }

  async onGoLive() {
    console.log('📱 Create Content: Go Live');
    
    const toast = await this.toastController.create({
      message: 'Live streaming feature coming soon!',
      duration: 2000,
      position: 'bottom',
      color: 'primary'
    });
    await toast.present();
    
    this.goLive.emit();
  }

  onMoreOptions() {
    console.log('📱 Create Content: More Options');
    this.moreOptions.emit();
    this.onClose();
  }

  // Media Capture Methods
  onTakePhoto(type: string = 'post') {
    console.log('📱 Create Content: Take Photo for', type);
    this.showCamera = true;
    this.startCamera();
  }

  onSelectFromGallery(type: string = 'post') {
    console.log('📱 Create Content: Select from Gallery for', type);
    this.fileInput.nativeElement.setAttribute('data-type', type);
    this.fileInput.nativeElement.click();
  }

  onRecordVideo(type: string = 'post') {
    console.log('📱 Create Content: Record Video for', type);
    
    if (this.isMobile) {
      this.showCamera = true;
      this.startCamera();
    } else {
      this.onSelectFromGallery(type);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const type = input.getAttribute('data-type') || 'post';
    
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      console.log('📱 Create Content: Files selected for', type, files);
      
      switch (type) {
        case 'story':
          this.addStory.emit({ files, type });
          break;
        case 'reel':
          this.createReel.emit({ files, type });
          break;
        default:
          this.createPost.emit({ files, type });
      }
      
      this.onClose();
    }
  }

  // Camera Methods
  async startCamera() {
    try {
      const constraints = {
        video: {
          facingMode: this.facingMode,
          width: { ideal: 1080 },
          height: { ideal: 1920 }
        },
        audio: false
      };

      this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (this.cameraVideo?.nativeElement) {
        this.cameraVideo.nativeElement.srcObject = this.currentStream;
      }
    } catch (error) {
      console.error('❌ Error starting camera:', error);
      
      const toast = await this.toastController.create({
        message: 'Unable to access camera. Please check permissions.',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
      
      this.showCamera = false;
    }
  }

  stopCamera() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }
  }

  onCloseCamera() {
    this.showCamera = false;
    this.stopCamera();
  }

  onCameraDismiss() {
    this.stopCamera();
  }

  onSwitchCamera() {
    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
    this.stopCamera();
    this.startCamera();
  }

  onToggleFlash() {
    this.flashEnabled = !this.flashEnabled;
    // Flash implementation would go here
    console.log('📱 Flash toggled:', this.flashEnabled);
  }

  onCapture() {
    if (!this.cameraVideo?.nativeElement || !this.cameraCanvas?.nativeElement) return;

    const video = this.cameraVideo.nativeElement;
    const canvas = this.cameraCanvas.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        console.log('📱 Photo captured:', file);
        
        this.addStory.emit({ files: [file], type: 'story' });
        this.onCloseCamera();
        this.onClose();
      }
    }, 'image/jpeg', 0.9);
  }

  // Draft Methods
  onOpenDraft(draft: any) {
    console.log('📱 Opening draft:', draft);
    
    switch (draft.type) {
      case 'story':
        this.addStory.emit({ draft });
        break;
      case 'reel':
        this.createReel.emit({ draft });
        break;
      default:
        this.createPost.emit({ draft });
    }
    
    this.onClose();
  }

  async onDeleteDraft(draft: any, event: Event) {
    event.stopPropagation();
    console.log('📱 Deleting draft:', draft);
    
    const toast = await this.toastController.create({
      message: 'Draft deleted',
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
    
    this.drafts = this.drafts.filter(d => d.id !== draft.id);
  }

  // Utility Methods
  getDraftIcon(type: string): string {
    switch (type) {
      case 'story': return 'camera';
      case 'reel': return 'videocam';
      case 'live': return 'radio';
      default: return 'images';
    }
  }

  getDraftTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }
}
