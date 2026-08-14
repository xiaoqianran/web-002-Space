<template>
  <svg
    class="ship"
    :class="[if_stroke || stroke ? 'ship_stroke' : '', errorClass]"
    viewBox="0 0 500 500"
  >
    <defs>
      <clipPath :id="clipId">
        <path d="M250-65.29C75.87-65.29-65.29,75.87-65.29,250S75.87,565.29,250,565.29S565.29,424.13,565.29,250 S424.13-65.29,250-65.29z" />
      </clipPath>
    </defs>
    <g class="ship_back">
      <path ref="back1" class="ship_back_p1" :d="PAIRS[4].before" />
      <path ref="back2" class="ship_back_p2" :d="PAIRS[5].before" />
    </g>
    <g class="ship_front" :clip-path="(if_stroke || stroke) ? `url(#${clipId})` : undefined">
      <path ref="front1" class="ship_front_p1" :d="PAIRS[0].before" />
      <path ref="front2" class="ship_front_p2" :d="PAIRS[1].before" />
      <path ref="front3" class="ship_front_p3" :d="PAIRS[2].before" />
      <path ref="front4" class="ship_front_p4" :d="PAIRS[3].before" />
    </g>
    <g class="ship_eye">
      <circle cx="250" cy="250" r="103.88" />
      <circle cx="250" cy="250" r="55.6" />
      <circle cx="250" cy="250" r="27.3" />
      <line x1="278.54" y1="202.27" x2="202.86" y2="157.41" />
      <line x1="222.93" y1="201.42" x2="146.25" y2="244.53" />
      <line x1="194.4" y1="249.15" x2="193.38" y2="337.12" />
      <line x1="221.46" y1="297.73" x2="297.14" y2="342.59" />
      <line x1="277.07" y1="298.58" x2="353.75" y2="255.47" />
      <line x1="305.6" y1="250.85" x2="306.62" y2="162.88" />
    </g>
    <circle ref="hole" class="ship_hole" cx="250" cy="250" r="147.62" />
  </svg>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { interpolate } from 'flubber'
import { gsap, ease_inout } from '../motion.js'

const props = defineProps({
  stroke: { type: Boolean, default: false },
  if_stroke: { type: Boolean, default: false },
  error_type: { type: Object, default: null },
})

const clipId = `shipclip_${Math.random().toString(36).slice(2, 8)}`
const errorClass = computed(() => {
  const q = props.error_type?.quadrant || props.error_type?.value?.quadrant
  return q ? `ship_stroke_error_quadrant${q}` : ''
})

