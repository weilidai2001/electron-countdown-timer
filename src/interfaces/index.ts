// Domain Interfaces - Following Interface Segregation Principle (ISP)

export interface IWindowManager {
  createMainWindow(): Promise<void>;
  createTimerWindow(): Promise<void>;
  destroyTimerWindow(): void;
  centerMainWindow(): void;
  switchToTimerMode(): Promise<void>;
  switchToSetupMode(): Promise<void>;
  getMainWindow(): Electron.BrowserWindow | null;
  getTimerWindow(): Electron.BrowserWindow | null;
}

export interface ISystemService {
  killChromeProcesses(): Promise<void>;
  lockScreen(): Promise<void>;
}

export interface IIPCCommand {
  execute(): Promise<void>;
}

export interface ICommandHandler {
  handle(command: string, ...args: any[]): Promise<void>;
}

export interface ILogger {
  info(message: string, meta?: any): void;
  error(message: string, error?: Error, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

export interface IConfigurationManager {
  get<T>(key: string): T;
  set<T>(key: string, value: T): void;
  getWindowConfig(type: 'main' | 'timer'): WindowConfiguration;
}

export interface IApplicationLifecycle {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

// Data Transfer Objects
export interface WindowConfiguration {
  width: number;
  height: number;
  x?: number;
  y?: number;
  frame?: boolean;
  alwaysOnTop?: boolean;
  transparent?: boolean;
  resizable?: boolean;
}

export interface TimerUpdateData {
  timeLeft: number;
  isPaused: boolean;
}

// Event Types
export type IPCEventType =
  | 'switch-to-timer-mode'
  | 'switch-to-setup-mode'
  | 'timer-finished'
  | 'toggle-pause'
  | 'stop-timer'
  | 'update-timer-display';

// Error Types
export class ApplicationError extends Error {
  constructor(
    message: string,
    public code?: string,
    public context?: any
  ) {
    super(message);
    this.name = 'ApplicationError';
  }
}

export class WindowError extends ApplicationError {
  constructor(message: string, context?: any) {
    super(message, 'WINDOW_ERROR', context);
    this.name = 'WindowError';
  }
}

export class SystemError extends ApplicationError {
  constructor(message: string, context?: any) {
    super(message, 'SYSTEM_ERROR', context);
    this.name = 'SystemError';
  }
}