import { Injectable } from '@angular/core';
import { PomodoroConfig } from '../models/pomodoro-config.model';
import { PomodoroSession } from '../models/pomodoro-session.model';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly CONFIG_KEY = 'pomodoro_config';
  private readonly SESSION_KEY = 'pomodoro_session';

  saveConfig(config: PomodoroConfig): void {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error saving config to localStorage:', error);
    }
  }

  loadConfig(): PomodoroConfig | null {
    try {
      const data = localStorage.getItem(this.CONFIG_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading config from localStorage:', error);
      return null;
    }
  }

  saveSession(session: PomodoroSession): void {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session to localStorage:', error);
    }
  }

  loadSession(): PomodoroSession | null {
    try {
      const data = localStorage.getItem(this.SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading session from localStorage:', error);
      return null;
    }
  }

  clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Error clearing session from localStorage:', error);
    }
  }
}
