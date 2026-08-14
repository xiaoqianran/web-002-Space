<template>
  <div class="portraits-page">
    <div class="page-bg-grid"></div>
    <div v-show="!viewOpen" class="page-return page-return_bottom" @click="back"><ReturnButton /></div>

    <div class="pdata system" ref="sysEl">
      <svg class="system_block" viewBox="0 0 842 373">
        <path d="M2.995,1.008h836.01V41H2.995V1.008Z"></path>
        <path d="M2.995,3h836.01V369.183L49,370,3,324Z" vector-effect="non-scaling-stroke"></path>
        <path d="M33,354H840" vector-effect="non-scaling-stroke"></path>
        <rect x="47.531" y="7" width="163.094" height="27.5"></rect>
        <text transform="translate(55.062 27.021) scale(0.114 0.114)">DATA SYSTEM</text>
      </svg>
      <div class="system_image">
        <div class="system_image_border _clip_cross"></div>
        <div class="system_image_dot system_image_dot_tl _dot"></div>
        <div class="system_image_dot system_image_dot_bl _dot"></div>
        <div class="system_image_dot system_image_dot_tr _dot"></div>
        <div class="system_image_dot system_image_dot_br _dot"></div>
        <img :src="$asset('img/system_matrix.svg')" alt="matrix" />
      </div>
      <div class="system_content">
        <p class="system_content_object _font_1">ACCESS OBJECT: <span class="_font_1">{{ currentName }}</span></p>
        <p class="system_content_information _font_1">
          0BJECT INFORMATI0N:
          <span v-for="(ch, i) in infoChars" :key="sel + '-' + i" class="_font_1">{{ ch }}</span>
          <span class="_font_1">...</span>
        </p>
        <div class="system_content_botttom">
          <div v-for="s in 4" :key="s" class="system_content_block _clip_edge">
            <div class="system_content_block_cross" :style="{ '--d': s }"></div>
          </div>
          <div class="system_content_inserttip">
            <div style="--d:0"></div>
            <div style="--d:1"></div>
            <div style="--d:2"></div>
            <p class="_font_1">READY TO ACCESS</p>
          </div>
        </div>
      </div>
    </div>

    <div class="paortraitsbox">
      <div
        v-for="(role, i) in roles"
        :key="i"
        class="paortraitsbox_portrait"
        :style="{ '--x': offsets[i] ?? 1.5 }"
        @click="readyShow(i)"
        @mouseenter="showArrow(i)"
        @touchstart.passive="showArrow(i)"
        @mouseleave="hiddenArrow(i)"
        @mouseup="hiddenArrow(i)"
        @touchend="hiddenArrow(i)"
      >
        <div class="paortraitsbox_portrait_imagebox">
          <div class="paortraitsbox_portrait_imagebox_block"></div>
          <div class="paortraitsbox_portrait_imagebox_image">
            <img :src="$cdn(role.portraits?.[0]?.image_url)" alt="portrait" decoding="async" :loading="i < 4 ? 'eager' : 'lazy'" />
          </div>
        </div>
        <div class="paortraitsbox_portrait_content" :class="{ paortraitsbox_portrait_content_show: shown.has(i) }">
          <p class="paortraitsbox_portrait_content_letters">
            <span v-for="(ch, ci) in letters(i, role)" :key="ci" class="_font_1" :style="{ '--d': `${ci * 0.04}s` }">{{ ch }}</span>
          </p>
          <p class="paortraitsbox_portrait_content_rects">
            <span v-for="l in 4" :key="l" class="_font_1" :style="{ '--d': rectDelay(role, l) }">{{ l % 2 ? '■' : '□' }}</span>
          </p>
        </div>
        <div class="paortraitsbox_portrait_arrow" :class="{ paortraitsbox_portrait_arrow_show: arrowI === i }">
          <div></div>
          <svg viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="22" vector-effect="non-scaling-stroke" />
          </svg>
          <div class="paortraitsbox_portrait_arrow_line"></div>
        </div>
      </div>
    </div>

    <div class="viewbox" :class="{ viewbox_hidden: !viewOpen }" ref="viewboxEl">
      <div class="viewbox_top">
        <div class="viewbox_dragline">
          <svg class="viewbox_dragline_edge viewbox_dragline_edge_left" viewBox="0 0 100 2">
            <line x1="0" y1="1" x2="100" y2="1" vector-effect="non-scaling-stroke"></line>
          </svg>
          <p class="viewbox_dragline_tip _font_1">DRAG</p>
          <svg class="viewbox_dragline_line viewbox_dragline_line_left" viewBox="0 0 100 2">
            <line x1="0" y1="1" x2="100" y2="1" vector-effect="non-scaling-stroke"></line>
            <line x1="0" y1="1" x2="100" y2="1" vector-effect="non-scaling-stroke"></line>
          </svg>
          <div class="viewbox_dragline_arrow">
            <div></div>
            <div></div>
          </div>
          <svg class="viewbox_dragline_line viewbox_dragline_line_right" viewBox="0 0 100 2">
            <line x1="0" y1="1" x2="100" y2="1" vector-effect="non-scaling-stroke"></line>
            <line x1="0" y1="1" x2="100" y2="1" vector-effect="non-scaling-stroke"></line>
          </svg>
          <p class="viewbox_dragline_tip _font_1">DRAG</p>
          <svg class="viewbox_dragline_edge viewbox_dragline_edge_right" viewBox="0 0 100 2">
            <line x1="0" y1="1" x2="100" y2="1" vector-effect="non-scaling-stroke"></line>
          </svg>
        </div>
        <div class="viewbox_imagebox_container">
          <div
            class="viewbox_imagebox"
            ref="imageboxEl"
            @pointerdown="onDown"
            @pointermove="onMove"
            @pointerup="onUp"
            @pointercancel="onUp"
          >
            <div
              v-for="(img, i) in portraitsData"
              :key="i"
              class="viewbox_imagebox_image _clip_edge"
              :class="{ viewbox_imagebox_image_selected: i === selectedImage }"
            >
              <div></div>
              <img :src="$cdn(img.image_url)" alt="image" decoding="async" loading="lazy" />
            </div>
          </div>
        </div>
        <div class="viewbox_instrution" ref="instrutionEl">
          <p class="viewbox_instrution_tip _font_1">
            {{ roles[viewIndex]?.name }} <span>◆</span> {{ selectedImage + 1 }}-{{ portraitsData.length }}
          </p>
          <div class="viewbox_instrution_content">
            <p class="_font_2" ref="contentEl">{{ portraitsData[selectedImage]?.content }}</p>
          </div>
        </div>
      </div>
      <div class="viewbox_content">
        <p v-for="(line, i) in infoLines" :key="i" class="_font_4">{{ line }}</p>
      </div>
      <div v-show="!store.imageview.open" class="viewbox_return" @click.stop="hideView">
        <ReturnButton />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api.js'
