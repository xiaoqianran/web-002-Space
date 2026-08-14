<template>
  <Loading />
  <SiteHeader />
  <MenuOverlay />
  <PageScrollbar v-if="isInner" />
  <router-view />
  <div
    class="imageview"
    :style="{ pointerEvents: store.imageview.open ? 'auto' : 'none' }"
    @wheel.prevent="onWheel"
    @click.self="closeView"
    @touchstart="onViewTouchStart"
    @touchmove.prevent="onViewTouchMove"
  >
    <div
      ref="imgBox"
      class="imageview_image"
      @mousedown.prevent="startDrag"
      @touchstart="onImageTouchStart"
    >
      <img :src="$cdn(store.imageview.src)" alt="imageview" decoding="async" />
    </div>
    <p class="imageview_tip _font_2">+ 拖拽移动图片，滑动滚轮/双指捏合缩放图片 +</p>
    <div v-show="store.imageview.open" class="imageview_return" @click.stop="closeView">
      <ReturnButton />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { store, hideImageview, boot } from './store.js'
import { gsap, ease_out, initGlobalLenis, scroll_controler } from './motion.js'
import ReturnButton from './components/ReturnButton.vue'
import SiteHeader from './components/SiteHeader.vue'
import MenuOverlay from './components/MenuOverlay.vue'
import Loading from './components/Loading.vue'
import PageScrollbar from './components/PageScrollbar.vue'

boot()

const route = useRoute()
const isInner = computed(() => route.name !== 'home')
const imgBox = ref(null)
const ix = ref(0)
const iy = ref(0)
const iz = ref(1)
let dragging = false
let lx = 0
let ly = 0

function applyPageScroll() {
  const inner = route.name !== 'home'
  document.documentElement.classList.toggle('page-scroll', inner)
  if (inner && scroll_controler) {
    scroll_controler.resize()
    scroll_controler.scrollTo(0, { immediate: true })
  }
}

function onKey(e) {
  if (e.key !== 'Escape') return
  if (store.menuOpen) return
  if (!store.imageview.open) return
  e.preventDefault()
  closeView()
}

onMounted(() => {
  initGlobalLenis()
  applyPageScroll()
  gsap.set('.imageview', { opacity: 0 })
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
})

watch(() => route.fullPath, () => {
  if (store.imageview.open) closeView()
  scroll_controler?.start()
  scroll_controler?.resize()
  applyPageScroll()
})

watch(() => store.menuOpen, (v) => {
  if (!scroll_controler) return
  if (v) {
    scroll_controler.stop()
  } else {
    scroll_controler.start()
    scroll_controler.resize()
  }
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
  if (!store.imageview.open) return
  scroll_controler && scroll_controler.start()
  gsap.to('.imageview', {
    opacity: 0,
    duration: 0.6,
    ease: ease_out,
    onComplete: () => {
      hideImageview()
      ix.value = iy.value = 0
      iz.value = 1
    },
  })
}

let pinchHypot = null

function scaleImage(dir) {
  iz.value = Math.min(3, Math.max(0.5, iz.value + dir * 0.1))
  applyImage()
}

function onViewTouchStart(e) {
  if (e.touches && e.touches.length === 2) {
    e.preventDefault()
    dragging = false
    pinchHypot = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    )
  }
}

function onViewTouchMove(e) {
  if (!e.touches || e.touches.length !== 2 || pinchHypot == null) return
  const n = Math.hypot(
    e.touches[0].clientX - e.touches[1].clientX,
    e.touches[0].clientY - e.touches[1].clientY,
  )
  scaleImage(Math.sign(n - pinchHypot))
  pinchHypot = n
}

function onImageTouchStart(e) {
  if (e.touches && e.touches.length === 2) {
    onViewTouchStart(e)
    return
  }
  e.preventDefault()
  startDrag(e)
}

function startDrag(e) {
  if (e.touches && e.touches.length === 2) return
  dragging = true
  const p = e.touches ? e.touches[0] : e
  lx = p.clientX
  ly = p.clientY
  const move = (ev) => {
    if (!dragging) return
    if (ev.touches && ev.touches.length === 2) {
      dragging = false
      onViewTouchStart(ev)
      return
    }
    const q = ev.touches ? ev.touches[0] : ev
    ix.value += q.clientX - lx
    iy.value += q.clientY - ly
    lx = q.clientX
    ly = q.clientY
    applyImage()
  }
  const up = () => {
    dragging = false
    pinchHypot = null
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
  scaleImage(e.deltaY < 0 ? 1 : -1)
}
</script>
