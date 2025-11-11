export interface PomodoroConfig {
  workDuration: number;        // minutos (1-60)
  shortBreakDuration: number;  // minutos (1-60)
  longBreakDuration: number;   // minutos (1-60)
  totalGoals: number;          // sesiones totales (1-20)
  autoStartNext: boolean;      // inicio automático
  sessionsUntilLongBreak: number; // por defecto 4
  notifications: boolean;      // notificaciones del sistema
}

export const DEFAULT_CONFIG: PomodoroConfig = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  totalGoals: 4,
  autoStartNext: true,
  sessionsUntilLongBreak: 4,
  notifications: true
};