<script setup lang="ts">
import {useIpcRenderer} from "@vueuse/electron"
import {computed, onMounted, ref} from "vue";
import {ipcRendererInvoke} from "../typings";

import {version} from "../../package.json"
const shell = require('electron').shell;

const vers = computed(() => version)
const settings = ref({})

async function save() {
    for (const [key, value] of Object.entries(settings.value)) {
        await ipcRendererInvoke("settings:set", key, value)
    }
}

async function selectMinecraftPath() {
    const folder = await ipcRendererInvoke("dialog:openDirectory")
    if (!folder) return

    settings.value["minecraft-path"] = folder
}

onMounted(async () => {
    settings.value = await ipcRendererInvoke("settings:get")
})
</script>

<template>
    <h1>Settings</h1>

    <div class="flex flex-col gap-2" v-if="settings">
        <div class="flex flex-col">
            <label class="font-semibold mt-2"><code>.minecraft</code> path</label>

            <div class="flex flex-row gap-2 mt-1">
                <input type="text" class="control w-full" v-model="settings['minecraft-path']">
                <button class="btn btn-none !mb-0"
                        @click="selectMinecraftPath">Select</button>
            </div>
        </div>

        <button class="btn btn-success"
                @click="save">
            Save
        </button>

        <div class="flex flex-row justify-between">
            <span class="text-neutral-500">Mod switcher v{{ vers }}</span>
            <div class="flex flex-row gap-2">
                <a @click="shell.openExternal('https://github.com/Mon4ik/mod-switcher')">Github</a>
                <a @click="shell.openExternal('https://github.com/Mon4ik/mod-switcher/issues')">Issues</a>
            </div>
        </div>
    </div>
</template>
