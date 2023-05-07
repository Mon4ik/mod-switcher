<script setup lang="ts">
import {onMounted, ref} from "vue";
import {ModMetadata, ModPackInfo} from "../typings";
import {useRoute, useRouter} from "vue-router";

const route = useRoute()
const router = useRouter()

const dragOver = ref<boolean>(false)

const info = ref<ModPackInfo>()
const mods = ref<ModMetadata[]>()

const versions = ref<string[]>([])

async function refreshInfo() {
    //@ts-ignore
    info.value = await window.modpacks.getOne(route.params.id)
    //@ts-ignore
    mods.value = await window.modpacks.getMods(route.params.id)
}

async function save() {
    //@ts-ignore
    await window.modpacks.save(JSON.stringify(info.value))
    await refreshInfo()
}

async function deletePack() {
    //@ts-ignore
    await window.modpacks.delete(info.value.id)
    await router.push({
        path: "/"
    })
}

async function saveMod(e: { dataTransfer: DataTransfer }) {
    for (const file of e.dataTransfer.files) {
        let reader = new FileReader()
        reader.readAsArrayBuffer(file)

        reader.onloadend = function() {
            //@ts-ignore
            window.modpacks.saveMod(route.params.id, {
                name: file.name,
                data: new Uint8Array(reader.result as ArrayBuffer)
            })
            refreshInfo()
        }
    }
}

async function removeMod(filename: string) {
    //@ts-ignore
    await window.modpacks.removeMod(route.params.id, filename)
    await refreshInfo()
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
    <div class="flex justify-between items-center mt-2">
        <h1 class="!mt-0">Modify</h1>
        <router-link to="/">
            <button class="btn btn-none !mb-0">Back</button>
        </router-link>
    </div>
    <div v-if="info !== undefined" class="grid md:grid-cols-[2fr_1fr] gap-2 relative">
        <div class="flex flex-col gap-2">
            <div class="box flex items-center justify-between"
                 v-for="mod in mods!" :key="mod.displayName">
                <p>{{ mod.displayName }} ({{ mod.version}})</p>
                <button class="btn btn-danger !mb-0"
                @click="removeMod(mod.filename)">Remove</button>
            </div>
            <div class="box bg-neutral-50 border-dashed text-center !p-10 mt-5"
                 @drop.prevent="saveMod">
                Drop here <code>.jar</code> files
            </div>
        </div>
        <div class="flex flex-col gap-2">
            <div class="flex flex-col">
                <label class="font-semibold">Title</label>
                <input type="text" class="control" v-model="info.title">
            </div>
            <div class="flex flex-col">
                <label class="font-semibold">Description</label>
                <input type="text" class="control" v-model="info.description">
            </div>

            <div class="flex flex-col">
                <label class="font-semibold">Minecraft Version</label>
                <input type="text" list="versions" class="control" v-model="info.version">
            </div>
            <datalist id="versions">
                <option v-for="version in versions" :value="version"/>
            </datalist>
            <div class="flex flex-col">
                <label class="font-semibold">Mod loader</label>
                <input type="text" list="loaders" class="control" v-model="info.loader">
            </div>
            <datalist id="loaders">
                <option value="Forge"/>
                <option value="Fabric"/>
                <option value="Quilt"/>
            </datalist>

            <div class="mt-2">
                <button class="btn btn-success w-full"
                        @click="save">
                    Save
                </button>
                <button class="btn btn-danger w-full"
                        @click="deletePack">
                    Delete
                </button>
            </div>
        </div>


    </div>

</template>

<style scoped lang="scss">

</style>