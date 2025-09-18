import { BrowserWindow, screen } from 'electron';
import { IWindowManager, ILogger, IConfigurationManager, WindowError } from '../interfaces';

// Window Manager - Single Responsibility: Window lifecycle management
export class WindowManager implements IWindowManager {
  private mainWindow: BrowserWindow | null = null;
  private timerWindow: BrowserWindow | null = null;

  constructor(
    private readonly logger: ILogger,
    private readonly config: IConfigurationManager
  ) {}

  public async createMainWindow(): Promise<void> {
    try {
      this.logger.debug('Creating main window');

      const windowConfig = this.config.getWindowConfig('main');

      this.mainWindow = new BrowserWindow({
        width: windowConfig.width,
        height: windowConfig.height,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
        resizable: windowConfig.resizable,
        alwaysOnTop: windowConfig.alwaysOnTop,
        show: false,
        frame: windowConfig.frame,
        titleBarStyle: 'default',
      });

      await this.mainWindow.loadFile('index.html');

      this.mainWindow.once('ready-to-show', () => {
        this.centerMainWindow();
        this.mainWindow?.show();
        this.logger.info('Main window created and shown');
      });

      this.mainWindow.on('closed', () => {
        this.mainWindow = null;
        this.logger.debug('Main window closed');
      });

    } catch (error) {
      this.logger.error('Failed to create main window', error as Error);
      throw new WindowError('Failed to create main window', { error });
    }
  }

  public async createTimerWindow(): Promise<void> {
    try {
      this.logger.debug('Creating timer window');

      const windowConfig = this.config.getWindowConfig('timer');
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width } = primaryDisplay.workAreaSize;

      this.timerWindow = new BrowserWindow({
        width: windowConfig.width,
        height: windowConfig.height,
        x: width - (windowConfig.x || 150),
        y: windowConfig.y || 10,
        frame: windowConfig.frame,
        resizable: windowConfig.resizable,
        movable: false,
        minimizable: false,
        maximizable: false,
        alwaysOnTop: windowConfig.alwaysOnTop,
        skipTaskbar: true,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
        transparent: windowConfig.transparent,
        hasShadow: false,
      });

      // Hide main window and show timer window
      if (this.mainWindow) {
        this.mainWindow.hide();
      }

      await this.timerWindow.loadFile('timer.html');
      this.timerWindow.setAlwaysOnTop(true, 'screen-saver');

      if (process.platform === 'darwin') {
        this.timerWindow.setVisibleOnAllWorkspaces(true, {
          visibleOnFullScreen: true,
        });
      }

      this.timerWindow.on('closed', () => {
        this.timerWindow = null;
        this.logger.debug('Timer window closed');
      });

      this.logger.info('Timer window created');

    } catch (error) {
      this.logger.error('Failed to create timer window', error as Error);
      throw new WindowError('Failed to create timer window', { error });
    }
  }

  public destroyTimerWindow(): void {
    if (this.timerWindow) {
      this.timerWindow.close();
      this.timerWindow = null;
      this.logger.debug('Timer window destroyed');
    }
  }

  public centerMainWindow(): void {
    if (!this.mainWindow) return;

    try {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.workAreaSize;
      const windowBounds = this.mainWindow.getBounds();

      const x = Math.round((width - windowBounds.width) / 2);
      const y = Math.round((height - windowBounds.height) / 2);

      this.mainWindow.setPosition(x, y);
      this.logger.debug('Main window centered', { x, y });

    } catch (error) {
      this.logger.error('Failed to center main window', error as Error);
    }
  }

  public async switchToTimerMode(): Promise<void> {
    try {
      await this.createTimerWindow();
      this.logger.info('Switched to timer mode');
    } catch (error) {
      this.logger.error('Failed to switch to timer mode', error as Error);
      throw error;
    }
  }

  public async switchToSetupMode(): Promise<void> {
    try {
      this.destroyTimerWindow();

      if (this.mainWindow) {
        this.mainWindow.show();
        this.mainWindow.setAlwaysOnTop(false);

        const windowConfig = this.config.getWindowConfig('main');
        this.mainWindow.setSize(windowConfig.width, windowConfig.height);
        this.centerMainWindow();

        if (process.platform === 'darwin') {
          this.mainWindow.setVisibleOnAllWorkspaces(false);
        }
      }

      this.logger.info('Switched to setup mode');

    } catch (error) {
      this.logger.error('Failed to switch to setup mode', error as Error);
      throw error;
    }
  }

  public getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  public getTimerWindow(): BrowserWindow | null {
    return this.timerWindow;
  }
}