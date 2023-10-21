<script setup lang="ts">
import {fetchModrinth, fetchProgress, ModrinthMod} from "../utils";
import {onMounted, ref} from "vue";
import {ipcRendererInvoke, ModMetadata, ModPackInfo} from "../typings";
import {useRoute, useRouter} from "vue-router";
import {usePreferredDark} from "@vueuse/core";

import ModDownload from "../components/ModDownload.vue";
import Popper from "vue3-popper"
import Modal from "../components/Modal.vue";
import ShareModal from "../components/ShareModal.vue";

const {shell} = require('electron')

const route = useRoute()
const router = useRouter()

const isDark = usePreferredDark()

const dragOver = ref<boolean>(false)

const info = ref<ModPackInfo>()
const mods = ref<ModMetadata[]>()

const versions = ref<string[]>([])
const shareOpened = ref(false)


async function refreshInfo() {
	info.value = await ipcRendererInvoke("modpacks:getOne", route.params.id)
	mods.value = await ipcRendererInvoke("modpacks:getMods", route.params.id)
}

async function save() {
	await ipcRendererInvoke("modpacks:save", JSON.stringify(info.value))
	await refreshInfo()
}

async function deletePack() {
	await ipcRendererInvoke("modpacks:delete", info.value.id)
	await router.push({
		path: "/"
	})
}

async function saveMod(e: { dataTransfer: DataTransfer }) {
	for (const file of e.dataTransfer.files) {
		let reader = new FileReader()
		reader.readAsArrayBuffer(file)

		reader.onloadend = async function () {
			await ipcRendererInvoke(
				"modpacks:saveMod",
				route.params.id,
				{
					name: file.name,
					data: new Uint8Array(reader.result as ArrayBuffer)
				}
			)
			await refreshInfo()
		}
	}
}

async function removeMod(filename: string) {
	await ipcRendererInvoke("modpacks:removeMod", route.params.id, filename)
	await refreshInfo()
}

async function openInExplorer() {
	await ipcRendererInvoke("modpacks:openInExplorer", route.params.id)

}

onMounted(async () => {
	['dragenter', 'dragover', 'dragleave', 'drop']
		.forEach((eventName) => {
			document.body.addEventListener(eventName, (e) => e.preventDefault())
		})

	await refreshInfo()

	// loading minecraft versions
	const all_versions = await fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json")
		.then((res) => res.json())
		.then((data) => data.versions)

	versions.value = all_versions
		.filter((ver) => ver.type === "release")
		.map((ver) => ver.id)
})
</script>

<template>
    <ShareModal :opened="shareOpened" @close="shareOpened = false" />

    <div class="flex justify-between items-center my-2">
        <h1 class="!mt-0">Modify</h1>

        <div class="flex gap-2 items-baseline">
            <router-link to="/">
                <button class="btn btn-none !mb-0">Back</button>
            </router-link>
            <Popper :class="isDark ? 'dark' : 'light'"
                    arrow
                    disableClickAway :zIndex="40">
                <button class="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                         class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                        <path
                                d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                    </svg>
                </button>
                <template #content>
                    <div class="flex flex-col gap-2">
                        <button class="btn btn-none !mb-0"
                        @click="shareOpened = !shareOpened">
                            Share
                            <span class="badge badge-success">NEW</span>
                        </button>
                        <button class="btn btn-none !mb-0"
                        @click="openInExplorer">
                            Open in Explorer
                        </button>
                        <button class="btn btn-danger !mb-0"
                                @click="deletePack">
                            Delete forever
                        </button>
                    </div>
                </template>
            </Popper>
        </div>


    </div>
    <div v-if="info !== undefined" class="grid md:grid-cols-[2fr_1fr] gap-2 relative">
        <div class="flex flex-col gap-2">
            <div class="box flex items-center justify-between"
                 v-for="mod in mods!" :key="mod.displayName">
                <p>{{ mod.displayName }} ({{ mod.version }})</p>
                <button class="btn btn-danger !mb-0"
                        @click="removeMod(mod.filename)">
                    Remove
                </button>
            </div>

            <hr>

            <div class="box border-dashed border-4 text-center !p-10"
                 @drop.prevent="saveMod">
                <p class="select-none">
                    Drop here <code>.jar</code> files
                </p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                <ModDownload
                        name="Fabric API"
                        loader="fabric" :version="info!.version" :versions="versions"
                        :mod-id="ModrinthMod.FabricAPI"
                        v-if="info!.loader.toLowerCase() === 'fabric'"
                        @refresh-info="refreshInfo"
                />
                <ModDownload
                        name="Sodium"
                        loader="fabric" :version="info!.version" :versions="versions"
                        :mod-id="ModrinthMod.Sodium"
                        v-if="info!.loader.toLowerCase() === 'fabric'"
                        @refresh-info="refreshInfo"
                />
            </div>
        </div>

        <!-- === Right box === -->

        <div class="flex flex-col gap-2 box h-fit mt-5 md:mt-0">
            <div class="flex flex-col">
                <label class="font-semibold">Title</label>
                <input
                        type="text" class="control" v-model="info.title"
                        @change="save"
                >
            </div>
            <div class="flex flex-col">
                <label class="font-semibold">Description</label>
                <input
                        type="text" class="control" v-model="info.description"
                        @change="save"
                >
            </div>

            <div class="flex flex-col">
                <label class="font-semibold">Minecraft Version</label>
                <input
                        type="text" list="versions" class="control" v-model="info.version"
                        @change="save"
                >
            </div>
            <datalist id="versions">
                <option v-for="version in versions" :value="version"/>
            </datalist>
            <div class="flex flex-col">
                <label class="font-semibold">Mod loader</label>
                <input
                        type="text" list="loaders" class="control" v-model="info.loader"
                        @change="save"
                >
            </div>
            <datalist id="loaders">
                <option value="Forge"/>
                <option value="Fabric"/>
                <option value="Quilt"/>
            </datalist>
        </div>


    </div>

</template>