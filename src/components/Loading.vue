<template>
  <div class="loading" v-show="visible">
    <svg class="loading_blocks" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
      <g v-for="(row, ri) in hexes" :key="ri">
        <polygon
          v-for="(h, hi) in row"
          :key="hi"
          class="loading_blocks_block"
          fill="#000013"
          vector-effect="non-scaling-stroke"
          :points="h.points"
          :style="{ transformOrigin: h.origin }"
        />
      </g>
    </svg>
    <div class="loading_codewall _font_1">{{ code }}</div>
    <div class="loading_middle">
      <div class="loading_middle_ship">
        <Ship ref="shipRef" />
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
        <p class="_font_1">→ ACCESS</p>
        <p class="_font_1">SYSTEM...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { registerLoading, check_loading, store } from '../store.js'
import { gsap, ease_out } from '../motion.js'
import Ship from './Ship.vue'

const visible = ref(true)
const code = ref('')
const shipRef = ref(null)
let codeTimer = null
let animater = null
let blocks = []
let codewall = null
let middle = null

const n = 80
const i = Math.sqrt(3) / 2 * n
const rows = 10
const cols = 10
const hexes = []
for (let c = 1; c <= rows; c++) {
  const f = []
  for (let h = 1; h <= cols; h++) {
    const p = c % 2 ? (i * 2 - 1) * h - n * 2 : (i * 2 - 1) * h + i - n * 2
    const y = c * (n * 2 / 4 * 3 - 0.5) - n * 2
    f.push({
      points: `${p},${y - n} ${p + i},${y - n / 2} ${p + i},${y + n / 2} ${p},${y + n} ${p - i},${y + n / 2} ${p - i},${y - n / 2}`,
      origin: 'center',
    })
  }
  hexes.push(f)
}

const BIN_A = '01000111010100100100000101001110010001000010110101010011010101000100000101010010010100100101001100101101010100100100000101011001'
const BIN_B = '011000110110111101110011011011010110100101100011001000000110001001110010011011110111010001101000'

function update_code() {
  code.value = Array.from({ length: 30 }, () => (Math.random() > 0.5 ? BIN_A : BIN_B)).join('')
}

function playCode() {
  stopCode()
  update_code()
  codeTimer = setInterval(update_code, 100)
}

function stopCode() {
  if (codeTimer) {
    clearInterval(codeTimer)
    codeTimer = null
  }
}

function sine(amp, freq, phase, y) {
  let d = `M0 ${y}`
  for (let x = 0; x <= 400; x += 8) {
    d += ` L${x} ${(y + Math.sin((x / 400) * freq * Math.PI * 2 + phase) * amp).toFixed(1)}`
  }
  return d
}
const wave = sine(10, 3, 0, 20)
const wave2 = sine(7, 4, 1.2, 20)

function init() {
  blocks = [...document.querySelectorAll('.loading_blocks_block')]
  codewall = document.querySelector('.loading_codewall')
  middle = document.querySelector('.loading_middle')
}

function show(next) {
  playCode()
  shipRef.value?.play?.()
  visible.value = true
  store.loadingVisible = true
  if (animater) animater.kill()
  animater = gsap.timeline()
    .set(blocks, { scale: 1 })
    .to(blocks, { opacity: 1, duration: 0.5, ease: ease_out, stagger: { from: 'random', each: 0.002 } })
    .to(blocks, {
      strokeOpacity: 0,
      strokeDashoffset: () => (Math.random() > 0.5 ? 'calc(var(--scale) * 50rem)' : 'calc(var(--scale) * -50rem)'),
      duration: 0.5,
      ease: ease_out,
      stagger: { from: 'random', each: 0.002 },
    }, '<0.3')
    .to(middle, { opacity: 1, duration: 1, ease: ease_out }, '<')
    .to(codewall, {
      opacity: 0.05,
      duration: 1,
      ease: ease_out,
      onComplete: () => {
        if (typeof next === 'function') next()
        check_loading()
      },
    }, '<')
}

function hidden() {
  if (animater) animater.kill()
  animater = gsap.timeline()
    .set(blocks, {
      strokeDashoffset: () => (Math.random() > 0.5 ? 'calc(var(--scale) * 50rem)' : 'calc(var(--scale) * -50rem)'),
    })
    .to(blocks, {
      strokeOpacity: 1,
      strokeDashoffset: 0,
      duration: 0.5,
      ease: ease_out,
      stagger: { from: 'random', each: 0.002 },
    })
    .to([middle, codewall], { opacity: 0, duration: 1, ease: ease_out }, '<')
    .to(blocks, {
      scale: 0,
      opacity: 0,
      duration: 1,
      ease: ease_out,
      stagger: { from: 'center', each: 0.004 },
      onComplete: () => {
        stopCode()
        shipRef.value?.pause?.()
        visible.value = false
        store.loadingVisible = false
      },
    }, '<0.2')
}

onMounted(() => {
  init()
  playCode()
  registerLoading({ show, hidden })
})

onUnmounted(() => {
  stopCode()
  if (animater) animater.kill()
  registerLoading(null)
})
</script>
