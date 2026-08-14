<template>
  <section class="windowview" ref="root" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointerleave="onUp">
    <div class="windowview_backgroud" :style="layerStyle">
      <img class="windowview_backgroud_image" :src="BG" alt="background" />
      <canvas ref="canvas" class="windowview_backgroud_stars"></canvas>
    </div>
    <div class="windowview_stars" :style="layerStyle">
      <div class="windowview_stars_empty"></div>
      <div
        v-for="w in worldList()"
        :key="w.id"
        class="windowview_stars_star windowview_stars_star_clickable"
        :style="{ left: w.x + '%', top: w.y + '%', '--r': w.r }"
        @pointerenter="hoverStar(w.id)"
        @pointerleave="hoverStar(null)"
        @click.stop="clickStar(w.id)"
      >
        <img :src="w.star_image_url" :alt="w.name" />
      </div>
      <div
        v-for="(u, i) in store.unknownWorlds"
        :key="'u'+i"
        class="windowview_stars_star windowview_stars_star_unknown"
        :style="{ left: u.x + '%', top: u.y + '%', '--r': u.r || 1 }"
        @pointerenter="hoverStar('unknown-'+i)"
        @pointerleave="hoverStar(null)"
        @click.stop="clickUnknown(i)"
      >
        <img :src="u.image_url" alt="unknown" />
      </div>

      <div v-if="selected" class="windowview_stars_information" :style="cardStyle">
        <svg class="wsi_line" viewBox="0 0 160 40">
          <g :class="{ show: true }">
            <circle cx="8" cy="20" r="4" />
            <path d="M12 20 H70 L90 8 H150" />
            <circle cx="150" cy="8" r="3" />
          </g>
        </svg>
        <div class="wsi_container show">
          <div class="wsi_top"><div></div></div>
          <div class="wsi_title show" :style="{ '--color': selected.color }">
            <div class="wsi_title_icon">
              <div class="wsi_title_icon_border" style="--angle:0"></div>
              <div class="wsi_title_icon_border" style="--angle:1"></div>
              <div class="wsi_title_icon_border" style="--angle:2"></div>
              <div class="wsi_title_icon_border" style="--angle:3"></div>
              <div class="wsi_title_icon_line"></div>
            </div>
            <p class="_font_3">{{ selected.name }}</p>
          </div>
          <p class="wsi_content _font_1">{{ selected.introduce }}</p>
          <div v-if="!selected.unknown" class="wsi_button" @click.stop="explore">
            <div class="wsi_button_icon"><div></div><div></div></div>
            <p class="wsi_button_text _font_2" :style="{ '--color': selected.color }">EXPLORE</p>
          </div>
          <p v-else class="wsi_content _font_1">[UNKNOWN SIGNAL] // no access</p>
          <div class="wsi_border wsi_border_left"></div>
          <div class="wsi_border wsi_border_right"></div>
        </div>
      </div>
    </div>

    <div
      class="windowview_mousetip"
      :class="{ windowview_mousetip_activted: true, windowview_mousetip_click: !!hoverId && !hoverId.startsWith('unknown') }"
      :style="{ left: mouse.x + 'px', top: mouse.y + 'px', transform: 'scale(1)' }"
    >
      <svg class="windowview_mousetip_halo" viewBox="0 0 100 100">
        <circle class="windowview_mousetip_halo_circle1" cx="50" cy="50" r="40" />
        <circle class="windowview_mousetip_halo_circle2" cx="50" cy="50" r="32" />
        <circle class="windowview_mousetip_halo_circle3" cx="50" cy="50" r="24" />
      </svg>
      <div class="windowview_mousetip_content">
        <p class="_font_2">CLICK</p>
        <p class="_font_2">DRAG</p>
      </div>
      <div class="windowview_mousetip_outline">
        <div class="wmo_lineup"></div>
        <div class="wmo_linedown"></div>
        <p class="wmo_x _font_1">{{ pad(mouse.x) }}</p>
        <p class="wmo_y _font_1">{{ pad(mouse.y) }}</p>
      </div>
    </div>

    <div class="windowview_dragtip windowview_dragtip_left" :style="{ opacity: store.hasDragged ? 0 : 1, transition: 'opacity 1s' }">
      <p class="windowview_dragtip_texts _font_2">DRAG</p>
      <div class="windowview_dragtip_arrow"></div>
      <svg class="windowview_dragtip_line" viewBox="0 0 20 220">
        <polyline points="10,0 10,220" />
        <path d="M10 0 V220" />
        <path d="M10 0 V220" />
      </svg>
    </div>
    <div class="windowview_dragtip windowview_dragtip_right" :style="{ opacity: store.hasDragged ? 0 : 1, transition: 'opacity 1s' }">
      <p class="windowview_dragtip_texts _font_2">DRAG</p>
      <div class="windowview_dragtip_arrow"></div>
      <svg class="windowview_dragtip_line" viewBox="0 0 20 220">
        <polyline points="10,0 10,220" />
        <path d="M10 0 V220" />
        <path d="M10 0 V220" />
      </svg>
    </div>
    <div class="windowview_dragtip windowview_dragtip_top" :style="{ opacity: store.hasDragged ? 0 : 1, transition: 'opacity 1s' }">
      <svg class="windowview_dragtip_line" viewBox="0 0 400 20">
        <polyline points="0,10 400,10" />
        <path d="M0 10 H400" />
        <path d="M0 10 H400" />
      </svg>
      <div class="windowview_dragtip_arrow"></div>
      <p class="windowview_dragtip_texts _font_2" style="writing-mode:horizontal-tb;letter-spacing:.3rem">DRAG</p>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { store, worldList, openSystem, setTheme } from '../store.js'

