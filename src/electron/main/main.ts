import {join} from 'path';
import {
    app,
    BrowserWindow,
    ipcMain,
    dialog
} from 'electron';
import * as modpacks from "../ipcHandlers/modpacks";
import * as settings from "../ipcHandlers/settings";

const isDev = process.env.npm_lifecycle_event === "app:dev"

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // preload: join(__dirname, '../preload/preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    mainWindow.setMenuBarVisibility(false)

    // and load the index.html of the app.
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');// Open the DevTools.
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(join(__dirname, '../../../index.html'));
        console.log("File loaded")
    }

    ipcMain.handle("modpacks:getAlert", modpacks.getAlert)
    ipcMain.handle("modpacks:fixMA", modpacks.fixMA)

    ipcMain.handle("modpacks:getAll", modpacks.getAll)
    ipcMain.handle("modpacks:getOne", modpacks.getOne)
    ipcMain.handle("modpacks:getMods", modpacks.getMods)

    ipcMain.handle("modpacks:create", modpacks.create)
    ipcMain.handle("modpacks:delete", modpacks.deletePack)
    ipcMain.handle("modpacks:save", modpacks.save)
    ipcMain.handle("modpacks:openInExplorer", modpacks.openInExplorer)

    ipcMain.handle("modpacks:saveMod", modpacks.saveMod)
    ipcMain.handle("modpacks:removeMod", modpacks.removeMod)

    ipcMain.handle("modpacks:use", modpacks.use)
    ipcMain.handle("modpacks:unuse", modpacks.unUse)

    ipcMain.handle("settings:get", settings.get)
    ipcMain.handle("settings:set", settings.set)

    ipcMain.handle('dialog:openDirectory', async () => {
        const {canceled, filePaths} = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        })

        if (!canceled) {
            return filePaths[0]
        }
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});