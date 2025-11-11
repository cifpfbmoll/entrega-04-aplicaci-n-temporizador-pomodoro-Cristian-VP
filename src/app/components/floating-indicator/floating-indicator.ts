import { Component, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { PomodoroService } from '../../services/pomodoro';
import { SessionType } from '../../models/pomodoro-session.model';

@Component({
  selector: 'app-floating-indicator',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './floating-indicator.html',
  styleUrl: './floating-indicator.scss'
})
export class FloatingIndicatorComponent {
  @Output() showMainDialog = new EventEmitter<void>();

  pomodoroService = inject(PomodoroService);
  
  // Estado para expandir/contraer
  isExpanded = signal(false);

  // Señales del servicio
  session = this.pomodoroService.session;
  config = this.pomodoroService.config;
  
  // Computed properties basadas en las señales disponibles
  isRunning = this.pomodoroService.isRunning;
  progress = this.pomodoroService.progressPercentage;

  // Formatear tiempo restante usando la señal disponible
  formattedTime = computed(() => {
    const remaining = this.pomodoroService.remainingTime();
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  sessionTypeLabel = computed(() => {
    const type = this.session().currentType;
    switch (type) {
      case SessionType.WORK:
        return 'Trabajo';
      case SessionType.SHORT_BREAK:
        return 'Descanso corto';
      case SessionType.LONG_BREAK:
        return 'Descanso largo';
      default:
        return 'Sesión';
    }
  });

  toggleExpanded() {
    this.isExpanded.update(v => !v);
  }

  toggleTimer() {
    if (this.isRunning()) {
      this.pomodoroService.pauseSession();
    } else {
      this.pomodoroService.startSession();
    }
  }

  resetSession() {
    this.pomodoroService.resetSession();
  }

  skipSession() {
    this.pomodoroService.skipToNext();
  }

  showSettings() {
    // Emitir evento para mostrar el diálogo principal
    this.showMainDialog.emit();
  }
}
