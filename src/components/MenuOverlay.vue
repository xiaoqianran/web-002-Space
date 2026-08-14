<template>
  <div v-if="store.menuOpen" class="menubox" @keydown.esc.prevent="close">
    <div class="menubox_mask"></div>
    <div class="menubox_container">
      <div class="menubox_egde menubox_egde_left">
        <div class="menubox_egde_dot _dot"></div>
        <div class="menubox_egde_dot _dot"></div>
      </div>

      <div class="menubox_worldview">
        <p class="menubox_worldview_title _font_2">■ [缩略浏览]::check()</p>
        <div class="menubox_worldview_box">
          <div class="mwb_title">
            <div></div>
            <p class="_font_2">【{{ preview.name }}】</p>
            <div></div>
          </div>
          <div class="mwb_content">
            <div class="mwb_content_image">
              <img :src="$cdn(preview.image_url)" :alt="preview.name" decoding="async" />
            </div>
            <div class="mwb_content_container">
              <p class="mwb_content_introduction _font_1">{{ preview.introduce }}</p>
              <div class="mwb_content_button">
                <div class="_font_2" :style="{ '--color': preview.color }" @click="explorePreview">EXPLORE</div>
              </div>
            </div>
          </div>
        </div>
        <p class="menubox_worldview_code _font_1">[WORLD.OVERVIEW] INITIALIZING…
00000000 00000000 0000FF01 00A1C0DE
→ projection.scale: 1:2048
→ view_port: READY</p>
      </div>

      <div class="menubox_selecter">
        <p class="menubox_selecter_path _font_1">c:\cosmicbroth\database</p>
        <div class="menubox_selecter_box">
          <div
            v-for="w in worlds"
            :key="w.id"
            class="msb_worlds"
            :class="{ msb_selection_selected_world: openWorld === w.id }"
            :style="{ '--color': w.color }"
          >
            <div class="msb_selection" @click="toggleWorld(w.id)">
              <svg viewBox="0 0 200 160"><path d="M100.1,23.4L76.68,1.71c0,0-49.55,0-76.68,0V158.3h200V23.4C166.7,23.4,100.1,23.4,100.1,23.4z M187.9,146.19H12.1V35.49h175.8V146.19z"/><rect x="12.1" y="35.49" width="175.8" height="110.7"/></svg>
              <p class="_font_3">{{ w.name }}</p>
              <div class="msb_selection_arrow _arrow_left"></div>
            </div>
            <div class="msb_nodes_container" :class="{ open: openWorld === w.id }">
              <div
                v-for="node in nodesOf(w)"
                :key="node.key"
                class="msb_nodes" :class="{ msb_selection_selected_node: openNode === w.id + '/' + node.key }"
                :style="{ '--color': w.color }"
              >
                <div class="msb_selection" @click="toggleNode(w.id, node.key)">
                  <svg viewBox="0 0 200 160"><path d="M100.1,23.4L76.68,1.71c0,0-49.55,0-76.68,0V158.3h200V23.4C166.7,23.4,100.1,23.4,100.1,23.4z M187.9,146.19H12.1V35.49h175.8V146.19z"/><rect x="12.1" y="35.49" width="175.8" height="110.7"/></svg>
                  <p class="_font_3">{{ node.label }}</p>
                  <div class="msb_selection_arrow _arrow_left"></div>
                </div>
                <div class="msb_ids_container" :class="{ open: openNode === w.id + '/' + node.key }">
                  <div
                    v-for="item in node.items"
                    :key="item.id"
                    class="msb_ids"
                    :style="{ '--color': w.color }"
                  >
                    <div class="msb_selection" @click="goItem(w, node.key, item)">
                      <svg viewBox="0 0 150 200"><polygon points="150,60 150,200 0,200 0,0 90,0 90,60"/><polygon points="150,50 100,50 100,0"/></svg>
                      <p class="_font_3">{{ item.name }}</p>
                      <div class="msb_selection_arrow _arrow_left"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="menubox_egde menubox_egde_right">
        <div class="menubox_egde_dot _dot"></div>
        <div class="menubox_egde_right_icons">
          <a v-for="s in socials" :key="s.k" :href="s.href" target="_blank" rel="noreferrer" :title="s.k">
            <img :src="$asset(s.icon)" :alt="s.k" />
            <span class="_font_1">{{ s.k }}</span>
          </a>
        </div>
        <div class="menubox_egde_dot _dot"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store, worldList, currentWorld, toggleMenu, setTheme } from '../store.js'

const route = useRoute()
const router = useRouter()
const worlds = computed(() => worldList())
const preview = computed(() => {
  const id = openWorld.value || store.currentWorldId
  return store.worlds[id] || currentWorld()
})

const openWorld = ref(store.currentWorldId)
const openNode = ref('')

const socials = [
  { k: 'BILI', icon: 'img/social/bilibili.svg', href: 'https://b23.tv/0kFykcQ' },
  { k: 'WB', icon: 'img/social/weibo.svg', href: 'https://weibo.com/u/5652161753' },
  { k: '小说', icon: 'img/social/novel.svg', href: 'https://changdunovel.com/wap/share-v2.html?&book_id=7522080164855942206&share_code=xqpvRmoYGDWFCVOrdvXQC__rR3BMUmS67C6Ik5kwfL8%3D' },
]

const NODE_LABEL = { records: 'records', portraits: 'portraits', images: 'images' }

function nodesOf(w) {
  const m = w.map || {}
  return ['records', 'portraits', 'images']
    .filter((k) => m[k] && Object.keys(m[k]).length)
    .map((k) => ({ key: k, label: NODE_LABEL[k], items: Object.values(m[k]) }))
}

function toggleWorld(id) {
  openWorld.value = openWorld.value === id ? '' : id
  setTheme(id)
  openNode.value = ''
}

function toggleNode(wid, key) {
  const k = wid + '/' + key
  openNode.value = openNode.value === k ? '' : k
}

function close() {
  toggleMenu(false)
}

function explorePreview() {
  const id = preview.value.id
  if (route.name === 'world' && route.params.world === id) {
    close()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const el = document.querySelector('.worldpage')
    el?.scrollTo?.({ top: 0, behavior: 'smooth' })
    return
  }
  close()
  router.push('/' + id)
}

function goItem(w, node, item) {
  close()
  setTheme(w.id)
  if (node === 'records') {
    const chapters = store.routerMap?.[w.id]?.records?.[item.id] || ['c1']
    router.push(`/${w.id}/records/${item.id}/${chapters[0]}`)
  } else {
    router.push(`/${w.id}/${node}/${item.id}`)
  }
}

function onKey(e) {
  if (e.key === 'Escape') close()
}

watch(() => store.menuOpen, (v) => {
  if (v) openWorld.value = store.currentWorldId
})

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>
