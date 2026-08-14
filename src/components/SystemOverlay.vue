<template>
  <div class="system" ref="container" :class="{ system_hidden: !store.systemOpen && !animating }">
    <div class="system_background" @click="hide"></div>
    <div class="system_databox" ref="databox">
      <div class="system_databox_title">
        <p class="_font_2" ref="dbTitle">{{ world.name }} / {{ node }} / <span class="_font_4">{{ currentName }}</span></p>
      </div>
      <div class="system_databox_main">
        <div class="sdm_block">
          <div class="sdm_block_image" ref="dbImage">
            <img :src="$cdn(dbImageUrl)" alt="world" decoding="async" fetchpriority="high" />
          </div>
        </div>
        <img class="sdm_web" :src="$asset('img/web.svg')" alt="databox_web" />
        <div class="sdm_content" ref="dbContent">
          <div class="sdm_content_sections" ref="secs">
            <p class="_font_2">{{ world.name }}</p>
            <p class="_font_1">{{ dbIntroduce }}</p>
          </div>
          <div class="sdm_content_scrollline"><div :style="{ '--p': scrollP }"></div></div>
        </div>
      </div>
      <div class="system_databox_bottom">
        <div class="sdb_code">
          <div
            v-for="(ch, i) in codeChars"
            :key="i"
            :style="{ '--s': ch, '--i': i, '--l': codeChars.length }"
          ></div>
        </div>
        <div class="sdb_button" ref="dbButton" @click.stop="jump">
          <p class="_font_2">ACCESS-></p>
          <div class="sdb_button_spot">
            <div></div>
            <div style="--d:0"></div>
            <div style="--d:0.3"></div>
            <div style="--d:0.6"></div>
            <div style="--d:1"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="system_pagebox">
      <img class="system_pagebox_wave" :src="$asset('img/wave.svg')" alt="wave" />
      <div
        class="system_pagebox_worlds"
        ref="worldsEl"
        :style="{ '--angle_rotate': angleRotate + 'deg', '--angle_world': '45deg' }"
        @pointerdown="worldsDown"
      >
        <div
          v-for="w in worlds"
          :key="w.id"
          class="spw_world"
          :class="{ spw_world_current: w.id === store.currentWorldId }"
          :style="{ '--index': slotOf(w.id).index, '--n': worlds.length }"
        >
          <div
            class="spw_world_icon"
            :class="{ spw_world_icon_outter: slotOf(w.id).outter }"
            :world="w.id"
            @click.stop="selectWorld(w.id)"
          >
            <div>
              <div class="spw_lottie home-lottie-animation" :data-world="w.id"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="system_pagebox_compass" ref="compassEl" :class="{ system_pagebox_compass_show: store.systemOpen }">
        <svg class="spc_pattern" viewBox="0 0 500 500">
          <image class="spc_pattern_inner" :href="$asset('img/compass_inner.svg')" width="500" height="500" />
          <image class="spc_pattern_outer" :href="$asset('img/compass_outer.svg')" width="600" height="600" x="-50" y="-50" />
          <path class="spc_pattern_dropline" d="M369.65,448.14c-34.58,20.3-74.81,32.02-117.8,32.23c-43.79,0.21-84.83-11.57-120.04-32.23" />
          <g class="spc_pattern_dashline">
            <path d="M413.4,211.84c2.85,12.09,4.38,24.69,4.44,37.64c0.19,39.78-13.54,76.38-36.62,105.19" />
            <path d="M88.05,211.84c-2.97,12.6-4.52,25.74-4.45,39.25c0.19,39.21,13.87,75.19,36.61,103.59" />
          </g>
          <g class="spc_pattern_solidline">
            <path d="M79.34,193.01c23.76-71.48,91.01-123.19,170.51-123.57c80.11-0.38,148.27,51.47,172.23,123.57" />
            <path d="M84.65,193.01c23.56-68.67,88.53-118.19,165.23-118.55c77.3-0.37,143.16,49.28,166.93,118.55" />
            <path d="M382.4,373.52c-32.74,34.89-79.19,56.78-130.82,57.03c-52.24,0.25-99.4-21.72-132.54-57.03" />
            <path d="M375.44,373.52c-31.61,31.92-75.41,51.78-123.88,52.01c-49.08,0.24-93.54-19.7-125.55-52.01" />
          </g>
          <path class="spc_pattern_star" d="M266.54,0.82C257.4,0.82,250,13.44,250,29.01c0-15.57-7.41-28.19-16.54-28.19C242.6,0.82,250-11.8,250-27.37C250-11.8,257.41,0.82,266.54,0.82z" />
        </svg>
        <div class="spc_node" ref="nodeEl">
          <div
            v-for="(n, i) in nodes"
            :key="n.key"
            class="spc_node_selection"
            :class="{ spc_node_selection_selected: node === n.key }"
            :style="{ '--i': i, '--a': 45 }"
            @click.stop="selectNode(n.key, i)"
          >
            <p class="_font_3" @click.stop="selectNode(n.key, i)">{{ n.key }}</p>
          </div>
        </div>
        <div class="spc_id" ref="idEl">
          <div
            v-for="(it, i) in ids"
            :key="it.id"
            class="spc_id_selection"
            :class="{ spc_id_selection_selected: currentId === it.id }"
            :style="{ '--i': i, '--a': 30 }"
            @click.stop="selectId(it, i)"
          >
            <p class="_font_3" @click.stop="selectId(it, i)">{{ it.name }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="system_return" @click="hide">
      <ReturnButton />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import lottie from 'lottie-web'
import { store, worldList, currentWorld, setTheme, closeSystem } from '../store.js'
import { cdn } from '../assets.js'
import { gsap, ease_out, ease_in, ease_inout, createLenis } from '../motion.js'
import ReturnButton from './ReturnButton.vue'

const router = useRouter()
const worlds = computed(() => worldList())
const world = computed(() => currentWorld())

const container = ref(null)
const databox = ref(null)
const dbTitle = ref(null)
const dbImage = ref(null)
const dbContent = ref(null)
const dbButton = ref(null)
const secs = ref(null)
const worldsEl = ref(null)
const compassEl = ref(null)
const nodeEl = ref(null)
const idEl = ref(null)

const node = ref('records')
const currentId = ref(null)
const angleRotate = ref(0)
const scrollP = ref(0)
const animating = ref(false)

const ANGLE_NODE = 45
const ANGLE_ID = 30

let animater = null
let lottieAnims = []
let innerLenis = null
let if_worlds_rotatable = false
let worlds_x = 0
let worlds_y = 0
let mouse_x = 0
let mouse_y = 0
let didDrag = false
let dragStartX = 0
let dragStartY = 0

const nodes = computed(() => {
  const m = world.value.map || {}
  return Object.keys(m).map((k) => ({ key: k }))
})

const ids = computed(() => {
  const m = world.value.map?.[node.value] || {}
  return Object.values(m)
})

const introEntry = computed(() => {
  const w = store.currentWorldId
  const n = node.value
  const id = currentId.value
  return store.introduces?.[w]?.[n]?.[id] || null
})

const dbIntroduce = computed(() => introEntry.value?.introduce || world.value.introduce || '')
const dbImageUrl = computed(() => introEntry.value?.image_url || world.value.image_url || '')
const currentName = computed(() => ids.value.find((x) => x.id === currentId.value)?.name || currentId.value || '')
const CODE_STR = "'123122132212541212544512365444565122152"
const codeChars = CODE_STR.split('')

const slots = ref([])

function slotOf(id) {
  return slots.value.find((s) => s.id === id) || { id, index: 0, outter: id !== store.currentWorldId }
}

function initSlots() {
  const cur = store.currentWorldId
  let m = 0
  slots.value = worlds.value.map((w) => {
    if (w.id === cur) return { id: w.id, index: 0, outter: false }
    return { id: w.id, index: m++, outter: true }
  })
}

function ensureId() {
  if (!currentId.value && ids.value[0]) currentId.value = ids.value[0].id
  if (currentId.value && !ids.value.find((x) => x.id === currentId.value) && ids.value[0]) {
    currentId.value = ids.value[0].id
  }
}

function resetCompass() {
  const solid = [...document.querySelectorAll('.spc_pattern_solidline path')]
  const dash = document.querySelectorAll('.spc_pattern_dashline path')
  const drop = document.querySelector('.spc_pattern_dropline')
  const icons = [...document.querySelectorAll('.spw_lottie svg, .spw_lottie img')]
  compassEl.value?.classList.remove('system_pagebox_compass_show')
  gsap.timeline()
    .set(solid.slice(0, 2), { strokeDashoffset: 460 })
    .set(solid.slice(2, 4), { strokeDashoffset: 300 })
    .set(dash, { strokeDasharray: '0, 80' })
    .set(drop, { strokeDasharray: '0, 500', strokeDashoffset: 10 })
    .set([nodeEl.value, idEl.value], { opacity: 0, rotate: 0 })
    .set(icons, { scale: 0.5, opacity: 0 })
}

function resetDatabox() {
  innerLenis && innerLenis.scrollTo(0, { immediate: true })
  gsap.timeline()
    .set(databox.value, { opacity: 0 })
    .set(dbTitle.value, { y: '100%' })
    .set(document.querySelectorAll('.sdb_code div'), { scale: 0 })
    .set(dbImage.value, { height: 0 })
    .set(dbContent.value, { opacity: 0 })
    .set(dbButton.value, { opacity: 0 })
}

function showDatabox() {
  gsap.timeline()
    .to(databox.value, { opacity: 1, duration: 1, ease: ease_out })
    .to(dbTitle.value, { y: 0, duration: 0.8, ease: ease_out }, '<')
    .to(document.querySelectorAll('.sdb_code div'), { scale: 1, duration: 1, ease: ease_in, stagger: 0.02 }, '<')
    .to(dbImage.value, { height: 'calc(var(--scale) * 15rem)', duration: 1.2, ease: ease_inout }, '<0.2')
    .to(dbContent.value, { opacity: 1, duration: 2, ease: ease_inout }, '<0.3')
    .to(dbButton.value, { opacity: 1, duration: 1.5, ease: ease_in }, '<')
}

function hiddenContent(cb) {
  gsap.timeline()
    .to(dbTitle.value, { y: '100%', duration: 0.8, ease: ease_out })
    .to([dbImage.value, dbContent.value], {
      opacity: 0,
      duration: 0.8,
      ease: ease_inout,
      onComplete: () => cb && cb(),
    }, '<')
}

function showContent() {
  innerLenis && innerLenis.scrollTo(0, { immediate: true })
  nextTick(() => innerLenis && innerLenis.resize())
  gsap.timeline()
    .to(dbTitle.value, { y: 0, duration: 0.8, ease: ease_out })
    .to([dbImage.value, dbContent.value], { opacity: 1, duration: 0.8, ease: ease_inout }, '<')
}

function show() {
  if (animater && animater.isActive()) return
  resizeWorlds()
  animating.value = true
  store.systemOpen = true
  initSlots()
  ensureId()
  resetCompass()
  resetDatabox()
  const solid = [...document.querySelectorAll('.spc_pattern_solidline path')]
  const dash = document.querySelectorAll('.spc_pattern_dashline path')
  const drop = document.querySelector('.spc_pattern_dropline')
  const icons = [...document.querySelectorAll('.spw_lottie svg, .spw_lottie img')]
  animater = gsap.timeline()
    .to(container.value, {
      opacity: 1,
      duration: 0.8,
      ease: ease_out,
      onStart: () => compassEl.value?.classList.add('system_pagebox_compass_show'),
    })
    .to([solid[0], solid[2]].filter(Boolean), { strokeDashoffset: 0, duration: 1.2, ease: ease_out }, '<0.5')
    .to([solid[1], solid[3]].filter(Boolean), { strokeDashoffset: 0, duration: 1.2, ease: ease_out }, '<0.3')
    .to(dash, { strokeDasharray: '1, 10', duration: 1, ease: ease_out }, '<')
    .to(drop, { strokeDasharray: '0, 48', strokeDashoffset: 20, duration: 1, ease: ease_out }, '<')
    .to([nodeEl.value, idEl.value], {
      opacity: 1,
      duration: 1,
      ease: ease_out,
      stagger: 0.2,
      onStart: () => showDatabox(),
    }, '<0.3')
    .to(icons, { scale: 1, opacity: 1, duration: 1, ease: ease_out, stagger: 0.1 }, '<')
}

function hide() {
  if (animater && animater.isActive()) return
  animater = gsap.timeline().to(container.value, {
    opacity: 0,
    duration: 1,
    ease: ease_out,
    onComplete: () => {
      closeSystem()
      animating.value = false
    },
  })
}

function selectWorld(id) {
  if (didDrag) return
  if (!id || !store.worlds[id] || id === store.currentWorldId) return
  if (animater && animater.isActive()) return
  const cur = slots.value.find((s) => !s.outter) || slots.value.find((s) => s.id === store.currentWorldId)
  const next = slots.value.find((s) => s.id === id)
  if (!cur || !next) return
  const ci = cur.index
  const ni = next.index
  slots.value = slots.value.map((s) => {
    if (s.id === cur.id) return { ...s, index: ni, outter: true }
    if (s.id === next.id) return { ...s, index: ci, outter: false }
    return s
  })
  setTheme(id)
  hiddenContent()
  animater = gsap.timeline()
    .to([nodeEl.value, idEl.value], { opacity: 0, duration: 0.6, ease: ease_out })
    .set([nodeEl.value, idEl.value], { rotate: 0 }, '<0.4')
    .to([nodeEl.value, idEl.value], {
      opacity: 1,
      duration: 1,
      ease: ease_out,
      onStart: () => {
        const map = store.worlds[id]?.map || {}
        const keys = Object.keys(map)
        node.value = keys[0] || 'records'
        const first = map[node.value]
        const vals = first ? Object.values(first) : []
        currentId.value = vals[0]?.id || null
        showContent()
      },
    }, '<0.4')
}

function selectNode(key, index) {
  if (node.value === key || (animater && animater.isActive())) return
  hiddenContent()
  animater = gsap.timeline()
    .to(nodeEl.value, { rotate: `${-index * ANGLE_NODE}deg`, duration: 1.5, ease: ease_out })
    .to(idEl.value, { opacity: 0, duration: 0.6, ease: ease_out }, '<')
    .set(idEl.value, { rotate: 0 }, '<0.4')
    .to(idEl.value, {
      opacity: 1,
      duration: 1,
      ease: ease_out,
      onStart: () => {
        node.value = key
        currentId.value = null
        ensureId()
        showContent()
      },
    }, '<0.2')
}

function selectId(item, index) {
  if (currentId.value === item.id || (animater && animater.isActive())) return
  hiddenContent(() => {
    currentId.value = item.id
    showContent()
  })
  animater = gsap.timeline().to(idEl.value, {
    rotate: `${-index * ANGLE_ID}deg`,
    duration: 1.5,
    ease: ease_out,
  })
}

function jump() {
  const w = store.currentWorldId
  const n = node.value
  ensureId()
  const id = currentId.value
  if (!w || !n || !id) return
  hide()
  if (n === 'records') {
    const chapters = store.routerMap?.[w]?.records?.[id] || ['c1']
    router.push(`/${w}/records/${id}/${chapters[0]}`)
  } else {
    router.push(`/${w}/${n}/${id}`)
  }
}

function eventXY(e) {
  return { x: e.clientX ?? 0, y: e.clientY ?? 0 }
}

function bindWorldsWindow(on) {
  const fn = on ? window.addEventListener : window.removeEventListener
  fn('pointermove', worldsMove)
  fn('pointerup', worldsUp)
  fn('pointercancel', worldsUp)
}

function worldsDown(e) {
  if_worlds_rotatable = true
  didDrag = false
  resizeWorlds()
  const p = eventXY(e)
  mouse_x = p.x
  mouse_y = p.y
  dragStartX = p.x
  dragStartY = p.y
  try { e.currentTarget?.setPointerCapture?.(e.pointerId) } catch {}
  bindWorldsWindow(true)
}

function worldsMove(e) {
  if (!if_worlds_rotatable) return
  const p = eventXY(e)
  if (!didDrag) {
    const dx = p.x - dragStartX
    const dy = p.y - dragStartY
    if (dx * dx + dy * dy > 36) didDrag = true
  }
  rotateWorlds(p.x, p.y)
}

function worldsUp() {
  if_worlds_rotatable = false
  bindWorldsWindow(false)
}

function rotateWorlds(x, y) {
  const f = mouse_x - worlds_x
  const b = mouse_y - worlds_y
  const _ = x - worlds_x
  const v = y - worlds_y
  const E = Math.atan2(_ * b - f * v, f * _ + b * v) * (180 / Math.PI)
  angleRotate.value -= E
  mouse_x = x
  mouse_y = y
}

function resizeWorlds() {
  if (!worldsEl.value) return
  const r = worldsEl.value.getBoundingClientRect()
  worlds_x = r.left + r.width / 2
  worlds_y = r.top + r.height / 2
}

function loadLottie() {
  if (!store.ready) return
  lottieAnims.forEach((a) => { try { a.destroy() } catch {} })
  lottieAnims = []
  nextTick(() => {
    document.querySelectorAll('.spw_lottie').forEach((el) => {
      const id = el.getAttribute('data-world')
      const w = store.worlds[id]
      const data = w?.compass
      el.innerHTML = ''
      if (data) {
        try {
          const animationData = typeof data === 'string' ? JSON.parse(data) : JSON.parse(JSON.stringify(data))
          const anim = lottie.loadAnimation({
            container: el,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData,
            rendererSettings: { className: 'lottie-svg', preserveAspectRatio: 'xMidYMid meet' },
          })
          el.querySelectorAll('svg').forEach((svg) => svg.classList.add('lottie-svg'))
          lottieAnims.push(anim)
          return
        } catch (err) {
          console.warn('lottie miss', id, err)
        }
      }
      if (w?.star_image_url) {
        const img = document.createElement('img')
        img.src = cdn(w.star_image_url)
        img.alt = w.name || id
        img.decoding = 'async'
        el.appendChild(img)
      }
    })
  })
}

watch(() => store.systemOpen, (v) => {
  if (v) {
    initSlots()
    ensureId()
    nextTick(() => {
      resizeWorlds()
      show()
    })
  }
})

watch(() => store.ready, () => loadLottie())
watch(worlds, () => loadLottie(), { deep: false })

onMounted(() => {
  gsap.set(container.value, { opacity: 0 })
  if (secs.value) {
    innerLenis = createLenis({ wrapper: secs.value })
    innerLenis.on('scroll', () => { scrollP.value = innerLenis.progress })
  }
  window.addEventListener('resize', resizeWorlds)
  initSlots()
  loadLottie()
  ensureId()
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeWorlds)
  bindWorldsWindow(false)
  lottieAnims.forEach((a) => { try { a.destroy() } catch {} })
  innerLenis && innerLenis.destroy()
  if (animater) animater.kill()
})
</script>
