import { app, BrowserWindow } from 'electron';
import {
  IApplicationLifecycle,
  IWindowManager,
  ISystemService,
  ILogger,
  IConfigurationManager,
  ICommandHandler,
} from './interfaces';
import { WindowManager } from './managers/window-manager';
import { createSystemService } from './services/system-service';
import { IPCCommandHandler } from './commands/ipc-handler';
import { Logger } from './utils/logger';
import { ConfigurationManager } from './utils/configuration';

// Application Controller - Facade Pattern
// Provides a unified interface to the complex subsystem
export class ApplicationController implements IApplicationLifecycle {
  private readonly logger: ILogger;
  private readonly config: IConfigurationManager;
  private readonly windowManager: IWindowManager;
  private readonly systemService: ISystemService;
  private readonly ipcHandler: ICommandHandler;

  constructor() {
    // Initialize dependencies following Dependency Injection
    this.logger = Logger.getInstance();
    this.config = ConfigurationManager.getInstance();
    this.windowManager = new WindowManager(this.logger, this.config);
    this.systemService = createSystemService(process.platform, this.logger);
    this.ipcHandler = new IPCCommandHandler(
      this.logger,
      this.windowManager,
      this.systemService
    );

    this.logger.info('Application Controller initialized');
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing application');

      this.setupElectronEventHandlers();

      // Wait for Electron to be ready
      await app.whenReady();
      await this.windowManager.createMainWindow();

      this.logger.info('Application initialized successfully');

    } catch (error) {
      this.logger.error('Failed to initialize application', error as Error);
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    try {
      this.logger.info('Shutting down application');

      // Cleanup resources
      this.windowManager.destroyTimerWindow();

      this.logger.info('Application shutdown completed');

    } catch (error) {
      this.logger.error('Error during application shutdown', error as Error);
      throw error;
    }
  }

  private setupElectronEventHandlers(): void {
    app.on('window-all-closed', () => {
      this.logger.debug('All windows closed');

      if (process.platform !== 'darwin') {
        this.logger.info('Quitting application (non-macOS)');
        app.quit();
      }
    });

    app.on('activate', async () => {
      this.logger.debug('Application activated');

      if (BrowserWindow.getAllWindows().length === 0) {
        this.logger.info('Creating window on activation');
        await this.windowManager.createMainWindow();
      }
    });

    app.on('before-quit', async () => {
      this.logger.debug('Application before quit');
      await this.shutdown();
    });

    this.logger.debug('Electron event handlers setup completed');
  }

  // Facade methods for external access
  public getWindowManager(): IWindowManager {
    return this.windowManager;
  }

  public getSystemService(): ISystemService {
    return this.systemService;
  }

  public getLogger(): ILogger {
    return this.logger;
  }

  public getConfiguration(): IConfigurationManager {
    return this.config;
  }
}