const PAIRS = [
  {
    translate: '-5%, 10%',
    before: 'M379.81,430.59c-36.51,26.32-81.37,41.82-129.82,41.82c-76.04,0-143.15-38.17-183.22-96.39l19.42-47.45l47.61-18l50.59,5.16l93.28,4.43l5.82,17.06l68.05,33.1l4.1,37.23L379.81,430.59z',
    after: 'M379.81,430.59c-36.51,26.32-81.37,41.82-129.82,41.82c-76.04,0-143.15-38.17-183.22-96.39c0,0-5.88-66.53,19.42-47.45s35.27-31.99,47.61-18c12.33,13.99,13.51,25.18,50.59,5.16c37.08-20.02,83.29-10.66,80.92,2.18c-2.38,12.84,31.45-0.21,20.81,29.53s56.55,10.91,60.65,27.07c4.11,16.16-9.33,32.61,8.87,33.06C373.83,408.02,379.81,430.59,379.81,430.59z',
    delay: 0.2,
  },
  {
    translate: '-10%, -5%',
    before: 'M249.98,127.47l-0.57,32.35l-20.44,14.32l-36.93-3.86l-21.32,43.08l13.66,102.36l-50.59-5.16l-47.61,18l-19.42,47.45C42.05,340.21,27.6,296.79,27.6,250c0-108.63,77.88-199.11,180.87-218.52l8.2,57.04L249.98,127.47z',
    after: 'M249.98,127.47c-6.66,13.3-15.79,21.87-0.57,32.35c15.22,10.48-21.25,26.6-20.44,14.32c0.81-12.28-29.49-22.07-36.93-3.86c-7.45,18.21-46.99,21.27-21.32,43.08s-2.45,69.33,13.66,102.36s-41.6,25.47-50.59-5.16s-65.13-3.29-47.61,18s-19.42,47.45-19.42,47.45C42.05,340.21,27.6,296.79,27.6,250c0-108.63,77.88-199.11,180.87-218.52c0,0,11.29,32.97,8.2,57.04S256.65,114.17,249.98,127.47z',
    delay: 0,
  },
  {
    translate: '10%, -5%',
    before: 'M470.19,218.64l-22.46-0.96l-14.32-16.97l-57.25-7.48l-52.73,16.25l-74.02-49.66l0.57-32.35l-33.31-38.95l-8.2-57.04c13.45-2.56,27.32-3.89,41.52-3.89C362.17,27.59,454.97,110.65,470.19,218.64z',
    after: 'M470.19,218.64c0,0-20.14,12.01-22.46-0.96s-2.91-20.64-14.32-16.97c-11.41,3.66-35.84,5.91-57.25-7.48c-21.41-13.39-47.2,40.78-52.73,16.25s-83.9-29.28-74.02-49.66c9.89-20.38-6.08-24.35,0.57-32.35s-19.51-45.76-33.31-38.95s-8.2-57.04-8.2-57.04c13.45-2.56,27.32-3.89,41.52-3.89C362.17,27.59,454.97,110.65,470.19,218.64z',
    delay: 0.4,
  },
  {
    translate: '10%, 5%',
    before: 'M472.4,250c0,74.38-36.51,140.22-92.59,180.59l-24.18-23.03l-4.1-37.23l-68.05-33.1l12.66-5.34l24.42-11.73l20.2-43.32l2.53-54.03l-19.87-13.33l52.73-16.25l57.25,7.48l14.32,16.97l22.46,0.96C471.64,228.9,472.4,239.36,472.4,250z',
    after: 'M472.4,250c0,74.38-36.51,140.22-92.59,180.59c0,0-44.61-11.06-24.18-23.03c20.43-11.97,24.37-44.07-4.1-37.23c-28.47,6.84-67.21-16.46-68.08-23.29s14.36-3.16,18.47-10.99s3.16-22.45,18.64-15.89c15.48,6.57,34.91-43.79,20.2-43.32s10.39-42.03,2.53-54.03s-6.39-3.17-14.41-15.94c-8.02-12.77,35.61,4.85,47.27-13.64s43.81,15.24,57.25,7.48c13.45-7.77,5.89,16.97,18.11,14.43s18.68,3.51,18.68,3.51C471.64,228.9,472.4,239.36,472.4,250z',
    delay: 0,
  },
  {
    translate: '-15%, 0%',
    before: 'M243.7,393.22l40.19,25.54c-10.94,2.2-22.28,3.35-33.89,3.35c-95.06,0-172.12-77.06-172.12-172.12c0-95.03,77.06-172.09,172.12-172.09c0.48,0,0.96,0,1.45,0.03l-25.39,68.92l37.96,54.18l-18.96,41.4l6.96,22.97l34.64,38.95L237.4,342.3l7.99,24.96L243.7,393.22z',
    after: 'M243.7,393.22c-7.54,18.58,40.19,25.54,40.19,25.54c-10.94,2.2-22.28,3.35-33.89,3.35c-95.06,0-172.12-77.06-172.12-172.12c0-95.03,77.06-172.09,172.12-172.09c0.48,0,0.96,0,1.45,0.03c0,0-49.02,56.1-25.39,68.92c23.64,12.82,7.33,54.4,28.74,60.76s9.24,14.8-9.75,34.81s15.05,3.52,6.96,22.97c-8.09,19.46-7.31,27.63,13.66,35.88c20.97,8.25-37.38,36.73-21.97,42.39c15.41,5.67,17.34,18.56,1.68,23.6S251.24,374.64,243.7,393.22z',
    delay: 0.3,
  },
  {
    translate: '15%, 0%',
    before: 'M422.12,249.99c0,83.45-59.39,153.04-138.23,168.78l-40.19-25.54l1.69-25.96l-7.99-24.96l49.26-37.96l-34.64-38.95l-6.96-22.97l18.96-41.4l-37.96-54.18l25.39-68.92C345.84,78.68,422.12,155.44,422.12,249.99z',
    after: 'M422.12,249.99c0,83.45-59.39,153.04-138.23,168.78c0,0-64.39-14.16-40.19-25.54s9.01-15.97,11.55-22.48c2.54-6.51,17.77-9.45-6.28-19.85c-24.04-10.4,51.57-28.83,37.69-46.55c-13.88-17.72-52.08-30.44-34.64-38.95s7.26-11.69-6.96-22.97c-14.22-11.28,67.02-25.12,18.96-41.4s1.44-38.59-37.96-54.18s25.39-68.92,25.39-68.92C345.84,78.68,422.12,155.44,422.12,249.99z',
    delay: 0.15,
  },
]

