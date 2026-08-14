<template>
  <div class="loading" :class="{ fade: !store.loadingVisible }" @click="tryAccess">
    <svg class="loading_blocks" :viewBox="`0 0 ${vw} ${vh}`" preserveAspectRatio="xMidYMid slice">
      <polygon
        v-for="(h, i) in hexes"
        :key="i"
        class="loading_blocks_block"
        :points="h.points"
        fill="none"
        :style="{ strokeOpacity: h.o, animationDelay: h.d + 's' }"
      />
    </svg>
    <div class="loading_codewall _font_1">
      {{ wall }}
    </div>
    <div class="loading_middle">
      <div class="loading_middle_ship">
        <Ship />
      </div>
      <p class="loading_middle_title _font_3">GRAND-STARRS-RAY</p>
      <div class="loading_middle_wavebox">
        <div>
          <svg viewBox="0 0 400 40" width="400" height="40">
            <path :d="wave" fill="none" stroke="var(--color_theme)" stroke-width="1.2" />
          </svg>
          <svg viewBox="0 0 400 40" width="400" height="40">
            <path :d="wave" fill="none" stroke="var(--color_theme)" stroke-width="1.2" />
          </svg>
        </div>
        <div>
          <svg viewBox="0 0 400 40" width="400" height="40">
            <path :d="wave2" fill="none" stroke="var(--color_white)" stroke-width="0.8" />
          </svg>
          <svg viewBox="0 0 400 40" width="400" height="40">
            <path :d="wave2" fill="none" stroke="var(--color_white)" stroke-width="0.8" />
          </svg>
        </div>
      </div>
      <div class="loading_middle_bottom">
        <p class="_font_1">[LOADING]</p>
        <p class="_font_1 loading_access" :class="{ ready: store.loadingReady }">→ ACCESS</p>
        <p class="_font_1">SYSTEM...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { store } from '../store.js'
import Ship from './Ship.vue'

const vw = 1600, vh = 900
const hexes = []
function hexPoints(cx, cy, r) {
  const pts = []
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 6 + i * Math.PI / 3
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
  }
  return pts.join(' ')
}
const R = 46, H = R * Math.sqrt(3)
for (let row = -1; row < 16; row++) {
  for (let col = -1; col < 24; col++) {
    const cx = col * (R * 1.5) + 20
    const cy = row * H + (col % 2 ? H / 2 : 0) + 10
    hexes.push({
      points: hexPoints(cx, cy, R - 2),
      o: (Math.random() * 0.35 + 0.05).toFixed(2),
      d: (Math.random() * 2).toFixed(2),
    })
  }
}

const bits = '01ABCDEF█▓▒░/\\<>|*+-=COSRAY'
let w = ''
for (let i = 0; i < 800; i++) w += bits[Math.floor(Math.random() * bits.length)]
const wall = w

function sine(amp, freq, phase, y) {
  let d = `M0 ${y}`
  for (let x = 0; x <= 400; x += 8) {
    d += ` L${x} ${(y + Math.sin((x / 400) * freq * Math.PI * 2 + phase) * amp).toFixed(1)}`
  }
  return d
}
const wave = sine(10, 3, 0, 20)
const wave2 = sine(7, 4, 1.2, 20)

function tryAccess() {
  if (!store.loadingReady) return
  store.loadingVisible = false
}

onMounted(() => {
  setTimeout(() => { store.loadingReady = true }, 2500)
})
</script>
