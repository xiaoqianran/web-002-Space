<template>
  <div class="nav" v-if="show">
    <div class="logo" @click="goHome">
      <div class="logo_mark">
        <img :src="$asset('img/logo.png')" alt="logo" />
      </div>
      <div class="logo_word">
        <p class="_font_2">GRAND-STARRS-RAY</p>
        <p class="_font_1">A C S &amp; 星际航路</p>
      </div>
    </div>
    <div
      class="button"
      :class="store.menuOpen ? 'button_open' : 'button_shut'"
      @click="toggleMenu()"
    >
      <svg viewBox="0 0 550 180" class="button_block">
        <polygon points="530.85,166.3 56.09,166.3 31.78,145.77 31.78,114.67 19.15,98.95 19.15,33.1 46.32,13.71 494.75,13.71 530.85,47.11" />
      </svg>
      <p class="button_text _font_2">MENU</p>
      <div class="button_icon">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store, toggleMenu } from '../store.js'

const route = useRoute()
const router = useRouter()
const show = computed(() => route.name !== 'home')

function goHome() {
  toggleMenu(false)
  router.push('/')
}
</script>
