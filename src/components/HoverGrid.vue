<template>
  <canvas id="background" ref="bgEl"></canvas>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  stroke_color: { type: String, default: '' },
})

const bgEl = ref(null)
let bgRaf = 0
let bgMove = null
let bgResize = null

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
    const x = e.clientX ?? e.x ?? e.touches?.[0]?.clientX
    const y = e.clientY ?? e.y ?? e.touches?.[0]?.clientY
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
    const stroke = props.stroke_color || '#f3f3f3'
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

onMounted(() => { initBackground() })
onUnmounted(() => { destroyBackground() })
</script>
