<template>
  <div class="system" :class="{ open: store.systemOpen, system_hidden: !store.systemOpen }">
    <div class="system_background" @click="closeSystem"></div>
    <div class="system_databox" :class="{ open: store.systemOpen }">
      <div class="system_databox_title" :class="{ open: store.systemOpen }">
        <p class="_font_2">WORLD / <span>{{ world.id }}</span></p>
      </div>
      <div class="system_databox_main">
        <div class="sdm_block">
          <div class="sdm_block_image" style="height:45%">
            <img :src="world.image_url" alt="world" />
          </div>
        </div>
        <svg class="sdm_web" viewBox="0 0 200 260">
          <image :href="$asset('img/web.svg')" width="200" height="260" />
        </svg>
        <div class="sdm_content">
          <div class="sdm_content_sections" ref="secs">
            <p class="_font_2">{{ world.name }}</p>
            <p class="_font_1">{{ world.introduce }}</p>
            <p v-for="(p, i) in outlineParas" :key="i" class="_font_1">{{ p }}</p>
          </div>
          <div class="sdm_content_scrollline"><div :style="{ '--p': 0.35 }"></div></div>
        </div>
      </div>
      <div class="system_databox_bottom">
        <div class="sdb_code">
          <span class="_font_1" style="color:var(--color_theme)">[WORLD.OVERVIEW] INITIALIZING…</span>
        </div>
        <div class="sdb_button" @click.stop="accessWorld">
          <p class="_font_2">ACCESS-></p>
          <div class="sdb_button_spot">
            <div></div>
            <div style="--d:0"></div>
            <div style="--d:0.3"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="system_pagebox">
      <img class="system_pagebox_wave" :src="$asset('img/wave.svg')" alt="wave" />
      <div class="system_pagebox_worlds" :style="{ '--angle_rotate': rotate + 'deg', '--angle_world': '90deg' }">
        <div
          v-for="(w, i) in worlds"
          :key="w.id"
          class="spw_world"
          :class="{ spw_world_current: w.id === store.currentWorldId }"
          :style="{ '--index': i, '--n': worlds.length }"
          @click.stop="pick(w.id)"
        >
          <div
            class="spw_world_icon"
            :class="{ spw_world_icon_outter: w.id !== store.currentWorldId }"
          >
            <div>
              <div>
                <img :src="w.star_image_url" :alt="w.name" />
              </div>
            </div>
          </div>
          <p class="spw_world_name _font_1">{{ w.name }}</p>
        </div>
      </div>
      <div class="spc_center" @click.stop="pick(store.currentWorldId)">
        <img :src="world.star_image_url" :alt="world.name" />
      </div>
      <div class="system_pagebox_compass" :class="{ system_pagebox_compass_show: store.systemOpen }">
        <svg class="spc_pattern" viewBox="0 0 500 500">
          <g class="spc_pattern_outer">
            <circle cx="250" cy="250" r="230" fill="none" stroke="#f3f3f3" stroke-width="0.6" />
            <circle cx="250" cy="250" r="210" fill="none" stroke="#f3f3f3" stroke-width="0.4" stroke-dasharray="4 8" />
          </g>
          <g class="spc_pattern_inner">
            <circle cx="250" cy="250" r="140" fill="none" stroke="#f3f3f3" stroke-width="0.8" />
            <circle cx="250" cy="250" r="90" fill="none" stroke="var(--color_theme)" stroke-width="1" />
          </g>
          <polygon class="spc_pattern_star" points="250,18 256,34 272,34 259,44 264,60 250,50 236,60 241,44 228,34 244,34" />
        </svg>
        <div class="spc_node">
          <div
            v-for="(n, i) in nodes"
            :key="n.key"
            class="spc_node_selection"
            :class="{ spc_node_selection_selected: node === n.key }"
            :style="{ '--i': i, '--a': 120 }"
            @click.stop="pickNode(n)"
          >
            <p class="_font_3">{{ n.key }}</p>
          </div>
        </div>
        <div class="spc_id">
          <div
            v-for="(it, i) in ids"
            :key="it.id"
            class="spc_id_selection"
            :class="{ spc_id_selection_selected: currentId === it.id }"
            :style="{ '--i': i, '--a': ids.length ? 360 / ids.length : 90 }"
            @click.stop="goItem(it)"
          >
            <p class="_font_3">{{ it.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="system_worldstrip">
      <div
        v-for="w in worlds"
        :key="'strip-'+w.id"
        class="system_worldstrip_item"
        :class="{ on: w.id === store.currentWorldId }"
        @click.stop="pick(w.id)"
      >
        <img :src="w.star_image_url" :alt="w.name" />
        <p class="_font_1">{{ w.name }}</p>
      </div>
    </div>
    <div class="system_return" @click="closeSystem">
      <ReturnButton />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { store, worldList, currentWorld, setTheme, closeSystem } from '../store.js'
import { api as API } from '../api.js'
import ReturnButton from './ReturnButton.vue'

const router = useRouter()
const worlds = computed(() => worldList())
const world = computed(() => currentWorld())
const node = ref('records')
const currentId = ref(null)
const outlineParas = ref([])

const rotate = computed(() => {
  const ids = worlds.value.map((w) => w.id)
  const i = Math.max(0, ids.indexOf(store.currentWorldId))
  return -i * 90
})

const nodes = computed(() => {
  const m = world.value.map || {}
  return ['records', 'portraits', 'images']
    .filter((k) => m[k] && Object.keys(m[k]).length)
    .map((k) => ({ key: k }))
})

const ids = computed(() => {
  const m = world.value.map?.[node.value] || {}
  return Object.values(m)
})

function pick(id) {
  if (!id || !store.worlds[id]) return
  setTheme(id)
  node.value = 'records'
  currentId.value = null
  loadOutline(id)
}

function accessWorld() {
  const id = store.currentWorldId
  if (!id) return
  closeSystem()
  router.push('/' + id)
}

function pickNode(n) {
  node.value = n.key
  currentId.value = null
}

function goItem(it) {
  currentId.value = it.id
  const w = store.currentWorldId
  if (node.value === 'records') {
    const chapters = store.routerMap?.[w]?.records?.[it.id] || ['c1']
    router.push(`/${w}/records/${it.id}/${chapters[0]}`)
  } else {
    router.push(`/${w}/${node.value}/${it.id}`)
  }
}

async function loadOutline(id) {
  const data = store.outlines[id] || (await API.outline(id))
  if (data) {
    store.outlines[id] = data
    const texts = []
    for (const block of data) {
      if (block.contents) texts.push(...block.contents.split('\n').filter(Boolean))
    }
    outlineParas.value = texts
  }
}

watch(() => store.systemOpen, (v) => { if (v) loadOutline(store.currentWorldId) }, { immediate: true })
watch(() => store.currentWorldId, (id) => { if (store.systemOpen) loadOutline(id) })
</script>
