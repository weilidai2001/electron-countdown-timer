// Configuration constants
export const CONFIG = {
  DEFAULT_TIME_MINUTES: 12,
  TIMER_WINDOW: {
    WIDTH: 128,
    HEIGHT: 38,
    OFFSET_FROM_RIGHT: 138,
    OFFSET_FROM_TOP: 10,
  },
  SETUP_WINDOW: {
    WIDTH: 320,
    HEIGHT: 300,
  },
} as const;

// Timer states
export type TimerState = 'stopped' | 'running' | 'paused';

// Window modes
export type WindowMode = 'setup' | 'timer';

// IPC event types
export interface IpcEvents {
  'switch-to-timer-mode': () => void;
  'switch-to-setup-mode': () => void;
  'timer-finished': () => void;
  'toggle-pause': () => void;
  'stop-timer': () => void;
  'update-timer-display': (data: TimerUpdateData) => void;
}

// Data structures
export interface TimerUpdateData {
  timeLeft: number;
  isPaused: boolean;
}

export interface TimerDisplayElements {
  setupMode: HTMLElement;
  timerMode: HTMLElement;
  timerText: HTMLElement;
  miniTimerText: HTMLElement;
  minus1MinBtn: HTMLButtonElement;
  minus10SecBtn: HTMLButtonElement;
  plus10SecBtn: HTMLButtonElement;
  plus1MinBtn: HTMLButtonElement;
  startBtn: HTMLButtonElement;
  stopBtn: HTMLButtonElement;
  pauseBtn: HTMLButtonElement;
}

// Timer configuration
export interface TimerConfig {
  defaultTimeSeconds: number;
}

// Window configuration
export interface WindowConfig {
  setup: {
    width: number;
    height: number;
  };
  timer: {
    width: number;
    height: number;
    offsetFromRight: number;
    offsetFromTop: number;
  };
}

// Error types
export class TimerError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'TimerError';
  }
}

// Utility types
export type Seconds = number;
export type Minutes = number;
export type ElementId = string;