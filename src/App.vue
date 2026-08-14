<template>
  <Loading />
  <SiteHeader />
  <MenuOverlay />
  <router-view />
  <div
    class="imageview"
    :style="{ pointerEvents: store.imageview.open ? 'auto' : 'none' }"
    @wheel.prevent="onWheel"
    @click.self="closeView"
  >
    <div
      ref="imgBox"
      class="imageview_image"
      @mousedown.prevent="startDrag"
      @touchstart.prevent="startDrag"
    >
      <img :src="store.imageview.src" alt="imageview" />
    </div>
    <p class="imageview_tip _font_2">+ 拖拽移动图片，滑动滚轮/双指捏合缩放图片 +</p>
    <div class="imageview_return" @click="closeView">
      <ReturnButton />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { store, hideImageview, boot } from './store.js'
import { gsap, ease_out, initGlobalLenis, scroll_controler } from './motion.js'
import ReturnButton from './components/ReturnButton.vue'
import SiteHeader from './components/SiteHeader.vue'
import MenuOverlay from './components/MenuOverlay.vue'
import Loading from './components/Loading.vue'

boot()

const imgBox = ref(null)
const ix = ref(0)
const iy = ref(0)
const iz = ref(1)
let dragging = false
let lx = 0
let ly = 0

onMounted(() => {
  initGlobalLenis()
  gsap.set('.imageview', { opacity: 0 })
})

watch(() => store.imageview.open, (v) => {
  if (v) {
    ix.value = iy.value = 0
    iz.value = 1
    scroll_controler && scroll_controler.stop()
    gsap.set(imgBox.value, { x: 0, y: 0, scale: 1.1 })
    gsap.timeline()
      .to('.imageview', { opacity: 1, duration: 1, ease: ease_out })
      .to(imgBox.value, { scale: 1, duration: 1, ease: ease_out }, '<')
  }
})

function applyImage() {
  if (!imgBox.value) return
  gsap.to(imgBox.value, { x: ix.value, y: iy.value, scale: iz.value, duration: 0.3, ease: ease_out })
}

function closeView() {
  gsap.to('.imageview', {
    opacity: 0,
    duration: 0.6,
    ease: ease_out,
    onComplete: () => {
      hideImageview()
      ix.value = iy.value = 0
      iz.value = 1
      scroll_controler && scroll_controler.start()
    },
  })
}

function startDrag(e) {
  dragging = true
  const p = e.touches ? e.touches[0] : e
  lx = p.clientX
  ly = p.clientY
  const move = (ev) => {
    if (!dragging) return
    const q = ev.touches ? ev.touches[0] : ev
    ix.value += q.clientX - lx
    iy.value += q.clientY - ly
    lx = q.clientX
    ly = q.clientY
    applyImage()
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
  const dir = e.deltaY < 0 ? 1 : -1
  iz.value = Math.min(3, Math.max(0.5, iz.value + dir * 0.1))
  applyImage()
}
</script>
