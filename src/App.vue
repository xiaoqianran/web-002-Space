<template>
  <SiteHeader />
  <MenuOverlay />
  <HexWipe />
  <router-view />
  <div v-if="store.imageview.open" class="imageview" @wheel.prevent="onWheel" @click.self="hideImageview">
    <div
      class="imageview_image"
      :style="{ transform: `translate(${ix}px,${iy}px) scale(${iz})` }"
      @mousedown.prevent="startDrag"
      @touchstart.prevent="startDrag"
    >
      <img :src="store.imageview.src" alt="imageview" />
    </div>
    <p class="imageview_tip _font_2">+ 拖拽移动图片，滑动滚轮/双指捏合缩放图片 +</p>
    <div class="imageview_return" @click="hideImageview">
      <ReturnButton />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { store, hideImageview, boot } from './store.js'
import ReturnButton from './components/ReturnButton.vue'
import SiteHeader from './components/SiteHeader.vue'
import MenuOverlay from './components/MenuOverlay.vue'
import HexWipe from './components/HexWipe.vue'

boot()

const ix = ref(0), iy = ref(0), iz = ref(1)
let dragging = false, lx = 0, ly = 0

watch(() => store.imageview.open, (v) => {
  if (v) { ix.value = iy.value = 0; iz.value = 1 }
})

function startDrag(e) {
  dragging = true
  const p = e.touches ? e.touches[0] : e
  lx = p.clientX; ly = p.clientY
  const move = (ev) => {
    if (!dragging) return
    const q = ev.touches ? ev.touches[0] : ev
    ix.value += q.clientX - lx
    iy.value += q.clientY - ly
    lx = q.clientX; ly = q.clientY
  }
  const up = () => {
    dragging = false
    window.removeEventListener('mousemove', move)
    window.removeEventListener('mouseup', up)
    window.removeEventListener('touchmove', move)
    window.removeEventListener('touchend', up)
  }
  window.addEventListener('mousemove', move)
  window.addEventListener('mouseup', up)
  window.addEventListener('touchmove', move, { passive: false })
  window.addEventListener('touchend', up)
}

function onWheel(e) {
  iz.value = Math.min(3, Math.max(0.5, iz.value + (e.deltaY < 0 ? 0.1 : -0.1)))
}
</script>
