import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';

import { UserPopoverComponent } from 'src/app/components/user-popover/user-popover.component';
import { IntroLobbyComponentModule } from '../popover/intro-lobby-popover/intro-lobby-popover.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardPageRoutingModule,
    IntroLobbyComponentModule
  ],
  entryComponents: [UserPopoverComponent],
  declarations: [DashboardPage, UserPopoverComponent]
})
export class DashboardPageModule { }