import { store, setTheme, showImageview } from '../store.js'
import { preload } from '../assets.js'
import { gsap, ease_out, ScrollTrigger, createLenis, scroll_controler } from '../motion.js'
import ReturnButton from '../components/ReturnButton.vue'

const route = useRoute()
const router = useRouter()
const roles = ref([])
const sel = ref(0)
const arrowI = ref(-1)
const viewOpen = ref(false)
const viewIndex = ref(0)
const selectedImage = ref(0)
const portraitsData = ref([])
const offsets = ref([])
const shown = reactive(new Set())
const sysEl = ref(null)
const viewboxEl = ref(null)
const imageboxEl = ref(null)
const instrutionEl = ref(null)
const contentEl = ref(null)

const currentName = computed(() => roles.value[sel.value]?.name || '')
const infoChars = computed(() => String(roles.value[sel.value]?.information || '').split('').slice(0, 50))
const infoLines = computed(() => String(roles.value[viewIndex.value]?.information || '').split('\n').filter((l) => l.length))

let portraits = []
let portraitTriggers = []
let informationAnimater = null
let images = []
let distance = 0
let startX = 0
let lastX = 0
let pendingIndex = -1
let ifDragable = false
let viewLenis = null
let bindedRotate = null
let bindedResizeArrow = null
let bindedResizeView = null
let imageAnim = null
let contentAnim = null
let viewAnim = null
let sysAnim = null

function letters(i, role) {
  return `【 ${String(i).padStart(3, '0')} 】ROLE: ${role.name || ''}`
}

function rectDelay(role, l) {
  return String(role?.name?.charCodeAt?.(0) ?? 0).split('')[l] ?? 0
}

function tweenSys(opacity) {
  if (!sysEl.value) return
  if (sysAnim) sysAnim.kill()
  gsap.killTweensOf(sysEl.value)
  sysAnim = gsap.to(sysEl.value, { opacity, duration: 0.5, ease: ease_out, delay: 0.1 })
}

function showArrow(i) {
  arrowI.value = i
  tweenSys(1)
  if (sel.value !== i) changeSystemContent(i)
}

function hiddenArrow() {
  arrowI.value = -1
  tweenSys(0.2)
}

function changeSystemContent(t) {
  sel.value = t
  informationAnimater && informationAnimater.kill()
  nextTick(() => {
    const spans = document.querySelectorAll('.portraits-page .system_content_information span')
    gsap.set(spans, { opacity: 0 })
    informationAnimater = gsap.to(spans, { opacity: 1, duration: 0.05, stagger: 0.01 })
  })
}

