import { ILogger } from '../interfaces';

// Singleton Logger - Single Responsibility: Logging only
export class Logger implements ILogger {
  private static instance: Logger;
  private isDebugEnabled: boolean;

  private constructor() {
    this.isDebugEnabled = process.env.NODE_ENV === 'development';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string, meta?: any): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta || '');
  }

  public error(message: string, error?: Error, meta?: any): void {
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${message}`,
      error?.stack || error?.message || '',
      meta || ''
    );
  }

  public warn(message: string, meta?: any): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta || '');
  }

  public debug(message: string, meta?: any): void {
    if (this.isDebugEnabled) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta || '');
    }
  }
}