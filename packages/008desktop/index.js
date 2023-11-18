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
  nativeTheme
} = require('electron');
const { openExternal } = shell;

const trayWindow = require('electron-tray-window');
const regedit = require('rage-edit');
const log = require('electron-log');

const pjson = require('./package.json');

app.commandLine.appendSwitch('enable-unsafe-webgpu');
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'file',
    privileges: { bypassCSP: true }
  }
]);

const {
  APP_URL = url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }),
  APP_DEBUG = false
} = process.env;

const WINDOWS_MAGICAL_MARGIN = 23;
const margin_y = process.platform === 'win32' ? WINDOWS_MAGICAL_MARGIN : null;

let SIZE, QUITTING, ANCHORED;

let mainWindow;
let tray;

const trayIcon = () => {
  const assets = path.join(__dirname, 'assets');

  if (process.platform === 'win32') return path.join(assets, 'tray.ico');

  return path.join(
    assets,
    nativeTheme.shouldUseDarkColors ? 'trayl.png' : 'trayd.png'
  );
};

const createTray = () => {
  tray = new Tray(trayIcon());
  tray.setIgnoreDoubleClickEvents(true);
};

const createWindow = () => {
  let height = 0;
  let width = 0;
  let x, y;

  if (mainWindow) {
    [x, y] = mainWindow.getPosition();
    mainWindow.close();
    tray.destroy();
  }

  if (SIZE) {
    height = ANCHORED ? 0 : SIZE.height;
    width = ANCHORED ? 0 : SIZE.width;
  }

  mainWindow = new BrowserWindow({
    alwaysOnTop: ANCHORED,
    frame: !ANCHORED,
    resizable: APP_DEBUG,
    maximizable: false,
    minimizable: false,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'loader.js'),
      devTools: APP_DEBUG
    }
  });

  mainWindow.loadURL(APP_URL);
  mainWindow.setContentSize(width, height);

  mainWindow.setMenuBarVisibility(false);

  mainWindow.webContents.on('did-fail-load', () => {
    setTimeout(() => mainWindow.loadURL(APP_URL), 10 * 1000);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    ANCHORED ? trayWindow.alignWindow() : display();
    mainWindow.webContents.send('anchored', { anchored: ANCHORED });
  });

  if (APP_DEBUG) mainWindow.webContents.openDevTools();

  if (ANCHORED) {
    createTray();
    app.dock && app.dock.hide();
  } else {
    mainWindow.on('close', e => {
      if (!QUITTING) e.preventDefault();
      mainWindow.hide();
    });

    x && y ? mainWindow.setPosition(x, y - margin_y) : mainWindow.center();

    mainWindow.show();
    app.dock && app.dock.show();

    return;
  }

  trayWindow.setOptions({
    tray,
    window: mainWindow,
    margin_y
  });
};

const display = () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
};

const quit = () => app.quit();

const anchor = () => {
  if (ANCHORED) return;
  ANCHORED = true;
  createWindow();
};

const unanchor = () => {
  if (!ANCHORED) return;
  ANCHORED = false;
  createWindow();
};

const deepLink = ({ url }) => {
  try {
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

  if (process.platform === 'win32') {
    const { productName } = pjson;

    await regedit.Registry.set(
      `HKCU\\Software\\${productName}\\Capabilities`,
      'ApplicationName',
      `${productName}`
    );
    await regedit.Registry.set(
      `HKCU\\Software\\${productName}\\Capabilities`,
      'ApplicationDescription',
      `${productName}`
    );

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
  const permissions = ['microphone', 'camera'];
  permissions.forEach(async permission => {
    if (systemPreferences.getMediaAccessStatus(permission) !== 'granted')
      await systemPreferences.askForMediaAccess(permission);
  });
};

!app.requestSingleInstanceLock() && quit();

app.on('activate', display);
app.on('before-quit', () => (QUITTING = true));

app.on('certificate-error', (ev, _, __, ___, ____, callback) => {
  ev.preventDefault();
  const data = true;
  callback(data);
});

app.on('open-url', (_, url) => {
  display();
  deepLink({ url });
});

app.on('second-instance', (_, argv) => {
  display();

  if (process.platform === 'win32') {
    const url = argv[argv.length - 1];
    if (url === '.') return;
    deepLink({ url });
  }
});

app.on('ready', async () => {
  try {
    await requestPermissions();
    await registerProtocolol();

    ipcMain.on('show', display);
    ipcMain.on('quit', quit);
    ipcMain.on('anchor', anchor);
    ipcMain.on('unanchor', unanchor);
    ipcMain.on('open', (_, { url }) => openExternal(url));

    ipcMain.on('resize', (_, opts) => {
      const { width, height } = opts;
      if (!mainWindow || !trayWindow) return;

      SIZE = { width, height };

      mainWindow.setContentSize(width, height);
      trayWindow.setWindowSize({ width, height });
    });

    nativeTheme.on('updated', () => tray.setImage(trayIcon()));

    anchor();
  } catch (err) {
    log.error(err);
    quit();
  }
});
