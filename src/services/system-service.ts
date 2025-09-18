import { exec } from 'child_process';
import { promisify } from 'util';
import { ISystemService, ILogger, SystemError } from '../interfaces';

const execAsync = promisify(exec);

// Abstract System Service - Strategy Pattern
export abstract class SystemService implements ISystemService {
  constructor(protected readonly logger: ILogger) {}

  abstract killChromeProcesses(): Promise<void>;
  abstract lockScreen(): Promise<void>;
}

// macOS-specific implementation
export class MacOSSystemService extends SystemService {
  public async killChromeProcesses(): Promise<void> {
    try {
      this.logger.debug('Killing Chrome processes on macOS');

      await execAsync('pkill -f "Google Chrome"');
      this.logger.info('Chrome processes killed successfully');

    } catch (error: any) {
      // Exit code 1 means no processes found, which is acceptable
      if (error.code !== 1) {
        this.logger.error('Failed to kill Chrome processes', error);
        throw new SystemError('Failed to kill Chrome processes', { error });
      }
      this.logger.debug('No Chrome processes found to kill');
    }
  }

  public async lockScreen(): Promise<void> {
    try {
      this.logger.debug('Locking screen on macOS');

      await execAsync('pmset displaysleepnow');
      this.logger.info('Screen locked successfully');

    } catch (error) {
      this.logger.error('Failed to lock screen', error as Error);
      throw new SystemError('Failed to lock screen', { error });
    }
  }
}

// Windows implementation (placeholder for future support)
export class WindowsSystemService extends SystemService {
  public async killChromeProcesses(): Promise<void> {
    try {
      this.logger.debug('Killing Chrome processes on Windows');

      await execAsync('taskkill /f /im chrome.exe');
      this.logger.info('Chrome processes killed successfully');

    } catch (error) {
      this.logger.error('Failed to kill Chrome processes', error as Error);
      throw new SystemError('Failed to kill Chrome processes', { error });
    }
  }

  public async lockScreen(): Promise<void> {
    try {
      this.logger.debug('Locking screen on Windows');

      await execAsync('rundll32.exe user32.dll,LockWorkStation');
      this.logger.info('Screen locked successfully');

    } catch (error) {
      this.logger.error('Failed to lock screen', error as Error);
      throw new SystemError('Failed to lock screen', { error });
    }
  }
}

// Linux implementation (placeholder for future support)
export class LinuxSystemService extends SystemService {
  public async killChromeProcesses(): Promise<void> {
    try {
      this.logger.debug('Killing Chrome processes on Linux');

      await execAsync('pkill -f chrome');
      this.logger.info('Chrome processes killed successfully');

    } catch (error) {
      this.logger.error('Failed to kill Chrome processes', error as Error);
      throw new SystemError('Failed to kill Chrome processes', { error });
    }
  }

  public async lockScreen(): Promise<void> {
    try {
      this.logger.debug('Locking screen on Linux');

      // Try common screen lockers
      try {
        await execAsync('gnome-screensaver-command -l');
      } catch {
        try {
          await execAsync('xdg-screensaver lock');
        } catch {
          await execAsync('loginctl lock-session');
        }
      }

      this.logger.info('Screen locked successfully');

    } catch (error) {
      this.logger.error('Failed to lock screen', error as Error);
      throw new SystemError('Failed to lock screen', { error });
    }
  }
}

// Factory Pattern - Creates appropriate system service based on platform
export class SystemServiceFactory {
  public static create(platform: string, logger: ILogger): ISystemService {
    switch (platform) {
      case 'darwin':
        return new MacOSSystemService(logger);
      case 'win32':
        return new WindowsSystemService(logger);
      case 'linux':
        return new LinuxSystemService(logger);
      default:
        logger.warn(`Unsupported platform: ${platform}, using macOS service as fallback`);
        return new MacOSSystemService(logger);
    }
  }
}