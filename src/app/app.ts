import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SessionViewComponent } from './components/session-view/session-view';
import { ConfigurationComponent } from './components/configuration/configuration';
import { FloatingIndicatorComponent } from './components/floating-indicator/floating-indicator';
import { PomodoroService } from './services/pomodoro';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    MatButtonModule, 
    MatCardModule, 
    MatIconModule, 
    MatTabsModule,
    MatProgressBarModule,
    SessionViewComponent,
    ConfigurationComponent,
    FloatingIndicatorComponent
  ],
  template: `
    <!-- Indicador flotante (visible cuando el diálogo está oculto) -->
    <app-floating-indicator 
      *ngIf="!showMainDialog()"
      (showMainDialog)="toggleMainDialog()">
    </app-floating-indicator>

    <!-- Diálogo principal -->
    <div class="app-container" *ngIf="showMainDialog()">
      <mat-card class="main-card">
        <mat-tab-group>
          <mat-tab label="Sesión">
            <app-session-view (sessionStarted)="onSessionStarted()"></app-session-view>
          </mat-tab>
          
          <mat-tab label="Configuración">
            <app-configuration></app-configuration>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
      background-color: var(--background);
    }
    
    .main-card {
      max-width: 600px;
      width: 100%;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-shadow: none;
      background: var(--surface);
    }

    ::ng-deep .mat-mdc-tab-header {
      background-color: transparent;
      border-bottom: 1px solid var(--border-color);
      
      .mat-mdc-tab-labels {
        .mdc-tab {
          color: rgba(0, 0, 0, 0.6);
          
          &.mdc-tab--active {
            color: var(--tomato-color);
          }
        }
      }
      
      .mdc-tab-indicator__content--underline {
        border-color: var(--tomato-color);
        border-width: 2px;
      }
    }
  `],
})
export class App {
  private pomodoroService = inject(PomodoroService);
  
  showMainDialog = signal(true);

  toggleMainDialog(): void {
    this.showMainDialog.update(v => !v);
  }

  onSessionStarted(): void {
    // Ocultar diálogo principal cuando se inicia una sesión
    this.showMainDialog.set(false);
  }
}
