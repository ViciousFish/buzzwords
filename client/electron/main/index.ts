import { app, BrowserWindow, shell, ipcMain, dialog } from "electron";
import { resolve, join } from "path";
import contextMenu from "electron-context-menu";

import "./menu";

contextMenu({
  showSaveImageAs: true,
});

// Disable GPU Acceleration for Windows 7 (came with electron vite template)
// if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

export const ROOT_PATH = {
  // /dist
  dist: join(__dirname, "../.."),
  // /dist or /public
  public: join(__dirname, app.isPackaged ? "../.." : "../../../public"),
};

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin
const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}`;
const indexHtml = join(ROOT_PATH.dist, "index.html");

async function createWindow() {
  win = new BrowserWindow({
    title: "Buzzwords",
    icon: join(ROOT_PATH.public, "favicon.ico"),
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#865511",
      symbolColor: "#ffffff",
    },
    trafficLightPosition: { x: 18, y: 18 },
    minHeight: 400,
    minWidth: 400,
    width: 900,
    height: 750,
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // nodeIntegration: true,
      contextIsolation: true,
    },
  });

  win.setMenu(null);
  if (app.isPackaged) {
    win.loadFile(indexHtml);
  } else {
    win.loadURL(url);
    // Open devTool if the app is not packaged
    // win.webContents.openDevTools();
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("before-input-event", (event, input) => {
    if (input.control && input.key.toLowerCase() === "i") {
      win?.webContents.openDevTools();
      event.preventDefault();
    }
  });

  win.webContents.on("will-navigate", (e, url) => {
    // app loads file:// in prod, but vite uses 127.0.0.1 for hot reloading in dev
    // all other urls are links and should be opened in the browser
    if (
      (app.isPackaged && !url.startsWith("file:")) ||
      (!app.isPackaged && !url.startsWith("http://127.0.0.1"))
    ) {
      shell.openExternal(url);
      e.preventDefault();
    }
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

ipcMain.handle("ping", () => "pong");

// new window example arg: new windows url
ipcMain.handle("open-win", (event, arg) => {
  dialog.showErrorBox(
    "Something went wrong",
    "This code shouldn't have been reachable. Please get in touch and let us know how you got here."
  );
});

app.on("open-url", function (event, data) {
  dialog.showErrorBox("debug", data);
  win?.webContents.send("open-url", data);
  event.preventDefault();
});

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(
      process.env.VITE_PRIVATE_SCHEME_NAME ?? "buzzwords",
      process.execPath,
      [resolve(process.argv[1])]
    );
  }
} else {
  app.setAsDefaultProtocolClient(
    process.env.VITE_PRIVATE_SCHEME_NAME ?? "buzzwords"
  );
}
