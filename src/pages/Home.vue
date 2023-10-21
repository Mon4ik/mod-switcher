<script setup lang="ts">
import {onMounted, ref} from "vue";
import {ModPackInfo, ipcRendererInvoke} from "../typings";
import ModpackRow from "../components/ModpackRow.vue";

const modPacks = ref<ModPackInfo[]>([])
const alertType = ref("")


async function reloadModpacks() {
  modPacks.value = (await ipcRendererInvoke<ModPackInfo[]>("modpacks:getAll"))
      .sort((a, b) => b.lastUsed - a.lastUsed)

	console.log(modPacks.value)

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
      Add them to new Modpack
    </button>
  </div>

  <div class="grid xl:grid-cols-2 gap-4">
    <ModpackRow
        v-for="modPack in modPacks" :key="modPack.id"
        :modPack="modPack"
        :modPacks="modPacks"
        @reload="reloadModpacks"
    />
  </div>

</template>
