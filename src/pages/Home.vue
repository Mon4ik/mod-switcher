<script setup lang="ts">
import imageUrl from "../assets/imgs/home.png";
import Popper from "vue3-popper";
import {onMounted, ref} from "vue";
import {ModPackInfo, ipcRendererInvoke} from "../typings";
import {usePreferredDark} from "@vueuse/core";

const {openExternal} = require("electron").shell

const isDark = usePreferredDark()

const modPacks = ref<ModPackInfo[]>([])
const alertType = ref("")


async function reloadModpacks() {
    modPacks.value = (await ipcRendererInvoke<ModPackInfo[]>("modpacks:getAll"))
        .sort((a, b) => b.lastUsed - a.lastUsed)
    //@ts-ignore
    alertType.value = await ipcRendererInvoke("modpacks:getAlert")
}

async function createModpack() {
    await ipcRendererInvoke("modpacks:create")
    await reloadModpacks()
}

async function migrateToModpack() {
    await ipcRendererInvoke("modpacks:fixMA") // fix "manually added" alert
    await reloadModpacks()
}

async function toggleModpack(id: string, using: boolean) {
    if (using) {
        await ipcRendererInvoke("modpacks:unuse", id)
    } else {
        const modpack = modPacks.value.find((pack) => pack.currentlyUsing)
        if (modpack) {
            await ipcRendererInvoke("modpacks:unuse", modpack.id)
        }

        await ipcRendererInvoke("modpacks:use", id)
    }

    await reloadModpacks()
}

function downloadCore(modPack: ModPackInfo) {
    if (modPack.loader === "Forge") {
        openExternal(`https://files.minecraftforge.net/net/minecraftforge/forge/index_${modPack.version}.html`)
    } else if (modPack.loader === "Fabric") {
        openExternal("https://fabricmc.net/use/installer/")
    } else if (modPack.loader === "Quilt") {
        openExternal("https://quiltmc.org/en/install/")
    }
}

onMounted(() => {
    reloadModpacks()
})
</script>
<template>
    <div class="flex flex-row justify-between items-baseline mb-2">
        <h1 class="!mt-0">Modpacks</h1>

        <div class="flex gap-2">
            <button class="btn btn-none !mb-0"
                    @click="reloadModpacks">
                Reload
            </button>
            <button class="btn btn-info !mb-0"
                    @click="createModpack">
                New
            </button>
        </div>
    </div>

    <div v-if="alertType === 'manually-added'" class="alert alert-danger">
        <p>Seems, mods in <samp>.minecraft/mods</samp> were manually added</p>

        <button class="btn btn-success !mb-0 w-full"
                @click="migrateToModpack">
            Add to new Modpack
        </button>
    </div>

    <div class="flex flex-col gap-2">
        <div class="box flex flex-row items-center gap-2"
             v-for="modPack in modPacks" :key="modPack.id"
        >
            <img src="https://placehold.co/512x512.png" :alt="modPack.title"
                 width="64" height="64"
                 class="rounded-xl">

            <div class="flex flex-row justify-between items-center w-full">
                <div class="flex flex-col">
                    <div class="flex flex-row gap-2">
                        <h4 class="!mt-0">{{ modPack.title }} </h4>
                        <span class="rounded-full px-4 py-1 text-sm bg-blue-200 text-blue-500">
                            {{ modPack.loader }} {{ modPack.version }}
                        </span>
                    </div>

                    <p>{{ modPack.description }}</p>
                </div>
                <div class="flex flex-row items-center gap-2">
                    <button class="btn btn-success !mb-0"
                            v-if="!modPack.currentlyUsing"
                            @click="toggleModpack(modPack.id, false)">
                        Enable
                    </button>
                    <button class="btn btn-danger !mb-0"
                            v-else
                            @click="toggleModpack(modPack.id, true)">
                        Disable
                    </button>

                    <router-link :to="`/modpack/${modPack.id}`">
                        <button class="btn btn-none !mb-0">Modify</button>
                    </router-link>


                    <Popper :class="isDark ? 'dark' : 'light'"
                            arrow
                            disableClickAway>
                        <button>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                 class="bi bi-three-dots" viewBox="0 0 16 16">
                                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                            </svg>
                        </button>
                        <template #content>
                            <div class="flex flex-col gap-2">
                                <button class="btn btn-none !mb-0"
                                        @click="() => downloadCore(modPack)">
                                    Download {{ modPack.loader }} {{ modPack.version }}
                                </button>
<!--                                <button class="btn btn-none !mb-0">Export to .zip</button> WIP-->
                            </div>
                        </template>
                    </Popper>
                </div>
            </div>
        </div>
    </div>

</template>
