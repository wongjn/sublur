const { app, BrowserWindow } = require('electron');

/**
 * Global window reference to prevent garbage collection on the active window.
 *
 * @type {import('electron').BrowserWindow|null}
 */
let window;

function createWindow() {
  window = new BrowserWindow({
    width: 1600,
    height: 900,
    backgroundColor: '#263238',
    frame: false,
    webPreferences: { nodeIntegration: true },
  });
  window.loadFile('app/index.html');
  window.on('closed', () => {
    window = null;
  });

  if (!app.isPackaged) {
    window.webContents.openDevTools();
  }
}

app.on('ready', createWindow);

app.on('activate', () => {
  if (window === null) {
    createWindow();
  }
});
