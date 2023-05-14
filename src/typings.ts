const ipcRenderer = require("electron").ipcRenderer

export type ModPackInfo = {
    currentlyUsing: boolean
    id: string
    title: string
    description: string
    version: string
    loader: string
    lastUsed: number
}

export type ModMetadata = {
    filename: string
    version: string
    displayName: string
    displayURL?: string
    credits?: string
    authors?: string
    description: string
}

export function ipcRendererInvoke<T = any>(channel: string, ...args: any[]): Promise<T> {
    return ipcRenderer.invoke(channel, ...args)
}