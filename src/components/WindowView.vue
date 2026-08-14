<template>
  <section
    class="windowview"
    ref="root"
    @pointerdown="onDown"
    @mousemove="onMove"
    @touchmove.prevent="onMove"
  >
    <div class="windowview_backgroud" ref="bgEl">
      <img class="windowview_backgroud_image" :src="BG" alt="background" decoding="async" fetchpriority="high" />
      <canvas ref="canvas" class="windowview_backgroud_stars"></canvas>
    </div>
    <div class="windowview_stars" ref="starsEl">
      <div class="windowview_stars_empty" @click="checkHidden"></div>
      <div
        v-for="w in worldList()"
        :key="w.id"
        class="windowview_stars_star windowview_stars_star_clickable"
        :style="{ left: w.x + '%', top: w.y + '%', '--r': w.r }"
        @pointerenter="hoverStar(w.id)"
        @pointerleave="hoverStar(null)"
        @click.stop="checkShow(w.id, $event.currentTarget)"
      >
        <img :src="$cdn(w.star_image_url)" :alt="w.name" decoding="async" />
      </div>
      <div
        v-for="(u, i) in store.unknownWorlds"
        :key="'u'+i"
        class="windowview_stars_star windowview_stars_star_unknown"
        :style="{ left: u.x + '%', top: u.y + '%', '--r': u.r || 1 }"
      >
        <img :src="$cdn(u.image_url)" alt="unknown" decoding="async" />
      </div>

      <div class="windowview_stars_information" ref="infoEl">
        <svg class="wsi_line" viewBox="0 0 160 40">
          <g ref="lineCircle">
            <circle cx="8" cy="20" r="4" />
            <path ref="lineLine" d="M12 20 H70 L90 8 H150" />
            <circle cx="150" cy="8" r="3" />
          </g>
        </svg>
        <div class="wsi_container" ref="wsiBox">
          <div class="wsi_top"><div></div></div>
          <div class="wsi_title" ref="wsiTitle" :style="{ '--color': selected?.color || '#178ec5' }">
            <div class="wsi_title_icon">
              <div class="wsi_title_icon_border" style="--angle:0"></div>
              <div class="wsi_title_icon_border" style="--angle:1"></div>
              <div class="wsi_title_icon_border" style="--angle:2"></div>
              <div class="wsi_title_icon_border" style="--angle:3"></div>
              <div class="wsi_title_icon_line"></div>
            </div>
            <p class="_font_3">{{ selected?.name }}</p>
          </div>
          <p class="wsi_content _font_1">{{ selected?.introduce }}</p>
          <div v-if="selected && !selected.unknown" class="wsi_button" @click.stop="explore">
            <div class="wsi_button_icon"><div></div><div></div></div>
            <p class="wsi_button_text _font_2" :style="{ '--color': selected.color }">EXPLORE</p>
          </div>
          <div class="wsi_border wsi_border_left"></div>
          <div class="wsi_border wsi_border_right"></div>
        </div>
      </div>
    </div>

    <div
      v-if="!isTouch"
      class="windowview_mousetip"
      :class="{ windowview_mousetip_activted: tipOn, windowview_mousetip_click: !!hoverId }"
      ref="tipEl"
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
        <path ref="dragL0" d="M10 0 V220" />
        <path ref="dragL1" d="M10 0 V220" />
      </svg>
    </div>
    <div class="windowview_dragtip windowview_dragtip_right" :style="{ opacity: store.hasDragged ? 0 : 1, transition: 'opacity 1s' }">
      <p class="windowview_dragtip_texts _font_2">DRAG</p>
      <div class="windowview_dragtip_arrow"></div>
      <svg class="windowview_dragtip_line" viewBox="0 0 20 220">
        <polyline points="10,0 10,220" />
        <path ref="dragR0" d="M10 0 V220" />
        <path ref="dragR1" d="M10 0 V220" />
      </svg>
    </div>
    <div class="windowview_dragtip windowview_dragtip_top" :style="{ opacity: store.hasDragged ? 0 : 1, transition: 'opacity 1s' }">
      <svg class="windowview_dragtip_line" viewBox="0 0 400 20">
        <polyline points="0,10 400,10" />
        <path ref="dragT0" d="M0 10 H400" />
        <path ref="dragT1" d="M0 10 H400" />
      </svg>
      <div class="windowview_dragtip_arrow"></div>
      <p class="windowview_dragtip_texts _font_2" style="writing-mode:horizontal-tb;letter-spacing:.3rem">DRAG</p>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { store, worldList, setTheme } from '../store.js'
import { gsap, ease_out } from '../motion.js'
import { cdn, STARFIELD } from '../assets.js'

const router = useRouter()
const BG = cdn(STARFIELD)
const isTouch = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0

const root = ref(null)
const canvas = ref(null)
const bgEl = ref(null)
const starsEl = ref(null)
const infoEl = ref(null)
const lineCircle = ref(null)
const lineLine = ref(null)
const wsiBox = ref(null)
const wsiTitle = ref(null)
const tipEl = ref(null)
const dragL0 = ref(null)
const dragL1 = ref(null)
const dragR0 = ref(null)
const dragR1 = ref(null)
const dragT0 = ref(null)
const dragT1 = ref(null)

