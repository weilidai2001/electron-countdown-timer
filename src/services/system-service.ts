import { exec } from 'child_process';
import { promisify } from 'util';
import { ISystemService, ILogger, SystemError } from '../interfaces';

const execAsync = promisify(exec);

type ExecOptions = {
  startMessage: string;
  successMessage: string;
  failureMessage: string;
  ignoredExitCodes?: number[];
  ignoredMessage?: string;
};

const exitCodeOf = (error: unknown): number | undefined => {
  const code = (error as { code?: unknown })?.code;
  return typeof code === 'number' ? code : undefined;
};

const execWithLogging = async (
  command: string,
  logger: ILogger,
  { startMessage, successMessage, failureMessage, ignoredExitCodes = [], ignoredMessage }: ExecOptions
): Promise<void> => {
  logger.debug(startMessage);

  try {
    await execAsync(command);
    logger.info(successMessage);
  } catch (error) {
    const exitCode = exitCodeOf(error);

    if (exitCode !== undefined && ignoredExitCodes.includes(exitCode) && ignoredMessage) {
      logger.debug(ignoredMessage);
      return;
    }

    logger.error(failureMessage, error as Error);
    throw new SystemError(failureMessage, { error });
  }
};

const lockLinux = async (logger: ILogger): Promise<void> => {
  logger.debug('Locking screen on Linux');

  const fallbacks = [
    'gnome-screensaver-command -l',
    'xdg-screensaver lock',
    'loginctl lock-session',
  ];

  let lastError: unknown;

  for (const command of fallbacks) {
    logger.debug(`Trying lock command: ${command}`);

    try {
      await execAsync(command);
      logger.info('Screen locked successfully');
      return;
    } catch (error) {
      lastError = error;
      logger.debug(`Command failed, moving to next fallback: ${command}`);
    }
  }

  logger.error('Failed to lock screen', lastError as Error);
  throw new SystemError('Failed to lock screen', { error: lastError });
};

const macOSService = (logger: ILogger): ISystemService => ({
  killChromeProcesses: () =>
    execWithLogging('pkill -f "Google Chrome"', logger, {
      startMessage: 'Killing Chrome processes on macOS',
      successMessage: 'Chrome processes killed successfully',
      failureMessage: 'Failed to kill Chrome processes',
      ignoredExitCodes: [1],
      ignoredMessage: 'No Chrome processes found to kill',
    }),
  lockScreen: () =>
    execWithLogging('pmset displaysleepnow', logger, {
      startMessage: 'Locking screen on macOS',
      successMessage: 'Screen locked successfully',
      failureMessage: 'Failed to lock screen',
    }),
});

const windowsService = (logger: ILogger): ISystemService => ({
  killChromeProcesses: () =>
    execWithLogging('taskkill /f /im chrome.exe', logger, {
      startMessage: 'Killing Chrome processes on Windows',
      successMessage: 'Chrome processes killed successfully',
      failureMessage: 'Failed to kill Chrome processes',
    }),
  lockScreen: () =>
    execWithLogging('rundll32.exe user32.dll,LockWorkStation', logger, {
      startMessage: 'Locking screen on Windows',
      successMessage: 'Screen locked successfully',
      failureMessage: 'Failed to lock screen',
    }),
});

const linuxService = (logger: ILogger): ISystemService => ({
  killChromeProcesses: () =>
    execWithLogging('pkill -f chrome', logger, {
      startMessage: 'Killing Chrome processes on Linux',
      successMessage: 'Chrome processes killed successfully',
      failureMessage: 'Failed to kill Chrome processes',
    }),
  lockScreen: () => lockLinux(logger),
});

const builders: Partial<Record<NodeJS.Platform, (logger: ILogger) => ISystemService>> = {
  darwin: macOSService,
  win32: windowsService,
  linux: linuxService,
};

export const createSystemService = (
  platform: NodeJS.Platform,
  logger: ILogger
): ISystemService => {
  const build = builders[platform];

  if (!build) {
    logger.warn(`Unsupported platform: ${platform}, using macOS service as fallback`);
    return macOSService(logger);
  }

  return build(logger);
};
