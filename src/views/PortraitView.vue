<template>
  <div class="portraits-page">
    <div class="page-bg-grid"></div>
    <div class="page-return page-return_bottom" @click="back"><ReturnButton /></div>
    <div class="pdata">
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
        :style="scatterStyle(i)"
        @click="openRole(i)"
        @mouseenter="onHover(i)"
      >
        <div class="paortraitsbox_portrait_imagebox scatter_clip">
          <div class="paortraitsbox_portrait_imagebox_image">
            <img :src="role.portraits?.[0]?.image_url" :alt="role.name" />
          </div>
        </div>
        <div class="paortraitsbox_portrait_content">
          <p class="paortraitsbox_portrait_content_letters _font_1">【 {{ String(i).padStart(3,'0') }} 】ROLE: {{ role.name }}</p>
          <p class="scatter_rects _font_1">■□■□</p>
        </div>
      </div>
    </div>

    <div v-if="viewOpen" class="pview">
      <div class="pview_strip" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp">
        <div class="pview_track" :style="{ transform: `translateX(${tx}px)` }">
          <div
            v-for="(img, i) in (current?.portraits || [])"
            :key="i"
            class="pview_img _clip_edge"
            :class="{ selected: i === imgI }"
            @click="pickImg(i, img.image_url)"
          >
            <img :src="img.image_url" alt="portrait" />
          </div>
        </div>
      </div>
      <p class="pview_cap _font_1">{{ current?.name }} ◆ {{ imgI + 1 }}-{{ current?.portraits?.length }}</p>
      <p class="pview_cap _font_2">{{ current?.portraits?.[imgI]?.content }}</p>
      <div class="page-return page-return_bottom" @click="viewOpen=false"><ReturnButton /></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../api.js'
import { setTheme, showImageview } from '../store.js'
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
let drag = false, lx = 0
const current = computed(() => roles.value[sel.value])
const scatterH = computed(() => {
  const rows = Math.ceil(roles.value.length / 2)
  return (12 + rows * 32) + 'vh'
})

function scatterStyle(i) {
  const col = i % 2
  const row = Math.floor(i / 2)
  const x = col === 0 ? 10 + (row % 3) * 3 : 54 + (row % 2) * 4
  const y = 8 + row * 30 + (col ? 6 : 0)
  const rot = ((i % 5) - 2) * 1.6
  return {
    left: x + '%',
    top: y + 'vh',
    transform: `rotate(${rot}deg)`,
  }
}

function typeInto(target, text) {
  const s = String(text || '')
  let i = 0
  const tick = () => {
    i++
    target.value = s.slice(0, i)
    if (i < s.length) setTimeout(tick, 18)
  }
  target.value = ''
  tick()
}

function onHover(i) {
  sel.value = i
  const r = roles.value[i]
  typeInto(typedName, r?.name || '')
  typeInto(typedInfo, r?.information || '')
}

async function load() {
  if (route.params.world) setTheme(route.params.world)
  const data = await api.portraits(route.params.id)
  roles.value = Array.isArray(data) ? data : []
  if (roles.value[0]) onHover(0)
}

function openRole(i) {
  sel.value = i
  imgI.value = 0
  tx.value = 0
  viewOpen.value = true
}
function pickImg(i, src) {
  imgI.value = i
  showImageview(src)
}
function back() { router.push(`/${route.params.world}`) }
function onDown(e) { drag = true; lx = e.clientX }
function onMove(e) { if (!drag) return; tx.value += e.clientX - lx; lx = e.clientX }
function onUp() { drag = false }

watch(() => route.fullPath, load, { immediate: true })
</script>
