import { app, BrowserWindow, ipcMain, screen } from 'electron';
import { exec } from 'child_process';
import { CONFIG, TimerUpdateData } from './types';

class CountdownTimerApp {
  private mainWindow: BrowserWindow | null = null;
  private timerWindow: BrowserWindow | null = null;
  private isTimerMode = false;

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    app.whenReady().then(() => this.createWindow());

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });

    this.setupIpcHandlers();
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: CONFIG.SETUP_WINDOW.WIDTH,
      height: CONFIG.SETUP_WINDOW.HEIGHT,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      resizable: false,
      alwaysOnTop: false,
      show: false,
      frame: true,
      titleBarStyle: 'default',
    });

    this.mainWindow.loadFile('index.html');

    this.mainWindow.once('ready-to-show', () => {
      this.centerWindow();
      this.mainWindow?.show();
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private centerWindow(): void {
    if (!this.mainWindow) return;

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    const windowBounds = this.mainWindow.getBounds();
    const x = Math.round((width - windowBounds.width) / 2);
    const y = Math.round((height - windowBounds.height) / 2);

    this.mainWindow.setPosition(x, y);
  }

  private switchToTimerMode(): void {
    if (this.isTimerMode || !this.mainWindow) return;

    this.isTimerMode = true;

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width } = primaryDisplay.workAreaSize;

    this.timerWindow = new BrowserWindow({
      width: CONFIG.TIMER_WINDOW.WIDTH,
      height: CONFIG.TIMER_WINDOW.HEIGHT,
      x: width - CONFIG.TIMER_WINDOW.OFFSET_FROM_RIGHT,
      y: CONFIG.TIMER_WINDOW.OFFSET_FROM_TOP,
      frame: false,
      resizable: false,
      movable: false,
      minimizable: false,
      maximizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      transparent: true,
      hasShadow: false,
    });

    this.mainWindow.hide();
    this.timerWindow.loadFile('timer.html');
    this.timerWindow.setAlwaysOnTop(true, 'screen-saver');

    if (process.platform === 'darwin') {
      this.timerWindow.setVisibleOnAllWorkspaces(true, {
        visibleOnFullScreen: true,
      });
    }

    this.timerWindow.on('closed', () => {
      this.timerWindow = null;
    });
  }

  private switchToSetupMode(): void {
    if (!this.isTimerMode || !this.mainWindow) return;

    this.isTimerMode = false;

    if (this.timerWindow) {
      this.timerWindow.close();
      this.timerWindow = null;
    }

    this.mainWindow.show();
    this.mainWindow.setAlwaysOnTop(false);
    this.mainWindow.setSize(
      CONFIG.SETUP_WINDOW.WIDTH,
      CONFIG.SETUP_WINDOW.HEIGHT
    );
    this.centerWindow();

    if (process.platform === 'darwin') {
      this.mainWindow.setVisibleOnAllWorkspaces(false);
    }
  }

  private killChromeProcesses(): void {
    if (process.platform === 'darwin') {
      exec('pkill -f "Google Chrome"', (error) => {
        if (error && error.code !== 1) {
          console.error('Error killing Chrome processes:', error);
        }
      });
    }
  }

  private lockScreen(): void {
    if (process.platform === 'darwin') {
      exec('pmset displaysleepnow', (error) => {
        if (error) {
          console.error('Error locking screen:', error);
        }
      });
    }
  }

  private setupIpcHandlers(): void {
    ipcMain.handle('switch-to-timer-mode', () => {
      this.switchToTimerMode();
    });

    ipcMain.handle('switch-to-setup-mode', () => {
      this.switchToSetupMode();
    });

    ipcMain.handle('timer-finished', () => {
      this.killChromeProcesses();
      setTimeout(() => {
        this.lockScreen();
      }, 1000);
    });

    ipcMain.handle('toggle-pause', () => {
      if (this.mainWindow) {
        this.mainWindow.webContents.send('toggle-pause-from-timer');
      }
    });

    ipcMain.handle('stop-timer', () => {
      if (this.mainWindow) {
        this.mainWindow.webContents.send('stop-timer-from-timer');
      }
    });

    ipcMain.handle('update-timer-display', (_, data: TimerUpdateData) => {
      if (this.timerWindow) {
        this.timerWindow.webContents.send('timer-update', data);
      }
    });
  }
}

// Initialize the application
new CountdownTimerApp();