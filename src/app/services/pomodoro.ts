import { Injectable, signal, computed, inject } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { PomodoroConfig, DEFAULT_CONFIG } from '../models/pomodoro-config.model';
import { PomodoroSession, SessionType, SessionStatus } from '../models/pomodoro-session.model';
import { StorageService } from './storage';

@Injectable({
  providedIn: 'root',
})
export class PomodoroService {
  private storage = inject(StorageService);
  private timerSubscription?: Subscription;

  // Signals principales
  config = signal<PomodoroConfig>(this.loadInitialConfig());
  session = signal<PomodoroSession>(this.createInitialSession());

  // Computed signals
  progressPercentage = computed(() => {
    const s = this.session();
    return s.totalSeconds > 0 ? (s.elapsedSeconds / s.totalSeconds) * 100 : 0;
  });

  remainingTime = computed(() => {
    const s = this.session();
    return Math.max(0, s.totalSeconds - s.elapsedSeconds);
  });

  isRunning = computed(() => this.session().status === SessionStatus.RUNNING);

  constructor() {
    // Restaurar sesión si existe
    const savedSession = this.storage.loadSession();
    if (savedSession && savedSession.status !== SessionStatus.COMPLETED) {
      this.session.set(savedSession);
    }

    // Solicitar permisos de notificaciones
    this.requestNotificationPermission();
  }

