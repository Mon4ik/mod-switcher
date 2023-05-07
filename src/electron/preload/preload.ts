import {ModMetadata, ModPackInfo} from "../../typings";

const {contextBridge, ipcRenderer} = require('electron')

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector: any, text: any) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }
})


contextBridge.exposeInMainWorld('modpacks', {
    getAlert: () => ipcRenderer.invoke("modpacks:getAlert"),
    fixMA: () => ipcRenderer.invoke("modpacks:fixMA"),

    getAll: () => ipcRenderer.invoke("modpacks:getAll"),
    getOne: (id: string) => ipcRenderer.invoke("modpacks:getOne", id),
    getMods: (id: string) => ipcRenderer.invoke("modpacks:getMods", id),
    create: () => ipcRenderer.invoke("modpacks:create"),
    delete: (id: string) => ipcRenderer.invoke("modpacks:delete", id),
    save: (info: string) => ipcRenderer.invoke("modpacks:save", info),
    saveMod: (id: string, mod: any) => ipcRenderer.invoke("modpacks:saveMod", id, mod),
    removeMod: (id: string, filename: string) => ipcRenderer.invoke("modpacks:removeMod", id, filename),
    use: (id: string) => ipcRenderer.invoke("modpacks:use", id),
    unUse: (id: string) => ipcRenderer.invoke("modpacks:unuse", id)
})

