import { Component, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PomodoroService } from '../../services/pomodoro';
import { SessionType, SessionStatus } from '../../models/pomodoro-session.model';

@Component({
  selector: 'app-session-view',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './session-view.html',
  styleUrl: './session-view.scss'
})
export class SessionViewComponent {
  pomodoroService = inject(PomodoroService);
  sessionStarted = output<void>();
  
  session = this.pomodoroService.session;
  config = this.pomodoroService.config;
  progress = this.pomodoroService.progressPercentage;
  remainingTime = this.pomodoroService.remainingTime;
  isRunning = this.pomodoroService.isRunning;
  
  formattedTime = computed(() => {
    const seconds = this.remainingTime();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });
  
  sessionTypeLabel = computed(() => {
    const type = this.session().currentType;
    const labels: Record<SessionType, string> = {
      [SessionType.WORK]: 'Trabajo',
      [SessionType.SHORT_BREAK]: 'Descanso Corto',
      [SessionType.LONG_BREAK]: 'Descanso Largo'
    };
    return labels[type];
  });

  onStart(): void {
    this.pomodoroService.startSession();
    this.sessionStarted.emit(); // Notificar que la sesión ha comenzado
  }

  onPause(): void {
    this.pomodoroService.pauseSession();
  }

  onReset(): void {
    this.pomodoroService.resetSession();
  }

  onSkip(): void {
    this.pomodoroService.skipToNext();
  }
}
