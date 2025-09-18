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

  // Create a new frameless window for timer mode
  const timerWindow = new BrowserWindow({
    width: 85,
    height: 25,
    x: width - 95,
    y: 10,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    transparent: true,
    hasShadow: false
  });

  // Hide the main window and show timer window
  mainWindow.hide();
  timerWindow.loadFile('timer.html');
  timerWindow.setAlwaysOnTop(true, 'screen-saver');

  if (process.platform === 'darwin') {
    timerWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  // Store reference to timer window
  global.timerWindow = timerWindow;

  timerWindow.on('closed', () => {
    global.timerWindow = null;
  });
}

function switchToSetupMode() {
  if (!isTimerMode) return;

  isTimerMode = false;

  // Close timer window and show main window
  if (global.timerWindow) {
    global.timerWindow.close();
    global.timerWindow = null;
  }

  mainWindow.show();
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
  }, 1000);
});

ipcMain.handle('toggle-pause', () => {
  // Forward pause toggle to main window
  if (mainWindow) {
    mainWindow.webContents.send('toggle-pause-from-timer');
  }
});

ipcMain.handle('stop-timer', () => {
  // Forward stop to main window
  if (mainWindow) {
    mainWindow.webContents.send('stop-timer-from-timer');
  }
});

ipcMain.handle('update-timer-display', (event, data) => {
  // Forward timer updates to timer window
  if (global.timerWindow) {
    global.timerWindow.webContents.send('timer-update', data);
  }
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