  private async requestNotificationPermission(): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('Notifications API not supported by this browser');
      return;
    }

    try {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        console.log('Notification permission result:', permission);
        
        // Mostrar notificación de test si se otorgan permisos
        if (permission === 'granted') {
          this.showTestNotification();
        }
      } else {
        console.log('Notification permission already:', Notification.permission);
        if (Notification.permission === 'granted') {
          this.showTestNotification();
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  private showTestNotification(): void {
    try {
      const notification = new Notification('🍅 Pomodoro Timer', {
        body: 'Las notificaciones están activadas correctamente',
        icon: '/favicon.ico',
        tag: 'pomodoro-test'
      });
      
      setTimeout(() => {
        try {
          notification.close();
        } catch (e) {
          // Ignorar error si ya está cerrada
        }
      }, 3000);
    } catch (error) {
      console.error('Error showing test notification:', error);
    }
  }

  private showNotification(title: string, body: string, tag: string = 'pomodoro-timer'): void {
    const config = this.config();
    
    // Verificar si las notificaciones están habilitadas
    if (!config.notifications) {
      console.log('Notifications disabled in config');
      return;
    }

    // Verificar soporte del navegador
    if (!('Notification' in window)) {
      console.warn('Notifications API not supported');
      return;
    }

    // Verificar permisos
    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted:', Notification.permission);
      return;
    }

    try {
      console.log('Showing notification:', { title, body, tag });
      
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag,
        silent: false,
        requireInteraction: false
      });

      // Evento cuando se hace clic en la notificación
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Auto-close notification after 5 seconds
      setTimeout(() => {
        try {
          notification.close();
        } catch (e) {
          // Ignorar error si ya está cerrada
        }
      }, 5000);

    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  private loadInitialConfig(): PomodoroConfig {
    return this.storage.loadConfig() || DEFAULT_CONFIG;
  }

  private createInitialSession(): PomodoroSession {
    const cfg = this.config();
    return {
      currentGoal: 1,
      currentType: SessionType.WORK,
      status: SessionStatus.IDLE,
      startTime: null,
      pausedTime: null,
      elapsedSeconds: 0,
      totalSeconds: cfg.workDuration * 60,
      completedGoals: 0
    };
  }

  startSession(): void {
    const currentSession = this.session();
    
    if (currentSession.status === SessionStatus.RUNNING) {
      return;
    }
    
    const now = Date.now();
    
    this.session.update(s => ({
      ...s,
      status: SessionStatus.RUNNING,
      startTime: now - (s.elapsedSeconds * 1000),
      pausedTime: null
    }));
    
    this.startTimer();
    this.storage.saveSession(this.session());
    
    // Notification when session starts
    const typeLabel = this.getSessionTypeLabel(currentSession.currentType);
    this.showNotification(
      '🍅 Pomodoro Timer',
      `${typeLabel} iniciado`,
      'session-start'
    );
  }

  pauseSession(): void {
    this.session.update(s => ({
      ...s,
      status: SessionStatus.PAUSED,
      pausedTime: Date.now()
    }));
    
    this.stopTimer();
    this.storage.saveSession(this.session());

    this.showNotification(
      '⏸️ Sesión pausada',
      'Tu sesión ha sido pausada',
      'session-paused'
    );
  }

  resetSession(): void {
    this.stopTimer();
    const newSession = this.createInitialSession();
    this.session.set(newSession);
    this.storage.clearSession();

    this.showNotification(
      '🔄 Sesión reiniciada',
      'El timer ha sido reiniciado',
      'session-reset'
    );
  }

  skipToNext(): void {
    this.completeSession();
  }

  updateConfig(newConfig: PomodoroConfig): void {
    this.config.set(newConfig);
    this.storage.saveConfig(newConfig);
  }

  private getSessionTypeLabel(type: SessionType): string {
    switch (type) {
      case SessionType.WORK:
        return 'Sesión de trabajo';
      case SessionType.SHORT_BREAK:
        return 'Descanso corto';
      case SessionType.LONG_BREAK:
        return 'Descanso largo';
      default:
        return 'Sesión';
    }
  }

  private startTimer(): void {
    this.stopTimer();
    
    this.timerSubscription = interval(1000).subscribe(() => {
      const currentSession = this.session();
      
      if (currentSession.status !== SessionStatus.RUNNING || !currentSession.startTime) {
        return;
      }
      
      const elapsed = Math.floor((Date.now() - currentSession.startTime) / 1000);
      
      // Update elapsed time
      this.session.update(s => ({
        ...s,
        elapsedSeconds: elapsed
      }));

      // Check if session is complete (>= instead of just >=)
      if (elapsed >= currentSession.totalSeconds) {
        this.completeSession();
      }
    });
  }

  private stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = undefined;
    }
  }

  private completeSession(): void {
    this.stopTimer();
    
    const currentSession = this.session();
    const config = this.config();
    
    // Update session as completed
    this.session.update(s => ({
      ...s,
      status: SessionStatus.COMPLETED,
      elapsedSeconds: s.totalSeconds
    }));

    // Show completion notification
    const typeLabel = this.getSessionTypeLabel(currentSession.currentType);
    this.showNotification(
      '✅ Sesión completada',
      `${typeLabel} finalizada`,
      'session-completed'
    );

    // Auto transition to next session after delay
    if (config.autoStartNext) {
      setTimeout(() => {
        this.transitionToNextSession();
      }, 3000); // 3 second delay
    } else {
      this.transitionToNextSession();
    }
  }

  private transitionToNextSession(): void {
    const currentSession = this.session();
    const config = this.config();
    
    let nextType: SessionType;
    let nextGoal = currentSession.currentGoal;
    let completedGoals = currentSession.completedGoals;
    
    if (currentSession.currentType === SessionType.WORK) {
      // Work session completed
      completedGoals += 1;
      
      // Determine break type
      if (completedGoals % config.sessionsUntilLongBreak === 0) {
        nextType = SessionType.LONG_BREAK;
      } else {
        nextType = SessionType.SHORT_BREAK;
      }
    } else {
      // Break session completed
      nextType = SessionType.WORK;
      nextGoal += 1;
    }
    
    // Check if all goals completed
    if (nextGoal > config.totalGoals) {
      this.showNotification(
        '🎉 ¡Felicitaciones!',
        `Has completado todos los ${config.totalGoals} pomodoros`,
        'all-completed'
      );
      this.resetSession();
      return;
    }
    
    // Set up next session
    const nextDuration = this.getSessionDuration(nextType);
    
    this.session.set({
      currentGoal: nextGoal,
      currentType: nextType,
      status: config.autoStartNext ? SessionStatus.RUNNING : SessionStatus.IDLE,
      startTime: config.autoStartNext ? Date.now() : null,
      pausedTime: null,
      elapsedSeconds: 0,
      totalSeconds: nextDuration * 60,
      completedGoals
    });
    
    this.storage.saveSession(this.session());
    
    // Start timer if auto-start is enabled
    if (config.autoStartNext) {
      this.startTimer();
      const typeLabel = this.getSessionTypeLabel(nextType);
      this.showNotification(
        '▶️ Siguiente sesión',
        `${typeLabel} iniciado automáticamente`,
        'auto-start'
      );
    } else {
      const typeLabel = this.getSessionTypeLabel(nextType);
      this.showNotification(
        '⏭️ Siguiente sesión',
        `${typeLabel} listo para comenzar`,
        'next-ready'
      );
    }
  }

  private getSessionDuration(type: SessionType): number {
    const config = this.config();
    switch (type) {
      case SessionType.WORK:
        return config.workDuration;
      case SessionType.SHORT_BREAK:
        return config.shortBreakDuration;
      case SessionType.LONG_BREAK:
        return config.longBreakDuration;
      default:
        return config.workDuration;
    }
  }
}
