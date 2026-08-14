<template>
  <HoverGrid :stroke_color="light ? '#000013' : '#f3f3f3'" />
  <section class="records">
    <div class="page-return page-return_bottom" @click="back">
      <ReturnButton />
    </div>
    <div class="information">
      <div class="information_top">
        <p class="information_top_title _font_2">&gt;&gt; TITLE: {{ meta.name }}</p>
        <div class="information_top_code">
          <span v-for="n in 22" :key="n" :style="{ width: ((n * 7) % 5 + 1) + 'px' }"></span>
        </div>
      </div>
      <div class="information_middle">
        <div class="information_middle_image">
          <img v-if="meta.image_url" :src="$cdn(meta.image_url)" alt="information" decoding="async" />
        </div>
        <div class="information_middle_content">
          <div class="information_middle_content_instrution">
            <p class="_font_1">{{ meta.instrution }}</p>
          </div>
          <div class="information_middle_content_data">
            <p class="_font_1">&gt;&gt; world --------------- <span>{{ meta.world || worldName }}</span></p>
            <p class="_font_1">&gt;&gt; type --------------- <span>{{ meta.type }}</span></p>
            <p class="_font_1">&gt;&gt; time --------------- <span>{{ meta.time }}</span></p>
            <div class="information_middle_content_arrow">
              <svg viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" vector-effect="non-scaling-stroke" />
                <path d="M12 16 L20 24 L28 16" vector-effect="non-scaling-stroke" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <p class="information_code _font_1">[NODE.LINK] INITIATING…
[DECODE] memory.fragment[chapter_{{ chapterNum }}]
{{ binaryLine(0, 8) }}
{{ binaryLine(8, 16) }}
→ STATUS: ACTIVE
→ OUTPUT: [timeline append]
→ PREFETCH: enabled</p>
    </div>

    <div class="chapter" ref="chapterEl">
      <div class="chapter_title _font_5">
        <p class="_font_3">{{ chapterNum }}</p>
        {{ chapterTitle }}
        <svg viewBox="0 0 616 106">
          <path d="M18,15.41H226.571m65.581,15.511C320.861,51.9,367,86,367,86l151,0.4" vector-effect="non-scaling-stroke" />
          <path d="M561,86.41L541,99.269V73.55Z" />
          <path d="M604,86.41L584,99.269V73.55Z" />
          <circle cx="262.5" cy="15.5" r="9.5" />
        </svg>
      </div>
      <p v-for="(para, i) in paras" :key="i" class="chapter_section _font_4">{{ para }}</p>
    </div>

    <div class="navigation">
      <svg class="navigation_line" viewBox="0 0 39 817">
        <path d="M38 0V658.718L1 702.216V821" vector-effect="non-scaling-stroke" />
      </svg>
      <div class="navigation_container">
        <div
          class="navigation_arrow navigation_arrow_prev"
          :class="{ navigation_arrow_hidden: chapterNum <= 1 }"
          @click="go(chapterNum - 1)"
        >
          <div class="_arrow_top"></div>
          <p class="_font_1">上一章</p>
        </div>
        <div class="navigation_chapters" ref="chaptersEl">
          <div
            v-for="(c, i) in (meta.chapters || [])"
            :key="i"
            class="navigation_chapters_chapter"
            :class="{ navigation_chapters_chapter_current: i + 1 === chapterNum }"
            @click="go(i + 1)"
          >
            <p class="_font_1">{{ c }}</p>
            <div></div>
          </div>
        </div>
        <div
          class="navigation_arrow navigation_arrow_next"
          :class="{ navigation_arrow_hidden: chapterNum >= (meta.chapters || []).length }"
          @click="go(chapterNum + 1)"
        >
          <p class="_font_1">下一章</p>
          <div class="_arrow_down"></div>
        </div>
        <svg
          class="navigation_readmode"
          :class="{ navigation_readmode_light: light }"
          viewBox="0 0 100 100"
          @click="toggleRead"
        >
          <circle cx="50" cy="50" r="30.18" vector-effect="non-scaling-stroke" />
          <circle cx="50" cy="50" r="46.74" vector-effect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api.js'
import { setTheme, store } from '../store.js'
import { bindLenis, ease_out, gsap, resizeLenis, scroll_controler } from '../motion.js'
import ReturnButton from '../components/ReturnButton.vue'
import HoverGrid from '../components/HoverGrid.vue'

