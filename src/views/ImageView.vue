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
      :class="{ dragging: moving }"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointerleave="onUp"
      @wheel.prevent="onWheel"
    >
      <div
        v-for="(cell, i) in cells"
        :key="i"
        class="imove imove_cut"
        :style="cellStyle(cell)"
        @click="open(cell)"
      >
        <img :src="cell.item.image_url" alt="image" />
        <p class="imove_tip _font_1">{{ cell.n }}</p>
      </div>
    </div>
    <div class="dragtip" :class="{ hidden: dragged }">
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
    <div v-if="picked" class="iview" @click.self="picked=null">
      <img class="hero" :src="picked.image_url" alt="view" @click="showImageview(picked.image_url)" />
      <p class="iview_txt _font_1">{{ picked.instrution }}</p>
      <div class="page-return page-return_bottom" @click="picked=null"><ReturnButton /></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api.js'
import { setTheme, showImageview } from '../store.js'
import ReturnButton from '../components/ReturnButton.vue'

const route = useRoute()
const router = useRouter()
const items = ref([])
const pan = reactive({ x: 0, y: 0 })
const moving = ref(false)
const dragged = ref(false)
const picked = ref(null)
const cells = ref([])
let last = { x: 0, y: 0 }
let start = { x: 0, y: 0 }

const COLS = 6
const CW = 240
const CH = 320
const GAP = 40
let PERIOD_X = COLS * (CW + GAP)
let PERIOD_Y = 4 * (CH + GAP * 0.6)

function layout() {
  const list = items.value
  if (!list.length) { cells.value = []; return }
  const out = []
  const rows = Math.max(1, Math.ceil(list.length / COLS))
  PERIOD_X = COLS * (CW + GAP)
  PERIOD_Y = rows * (CH + GAP * 0.6)
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
        x: ox + col * (CW + GAP) + (row % 2 ? GAP : 0),
        y: oy + row * (CH + GAP * 0.6),
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
    width: CW + 'px',
    height: CH + 'px',
    transform: `translate(${c.x + pan.x}px, ${c.y + pan.y}px)`,
  }
}

function onDown(e) {
  moving.value = true
  last = { x: e.clientX, y: e.clientY }
  start = { x: e.clientX, y: e.clientY }
}
function onMove(e) {
  if (!moving.value) return
  pan.x += e.clientX - last.x
  pan.y += e.clientY - last.y
  last = { x: e.clientX, y: e.clientY }
  wrapPan()
  dragged.value = true
}
function onUp() {
  moving.value = false
}
function onWheel(e) {
  pan.y += e.deltaY < 0 ? 40 : -40
  wrapPan()
  dragged.value = true
}
function open(cell) {
  if (Math.hypot(last.x - start.x, last.y - start.y) > 6) return
  picked.value = cell.item
}
function back() { router.push(`/${route.params.world}`) }

async function load() {
  if (route.params.world) setTheme(route.params.world)
  const data = await api.images(route.params.id)
  items.value = Array.isArray(data) ? data : []
  layout()
}

watch(() => route.fullPath, load, { immediate: true })
onMounted(() => { pan.x = -80; pan.y = -40 })
</script>
