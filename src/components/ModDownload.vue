<script setup lang="ts">
import {fetchModrinth, fetchProgress, ModrinthMod} from "../utils";
import {ipcRendererInvoke} from "../typings";
import {ref} from "vue";
import {useRoute} from "vue-router";

const props = defineProps<{
  name: string
  version: string
  versions: string[]
  loader: string
  modId: ModrinthMod | string
}>()

const $emit = defineEmits<{
  (event: "refreshInfo"): Promise<void>
}>()

const route = useRoute()

const loading = ref(false)
const progress = ref(0)

async function download() {
  loading.value = true
  const versions = await fetchModrinth(`/project/${props.modId}/version`, {
    params: {
      loaders: props.loader
          ? `["${props.loader}"]`
          : "[]",
      game_versions: props.version
          ? `["${props.version}"]`
          : "[]"
    }
  })

  const version = versions.data[0]
  if (versions.data.length === 0) return loading.value = false
  const file = version.files[0]
  console.log(file)

  const response = await fetch(file.url);
  const blob = await fetchProgress(response, ({loaded, total}) => {
    progress.value = ((loaded / total) * 100)
  })

  let reader = new FileReader()
  reader.readAsArrayBuffer(blob)

  reader.onloadend = async function () {
    await ipcRendererInvoke(
        "modpacks:saveMod",
        route.params.id,
        {
          name: file.filename.replace("+", "-"),
          data: new Uint8Array(reader.result as ArrayBuffer)
        }
    )
    await $emit("refreshInfo")

    loading.value = false
    progress.value = 0
  }
}
</script>

<template>
  <button class="btn btn-none !mb-0 progressful"
          :style="{'--progress': `${progress}%`}" :disabled="loading || !versions.includes(version)"
          @click="download"
  >
    Download {{props.name}}
  </button>
</template>

<style scoped lang="scss">

</style>