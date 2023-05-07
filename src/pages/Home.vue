<script setup lang="ts">
import imageUrl from "../assets/imgs/home.png";
import {onMounted, ref} from "vue";
import {ModPackInfo} from "../typings";

const modPacks = ref<ModPackInfo[]>([])
const alertType = ref("")

async function reloadModpacks() {
    //@ts-ignore
    modPacks.value = await window.modpacks.getAll()
    //@ts-ignore
    alertType.value = await window.modpacks.getAlert()
}

async function createModpack() {
    //@ts-ignore
    await window.modpacks.create()
    await reloadModpacks()
}

async function migrateToModpack() {
    //@ts-ignore
    await window.modpacks.fixMA()
    await reloadModpacks()
}

async function toggleModpack(id: string, using: boolean) {
    if (using) {
        //@ts-ignore
        await window.modpacks.unUse(id)
    } else {
        //@ts-ignore
        await window.modpacks.use(id)
    }
    await reloadModpacks()
}

onMounted(() => {
    reloadModpacks()
})
</script>
<template>
    <div class="flex flex-row justify-between items-baseline mb-2">
        <h1 class="!mt-0">Modpacks</h1>
        <button class="btn btn-info !mb-0"
                @click="createModpack">
            New
        </button>
    </div>

    <div v-if="alertType === 'manually-added'" class="alert alert-danger">
        <p>Seems, mods in <samp>.minecraft/mods</samp> were manually added</p>

        <button class="btn btn-success !mb-0 w-full"
        @click="migrateToModpack">Add to new Modpack</button>
    </div>

    <div class="flex flex-col gap-2">
        <div class="box flex flex-row items-center gap-2"
             v-for="modPack in modPacks" :key="modPack.id">
            <img src="https://placehold.co/512x512.png" width="64" height="64" alt="title"
                 class="rounded-xl">
            <div class="flex flex-row justify-between items-center w-full">
                <div class="flex flex-col">
                    <h3 class="!mt-0">{{ modPack.title }}</h3>
                    <p>{{ modPack.description }}</p>
                </div>
                <div class="flex flex-row gap-2">
                    <button class="btn btn-success !mb-0"
                            v-if="!modPack.currentlyUsing"
                            @click="toggleModpack(modPack.id, false)">Enable</button>
                    <button class="btn btn-danger !mb-0"
                            v-else
                            @click="toggleModpack(modPack.id, true)">Disable</button>
                    <router-link :to="`/modpack/${modPack.id}`">
                        <button class="btn btn-none !mb-0">Modify</button>
                    </router-link>
                </div>
            </div>
        </div>
    </div>

</template>