const mouse = reactive({ x: 0, y: 0 })
const hoverId = ref(null)
const tipOn = ref(false)
const currentStar = ref(null)
const ifInfo = ref(false)

let if_movable = false
let mouse_x = 0
let mouse_y = 0
let distance_x = 0
let distance_y = 0
let vel_x = 0
let vel_y = 0
let min_x = 0, max_x = 0, min_y = 0, max_y = 0
let infoTl = gsap.timeline()
let dragTl = null
let particles = []
let raf = 0
let starResize = null
let dragBound = false
let coastRaf = 0

const selected = computed(() => {
  if (currentStar.value && store.worlds[currentStar.value]) return store.worlds[currentStar.value]
  return null
})

function pad(n) {
  return String(Math.round(n)).padStart(4, '0')
}

function bounds() {
  const w = window.innerWidth
  const h = window.innerHeight
  const extra = h > w ? 0.5 : 0.25
  max_x = w * extra
  min_x = -max_x
  max_y = h * extra
  min_y = -max_y
}

function eventXY(e) {
  if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  return { x: e.clientX ?? e.x ?? 0, y: e.clientY ?? e.y ?? 0 }
}

function bindDragWindow(on) {
  if (on === dragBound) return
  dragBound = on
  const fn = on ? window.addEventListener : window.removeEventListener
  fn('pointermove', onDragMove)
  fn('pointerup', onUp)
  fn('pointercancel', onUp)
}

function stopCoast() {
  if (coastRaf) {
    cancelAnimationFrame(coastRaf)
    coastRaf = 0
  }
}

function clampPan() {
  distance_x = Math.max(min_x, Math.min(max_x, distance_x))
  distance_y = Math.max(min_y, Math.min(max_y, distance_y))
}

function applyPan(x, y, duration) {
  if (dragTl) dragTl.kill()
  dragTl = gsap.timeline()
    .to(bgEl.value, { x: distance_x, y: distance_y, duration, ease: ease_out })
    .to(starsEl.value, { x: distance_x * 0.8, y: distance_y * 0.8, duration, ease: ease_out }, '<')
    .set([dragL0.value, dragL1.value, dragR0.value, dragR1.value].filter(Boolean), {
      strokeDashoffset: (f) => (f % 2 === 0 ? y - innerHeight / 2 : y - innerHeight / 2 + 20),
    }, '<')
    .set([dragT0.value, dragT1.value].filter(Boolean), {
      strokeDashoffset: (f) => (f === 0 ? x - innerWidth / 2 : x - innerWidth / 2 + 20),
    }, '<')
}

function onDown(e) {
  if (e.target.closest?.('.windowview_stars_star_clickable') || e.target.closest?.('.windowview_stars_information')) return
  stopCoast()
  const p = eventXY(e)
  if_movable = true
  mouse_x = p.x
  mouse_y = p.y
  vel_x = 0
  vel_y = 0
  bindDragWindow(true)
}

function followTip(p) {
  mouse.x = p.x
  mouse.y = p.y
  if (tipEl.value && !isTouch) {
    gsap.to(tipEl.value, { x: p.x, y: p.y, duration: 0.6, ease: ease_out })
  }
}

function onMove(e) {
  followTip(eventXY(e))
}

function onDragMove(e) {
  const p = eventXY(e)
  followTip(p)
  if (!if_movable) return
  move(p.x, p.y)
  mouse_x = p.x
  mouse_y = p.y
  store.hasDragged = true
}

function onUp() {
  if (!if_movable) {
    bindDragWindow(false)
    return
  }
  if_movable = false
  bindDragWindow(false)
  startCoast()
}

function startCoast() {
  stopCoast()
  if (Math.abs(vel_x) < 0.12 && Math.abs(vel_y) < 0.12) return
  const remain = 1 / (1 - 0.93)
  distance_x += vel_x * remain
  distance_y += vel_y * remain
  clampPan()
  applyPan(mouse.x, mouse.y, 1.2)
}

function move(x, y) {
  const dpr = window.devicePixelRatio || 1
  const unit = 500 / window.innerWidth / dpr
  const dx = (x - mouse_x) * unit
  const dy = (y - mouse_y) * unit
  vel_x = vel_x * 0.55 + dx * 0.45
  vel_y = vel_y * 0.55 + dy * 0.45
  distance_x += dx
  distance_y += dy
  clampPan()
  applyPan(x, y, 1)
}

function hoverStar(id) {
  hoverId.value = id
}

function checkShow(id, el) {
  if (currentStar.value === id) return
  if (infoTl && infoTl.isActive()) infoTl.kill()
  infoTl = gsap.timeline()
  if (currentStar.value) infoTl.add(hideInfo())
  infoTl.add(showInfo(id, el))
}

function checkHidden() {
  if (!currentStar.value) return
  if (infoTl && infoTl.isActive()) infoTl.kill()
  infoTl = hideInfo(() => { currentStar.value = null })
}

