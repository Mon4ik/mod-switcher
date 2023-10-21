import * as path from "path"
import * as fs from "fs"
import {v4 as uuidv4} from "uuid"
import {unzip} from 'unzipit';

import {IpcMainInvokeEvent} from "electron"


import {getMinecraftPath, getModSwitcherPath} from "../utils";
import {IpcMain} from "electron"
import {ModPackInfo} from "../../typings";
import * as toml from "toml";
const {shell} = require("electron")

async function isCurrentlyUsing(id: string) {
    const minecraft = await getMinecraftPath()
    try {
        const modpackid = fs.readFileSync(path.join(minecraft, "mods", ".modpackid")).toString("utf-8")
        return modpackid === id
    } catch (e) {
        return false
    }
}

export async function getAlert(event: IpcMainInvokeEvent) {
    const appStorage = await getModSwitcherPath()
    const minecraft = await getMinecraftPath()

    if (!fs.existsSync(
        path.join(minecraft, "mods", ".modpackid")
    ) && fs.readdirSync(path.join(minecraft, "mods")).length !== 0) {
        return "manually-added"
    }
}

export async function fixMA(event: IpcMainInvokeEvent) {
    const appStorage = await getModSwitcherPath()
    const minecraft = await getMinecraftPath()

    const modpack: ModPackInfo = JSON.parse(
        await create(event, {
            title: "Migrated Modpack"
        })
    )

    fs.readdirSync(
        path.join(minecraft, "mods"),
        {
            withFileTypes: true
        }
    ).forEach((f) => {
        if (!f.isDirectory()) {
            fs.copyFileSync(path.join(minecraft, "mods", f.name), path.join(appStorage, modpack.id, f.name))
            fs.rmSync(path.join(minecraft, "mods", f.name))
        }
    })

    fs.writeFileSync(
        path.join(minecraft, "mods", ".modpackid"),
        modpack.id
    )
}

export async function getAll(): Promise<ModPackInfo[]> {
    const appStorage = await getModSwitcherPath()
    const minecraft = await getMinecraftPath()
    const modPacks = fs.readdirSync(appStorage, {withFileTypes: true}).filter((e) => e.isDirectory())


    return Promise.all(modPacks.map(async (dir) => ({
        currentlyUsing: await isCurrentlyUsing(dir.name),

        ...JSON.parse(fs.readFileSync(
            path.join(appStorage, dir.name, "info.json")
        ).toString("utf-8"))
    })))
}

export async function getMods(event: IpcMainInvokeEvent, id: string) {
    const appStorage = await getModSwitcherPath()

    const mods = fs.readdirSync(
        path.join(appStorage, id),
        {withFileTypes: true}
    )
        .filter((e) => e.isFile())
        .filter((e) => e.name !== "info.json")
        .map((e) => e.name)

    return Promise.all(
        mods
            .map(async (mod) => {
                const {entries} = await unzip(
                    fs.readFileSync(path.join(appStorage, id, mod))
                )

                if (entries["META-INF/mods.toml"]) {
                    const metadata_toml = await entries["META-INF/mods.toml"].arrayBuffer()
                    const metadata = toml.parse(Buffer.from(metadata_toml).toString("utf-8"))
                    return {
                        filename: mod,
                        version: metadata.mods[0].version,
                        displayName: metadata.mods[0].displayName,
                        displayURL: metadata.mods[0].displayURL,
                        credits: metadata.mods[0].credits,
                        authors: metadata.mods[0].authors,
                        description: metadata.mods[0].description
                    }
                } else if (entries["fabric.mod.json"]) {
                    const fabric_json = await entries["fabric.mod.json"].arrayBuffer()
                    const fabric = JSON.parse(Buffer.from(fabric_json).toString("utf-8"))
                    return {
                        filename: mod,
                        version: fabric.version,
                        displayName: fabric.name,
                        displayURL: fabric.contact?.homepage ?? "",
                        authors: fabric.authors.join(", "),
                        description: fabric.description
                    }
                } else {
                    return {
                        filename: mod,
                        version: "0.0.0",
                        displayName: mod,
                        description: mod
                    }
                }

            }))
}