const front1 = ref(null)
const front2 = ref(null)
const front3 = ref(null)
const front4 = ref(null)
const back1 = ref(null)
const back2 = ref(null)
const hole = ref(null)
let tl = null

function morpher(before, after) {
  try {
    return interpolate(before, after, { maxSegmentLength: 10 })
  } catch {
    return (t) => (t < 0.5 ? before : after)
  }
}

function build() {
  const els = [front1.value, front2.value, front3.value, front4.value, back1.value, back2.value]
  const states = PAIRS.map((p, idx) => ({
    t: 0,
    fn: morpher(p.before, p.after),
    el: els[idx],
    delay: p.delay,
    translate: p.translate,
  }))
  tl = gsap.timeline({ repeat: -1, paused: true })
  states.forEach((s) => {
    if (!s.el) return
    tl.to(s, {
      t: 1,
      delay: s.delay,
      duration: 2,
      ease: ease_inout,
      onUpdate() {
        s.el.setAttribute('d', s.fn(s.t))
        const k = s.t
        const [tx, ty] = s.translate.split(',').map((v) => v.trim())
        s.el.style.transform = `translate(${tx.replace('%', '') * k}%, ${ty.replace('%', '') * k}%)`
      },
    }, 0)
  })
  if (hole.value) {
    tl.to(hole.value, { attr: { 'stroke-width': 0 }, duration: 1.5, ease: ease_inout }, 0)
  }
  states.forEach((s) => {
    if (!s.el) return
    const back = { t: 1, fn: s.fn, el: s.el, translate: s.translate }
    tl.to(back, {
      t: 0,
      delay: s.delay,
      duration: 2,
      ease: ease_inout,
      onUpdate() {
        back.el.setAttribute('d', back.fn(back.t))
        const k = back.t
        const [tx, ty] = back.translate.split(',').map((v) => v.trim())
        back.el.style.transform = `translate(${parseFloat(tx) * k}%, ${parseFloat(ty) * k}%)`
      },
    }, 1.8)
  })
  if (hole.value) {
    tl.to(hole.value, { attr: { 'stroke-width': 15 }, duration: 1.5, ease: ease_inout }, 1.8)
  }
}

function play() {
  if (!tl) build()
  tl && tl.play()
}

function pause() {
  tl && tl.pause()
}

onMounted(() => {
  build()
  play()
})

onUnmounted(() => {
  if (tl) tl.kill()
})

defineExpose({ play, pause, animater: () => tl })
</script>