function showInfo(id, el) {
  return gsap.timeline()
    .set(infoEl.value, {
      left: `${el.offsetLeft + el.offsetWidth}px`,
      top: `${el.offsetTop + el.offsetHeight}px`,
      opacity: 1,
    })
    .to(lineCircle.value, {
      transform: 'scale(1)',
      duration: 0.3,
      ease: ease_out,
      onStart: () => {
        ifInfo.value = true
        currentStar.value = id
        store.selectedStarId = id
        setTheme(id)
      },
    })
    .to(lineLine.value, { strokeDashoffset: 0, duration: 0.8, ease: ease_out }, '<0.1')
    .to(wsiTitle.value, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 1, ease: ease_out }, '<0.3')
    .to(wsiBox.value, { opacity: 1, duration: 1, ease: ease_out }, '<')
}

function hideInfo(cb) {
  return gsap.timeline()
    .to(infoEl.value, {
      opacity: 0,
      duration: 0.3,
      ease: 'linear',
      onComplete: () => {
        ifInfo.value = false
        store.selectedStarId = null
        cb && cb()
      },
    })
    .set(infoEl.value, { opacity: 1 })
    .set(lineCircle.value, { transform: 'scale(0)' })
    .set(lineLine.value, { strokeDashoffset: 'calc(var(--scale) * 4rem)' })
    .set(wsiTitle.value, { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' })
    .set(wsiBox.value, { opacity: 0 })
}

function explore() {
  const id = currentStar.value
  if (!id) return
  router.push('/' + id)
}

function initStars() {
  const c = canvas.value
  if (!c) return
  const ctx = c.getContext('2d')
  const field = {
    width: 0,
    height: 0,
    stars: [],
    max_radius: 0,
    min_radius: 0,
    max_speed: 0,
    min_speed: 0,
  }
  const resize = () => {
    const prevW = field.width || 1
    const prevH = field.height || 1
    const dpr = window.devicePixelRatio || 1
    field.width = innerWidth * dpr
    field.height = innerHeight * dpr
    c.width = field.width
    c.height = field.height
    field.max_radius = (innerWidth + innerHeight) / 2000 * dpr
    field.min_radius = field.max_radius / 5
    field.max_speed = (innerWidth + innerHeight) / 8000 * dpr
    field.min_speed = field.max_speed / 10
    const fx = field.width / prevW
    const fy = field.height / prevH
    field.stars.forEach((s) => { s.x *= fx; s.y *= fy })
  }
  resize()
  if (!field.stars.length) {
    for (let i = 0; i < 500; i++) {
      field.stars.push({
        x: Math.random() * field.width,
        y: Math.random() * field.height,
        speed_x: Math.random() * (field.max_speed - field.min_speed) + field.min_speed,
        speed_y: Math.random() * (field.max_speed - field.min_speed) + field.min_speed,
        dirction_x: Math.random() > 0.5 ? -1 : 1,
        dirction_y: Math.random() > 0.5 ? -1 : 1,
        r: Math.random() * (field.max_radius - field.min_radius) + field.min_radius,
        alpha: Math.random(),
      })
    }
  }
  particles = field.stars
  const draw = () => {
    ctx.clearRect(0, 0, c.width, c.height)
    for (const s of field.stars) {
      s.x += s.speed_x * s.dirction_x
      s.y += s.speed_y * s.dirction_y
      s.alpha += (Math.random() - 0.5) * 0.2
      s.alpha = Math.max(0, Math.min(1, s.alpha))
      if (s.x < s.r * 2 || s.x > field.width + s.r * 2) s.dirction_x = -s.dirction_x
      if (s.y < s.r * 2 || s.y > field.height + s.r * 2) s.dirction_y = -s.dirction_y
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fill()
    }
    raf = requestAnimationFrame(draw)
  }
  draw()
  window.addEventListener('resize', resize)
  starResize = resize
}

onMounted(() => {
  bounds()
  initStars()
  if (infoEl.value) gsap.set(infoEl.value, { opacity: 1 })
  if (lineCircle.value) gsap.set(lineCircle.value, { transform: 'scale(0)', transformOrigin: '8px 20px' })
  if (lineLine.value) gsap.set(lineLine.value, { strokeDashoffset: 'calc(var(--scale) * 4rem)' })
  if (wsiTitle.value) gsap.set(wsiTitle.value, { clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' })
  if (wsiBox.value) gsap.set(wsiBox.value, { opacity: 0 })
  if (tipEl.value && !isTouch) {
    gsap.set(tipEl.value, { x: innerWidth / 2, y: innerHeight / 2, scale: 0 })
    root.value?.addEventListener('mouseenter', () => {
      tipOn.value = true
      gsap.to(tipEl.value, { scale: 1, duration: 0.8, ease: ease_out })
    })
    root.value?.addEventListener('mouseleave', () => {
      tipOn.value = false
      gsap.to(tipEl.value, { scale: 0, duration: 0.8, ease: ease_out })
    })
  }
  window.addEventListener('resize', bounds)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  stopCoast()
  bindDragWindow(false)
  if (dragTl) dragTl.kill()
  if (starResize) window.removeEventListener('resize', starResize)
  window.removeEventListener('resize', bounds)
})
</script>
