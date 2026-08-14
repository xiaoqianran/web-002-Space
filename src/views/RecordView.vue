<template>
  <div class="records" :class="{ light: light }">
    <div class="page-bg-grid"></div>
    <div class="page-return page-return_bottom" @click="back">
      <ReturnButton />
    </div>
    <div class="information">
      <div class="information_top">
        <p class="information_top_title _font_2">&gt;&gt; TITLE: {{ meta.name }}</p>
        <div class="information_top_code">
          <span v-for="n in 18" :key="n" :style="{ width: ((n * 7) % 5 + 1) + 'px' }"></span>
        </div>
      </div>
      <div class="information_middle">
        <div class="information_middle_image">
          <img v-if="meta.image_url" :src="meta.image_url" alt="information" />
        </div>
        <div class="information_middle_content">
          <div class="information_middle_content_instrution">
            <p class="_font_1">{{ meta.instrution }}</p>
          </div>
          <div class="information_middle_content_data">
            <p class="_font_1">&gt;&gt; WORLD ---- <span>{{ meta.world || worldName }}</span></p>
            <p class="_font_1">&gt;&gt; TYPE ---- <span>{{ (meta.type || 'NORMAL').toUpperCase() }}</span></p>
            <p class="_font_1">&gt;&gt; TIME ---- <span>{{ meta.time }}</span></p>
          </div>
        </div>
      </div>
      <p class="information_code _font_1">[NODE.LINK] INITIATING…
[DECODE] memory.fragment[chapter_{{ chapterNum }}]
→ STATUS: ACTIVE
→ OUTPUT: [timeline append]
→ PREFETCH: enabled</p>
    </div>

    <div class="chapter">
      <div class="chapter_title">
        <p class="_font_3">{{ chapterNum }}</p>
        <span class="_font_5">{{ chapterTitle }}</span>
        <svg viewBox="0 0 616 106">
          <path d="M18,15.41H226.571m65.581,15.511C320.861,51.9,367,86,367,86l151,0.4" />
          <path d="M561,86.41L541,99.269V73.55Z" />
          <path d="M604,86.41L584,99.269V73.55Z" />
          <circle cx="262.5" cy="15.5" r="9.5" />
        </svg>
      </div>
      <p v-for="(p, i) in paras" :key="i" class="chapter_section _font_4">{{ p }}</p>
    </div>

    <div class="navigation">
      <div class="navigation_container">
        <div class="navigation_arrow navigation_arrow_prev" :class="{ navigation_arrow_hidden: chapterNum <= 1 }" @click="go(chapterNum - 1)">
          <div class="_arrow_top"></div>
          <p class="_font_1">上一章</p>
        </div>
        <div class="navigation_chapters">
          <div
            v-for="(c, i) in (meta.chapters || [])"
            :key="i"
            class="navigation_chapters_chapter"
            :class="{ active: i + 1 === chapterNum }"
            @click="go(i + 1)"
          >
            <p class="_font_1">{{ c }}</p>
          </div>
        </div>
        <div class="navigation_arrow navigation_arrow_next" :class="{ navigation_arrow_hidden: chapterNum >= (meta.chapters || []).length }" @click="go(chapterNum + 1)">
          <p class="_font_1">下一章 ▼</p>
          <div class="_arrow_down"></div>
        </div>
        <svg class="navigation_readmode" :class="{ navigation_readmode_light: light }" viewBox="0 0 100 100" @click="light = !light">
          <circle cx="50" cy="50" r="30.18" />
          <circle cx="50" cy="50" r="46.74" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api.js'
import { setTheme, store } from '../store.js'
import ReturnButton from '../components/ReturnButton.vue'

const route = useRoute()
const router = useRouter()
const meta = ref({ name: '', chapters: [], instrution: '', world: '', type: '', time: '', image_url: '' })
const paras = ref([])
const light = ref(false)

const chapterNum = computed(() => parseInt(String(route.params.chapter).replace(/^c/, ''), 10) || 1)
const chapterTitle = computed(() => (meta.value.chapters || [])[chapterNum.value - 1] || '')
const worldName = computed(() => store.worlds[route.params.world]?.name || '')

async function load() {
  const w = route.params.world
  const id = route.params.id
  if (w) setTheme(w)
  const m = await api.recordMeta(id)
  if (m) meta.value = m
  const ch = await api.recordChapter(id, 'c' + chapterNum.value)
  paras.value = Array.isArray(ch) ? ch : []
}

function go(n) {
  const max = (meta.value.chapters || []).length
  if (n < 1 || n > max) return
  router.push(`/${route.params.world}/records/${route.params.id}/c${n}`)
}

function back() {
  router.push(`/${route.params.world}`)
}

watch(() => route.fullPath, load, { immediate: true })
</script>
