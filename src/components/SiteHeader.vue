<template>
  <header class="nav" v-if="show">
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
      class="nav_button"
      :class="{ nav_button_open: store.menuOpen }"
      @click="toggleMenu()"
    >
      <div class="nav_button_block">
        <svg viewBox="0 0 120 40" preserveAspectRatio="none">
          <polygon points="8,4 112,4 120,20 112,36 8,36 0,20" />
        </svg>
      </div>
      <p class="nav_button_text _font_2">{{ store.menuOpen ? 'MENU ✕' : 'MENU ☰' }}</p>
      <div class="nav_button_icon">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </header>
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
