const path = require('path');
const url = require('url');
const {
  app,
  BrowserWindow,
  Tray,
  ipcMain,
  systemPreferences,
  shell,
  protocol,
  nativeTheme,
  screen,
  dialog
} = require('electron');
const { openExternal } = shell;

const regedit = require('rage-edit');
const log = require('electron-log');
const Store = require('electron-store');

const pjson = require('./package.json');

process.argv.push('--enable-dawn-features=allow_unsafe_apis');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'file',
    privileges: { bypassCSP: true }
  }
]);

const {
  APP_URL_008 = url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }),
  APP_DEBUG_008 = 'no'
} = process.env;

const STORE = new Store();

const ISWIN = process.platform === 'win32';
const ISLINUX = process.platform === 'linux';
const WIN_MARGIN_Y = 23;

let QUITTING;
let ANCHORED = ISLINUX
  ? false
  : STORE.get('anchored') === undefined
  ? true
  : STORE.get('anchored');
let TRAYPOS;

let mainWindow;
let tray;

const { quit } = app;

const trayIcon = () => {
  let icon = nativeTheme.shouldUseDarkColors ? 'trayl.png' : 'trayd.png';
  if (ISLINUX) icon = 'trayp.png';
  if (ISWIN) icon = 'tray.ico';

  return path.join(__dirname, 'assets', icon);
};

const alignWindow = () => {
  if (!mainWindow) return;

  let x = 0;
  let y = 0;
  const margin_x = 0;
  const margin_y = ISWIN ? WIN_MARGIN_Y : 0;

  const { height, width } = mainWindow.getBounds();

  const screenBounds = screen.getPrimaryDisplay().size;
  const trayBounds = TRAYPOS || tray.getBounds();

  let trayPos = 4; // 1:top-left 2:top-right 3:bottom-left 4.bottom-right
  trayPos = trayBounds.y > screenBounds.height / 2 ? trayPos : trayPos / 2;
  trayPos = trayBounds.x > screenBounds.width / 2 ? trayPos : trayPos - 1;

  // calculate the new window position
  switch (trayPos) {
    case 1: // TOP - LEFT
      x = Math.floor(trayBounds.x + margin_x + trayBounds.width / 2);
      y = Math.floor(trayBounds.y + margin_y + trayBounds.height / 2);
      break;

    case 2: // TOP - RIGHT
      x = Math.floor(trayBounds.x - width - margin_x + trayBounds.width / 2);
      y = Math.floor(trayBounds.y + margin_y + trayBounds.height / 2);
      break;

    case 3: // BOTTOM - LEFT
      x = Math.floor(trayBounds.x + margin_x + trayBounds.width / 2);
      y = Math.floor(trayBounds.y - height - margin_y + trayBounds.height / 2);
      break;

    case 4: // BOTTOM - RIGHT
      x = Math.floor(trayBounds.x - width - margin_x + trayBounds.width / 2);
      y = Math.floor(trayBounds.y - height - margin_y + trayBounds.height / 2);
      break;
  }

  mainWindow.setPosition(x, y);
};

const display = () => {
  if (!mainWindow) return;

  mainWindow.show();
  mainWindow.focus();
};

const createWindow = anchor => {
  if (mainWindow) {
    if (anchor && ANCHORED) return;
    if (!anchor && !ANCHORED) return;
  }

  ANCHORED = anchor;
  STORE.set('anchored', ANCHORED);

  if (mainWindow) {
    mainWindow.close();

    if (tray) tray.destroy();
  }

  mainWindow = new BrowserWindow({
    alwaysOnTop: ANCHORED,
    frame: !ANCHORED,
    skipTaskbar: ANCHORED,
    useContentSize: !ANCHORED,
    resizable: true,
    fullscreenable: false,
    maximizable: false,
    minimizable: false,
    show: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'loader.js')
    }
  });

  mainWindow.webContents.on('did-fail-load', () => {
    setTimeout(() => mainWindow.loadURL(APP_URL_008), 1000);
  });

  mainWindow.webContents.on('ready-to-show', () => {
    mainWindow.webContents.send('anchored', { anchored: ANCHORED });
  });

  if (APP_DEBUG_008 === 'yes') mainWindow.webContents.openDevTools();

  mainWindow.setContentSize(340, 460);
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(APP_URL_008);

  mainWindow.on('close', ev => {
    if (!QUITTING) ev.preventDefault();

    if (ISLINUX || ISWIN) {
      mainWindow.minimize();
    } else {
      mainWindow.hide();
    }
  });

  if (!ANCHORED) {
    display();
    return;
  }

  tray = new Tray(trayIcon());
  tray.setIgnoreDoubleClickEvents(true);
  tray.on('click', () => {
    if (ISLINUX) {
      TRAYPOS = { ...screen.getCursorScreenPoint(), width: 32, height: 32 };
    }

    if (mainWindow.isVisible()) {
      mainWindow.hide();
      return;
    }

    alignWindow();
    display();
  });
};

