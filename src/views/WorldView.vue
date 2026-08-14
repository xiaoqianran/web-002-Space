<template>
  <div class="worldpage">
    <HoverGrid />
    <div class="background">
      <img ref="bgA" alt="background" decoding="async" fetchpriority="high" />
      <img ref="bgB" alt="background" decoding="async" />
    </div>
    <div class="container">
      <div class="scrollline" :style="{ '--p': scrollP }">
        <svg class="scrollline_line scrollline_line1" viewBox="0 0 56 3355" style="--h:50%">
          <path d="M29.836,3353c0,13.43-.38-330.65-0.38-330.65l12.782-26.88-0.031-135.7L29.341,2811.8l-0.118-122.25L2.164,2629.11V2527.92l26.957-74.72-0.014-146.89,23.114-61.2v-142.7l-23.009-61.45L29.35,1795.5l25-59.8v-42.18l-15.7-21.6v-40l-13.124-32.87V1446.72L14.3,1418.1v-51.67l11.219-33.24V1160.52l9.493-43.97v-79.08L46,1010.86V947L26,914l-0.48-208.8-14-32.8V621.756l14-33.174V499.1L42,499V454L25.521,422.552,26,257l17-47,1-93L25.521,60.495,26,0" vector-effect="non-scaling-stroke" />
        </svg>
        <svg class="scrollline_line scrollline_line2" viewBox="0 0 60 3354" style="--h:35%">
          <path d="M33.391,3354l0.281-213L13,3074V2944l21.672-38-1.566-70.51-0.138-230.32L55.672,2495l0.306-192.08L32.672,2181V2007l-27-76v-48l27-71,0.188-96.25L1.672,1716v-27l31-59v-79l13.29-13.03,0.031-117.62-12.782-31.84s0.116-131.84.141-131.84c0.119,0.02-26.7-27.13-26.7-27.13l0.125-38.73,26.9-74.81L33.636,990.016l24.99-35.163-0.013-45.625L33.6,868.253l-0.02-68.31-16.007-25.1-0.013-44.251L4.672,702V651l29-39-0.024-46.713,10.99-20.1-0.009-17.453-11.009-16.4L33.561,400.592,51.542,362.6l-0.034-64.058L33.5,278.435,33.441,169.794,17.417,147.267,17.4,111.387,17.376,70.416,33.353,1" vector-effect="non-scaling-stroke" />
        </svg>
        <svg class="scrollline_line scrollline_line3" viewBox="0 0 73 3426" style="--h:20%">
          <path d="M10,3426V3227l12-68-0.089-276.73L55,2857V2745l-44.972-70.51L9,2583l21.2-30-0.191-241.41-22.05-63.44-0.071-89.97,21.955-56.95V1981.37L9.9,1898.29l0.118-205.91,53.865-56.82,1.252-101.64L21,1502s-0.025-138,0-138c0.392,0.06.608-262.86,0.608-262.86L1.571,1034.53l-0.03-54.984,19.971-52.979L21.385,697.635l36.961-70.767-0.03-54.523,12.983-31L71,414,29,378l-1-68L8,253.863V138.632l20-25.026V0" vector-effect="non-scaling-stroke" />
        </svg>
      </div>
      <div class="content">
        <div class="content_title _font_5">{{ world.name }}</div>
        <div v-for="(item, wi) in outline" :key="wi" class="content_sections">
          <div class="content_sections_warp">
            <div class="content_sections_warp_drops">
              <div
                v-for="(o, di) in (dropSeeds[wi] && dropSeeds[wi][0]) || []"
                :key="'a'+di"
                class="_dot"
                :style="{ '--o': o }"
              ></div>
            </div>
            <div class="content_sections_warp_drops">
              <div
                v-for="(o, di) in (dropSeeds[wi] && dropSeeds[wi][1]) || []"
                :key="'b'+di"
                class="_dot"
                :style="{ '--o': o }"
              ></div>
            </div>
          </div>
          <p
            v-for="(para, pi) in parasOf(item)"
            :key="pi"
            class="content_sections_section _font_4"
          >{{ para }}</p>
        </div>
        <div
          v-if="exploreTo"
          class="wsi_button worldpage_explore"
          @click="explore"
        >
          <div class="wsi_button_icon"><div></div><div></div></div>
          <p class="wsi_button_text _font_2" :style="{ '--color': world.color }">EXPLORE</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api.js'
import { store, setTheme } from '../store.js'
import { preload, cdn } from '../assets.js'
import {
  gsap,
  ease_out,
  ScrollTrigger,
  scroll_controler,
  scroll_progress,
} from '../motion.js'
import HoverGrid from '../components/HoverGrid.vue'

const route = useRoute()
const router = useRouter()
const outline = ref([])
const dropSeeds = ref([])
const currentIndex = ref(0)
const bgA = ref(null)
const bgB = ref(null)
let frontIsA = true
let sectionTriggers = []
let warpTriggers = []
let bgAnim = null
let bgGen = 0
let onScroll = null

const world = computed(() => store.worlds[route.params.world] || store.worlds['cosmic-broth'])
const scrollP = computed(() => scroll_progress.value ?? scroll_controler?.progress ?? 0)

const exploreTo = computed(() => {
  const id = world.value?.id
  const records = store.worlds[id]?.map?.records || {}
  const first = Object.values(records)[0]
  const firstId = first?.id || Object.keys(records)[0]
  if (!id || !firstId) return ''
  const chapters = store.routerMap?.[id]?.records?.[firstId]
  const chapter = (Array.isArray(chapters) && chapters[0]) || 'c1'
  return `/${id}/records/${firstId}/${chapter}`
})