function killTriggers() {
  portraitTriggers.forEach((t) => { try { t.kill() } catch {} })
  portraitTriggers = []
}

function createPortraits() {
  killTriggers()
  portraits = []
  document.querySelectorAll('.portraits-page .paortraitsbox_portrait').forEach((t, e) => {
    const content = t.querySelector('.paortraitsbox_portrait_content')
    const arrow = t.querySelector('.paortraitsbox_portrait_arrow')
    if (!arrow) return
    if (e % 2) arrow.style.right = '-4rem'
    else arrow.style.left = '-4rem'
    portraits.push({
      content,
      arrow,
      arrow_line: arrow.querySelector('.paortraitsbox_portrait_arrow_line'),
      arrow_x: 0,
      arrow_y: 0,
      index: e,
    })
  })
  portraits.forEach((t) => {
    if (!t.content) return
    const e = ScrollTrigger.create({
      trigger: t.content,
      start: 'top 100%',
      onEnter: () => { shown.add(t.index) },
    })
    portraitTriggers.push(e)
  })
  resizeArrow()
  rotateArrow()
  ScrollTrigger.refresh()
}

function resizeArrow() {
  portraits.forEach((t) => {
    if (!t.arrow) return
    const e = t.arrow.getBoundingClientRect()
    t.arrow_x = e.x
    t.arrow_y = e.y + window.scrollY
  })
}

function rotateArrow() {
  portraits.forEach((t) => {
    if (!t.arrow_line) return
    const e = t.arrow_x
    const h = t.arrow_y - window.scrollY
    const s = (e - innerWidth / 2) / (h - innerHeight / 2)
    const r = h >= innerHeight / 2
      ? Math.atan(s) * 180 / Math.PI + 90
      : 270 + Math.atan(s) * 180 / Math.PI
    gsap.set(t.arrow_line, { rotate: `${-r}deg` })
  })
}

function createImages() {
  images = []
  document.querySelectorAll('.portraits-page .viewbox_imagebox_image').forEach((t, e) => {
    t.index = e
    images.push(t)
  })
}

function checkImagesX() {
  if (!images.length) return 0
  const t = images.reduce((h, s) => {
    const r = h.getBoundingClientRect()
    const l = s.getBoundingClientRect()
    const b = r.left + r.width / 2
    const M = l.left + l.width / 2
    return Math.abs(b - innerWidth / 2) < Math.abs(M - innerWidth / 2) ? h : s
  })
  if (t.index !== selectedImage.value) changeContent(t.index)
  const e = t.getBoundingClientRect()
  return innerWidth / 2 - e.left - e.width / 2
}

function moveImages(t, immediate = false) {
  if (!imageboxEl.value) return
  distance += t
  distance = Math.min(distance, 0)
  distance = Math.max(distance, -imageboxEl.value.offsetWidth)
  const lines = document.querySelectorAll('.portraits-page .viewbox_dragline_line line')
  if (imageAnim) imageAnim.kill()
  if (lines.length) gsap.killTweensOf(lines)
  if (images.length) gsap.killTweensOf(images)
  imageAnim = gsap.timeline()
    .to(lines, {
      strokeDashoffset: (s) => (s === 0 || s === 1 ? -distance : distance),
      duration: 0.2,
      ease: ease_out,
    })
  images.forEach((h) => {
    imageAnim.to(h, { x: `${distance}px`, duration: immediate ? 0 : 0.5, ease: ease_out }, '<')
  })
}

function changeContent(t) {
  if (!contentEl.value) {
    selectedImage.value = t
    return
  }
  if (contentAnim) contentAnim.kill()
  gsap.killTweensOf(contentEl.value)
  contentAnim = gsap.timeline()
    .to(contentEl.value, { y: '-100%', duration: 0.3, ease: ease_out })
    .fromTo(contentEl.value, { y: '100%' }, {
      y: '0',
      duration: 0.3,
      ease: ease_out,
      immediateRender: false,
      onStart: () => { selectedImage.value = t },
    }, '<0.15')
}

function resetView() {
  const edges = document.querySelectorAll('.portraits-page .viewbox_dragline_edge')
  const arrow = document.querySelector('.portraits-page .viewbox_dragline_arrow')
  gsap.timeline()
    .set(viewboxEl.value, { opacity: 0 })
    .set(edges, { scale: 0 })
    .set(instrutionEl.value, { translateY: '10%', opacity: 0 })
    .set(arrow, { scaleY: 0 })
}

