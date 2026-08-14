<template>
  <div class="hexwipe" :class="{ play: store.hexWiping }" :key="store.hexWipeKey">
    <div
      v-for="(h, i) in hexes"
      :key="i"
      class="hexwipe_cell"
      :style="{
        left: h.x + 'px',
        top: h.y + 'px',
        width: SIZE + 'px',
        height: SIZE * 1.1547 + 'px',
        '--d': h.d + 's',
      }"
    ></div>
  </div>
</template>

<script setup>
import { store } from '../store.js'

const SIZE = 56
const hexes = []
const cols = 28
const rows = 16
const w = SIZE
const h = SIZE * 0.866
for (let row = -1; row < rows; row++) {
  for (let col = -1; col < cols; col++) {
    const x = col * (w * 0.75)
    const y = row * h + (col % 2 ? h / 2 : 0)
    const cx = 14, cy = 7
    const dist = Math.hypot(col - cx, row - cy)
    hexes.push({ x, y, d: Math.min(0.45, dist * 0.035) })
  }
}
</script>
