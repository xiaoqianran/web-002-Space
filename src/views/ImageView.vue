<template>
  <div class="images-page">
    <div class="page-return page-return_bottom" @click="back"><ReturnButton /></div>
    <div class="viewfinder">
      <i class="vf vf_tl"></i><i class="vf vf_tr"></i><i class="vf vf_bl"></i><i class="vf vf_br"></i>
    </div>
    <div class="img_hint img_hint_l _font_2">◀</div>
    <div class="img_hint img_hint_r _font_2">▶</div>
    <div
      class="scrollbox"
      :class="{ dragging: moving, scrollbox_actived: moving }"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointerleave="onUp"
      @wheel.prevent="onWheel"
    >
      <div
        v-for="(cell, i) in cells"
        :key="i"
        class="imove imove_cut scrollbox_mover"
        :style="cellStyle(cell)"
        @click="open(cell)"
      >
        <img :src="cell.item.image_url" alt="image" />
        <p class="imove_tip _font_1">{{ cell.n }}</p>
      </div>
    </div>
    <div class="dragtip" :class="{ hidden: dragged, dragtip_hidden: dragged }">
      <div class="dragtip_main_content _clip_edge">
        <p class="_font_3">DRAG SCREEN</p>
        <p class="_font_1">TO BROWSE IMAGES</p>
      </div>
    </div>
    <div class="img_footer">
      <p class="_font_1">→ Infinite scrolling is ready</p>
      <div class="img_barcode">
        <span v-for="n in 22" :key="n" :style="{ width: ((n * 5) % 4 + 1) + 'px' }"></span>
      </div>
    </div>
    <div v-show="picked" class="iview" ref="viewbox" @click.self="hideView">
      <img class="hero viewbox_imagebox_image" :src="picked?.image_url" alt="view" @click="showImageview(picked.image_url)" />
      <p class="iview_txt _font_1">{{ picked?.instrution }}</p>
      <div class="page-return page-return_bottom" @click="hideView"><ReturnButton /></div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api.js'
import { setTheme, showImageview } from '../store.js'
import { gsap, ease_out } from '../motion.js'
import ReturnButton from '../components/ReturnButton.vue'

const route = useRoute()
const router = useRouter()
const items = ref([])
const pan = reactive({ x: 0, y: 0 })
const moving = ref(false)
const dragged = ref(false)
const picked = ref(null)
const cells = ref([])
const viewbox = ref(null)
let last = { x: 0, y: 0 }
let start = { x: 0, y: 0 }
let ease = { x: 0, y: 0 }
let raf = 0
let dragTipTimer = null
let if_movable = false

const COLS = 6
const scale_nums = () => innerHeight / 300 + innerWidth / 300
const CW = () => 12 * 2.4 * scale_nums()
const CH = () => 18 * 2.4 * scale_nums()
const GAP = 40
let PERIOD_X = COLS * (CW() + GAP)
let PERIOD_Y = 4 * (CH() + GAP * 0.6)

function layout() {
  const list = items.value
  if (!list.length) { cells.value = []; return }
  const out = []
  const cw = CW(), ch = CH()
  const rows = Math.max(1, Math.ceil(list.length / COLS))
  PERIOD_X = COLS * (cw + GAP)
  PERIOD_Y = rows * (ch + GAP * 0.6)
  const copies = 4
  for (let cpy = 0; cpy < copies; cpy++) {
    const ox = (cpy % 2) * PERIOD_X
    const oy = Math.floor(cpy / 2) * PERIOD_Y
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      const col = i % COLS
      const row = Math.floor(i / COLS)
      out.push({
        item,
        n: i + 1,
        x: ox + col * (cw + GAP) + (row % 2 ? GAP : 0),
        y: oy + row * (ch + GAP * 0.6),
        w: cw,
        h: ch,
      })
    }
  }
  cells.value = out
}

function wrapPan() {
  if (pan.x > 0) pan.x -= PERIOD_X
  if (pan.x < -PERIOD_X) pan.x += PERIOD_X
  if (pan.y > 0) pan.y -= PERIOD_Y
  if (pan.y < -PERIOD_Y) pan.y += PERIOD_Y
}

function cellStyle(c) {
  return {
    width: (c.w || CW()) + 'px',
    height: (c.h || CH()) + 'px',
    transform: `translate(${c.x + pan.x}px, ${c.y + pan.y}px)`,
  }
}

function applyEase() {
  pan.x += ease.x
  pan.y += ease.y
  wrapPan()
  ease.x *= 0.95
  ease.y *= 0.95
  if (Math.abs(ease.x) < 0.01 && Math.abs(ease.y) < 0.01) {
    ease.x = ease.y = 0
    raf = 0
    return
  }
  raf = requestAnimationFrame(applyEase)
}

function kickEase() {
  if (!raf) raf = requestAnimationFrame(applyEase)
}

function hideTipSoon() {
  if (dragTipTimer) return
  dragTipTimer = setTimeout(() => { dragged.value = true }, 500)
}

function onDown(e) {
  if (picked.value) return
  if_movable = true
  moving.value = true
  last = { x: e.clientX, y: e.clientY }
  start = { x: e.clientX, y: e.clientY }
}

function onMove(e) {
  if (!if_movable) return
  const dx = e.movementX ?? (e.clientX - last.x)
  const dy = e.movementY ?? (e.clientY - last.y)
  const s = scale_nums()
  ease.x += dx * 0.02 * s
  ease.y += dy * 0.02 * s
  last = { x: e.clientX, y: e.clientY }
  kickEase()
  hideTipSoon()
}

function onUp() {
  if_movable = false
  moving.value = false
}

function onWheel(e) {
  if (picked.value) return
  const dy = 10 * Math.sign(e.wheelDeltaY || -e.deltaY || 0)
  ease.y += dy * 0.02 * scale_nums()
  kickEase()
  hideTipSoon()
}

function open(cell) {
  if (Math.hypot(last.x - start.x, last.y - start.y) > 6) return
  picked.value = cell.item
  nextTick(() => {
    if (!viewbox.value) return
    gsap.set(viewbox.value, { opacity: 0 })
    gsap.to(viewbox.value, { opacity: 1, duration: 1.3, ease: ease_out })
  })
}

function hideView() {
  if (!viewbox.value) { picked.value = null; return }
  gsap.to(viewbox.value, {
    opacity: 0,
    duration: 0.8,
    ease: ease_out,
    onComplete: () => { picked.value = null },
  })
}

function back() { router.push(`/${route.params.world}`) }

async function load() {
  if (route.params.world) setTheme(route.params.world)
  const data = await api.images(route.params.id)
  items.value = Array.isArray(data) ? data : []
  layout()
}

watch(() => route.fullPath, load, { immediate: true })
onMounted(() => {
  pan.x = -80
  pan.y = -40
  window.addEventListener('resize', layout)
})
onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  window.removeEventListener('resize', layout)
  if (dragTipTimer) clearTimeout(dragTipTimer)
})
</script>
