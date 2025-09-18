import { ipcMain } from 'electron';
import {
  ICommandHandler,
  IWindowManager,
  ISystemService,
  ILogger,
  TimerUpdateData,
  IPCEventType,
} from '../interfaces';
import {
  SwitchToTimerModeCommand,
  SwitchToSetupModeCommand,
  TimerFinishedCommand,
  TogglePauseCommand,
  StopTimerCommand,
  UpdateTimerDisplayCommand,
} from './ipc-commands';

// Command Handler - Coordinates IPC commands using Command Pattern
export class IPCCommandHandler implements ICommandHandler {
  constructor(
    private readonly logger: ILogger,
    private readonly windowManager: IWindowManager,
    private readonly systemService: ISystemService
  ) {
    this.setupIpcHandlers();
  }

  private setupIpcHandlers(): void {
    this.logger.debug('Setting up IPC handlers');

    ipcMain.handle('switch-to-timer-mode', () =>
      this.handle('switch-to-timer-mode')
    );

    ipcMain.handle('switch-to-setup-mode', () =>
      this.handle('switch-to-setup-mode')
    );

    ipcMain.handle('timer-finished', () =>
      this.handle('timer-finished')
    );

    ipcMain.handle('toggle-pause', () =>
      this.handle('toggle-pause')
    );

    ipcMain.handle('stop-timer', () =>
      this.handle('stop-timer')
    );

    ipcMain.handle('update-timer-display', (_, data: TimerUpdateData) =>
      this.handle('update-timer-display', data)
    );

    this.logger.info('IPC handlers registered successfully');
  }

  public async handle(command: IPCEventType, ...args: any[]): Promise<void> {
    try {
      this.logger.debug(`Handling IPC command: ${command}`, args);

      const commandInstance = this.createCommand(command, ...args);
      await commandInstance.execute();

    } catch (error) {
      this.logger.error(`Failed to handle IPC command: ${command}`, error as Error, args);
      throw error;
    }
  }

  private createCommand(command: IPCEventType, ...args: any[]) {
    switch (command) {
      case 'switch-to-timer-mode':
        return new SwitchToTimerModeCommand(this.logger, this.windowManager);

      case 'switch-to-setup-mode':
        return new SwitchToSetupModeCommand(this.logger, this.windowManager);

      case 'timer-finished':
        return new TimerFinishedCommand(this.logger, this.systemService);

      case 'toggle-pause':
        return new TogglePauseCommand(this.logger, this.windowManager);

      case 'stop-timer':
        return new StopTimerCommand(this.logger, this.windowManager);

      case 'update-timer-display':
        const [data] = args as [TimerUpdateData];
        return new UpdateTimerDisplayCommand(this.logger, this.windowManager, data);

      default:
        throw new Error(`Unknown IPC command: ${command}`);
    }
  }
}