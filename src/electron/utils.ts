import electronSettings from "electron-settings";
import * as path from "path";
import * as fs from "fs";

export async function getMinecraftPath() {
    const appdata = process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + "/.local/share")

    const minepath = await electronSettings.get("minecraft-path") as string | null
    if (!minepath) {
        await electronSettings.set("minecraft-path", path.join(appdata, ".minecraft"))
    }

    return minepath ?? path.join(appdata, ".minecraft")
}

export async function getModSwitcherPath() {
    const MSPath = path.join(await getMinecraftPath(), ".mod-switcher")

    console.log(MSPath, fs.existsSync(MSPath))
    if (!fs.existsSync(MSPath)) {
        fs.mkdirSync(MSPath, { recursive: true})
    }

    return MSPath
}