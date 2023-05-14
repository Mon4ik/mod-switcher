import electronSettings from "electron-settings";
import {getMinecraftPath} from "../utils";
import {IpcMainInvokeEvent} from "electron";

export async function get(event: IpcMainInvokeEvent) {
    return {
        "minecraft-path": await getMinecraftPath()
    }
}

export async function set(event: IpcMainInvokeEvent, name: string, value: any) {
    await electronSettings.set(name, value)
}