function showView() {
  viewLenis && viewLenis.scrollTo(0, { immediate: true })
  if (viewAnim) viewAnim.kill()
  resetView()
  viewOpen.value = true
  const edges = document.querySelectorAll('.portraits-page .viewbox_dragline_edge')
  const arrow = document.querySelector('.portraits-page .viewbox_dragline_arrow')
  viewAnim = gsap.timeline()
    .to(viewboxEl.value, { opacity: 1, duration: 1, ease: ease_out })
    .to(edges, { scale: 1, duration: 1.2, ease: ease_out }, '<')
    .to(instrutionEl.value, { translateY: 0, opacity: 1, duration: 1.5, ease: ease_out }, '<')
    .to(arrow, { scaleY: 1, duration: 2, ease: ease_out }, '<')
}

function readyShow(i) {
  if (viewAnim) viewAnim.kill()
  viewIndex.value = i
  portraitsData.value = roles.value[i]?.portraits || []
  selectedImage.value = 0
  distance = 0
  images.forEach((e) => { gsap.set(e, { x: 0 }) })
  nextTick(() => {
    viewLenis && viewLenis.resize()
    createImages()
    moveImages(checkImagesX(), true)
    showView()
  })
}

function hideView() {
  if (viewAnim) viewAnim.kill()
  if (!viewboxEl.value) {
    portraitsData.value = []
    viewOpen.value = false
    return
  }
  viewAnim = gsap.to(viewboxEl.value, {
    opacity: 0,
    duration: 0.6,
    ease: ease_out,
    onComplete: () => {
      portraitsData.value = []
      images = []
      viewOpen.value = false
    },
  })
}

function onDown(e) {
  ifDragable = true
  startX = e.clientX
  lastX = e.clientX
  const img = e.target?.closest?.('.viewbox_imagebox_image')
  pendingIndex = img && imageboxEl.value ? [...imageboxEl.value.querySelectorAll('.viewbox_imagebox_image')].indexOf(img) : -1
  try { e.currentTarget?.setPointerCapture?.(e.pointerId) } catch {}
}

function onMove(e) {
  if (!ifDragable) return
  const dx = e.movementX || (e.clientX - lastX)
  lastX = e.clientX
  moveImages(dx, true)
}

function onUp(e) {
  if (e?.currentTarget?.hasPointerCapture?.(e.pointerId)) {
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
  }
  if (!ifDragable) return
  ifDragable = false
  moveImages(checkImagesX())
  if (startX === e.clientX && pendingIndex >= 0) {
    const src = portraitsData.value[pendingIndex]?.image_url
    if (src) showImageview(src)
  }
}

function back() { router.push(`/${route.params.world}`) }

function onKey(e) {
  if (e.key !== 'Escape') return
  if (store.menuOpen || store.systemOpen || store.consoleOpen || store.imageview.open) return
  if (!viewOpen.value) return
  e.preventDefault()
  hideView()
}

function onScrollRotate() {
  rotateArrow()
}

async function load() {
  if (route.params.world) setTheme(route.params.world)
  killTriggers()
  shown.clear()
  const data = await api.portraits(route.params.id)
  roles.value = Array.isArray(data) ? data : []
  offsets.value = roles.value.map(() => Math.random() + 1)
  preload(roles.value.slice(0, 6).map((r) => r.portraits?.[0]?.image_url))
  if (roles.value[0]) changeSystemContent(0)
  nextTick(() => {
    createPortraits()
    scroll_controler && scroll_controler.resize()
  })
}

watch(() => route.fullPath, load, { immediate: true })

onMounted(() => {
  if (sysEl.value) gsap.set(sysEl.value, { opacity: 0.2 })
  if (viewboxEl.value) {
    viewLenis = createLenis({ wrapper: viewboxEl.value })
    gsap.set(viewboxEl.value, { opacity: 0 })
  }
  bindedRotate = onScrollRotate
  bindedResizeArrow = () => { resizeArrow(); rotateArrow() }
  bindedResizeView = () => { if (viewOpen.value) moveImages(checkImagesX(), true) }
  window.addEventListener('keydown', onKey)
  window.addEventListener('scroll', bindedRotate)
  window.addEventListener('resize', bindedResizeArrow)
  window.addEventListener('resize', bindedResizeView)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
  if (scroll_controler) scroll_controler.on('scroll', bindedRotate)
})

onUnmounted(() => {
  killTriggers()
  informationAnimater && informationAnimater.kill()
  if (imageAnim) imageAnim.kill()
  if (contentAnim) contentAnim.kill()
  if (viewAnim) viewAnim.kill()
  if (sysAnim) sysAnim.kill()
  viewLenis && viewLenis.destroy()
  viewLenis = null
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('scroll', bindedRotate)
  window.removeEventListener('resize', bindedResizeArrow)
  window.removeEventListener('resize', bindedResizeView)
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('pointercancel', onUp)
  if (scroll_controler && bindedRotate) {
    try { scroll_controler.off('scroll', bindedRotate) } catch {}
  }
  portraits = []
})
</script>