const deepLink = ({ url }) => {
  try {
    if (url === '.') return;
    mainWindow.webContents.send('deep-link', { url });
  } catch (err) {}
};

const registerProtocolol = async () => {
  const protocols = ['tel', 'callto', 'sip'];

  protocols.forEach(protocol => {
    if (process.defaultApp && process.argv.length >= 2)
      app.setAsDefaultProtocolClient(protocol, process.execPath, [
        path.resolve(process.argv[1])
      ]);
    else app.setAsDefaultProtocolClient(protocol);
  });

  if (ISWIN) {
    const { productName } = pjson;

    for (const field of ['ApplicationName', 'ApplicationDescription']) {
      await regedit.Registry.set(
        `HKCU\\Software\\${productName}\\Capabilities`,
        field,
        `${productName}`
      );
    }

    for (const protocol of protocols) {
      await regedit.Registry.set(
        `HKCU\\Software\\${productName}\\Capabilities\\URLAssociations`,
        protocol,
        `${productName}.${protocol}`
      );
      await regedit.Registry.set(
        `HKCU\\Software\\Classes\\${productName}.${protocol}\\DefaultIcon`,
        '',
        process.execPath
      );
      await regedit.Registry.set(
        `HKCU\\Software\\Classes\\${productName}.${protocol}\\shell\\open\\command`,
        '',
        `"${process.execPath}" "%1"`
      );
    }

    await regedit.Registry.set(
      'HKCU\\Software\\RegisteredApplications',
      `${productName}`,
      `Software\\${productName}\\Capabilities`
    );
  }
};

const requestPermissions = async () => {
  if (ISLINUX) return;

  const permissions = ['microphone', 'camera'];
  for (const permission of permissions) {
    if (systemPreferences.getMediaAccessStatus(permission) !== 'granted')
      await systemPreferences.askForMediaAccess(permission);
  }
};

!app.requestSingleInstanceLock() && quit();

app.on('activate', display);

app.on('before-quit', () => (QUITTING = true));

app.on('open-url', (_, url) => {
  display();
  deepLink({ url });
});

app.on('second-instance', (ev, argv) => {
  display();

  if (ISWIN) {
    const url = argv[argv.length - 1];
    deepLink({ url });
  }
});

nativeTheme.on('updated', () => {
  if (tray) tray.setImage(trayIcon());
});

ipcMain.on('show', display);
ipcMain.on('quit', quit);
if (!ISLINUX) {
  ipcMain.on('anchor', () => createWindow(true));
  ipcMain.on('unanchor', () => createWindow(false));
}
ipcMain.on('open', (_, { url }) => openExternal(url));
ipcMain.on('resize', (_, opts) => {
  const { width, height } = opts;

  mainWindow.setContentSize(width, height);
  if (ANCHORED) {
    mainWindow.setSize(width, height);
    alignWindow();
  }
});

app.on('ready', async () => {
  try {
    await registerProtocolol();
    await requestPermissions();

    createWindow(ANCHORED);
  } catch (err) {
    log.error(err);
    await dialog.showMessageBox({
      type: 'error',
      title: 'Error',
      message: 'Houston we had a problem!',
      detail: err.message,
      buttons: ['Close']
    });
    quit();
  }
});