function parasOf(item) {
  return String(item?.contents || '').split('\n').map((s) => s.trim()).filter(Boolean)
}

function explore() {
  if (exploreTo.value) router.push(exploreTo.value)
}

function seedDrops(n) {
  dropSeeds.value = Array.from({ length: n }, () => [
    Array.from({ length: 10 }, () => Math.round(Math.random())),
    Array.from({ length: 10 }, () => Math.round(Math.random())),
  ])
}

function srcAt(index) {
  const item = outline.value[index]
  return cdn(item?.image || world.value?.image_url || '')
}

function layers() {
  return frontIsA
    ? { front: bgA.value, back: bgB.value }
    : { front: bgB.value, back: bgA.value }
}

function preloadNeighbor(index) {
  const next = outline.value[index + 1] || outline.value[index - 1]
  if (next?.image) preload([next.image])
}

function changeBackground(index) {
  if (index === currentIndex.value) return
  currentIndex.value = index
  const src = srcAt(index)
  const { front, back } = layers()
  if (!back || !front) return
  if (bgAnim) {
    bgAnim.kill()
    bgAnim = null
  }
  const gen = ++bgGen
  back.src = src
  const startFade = () => {
    if (gen !== bgGen) return
    if (bgAnim) bgAnim.kill()
    bgAnim = gsap.timeline({
      onComplete: () => {
        frontIsA = !frontIsA
        bgAnim = null
      },
    })
      .to(back, { opacity: 1, duration: 0.8, ease: ease_out }, 0)
      .to(front, { opacity: 0, duration: 0.8, ease: ease_out }, 0)
  }
  if (back.complete && back.naturalWidth) startFade()
  else {
    const done = () => {
      back.removeEventListener('load', done)
      back.removeEventListener('error', done)
      startFade()
    }
    back.addEventListener('load', done)
    back.addEventListener('error', done)
  }
  preloadNeighbor(index)
}

function revealSection(el) {
  gsap.killTweensOf(el)
  gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: ease_out })
}

function removeTriggers() {
  sectionTriggers.forEach((t) => t.kill())
  warpTriggers.forEach((t) => t.kill())
  sectionTriggers = []
  warpTriggers = []
  if (bgAnim) {
    bgAnim.kill()
    bgAnim = null
  }
  bgGen += 1
  if (onScroll) {
    window.removeEventListener('scroll', onScroll)
    onScroll = null
  }
}

function initTriggers() {
  removeTriggers()
  const sections = [...document.querySelectorAll('.worldpage .content_sections_section')]
  const warps = [...document.querySelectorAll('.worldpage .content_sections_warp')]
  sections.forEach((el) => {
    gsap.set(el, { opacity: 0, y: '2rem' })
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 100%',
      onEnter: () => revealSection(el),
      onEnterBack: () => revealSection(el),
    })
    sectionTriggers.push(st)
  })
  warps.forEach((el, r) => {
    el.index = r
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      onEnter: () => {
        if (el.index !== currentIndex.value) changeBackground(el.index)
      },
      onEnterBack: () => {
        if (el.index !== currentIndex.value) changeBackground(el.index)
      },
      onLeave: () => {
        if (el.index + 1 <= warps.length - 1 && el.index + 1 !== currentIndex.value) {
          changeBackground(el.index + 1)
        }
      },
      onLeaveBack: () => {
        if (el.index - 1 >= 0 && el.index - 1 !== currentIndex.value) {
          changeBackground(el.index - 1)
        }
      },
    })
    warpTriggers.push(st)
  })
  onScroll = () => {
    scroll_progress.value = scroll_controler?.progress ?? 0
  }
  window.addEventListener('scroll', onScroll)
  ScrollTrigger.refresh()
  scroll_controler?.resize?.()
  sectionTriggers.forEach((st) => {
    if (st.scroll() >= st.start) revealSection(st.trigger)
  })
}

function resetLayers() {
  frontIsA = true
  const src = srcAt(0)
  if (bgA.value) {
    if (src) bgA.value.src = src
    gsap.set(bgA.value, { opacity: 1 })
  }
  if (bgB.value) {
    bgB.value.removeAttribute('src')
    gsap.set(bgB.value, { opacity: 0 })
  }
}

async function load() {
  const id = route.params.world
  if (!store.worlds[id]) {
    router.replace('/404')
    return
  }
  setTheme(id)
  const data = store.outlines[id] || (await api.outline(id))
  removeTriggers()
  currentIndex.value = 0
  if (data) {
    store.outlines[id] = data
    outline.value = data
    seedDrops(data.length)
  } else {
    outline.value = []
    dropSeeds.value = []
  }
  const thumbs = [world.value.image_url, ...outline.value.map((b) => b.image).filter(Boolean)]
  for (const node of Object.values(store.introduces?.[id] || {})) {
    for (const item of Object.values(node || {})) {
      if (item?.image_url) thumbs.push(item.image_url)
    }
  }
  preload(thumbs.slice(0, 8))
  window.scrollTo(0, 0)
  scroll_controler?.scrollTo?.(0, { immediate: true })
  await nextTick()
  resetLayers()
  preloadNeighbor(0)
  initTriggers()
}

watch(() => route.params.world, load, { immediate: true })
onUnmounted(() => {
  removeTriggers()
})
</script>
