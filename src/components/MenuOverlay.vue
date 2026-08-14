<template>
  <div v-show="if_visible" class="menubox" ref="boxEl" @keydown.esc.prevent="close">
    <div class="menubox_container">
      <div class="menubox_egde menubox_egde_left">
        <div class="menubox_egde_dot _dot"></div>
        <div class="menubox_egde_dot _dot"></div>
      </div>

      <div class="menubox_worldview">
        <p class="menubox_worldview_title _font_2">■ [缩略浏览]::check()</p>
        <div class="menubox_worldview_box" ref="worldviewBox">
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
        <div class="menubox_selecter_box" ref="selecterBox">
          <div
            v-for="w in worlds"
            :key="w.id"
            class="msb_worlds"
            :class="{ msb_selection_selected_world: openWorld === w.id }"
            :style="{ '--color': w.color }"
            :data-world="w.id"
          >
            <div class="msb_selection" @click="toggleWorld(w.id)">
              <svg viewBox="0 0 200 160"><path d="M100.1,23.4L76.68,1.71c0,0-49.55,0-76.68,0V158.3h200V23.4C166.7,23.4,100.1,23.4,100.1,23.4z M187.9,146.19H12.1V35.49h175.8V146.19z"/><rect x="12.1" y="35.49" width="175.8" height="110.7"/></svg>
              <p class="_font_3">{{ w.name }}</p>
              <div class="msb_selection_arrow _arrow_left"></div>
            </div>
            <div class="msb_nodes_container">
              <div
                v-for="node in nodesOf(w)"
                :key="node.key"
                class="msb_nodes"
                :class="{ msb_selection_selected_node: openNode === w.id + '/' + node.key }"
                :style="{ '--color': w.color }"
                :data-node="w.id + '/' + node.key"
              >
                <div class="msb_selection" @click="toggleNode(w.id, node.key)">
                  <svg viewBox="0 0 200 160"><path d="M100.1,23.4L76.68,1.71c0,0-49.55,0-76.68,0V158.3h200V23.4C166.7,23.4,100.1,23.4,100.1,23.4z M187.9,146.19H12.1V35.49h175.8V146.19z"/><rect x="12.1" y="35.49" width="175.8" height="110.7"/></svg>
                  <p class="_font_3">{{ node.label }}</p>
                  <div class="msb_selection_arrow _arrow_left"></div>
                </div>
                <div class="msb_ids_container">
                  <div
                    v-for="item in node.items"
                    :key="item.id"
                    class="msb_ids"
                    :class="{ msb_selection_selected_id: item.id === route.params.id }"
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
    <div class="menubox_mask" ref="maskEl"></div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { store, worldList, currentWorld, toggleMenu, setTheme } from '../store.js'
import { bindLenis, ease_in, ease_out, ease_inout, gsap, resizeLenis, scroll_controler } from '../motion.js'

const route = useRoute()
const router = useRouter()
const worlds = computed(() => worldList())
const if_visible = ref(false)
const tem_current_world = ref(store.currentWorldId)
const preview = computed(() => {
  const id = tem_current_world.value || openWorld.value || store.currentWorldId
  return store.worlds[id] || currentWorld()
})
const selecterBox = ref(null)
const boxEl = ref(null)
const maskEl = ref(null)
const worldviewBox = ref(null)
const openWorld = ref(store.currentWorldId)
const openNode = ref('')
let menuLenis = null
let menuAnim = null
let worldviewAnim = null

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

function resizeMenuLenis() {
  menuLenis?.resize?.()
}

function animateHeight(sel, collapse, instant) {
  const els = typeof sel === 'string' ? document.querySelectorAll(sel) : sel
  if (!els || (els.length !== undefined && !els.length)) {
    resizeMenuLenis()
    return
  }
  gsap.killTweensOf(els)
  gsap.to(els, {
    height: collapse ? 0 : 'auto',
    duration: instant ? 0 : 0.5,
    ease: ease_out,
    onComplete: resizeMenuLenis,
  })
}

function slideWorldview(id) {
  const box = worldviewBox.value || document.querySelector('.menubox_worldview_box')
  if (!box) {
    tem_current_world.value = id
    return
  }
  if (worldviewAnim && worldviewAnim.isActive()) worldviewAnim.kill()
  tem_current_world.value = id
  worldviewAnim = gsap.timeline()
    .to(box, { x: '110%', duration: 0.3, ease: ease_in })
    .fromTo(box, { x: '-110%' }, {
      x: 0,
      duration: 0.4,
      ease: ease_out,
      immediateRender: false,
    }, '<0.45')
}

