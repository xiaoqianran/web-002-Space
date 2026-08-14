<template>
  <div class="scrollbar" :style="{ '--p': p }"></div>
</template>

<script setup>
import { computed } from 'vue'
import { scroll_controler, scroll_progress } from '../motion.js'

const p = computed(() => {
  const fromRef = scroll_progress?.value
  if (typeof fromRef === 'number') return fromRef
  return scroll_controler?.progress ?? 0
})
</script>
