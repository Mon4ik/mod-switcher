<script setup lang="ts">
import {ipcRendererInvoke, ModPackInfo} from "../typings";
import {usePreferredDark} from "@vueuse/core";
import Popper from "vue3-popper"
import router from "../router";
const {openExternal} = require("electron").shell

const props = defineProps<{ modPack: ModPackInfo, modPacks: ModPackInfo[] }>()
const {modPack, modPacks} = props

const $emit = defineEmits<{
  (event: "reload"): void
}>()

const isDark = usePreferredDark()

async function toggleModpack(id: string, using: boolean) {
  if (using) {
    await ipcRendererInvoke("modpacks:unuse", id)
  } else {
    const modpack = modPacks.find((pack) => pack.currentlyUsing)
    if (modpack) {
      await ipcRendererInvoke("modpacks:unuse", modpack.id)
    }

    await ipcRendererInvoke("modpacks:use", id)
  }

  $emit("reload")
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

async function deletePack() {
	await ipcRendererInvoke("modpacks:delete", modPack.id)
	location.reload()
}
</script>

<template>
  <div class="box flex flex-row items-center gap-2 !rounded-3xl"
  >
    <img src="https://placehold.co/512x512.png" :alt="modPack.title"
         width="64" height="64"
         class="rounded-xl">

    <div class="flex flex-row justify-between items-center w-full">
      <div class="flex flex-col">
        <div class="flex flex-row gap-2">
          <h4 class="!mt-0">{{ modPack.title }} </h4>
          <span class="badge">
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
              <path
                  d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
            </svg>
          </button>
          <template #content>
            <div class="flex flex-col gap-2">
              <button class="btn btn-none !mb-0"
                      @click="() => downloadCore(modPack)">
                Download {{ modPack.loader }} {{ modPack.version }}
              </button>
              <button class="btn btn-danger !mb-0"
                      @click="deletePack">
                Delete forever
              </button>
              <!--                                <button class="btn btn-none !mb-0">Export to .zip</button> WIP-->
            </div>
          </template>
        </Popper>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>