const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');

let mainWindow;
let isTimerMode = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 320,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    resizable: false,
    alwaysOnTop: false,
    show: false,
    frame: true,
    titleBarStyle: 'default'
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    centerWindow();
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function centerWindow() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const windowBounds = mainWindow.getBounds();
  const x = Math.round((width - windowBounds.width) / 2);
  const y = Math.round((height - windowBounds.height) / 2);

  mainWindow.setPosition(x, y);
}

function switchToTimerMode() {
  if (isTimerMode) return;

  isTimerMode = true;

  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;

  mainWindow.setSize(200, 50);
  mainWindow.setPosition(width - 210, 10);
  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  if (process.platform === 'darwin') {
    mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }
}

function switchToSetupMode() {
  if (!isTimerMode) return;

  isTimerMode = false;

  mainWindow.setAlwaysOnTop(false);
  mainWindow.setSize(320, 300);
  centerWindow();

  if (process.platform === 'darwin') {
    mainWindow.setVisibleOnAllWorkspaces(false);
  }
}

function killChromeProcesses() {
  if (process.platform === 'darwin') {
    exec('pkill -f "Google Chrome"', (error, stdout, stderr) => {
      if (error && error.code !== 1) {
        console.error('Error killing Chrome processes:', error);
      }
    });
  }
}

function lockScreen() {
  if (process.platform === 'darwin') {
    exec('pmset displaysleepnow', (error, stdout, stderr) => {
      if (error) {
        console.error('Error locking screen:', error);
      }
    });
  }
}

ipcMain.handle('switch-to-timer-mode', () => {
  switchToTimerMode();
});

ipcMain.handle('switch-to-setup-mode', () => {
  switchToSetupMode();
});

ipcMain.handle('timer-finished', () => {
  killChromeProcesses();
  setTimeout(() => {
    lockScreen();
    switchToSetupMode();
  }, 1000);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});