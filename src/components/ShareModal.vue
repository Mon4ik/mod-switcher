<script setup lang="ts">
import Modal from "./Modal.vue";
import {ref, watch} from "vue";

const props = defineProps<{ opened: boolean }>()
const emit = defineEmits<{
	(e: "close"): void
}>()

enum ShareType {
	none,
	bittorrent,
	zip
}

const shareType = ref<ShareType>(ShareType.none)

watch(() => props.opened, (newOpened) => {
	if (!newOpened) {
		shareType.value = ShareType.none
	}
})

function createTorrent() {

}
</script>

<template>
    <Modal :opened="props.opened">
        <div class="flex justify-between items-center">
            <h3 class="!mt-0">Share modpack</h3>
            <button class="btn btn-none !mb-0"
                    @click="shareType === ShareType.none ? emit('close') : shareType = ShareType.none">Back
            </button>
        </div>
        <div class="relative h-[17rem] mt-2">
            <TransitionGroup name="share">
                <div class="grid grid-cols-2 gap-2" v-if="shareType === ShareType.none">
                    <button class="share-item" @click="shareType = ShareType.bittorrent">
                        Share via BitTorrent protocol
                    </button>
                    <button class="share-item" @click="shareType = ShareType.zip">
                        Share <code>.zip</code> archive
                    </button>
                </div>
                <div class="absolute top-0 left-0" v-if="shareType === ShareType.bittorrent">
                    <div class="alert alert-success">
                        <p>Torrent created!</p>
                        <p>Now share this Magnet URI with your someone else!</p>
                    </div>
                    <div class="alert alert-warning">
                        Do not exit from this modal until someone else downloaded it
                    </div>
                    <input type="text" class="control w-full" disabled value="magnet:....">
                </div>
                <div class="absolute top-0 left-0" v-if="shareType === ShareType.zip">
                    <button>Download</button>
                </div>
            </TransitionGroup>
        </div>
    </Modal>
</template>

<style scoped lang="scss">
.share-item {
  transition: all 0.1s ease;
  @apply p-4 rounded-lg border
  hover:shadow-xl hover:bg-neutral-100 active:bg-neutral-200
  active:shadow-neutral-500/50

  dark:border-stone-700
  dark:hover:bg-stone-700 dark:active:bg-stone-800
  dark:active:shadow-stone-700/40 dark:active:border-stone-700
}

.share-enter-active,
.share-leave-active {
  transition: all 0.5s ease;
}

.share-enter-from {
  opacity: 0;
  transform: translateY(5rem);
}

.share-enter-to, .share-leave-from {
  opacity: 1;
  transform: translateY(0%);
}

.share-leave-to {
  opacity: 0;
  transform: translateY(-5rem);
}
</style>