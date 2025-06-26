import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingCount = 0;
  private currentLoading: HTMLIonLoadingElement | null = null;

  public isLoading$ = this.loadingSubject.asObservable();

  constructor(private loadingController: LoadingController) {}

  async show(message: string = 'Loading...', duration?: number): Promise<void> {
    this.loadingCount++;
    
    if (this.loadingCount === 1) {
      this.loadingSubject.next(true);
      
      this.currentLoading = await this.loadingController.create({
        message,
        duration,
        spinner: 'crescent',
        cssClass: 'custom-loading'
      });
      
      await this.currentLoading.present();
    }
  }

  async hide(): Promise<void> {
    if (this.loadingCount > 0) {
      this.loadingCount--;
    }
    
    if (this.loadingCount === 0) {
      this.loadingSubject.next(false);
      
      if (this.currentLoading) {
        await this.currentLoading.dismiss();
        this.currentLoading = null;
      }
    }
  }

  async hideAll(): Promise<void> {
    this.loadingCount = 0;
    this.loadingSubject.next(false);
    
    if (this.currentLoading) {
      await this.currentLoading.dismiss();
      this.currentLoading = null;
    }
  }

  isLoading(): boolean {
    return this.loadingSubject.value;
  }
}
