<template>
  <div class="worldpage" ref="root">
    <div class="worldpage_grid"></div>
    <div class="worldpage_bg">
      <img :src="$cdn(world.image_url)" :alt="world.name" decoding="async" fetchpriority="high" />
    </div>
    <div class="worldpage_body">
      <div class="worldpage_content">
        <div class="worldpage_title _font_3">{{ world.name }}</div>
        <div class="worldpage_sections">
          <div v-for="(block, bi) in blocks" :key="bi" class="worldpage_block">
            <p class="worldpage_glyphs _font_1">: ··· .: .</p>
            <p
              v-for="(para, pi) in block.paras"
              :key="pi"
              class="worldpage_para _font_4"
            >{{ para }}</p>
            <div v-if="block.image" class="worldpage_inline">
              <img :src="$cdn(block.image)" alt="" decoding="async" loading="lazy" />
            </div>
          </div>
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
      <div class="worldpage_scroll">
        <p class="_font_1">SCROLL ////</p>
        <div class="worldpage_scroll_line"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api.js'
import { store, setTheme } from '../store.js'
import { preload } from '../assets.js'

const route = useRoute()
const router = useRouter()
const root = ref(null)
const outline = ref([])

const world = computed(() => store.worlds[route.params.world] || store.worlds['cosmic-broth'])

const blocks = computed(() => {
  return (outline.value || []).map((b) => ({
    paras: String(b.contents || '').split('\n').map((s) => s.trim()).filter(Boolean),
    image: b.image || '',
  }))
})

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

function explore() {
  if (exploreTo.value) router.push(exploreTo.value)
}

async function load() {
  const id = route.params.world
  if (!store.worlds[id]) {
    router.replace('/404')
    return
  }
  setTheme(id)
  const data = store.outlines[id] || (await api.outline(id))
  if (data) {
    store.outlines[id] = data
    outline.value = data
  }
  const thumbs = [world.value.image_url]
  for (const node of Object.values(store.introduces?.[id] || {})) {
    for (const item of Object.values(node || {})) {
      if (item?.image_url) thumbs.push(item.image_url)
    }
  }
  preload(thumbs.slice(0, 8))
  root.value?.scrollTo?.(0, 0)
}

watch(() => route.params.world, load)
onMounted(load)
</script>
