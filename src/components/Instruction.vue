<template>
  <div
    class="instruction"
    v-show="store.instructionOpen || animating"
    @click.self="hide"
  >
    <div class="instruction_background" @click="hide"></div>
    <div class="instruction_main _clip_edge" ref="main">
      <img class="instruction_guide" :src="$asset('img/guide.png')" alt="OPERATING INSTRUCTIONS" />
      <svg viewBox="0 0 1600 900">
        <polygon points="40,8 1592,8 1592,892 8,892 8,48" />
        <circle class="instruction_main_circle" cx="40" cy="40" r="4" />
        <circle class="instruction_main_circle" cx="1560" cy="40" r="4" />
        <circle class="instruction_main_circle" cx="40" cy="860" r="4" />
        <circle class="instruction_main_circle" cx="1560" cy="860" r="4" />
        <rect class="instruction_main_block" x="80" y="8" width="40" height="6" />
        <rect class="instruction_main_block" x="1480" y="8" width="40" height="6" />
        <rect class="instruction_main_block" x="80" y="886" width="40" height="6" />
        <rect class="instruction_main_block" x="1480" y="886" width="40" height="6" />
      </svg>
    </div>
    <div class="instruction_return" @click="hide">
      <ReturnButton />
    </div>
  </div>
</template>
<script setup>
import { nextTick, ref, watch } from 'vue'
import { store } from '../store.js'
import { gsap, ease_out } from '../motion.js'
import ReturnButton from './ReturnButton.vue'

const main = ref(null)
const animating = ref(false)

function reset() {
  gsap.set('.instruction', { opacity: 0 })
  gsap.set(main.value, { scale: 1.1 })
  gsap.set('.instruction_main_block', { opacity: 0 })
  gsap.set('.instruction_main_circle', { opacity: 0 })
}

function show() {
  animating.value = true
  nextTick(() => {
    reset()
    gsap.timeline()
      .to('.instruction', { opacity: 1, duration: 1, ease: ease_out })
      .to(main.value, { scale: 1, duration: 1, ease: ease_out }, '<')
      .to('.instruction_main_block', { opacity: 0.4, duration: 0.8, ease: ease_out, stagger: { from: 'random', each: 0.1 } }, '<')
      .to('.instruction_main_circle', { opacity: 1, duration: 0.8, ease: ease_out, stagger: { from: 'random', each: 0.05 } }, '<')
  })
}

function hide() {
  gsap.to('.instruction', {
    opacity: 0,
    duration: 0.8,
    ease: ease_out,
    onComplete: () => {
      store.instructionOpen = false
      animating.value = false
    },
  })
}

watch(() => store.instructionOpen, (v) => { if (v) show() })
</script>