function toggleWorld(id) {
  if (openWorld.value === id) {
    animateHeight('.msb_selection_selected_world .msb_nodes_container, .msb_selection_selected_node .msb_ids_container', true)
    openWorld.value = ''
    openNode.value = ''
    return
  }
  if (worldviewAnim && worldviewAnim.isActive()) worldviewAnim.kill()
  animateHeight('.msb_selection_selected_world .msb_nodes_container, .msb_selection_selected_node .msb_ids_container', true)
  openWorld.value = id
  setTheme(id)
  openNode.value = ''
  nextTick(() => {
    animateHeight('.msb_selection_selected_world .msb_nodes_container', false)
  })
  slideWorldview(id)
}

function toggleNode(wid, key) {
  const k = wid + '/' + key
  if (openNode.value === k) {
    animateHeight('.msb_selection_selected_node .msb_ids_container', true)
    openNode.value = ''
    return
  }
  if (openNode.value) animateHeight('.msb_selection_selected_node .msb_ids_container', true)
  openNode.value = k
  nextTick(() => {
    animateHeight('.msb_selection_selected_node .msb_ids_container', false)
  })
}

function destroyMenuLenis() {
  if (menuLenis) {
    menuLenis.destroy()
    menuLenis = null
  }
}

function bindMenuLenis() {
  destroyMenuLenis()
  const el = selecterBox.value || document.querySelector('.menubox_selecter_box')
  if (!el) return
  menuLenis = bindLenis(el)
}

function close() {
  toggleMenu(false)
}

function explorePreview() {
  const id = preview.value.id
  if (route.name === 'world' && route.params.world === id) {
    close()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  close()
  router.push('/' + id)
}

function goItem(w, node, item) {
  close()
  setTheme(w.id)
  if (node === 'records') {
    const chapters = store.routerMap?.[w.id]?.records?.[item.id]
    const first = (Array.isArray(chapters) && chapters[0]) || 'c1'
    router.push(`/${w.id}/records/${item.id}/${first}`)
  } else {
    router.push(`/${w.id}/${node}/${item.id}`)
  }
}

function onKey(e) {
  if (e.key === 'Escape') close()
}

function currentNodeKey() {
  const name = route.name
  if (name === 'record') return 'records'
  if (name === 'portrait') return 'portraits'
  if (name === 'image') return 'images'
  return ''
}

function resetMenu() {
  const box = boxEl.value || document.querySelector('.menubox')
  const mask = maskEl.value || document.querySelector('.menubox_mask')
  const edges = document.querySelectorAll('.menubox_egde')
  gsap.timeline()
    .set(box, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)' })
    .set(mask, { y: 0 })
    .set(edges, { scale: 1.2, opacity: 0 })
}

async function showMenu() {
  scroll_controler?.stop()
  const world = route.params.world || store.currentWorldId
  openWorld.value = world
  tem_current_world.value = world
  const node = currentNodeKey()
  openNode.value = node ? `${world}/${node}` : ''
  resetMenu()
  if_visible.value = true
  await nextTick()
  const box = boxEl.value || document.querySelector('.menubox')
  const mask = maskEl.value || document.querySelector('.menubox_mask')
  const edges = document.querySelectorAll('.menubox_egde')
  if (worldviewBox.value) gsap.set(worldviewBox.value, { x: 0 })
  const nodes = document.querySelector('.msb_selection_selected_world .msb_nodes_container')
  const ids = document.querySelector('.msb_selection_selected_node .msb_ids_container')
  if (nodes) gsap.to(nodes, { height: 'auto', duration: 0.5, ease: ease_out, onComplete: resizeMenuLenis })
  if (ids) gsap.to(ids, { height: 'auto', duration: 0.5, ease: ease_out, onComplete: resizeMenuLenis })
  bindMenuLenis()
  menuLenis?.resize?.()
  resizeLenis()
  menuAnim?.kill()
  menuAnim = gsap.timeline()
    .to(box, { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', duration: 0.6, ease: ease_inout })
    .to(mask, { y: '100%', duration: 0.6, ease: ease_inout }, '<0.2')
    .to(edges, { scale: 1, opacity: 1, duration: 1, ease: ease_out }, '<')
}

function hideMenu() {
  scroll_controler?.start()
  destroyMenuLenis()
  document.querySelectorAll('.msb_nodes_container, .msb_ids_container').forEach((el) => {
    gsap.set(el, { height: 0 })
  })
  const box = boxEl.value || document.querySelector('.menubox')
  const mask = maskEl.value || document.querySelector('.menubox_mask')
  menuAnim?.kill()
  menuAnim = gsap.timeline()
    .to(mask, { y: 0, duration: 0.5, ease: ease_out })
    .to(box, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
      duration: 0.5,
      ease: ease_out,
      onComplete: () => { if_visible.value = false },
    }, '<0.2')
  scroll_controler?.resize()
}

watch(() => store.menuOpen, async (v) => {
  if (v) await showMenu()
  else hideMenu()
})

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  destroyMenuLenis()
  menuAnim?.kill()
  worldviewAnim?.kill()
})
</script>
