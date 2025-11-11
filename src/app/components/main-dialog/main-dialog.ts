import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { SessionViewComponent } from '../session-view/session-view';
import { ConfigurationComponent } from '../configuration/configuration';

@Component({
  selector: 'app-main-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    SessionViewComponent,
    ConfigurationComponent
  ],
  templateUrl: './main-dialog.html',
  styleUrl: './main-dialog.scss'
})
export class MainDialogComponent {}
