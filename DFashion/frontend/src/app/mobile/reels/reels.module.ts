import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { ReelsPage } from './reels.page';

// Import Swiper modules
import { register } from 'swiper/element/bundle';

const routes: Routes = [
  {
    path: '',
    component: ReelsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ReelsPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReelsPageModule {
  constructor() {
    // Register Swiper custom elements
    register();
  }
}
