<script setup lang="ts">
const props = defineProps<{ opened: boolean }>()
</script>

<template>
    <Transition name="modal">
        <div class="modal-backdrop" v-if="props.opened">
            <div class="modal">
                <slot></slot>
            </div>
        </div>
    </Transition>
</template>

<style scoped lang="scss">
.modal-enter-active,
.modal-leave-active {
  transition: all 1s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal {
    transform: scale(70%) translateY(30%);
  }
}

.modal-backdrop {
  @apply absolute top-0 left-0 w-screen h-screen
  bg-neutral-900/50 p-10 justify-center items-center
  transition-all flex z-50;

  &.closed {
    .modal {
      opacity: 0;
    }

    @apply hidden
  }

  &.opened {
    .modal {
      opacity: 1 !important;
    }

    //@apply flex
  }

  .modal {
    @apply p-4 border rounded-2xl h-fit w-[60%] shadow-2xl transition-all
    bg-neutral-50 dark:bg-stone-800 dark:border-stone-700
  }
}

</style>