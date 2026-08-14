<template>
  <div class="portraits-page">
    <div class="page-bg-grid"></div>
    <div v-show="!viewOpen" class="page-return page-return_bottom" @click="back"><ReturnButton /></div>
    <div class="pdata system" ref="sysEl">
      <p class="pdata_k _font_1">DATA SYSTEM</p>
      <p class="pdata_title _font_2">ACCESS OBJECT: {{ typedName }}</p>
      <p class="pdata_info _font_1">0BJECT INFORMATI0N: {{ typedInfo }}</p>
      <p class="_font_1 pdata_ready">READY TO ACCESS</p>
    </div>
    <div class="paortraitsbox paortraitsbox_scatter" :style="{ minHeight: scatterH }">
      <div
        v-for="(role, i) in roles"
        :key="i"
        class="paortraitsbox_portrait scatter_card"
        :class="{ paortraitsbox_portrait_content_show: shown.has(i) }"
        :style="scatterStyle(i)"
        @click="openRole(i)"
        @mouseenter="onHover(i)"
        @mouseleave="onLeave"
      >
        <div class="paortraitsbox_portrait_imagebox scatter_clip">
          <div class="paortraitsbox_portrait_imagebox_image">
            <img :src="$cdn(role.portraits?.[0]?.image_url)" :alt="role.name" decoding="async" :loading="i < 4 ? 'eager' : 'lazy'" />
          </div>
        </div>
        <div class="paortraitsbox_portrait_content">
          <p class="paortraitsbox_portrait_content_letters _font_1">
            <span v-for="(ch, ci) in letters(i, role)" :key="ci" :style="{ '--d': ci * 0.04 + 's' }">{{ ch }}</span>
          </p>
          <p class="scatter_rects _font_1">■□■□</p>
        </div>
      </div>
    </div>

    <div v-show="viewOpen" class="pview" ref="viewbox">
      <div class="pview_strip" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp">
        <div class="pview_track" ref="track" :style="{ transform: `translateX(${tx}px)` }">
          <div
            v-for="(img, i) in (current?.portraits || [])"
            :key="i"
            class="pview_img _clip_edge"
            :class="{ selected: i === imgI }"
            @click="pickImg(i, img.image_url)"
          >
            <img :src="$cdn(img.image_url)" alt="portrait" decoding="async" loading="lazy" />
          </div>
        </div>
      </div>
      <p class="pview_cap _font_1">{{ current?.name }} ◆ {{ imgI + 1 }}-{{ current?.portraits?.length }}</p>
      <p class="pview_cap _font_2">{{ current?.portraits?.[imgI]?.content }}</p>
      <div v-show="!store.imageview.open" class="overlay-return" @click.stop="hideView"><ReturnButton /></div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api.js'
import { store, setTheme, showImageview } from '../store.js'
import { preload } from '../assets.js'
import { gsap, ease_out } from '../motion.js'
import ReturnButton from '../components/ReturnButton.vue'

const route = useRoute()
const router = useRouter()
const roles = ref([])
const sel = ref(0)
const viewOpen = ref(false)
const imgI = ref(0)
const tx = ref(0)
const typedName = ref('')
const typedInfo = ref('')
const sysEl = ref(null)
const viewbox = ref(null)
const track = ref(null)
const shown = reactive(new Set())
const offsets = ref([])
let drag = false, lx = 0, startX = 0
const current = computed(() => roles.value[sel.value])
const scatterH = computed(() => {
  const rows = Math.ceil(roles.value.length / 2)
  return (12 + rows * 32) + 'vh'
})

function letters(i, role) {
  return `【 ${String(i).padStart(3, '0')} 】ROLE: ${role.name || ''}`
}

function scatterStyle(i) {
  const col = i % 2
  const row = Math.floor(i / 2)
  const x = col === 0 ? 10 + (row % 3) * 3 : 54 + (row % 2) * 4
  const y = 8 + row * 30 + (col ? 6 : 0)
  const rot = ((i % 5) - 2) * 1.6
  const xv = offsets.value[i] ?? 1.5
  return {
    left: x + '%',
    top: y + 'vh',
    transform: `rotate(${rot}deg)`,
    '--x': xv,
  }
}

function typeInto(target, text) {
  const s = String(text || '')
  target.value = ''
  const chars = s.split('')
  // gsap stagger on a dummy object list
  const objs = chars.map((ch) => ({ ch, out: '' }))
  gsap.to(objs, {
    duration: 0.05,
    stagger: 0.01,
    onUpdate() {
      target.value = objs.map((o, i) => (i <= Math.floor(this.progress() * objs.length) ? o.ch : '')).join('')
    },
    onComplete() { target.value = s },
  })
}

function onHover(i) {
  sel.value = i
  const r = roles.value[i]
  if (sysEl.value) gsap.to(sysEl.value, { opacity: 1, duration: 0.5, delay: 0.1 })
  typeInto(typedName, r?.name || '')
  typeInto(typedInfo, r?.information || '')
}

function onLeave() {
  if (sysEl.value) gsap.to(sysEl.value, { opacity: 0.2, duration: 0.5, delay: 0.1 })
}

async function load() {
  if (route.params.world) setTheme(route.params.world)
  const data = await api.portraits(route.params.id)
  roles.value = Array.isArray(data) ? data : []
  offsets.value = roles.value.map(() => Math.random() + 1)
  roles.value.forEach((_, i) => shown.add(i))
  preload(roles.value.slice(0, 6).map((r) => r.portraits?.[0]?.image_url))
  if (roles.value[0]) onHover(0)
}

function openRole(i) {
  sel.value = i
  imgI.value = 0
  tx.value = 0
  viewOpen.value = true
  nextTick(() => {
    if (!viewbox.value) return
    gsap.set(viewbox.value, { opacity: 0 })
    gsap.timeline()
      .to(viewbox.value, { opacity: 1, duration: 1, ease: ease_out })
  })
}

function hideView() {
  if (!viewbox.value) { viewOpen.value = false; return }
  gsap.to(viewbox.value, {
    opacity: 0,
    duration: 0.6,
    ease: ease_out,
    onComplete: () => { viewOpen.value = false },
  })
}

function pickImg(i, src) {
  if (startX !== lx && Math.abs(startX - lx) > 4) return
  imgI.value = i
  showImageview(src)
}

function back() { router.push(`/${route.params.world}`) }

function onDown(e) {
  drag = true
  lx = e.clientX
  startX = e.clientX
}
function onMove(e) {
  if (!drag) return
  tx.value += e.clientX - lx
  lx = e.clientX
}
function onUp() {
  if (!drag) return
  drag = false
  const imgs = current.value?.portraits || []
  if (!imgs.length) return
  const w = 280
  const nearest = Math.max(0, Math.min(imgs.length - 1, Math.round(-tx.value / w)))
  imgI.value = nearest
  gsap.to({ v: tx.value }, {
    v: -nearest * w,
    duration: 0.5,
    ease: ease_out,
    onUpdate() { tx.value = this.targets()[0].v },
  })
}

function onKey(e) {
  if (e.key !== 'Escape') return
  if (store.menuOpen || store.systemOpen || store.consoleOpen || store.imageview.open) return
  if (!viewOpen.value) return
  e.preventDefault()
  hideView()
}

watch(() => route.fullPath, load, { immediate: true })
onMounted(() => {
  if (sysEl.value) gsap.set(sysEl.value, { opacity: 0.2 })
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
})
</script>
