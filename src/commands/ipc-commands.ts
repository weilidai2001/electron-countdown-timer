import { IIPCCommand, IWindowManager, ISystemService, ILogger, TimerUpdateData } from '../interfaces';

// Command Pattern - Each IPC action is a separate command
export abstract class IPCCommand implements IIPCCommand {
  constructor(protected readonly logger: ILogger) {}

  abstract execute(): Promise<void>;
}

export class SwitchToTimerModeCommand extends IPCCommand {
  constructor(
    logger: ILogger,
    private readonly windowManager: IWindowManager
  ) {
    super(logger);
  }

  public async execute(): Promise<void> {
    this.logger.debug('Executing SwitchToTimerModeCommand');
    await this.windowManager.switchToTimerMode();
  }
}

export class SwitchToSetupModeCommand extends IPCCommand {
  constructor(
    logger: ILogger,
    private readonly windowManager: IWindowManager
  ) {
    super(logger);
  }

  public async execute(): Promise<void> {
    this.logger.debug('Executing SwitchToSetupModeCommand');
    await this.windowManager.switchToSetupMode();
  }
}

export class TimerFinishedCommand extends IPCCommand {
  constructor(
    logger: ILogger,
    private readonly systemService: ISystemService
  ) {
    super(logger);
  }

  public async execute(): Promise<void> {
    this.logger.debug('Executing TimerFinishedCommand');

    await this.systemService.killChromeProcesses();

    // Delay before locking screen to allow Chrome processes to terminate
    setTimeout(async () => {
      try {
        await this.systemService.lockScreen();
      } catch (error) {
        this.logger.error('Failed to lock screen after timer finished', error as Error);
      }
    }, 1000);
  }
}

export class TogglePauseCommand extends IPCCommand {
  constructor(
    logger: ILogger,
    private readonly windowManager: IWindowManager
  ) {
    super(logger);
  }

  public async execute(): Promise<void> {
    this.logger.debug('Executing TogglePauseCommand');

    const mainWindow = this.windowManager.getMainWindow();
    if (mainWindow) {
      mainWindow.webContents.send('toggle-pause-from-timer');
    }
  }
}

export class StopTimerCommand extends IPCCommand {
  constructor(
    logger: ILogger,
    private readonly windowManager: IWindowManager
  ) {
    super(logger);
  }

  public async execute(): Promise<void> {
    this.logger.debug('Executing StopTimerCommand');

    const mainWindow = this.windowManager.getMainWindow();
    if (mainWindow) {
      mainWindow.webContents.send('stop-timer-from-timer');
    }
  }
}

export class UpdateTimerDisplayCommand extends IPCCommand {
  constructor(
    logger: ILogger,
    private readonly windowManager: IWindowManager,
    private readonly data: TimerUpdateData
  ) {
    super(logger);
  }

  public async execute(): Promise<void> {
    this.logger.debug('Executing UpdateTimerDisplayCommand', this.data);

    const timerWindow = this.windowManager.getTimerWindow();
    if (timerWindow) {
      timerWindow.webContents.send('timer-update', this.data);
    }
  }
}