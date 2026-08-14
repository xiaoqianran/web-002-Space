<template>
  <canvas id="background" ref="bgEl"></canvas>
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

    <div class="chapter">
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

const route = useRoute()
const router = useRouter()
const meta = ref({ name: '', chapters: [], instrution: '', world: '', type: '', time: '', image_url: '' })
const paras = ref([])
const light = ref(false)
const chaptersEl = ref(null)
const bgEl = ref(null)
let chapterLenis = null
let bgRaf = 0
let bgMove = null
let bgResize = null

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
  destroyChapterLenis()
  const el = chaptersEl.value || document.querySelector('.navigation_chapters')
  if (!el) return
  el.scrollTo(0, 0)
  chapterLenis = bindLenis(el)
  chapterLenis?.resize?.()
}

async function load() {
  const w = route.params.world
  const id = route.params.id
  if (w) setTheme(w)
  const m = await api.recordMeta(id)
  if (m) meta.value = m
  const ch = await api.recordChapter(id, 'c' + chapterNum.value)
  paras.value = Array.isArray(ch) ? ch : []
  destroyChapterLenis()
  await nextTick()
  createChapterLenis()
  chapterLenis?.resize?.()
  scrollCurrentChapter()
  resizeLenis()
  scroll_controler?.scrollTo?.(0, { immediate: true })
  window.scrollTo(0, 0)
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

function initBackground() {
  const canvas = bgEl.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  let block = 30
  let cols = 0
  let rows = 0
  let blocks = []
  let last = ''

  function resize() {
    canvas.width = canvas.offsetWidth * devicePixelRatio
    canvas.height = canvas.offsetHeight * devicePixelRatio
    block = Math.min(innerWidth, innerHeight) / 100 * 5 * devicePixelRatio
    cols = Math.ceil(canvas.width / block)
    rows = Math.ceil(canvas.height / block)
    blocks = []
    for (let y = 0; y < rows; y++) {
      blocks[y] = []
      for (let x = 0; x < cols; x++) blocks[y][x] = { active: false, alpha: 0 }
    }
  }

  function select(e) {
    const x = e.clientX ?? e.touches?.[0]?.clientX
    const y = e.clientY ?? e.touches?.[0]?.clientY
    if (x == null) return
    const cx = Math.floor(x * devicePixelRatio / block)
    const cy = Math.floor(y * devicePixelRatio / block)
    const key = cx + ',' + cy
    if (key === last) return
    last = key
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const row = blocks[cy + dy]
        const cell = row && row[cx + dx]
        if (cell && Math.random() > 0.5) {
          cell.active = true
          cell.alpha = 1
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const stroke = light.value ? '#000013' : '#f3f3f3'
    const theme = getComputedStyle(document.body).getPropertyValue('--color_theme').trim() || '#178ec5'
    let r = 23, g = 142, b = 197
    if (theme.startsWith('#') && theme.length >= 7) {
      r = parseInt(theme.slice(1, 3), 16)
      g = parseInt(theme.slice(3, 5), 16)
      b = parseInt(theme.slice(5, 7), 16)
    }
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = blocks[y][x]
        const px = x * block
        const py = y * block
        ctx.strokeStyle = stroke + '10'
        ctx.strokeRect(px, py, block, block)
        if (cell.active) {
          ctx.strokeStyle = `rgba(${r},${g},${b},${cell.alpha})`
          ctx.strokeRect(px, py, block, block)
          cell.alpha -= 0.03
          if (cell.alpha <= 0) {
            cell.alpha = 0
            cell.active = false
          }
        }
      }
    }
    bgRaf = requestAnimationFrame(draw)
  }

  resize()
  draw()
  bgMove = select
  bgResize = resize
  window.addEventListener('mousemove', bgMove)
  window.addEventListener('touchmove', bgMove, { passive: true })
  window.addEventListener('resize', bgResize)
}

function destroyBackground() {
  if (bgRaf) cancelAnimationFrame(bgRaf)
  bgRaf = 0
  if (bgMove) {
    window.removeEventListener('mousemove', bgMove)
    window.removeEventListener('touchmove', bgMove)
  }
  if (bgResize) window.removeEventListener('resize', bgResize)
  bgMove = bgResize = null
}

watch(() => route.fullPath, load, { immediate: true })
onMounted(() => { initBackground() })
onUnmounted(() => {
  destroyChapterLenis()
  destroyBackground()
})
</script>
