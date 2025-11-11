export enum SessionType {
  WORK = 'WORK',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK'
}

export enum SessionStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED'
}

export interface PomodoroSession {
  currentGoal: number;
  currentType: SessionType;
  status: SessionStatus;
  startTime: number | null;
  pausedTime: number | null;
  elapsedSeconds: number;
  totalSeconds: number;
  completedGoals: number;
}