const route = useRoute()
const router = useRouter()
const meta = ref({ name: '', chapters: [], instrution: '', world: '', type: '', time: '', image_url: '' })
const paras = ref([])
const light = ref(false)
const chaptersEl = ref(null)
const chapterEl = ref(null)
let chapterLenis = null
let chapterFade = null
let loadGen = 0
let hasLoaded = false

const chapterNum = computed(() => parseInt(String(route.params.chapter).replace(/^c/, ''), 10) || 1)
const chapterTitle = computed(() => (meta.value.chapters || [])[chapterNum.value - 1] || '')
const worldName = computed(() => store.worlds[route.params.world]?.name || '')

function binaryLine(from, to) {
  const s = String(meta.value.instrution || '')
  return s.slice(from, to).split('').map((ch) =>
    (ch.charCodeAt(0) >> 8).toString(2).padStart(8, '0')
  ).join(' ')
}

function destroyChapterLenis() {
  if (chapterLenis) {
    chapterLenis.destroy()
    chapterLenis = null
  }
}

function scrollCurrentChapter() {
  const root = chaptersEl.value || document.querySelector('.navigation_chapters')
  const row = root?.querySelector?.('.navigation_chapters_chapter_current')
  if (!row) return
  chapterLenis?.resize?.()
  if (chapterLenis?.scrollTo) {
    chapterLenis.scrollTo(row, { immediate: true })
  } else {
    row.scrollIntoView({ block: 'nearest' })
  }
}

function createChapterLenis() {
  const el = chaptersEl.value || document.querySelector('.navigation_chapters')
  if (!el) return
  if (chapterLenis) {
    chapterLenis.resize?.()
    return
  }
  el.scrollTo(0, 0)
  chapterLenis = bindLenis(el)
  chapterLenis?.resize?.()
}

function fadeChapter(opacity, duration) {
  const el = chapterEl.value || document.querySelector('.records .chapter')
  if (!el) return Promise.resolve()
  if (chapterFade) chapterFade.kill()
  return new Promise((resolve) => {
    chapterFade = gsap.to(el, {
      opacity,
      duration,
      ease: ease_out,
      onComplete: resolve,
      onInterrupt: resolve,
    })
  })
}

async function load() {
  const gen = ++loadGen
  const w = route.params.world
  const id = route.params.id
  if (w) setTheme(w)
  const shouldFade = hasLoaded
  const fetchP = Promise.all([
    api.recordMeta(id),
    api.recordChapter(id, 'c' + chapterNum.value),
  ])
  if (shouldFade) await fadeChapter(0, 0.25)
  if (gen !== loadGen) return
  const [m, ch] = await fetchP
  if (gen !== loadGen) return
  if (m) meta.value = m
  paras.value = Array.isArray(ch) ? ch : []
  hasLoaded = true
  await nextTick()
  if (gen !== loadGen) return
  createChapterLenis()
  chapterLenis?.resize?.()
  scrollCurrentChapter()
  resizeLenis()
  scroll_controler?.scrollTo?.(0, { immediate: true })
  window.scrollTo(0, 0)
  if (shouldFade) fadeChapter(1, 0.3)
}

function go(n) {
  const max = (meta.value.chapters || []).length
  if (n < 1 || n > max) return
  router.push(`/${route.params.world}/records/${route.params.id}/c${n}`)
}

function back() {
  router.push(`/${route.params.world}`)
}

function toggleRead() {
  light.value = !light.value
  gsap.to('.records', {
    '--tem_color_black': light.value ? '#f3f3f3' : '#000013',
    '--tem_color_white': light.value ? '#000013' : '#f3f3f3',
    duration: 0.5,
    ease: ease_out,
  })
}

function overlaysOpen() {
  return store.menuOpen || store.systemOpen || store.consoleOpen || store.imageview.open
}

function onKey(e) {
  if (overlaysOpen()) return
  const k = e.key
  if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'k' || k === 'K') {
    e.preventDefault()
    go(chapterNum.value - 1)
  } else if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'j' || k === 'J') {
    e.preventDefault()
    go(chapterNum.value + 1)
  }
}

watch(() => route.fullPath, load, { immediate: true })
onMounted(() => {
  window.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  if (chapterFade) chapterFade.kill()
  destroyChapterLenis()
})
</script>