const router = useRouter()

const BG = 'https://cdn.cosmicbroth.com/background_436870b549.jpg'
const root = ref(null)
const canvas = ref(null)
const pan = reactive({ x: 0, y: 0 })
const mouse = reactive({ x: 0, y: 0 })
const hoverId = ref(null)
const unknownPick = ref(null)
let dragging = false
let last = { x: 0, y: 0 }
let particles = []
let raf = 0

const MAX = () => {
  const w = window.innerWidth, h = window.innerHeight
  const portrait = h > w
  const extra = portrait ? 0.5 : 0.25
  return { x: w * extra, y: h * extra }
}

const layerStyle = computed(() => ({
  transform: `translate(${pan.x}px, ${pan.y}px)`,
}))

const selected = computed(() => {
  if (store.selectedStarId && store.worlds[store.selectedStarId]) {
    return store.worlds[store.selectedStarId]
  }
  if (unknownPick.value != null) {
    const u = store.unknownWorlds[unknownPick.value]
    return { name: 'UNKNOWN', introduce: '无法解析的星体信号。权限不足。观测记录已封存。', color: '#888', unknown: true, x: u.x, y: u.y }
  }
  return null
})

const cardStyle = computed(() => {
  if (!selected.value) return {}
  return { left: `calc(${selected.value.x}% + 1.5rem)`, top: `calc(${selected.value.y}% - 1rem)` }
})

function pad(n) {
  return String(Math.round(n)).padStart(4, '0')
}

function clampPan() {
  const m = MAX()
  pan.x = Math.max(-m.x, Math.min(m.x, pan.x))
  pan.y = Math.max(-m.y, Math.min(m.y, pan.y))
}

function onDown(e) {
  if (e.target.closest('.windowview_stars_star') || e.target.closest('.windowview_stars_information')) return
  dragging = true
  last = { x: e.clientX, y: e.clientY }
  root.value?.setPointerCapture?.(e.pointerId)
}

function onMove(e) {
  mouse.x = e.clientX
  mouse.y = e.clientY
  if (!dragging) return
  pan.x += e.clientX - last.x
  pan.y += e.clientY - last.y
  last = { x: e.clientX, y: e.clientY }
  clampPan()
  store.hasDragged = true
}

function onUp() {
  dragging = false
}

function hoverStar(id) {
  hoverId.value = id
}

function clickStar(id) {
  unknownPick.value = null
  store.selectedStarId = id
  setTheme(id)
}

function clickUnknown(i) {
  store.selectedStarId = null
  unknownPick.value = i
}

function explore() {
  const id = store.selectedStarId
  if (!id) return
  openSystem(id)
  router.push('/' + id)
}

function initStars() {
  const c = canvas.value
  if (!c) return
  const ctx = c.getContext('2d')
  const resize = () => {
    c.width = c.offsetWidth
    c.height = c.offsetHeight
    particles = Array.from({ length: 180 }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random(),
      s: Math.random() * 0.02 + 0.005,
    }))
  }
  resize()
  const draw = () => {
    ctx.clearRect(0, 0, c.width, c.height)
    for (const p of particles) {
      p.a += p.s
      const alpha = 0.2 + Math.abs(Math.sin(p.a)) * 0.8
      ctx.fillStyle = `rgba(243,243,243,${alpha})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fill()
    }
    raf = requestAnimationFrame(draw)
  }
  draw()
  window.addEventListener('resize', resize)
  starResize = resize
}

let starResize = null
let ptrMove = null

onMounted(() => {
  initStars()
  ptrMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY }
  window.addEventListener('pointermove', ptrMove)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  if (starResize) window.removeEventListener('resize', starResize)
  if (ptrMove) window.removeEventListener('pointermove', ptrMove)
})
</script>