export async function getOne(event: IpcMainInvokeEvent, id: string): Promise<ModPackInfo> {
    const appStorage = await getModSwitcherPath()

    return JSON.parse(
        fs.readFileSync(
            path.join(appStorage, id, "info.json")
        ).toString("utf-8")
    )
}

export async function create(event: IpcMainInvokeEvent, info: Partial<ModPackInfo> = {}) {
    const appStorage = await getModSwitcherPath()

    const modPackId = uuidv4()
    const modPackInfo: Partial<ModPackInfo> = Object.assign({
        id: modPackId,
        title: "Untitled ModPack",
        description: "",

        version: "1.19.4",
        loader: "Fabric",
        lastUsed: new Date().getTime()
    }, info)

    fs.mkdirSync(path.join(appStorage, modPackId))
    fs.writeFileSync(
        path.join(appStorage, modPackId, "info.json"),
        JSON.stringify(modPackInfo)
    )

    return JSON.stringify(modPackInfo as Required<ModPackInfo>)
}

export async function deletePack(event: IpcMainInvokeEvent, id: string) {
    const appStorage = await getModSwitcherPath()
    const minecraft = await getMinecraftPath()

    if (await isCurrentlyUsing(id)) {
        fs.readdirSync(
            path.join(minecraft, "mods")
        ).forEach((f) => {
            fs.rmSync(path.join(minecraft, "mods", f))
        })
    }

    fs.rmSync(path.join(appStorage, id), {recursive: true})
}

export async function save(event: IpcMainInvokeEvent, info_raw: string) {
    const appStorage = await getModSwitcherPath()
    const info: ModPackInfo = JSON.parse(info_raw)

    fs.writeFileSync(
        path.join(appStorage, info.id, "info.json"),
        info_raw
    )
}

export async function openInExplorer(event: IpcMainInvokeEvent, id: string) {
    const appStorage = await getModSwitcherPath()
    const modPackPath = path.join(appStorage, id)

    await shell.openPath(modPackPath)
}


export async function saveMod(event: IpcMainInvokeEvent, id: string, mod: any) {
    const appStorage = await getModSwitcherPath()
    const minecraft = await getMinecraftPath()
    fs.writeFileSync(
        path.join(appStorage, id, mod.name),
        Buffer.from(mod.data)
    )

    if (await isCurrentlyUsing(id)) {
        fs.writeFileSync(
            path.join(minecraft, "mods", mod.name),
            Buffer.from(mod.data)
        )
    }
}

export async function removeMod(event: IpcMainInvokeEvent, id: string, filename: string) {
    const appStorage = await getModSwitcherPath()
    const minecraft = await getMinecraftPath()
    fs.rmSync(path.join(appStorage, id, filename))

    if (await isCurrentlyUsing(id)) {
        fs.rmSync(path.join(minecraft, "mods", filename))
    }
}

export async function use(event: IpcMainInvokeEvent, id: string) {
    const appStorage = await getModSwitcherPath()
    const minecraft = await getMinecraftPath()

    const mods = fs.readdirSync(
        path.join(appStorage, id),
        {withFileTypes: true}
    )
        .filter((e) => e.isFile())
        .filter((e) => e.name !== "info.json")
        .map((e) => e.name)

    mods.forEach((mod) => {
        fs.copyFileSync(path.join(appStorage, id, mod), path.join(minecraft, "mods", mod))
    })

    fs.writeFileSync(
        path.join(minecraft, "mods", ".modpackid"),
        id
    )

    await save(
        event,
        JSON.stringify(Object.assign(
            (await getOne(event, id)),
            {
                lastUsed: new Date().getTime()
            }
        ))
    )
}

export async function unUse(event: IpcMainInvokeEvent) {
    const minecraft = await getMinecraftPath()

    fs.readdirSync(
        path.join(minecraft, "mods")
    ).forEach((f) => {
        fs.rmSync(path.join(minecraft, "mods", f))
    })
}