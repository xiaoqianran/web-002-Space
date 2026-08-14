<template>
  <div class="error" :class="'error_type' + type">
    <svg class="error_maskbox" ref="maskboxEl">
      <defs>
        <filter id="error_maskbox_filter">
          <feTurbulence type="turbulence" baseFrequency="0 0.05" numOctaves="1" stitchTiles="stitch">
            <animate attributeName="baseFrequency" from="0 0.05" to="0 0.5" dur="1s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="100" />
        </filter>
      </defs>
      <mask id="error_maskbox_mask" maskUnits="userSpaceOnUse">
        <rect v-for="i in 40" :key="i" />
      </mask>
    </svg>
    <div class="error_asciibox">
      <pre class="error_asciibox_chars">{{ ascii }}</pre>
    </div>
    <canvas class="error_glitchbox" ref="glitchEl"></canvas>
    <div class="error_content">
      <p class="error_content_404">404</p>
      <p class="error_reconnect _font_2">RECONNECT</p>
      <div class="error_content_button" @click="$router.replace('/')">
        <svg viewBox="0 0 225 100">
          <path d="M171.72,100h53.31V0l-53.31,0c-27.61,0-50,22.39-50,50v0C121.72,77.61,144.11,100,171.72,100z" />
          <line x1="121.72" y1="50" x2="-0.04" y2="50" vector-effect="non-scaling-stroke" />
        </svg>
        <div class="_font_4">RECONNECT</div>
        <svg viewBox="0 0 265 100">
          <path d="M91.91,100H38.6V0h53.31c27.61,0,50,22.39,50,50v0C141.91,77.61,119.53,100,91.91,100z" />
          <rect x="1.33" y="17.62" width="37.27" height="18.5" />
          <rect x="1.33" y="63.88" width="37.27" height="18.5" />
          <line x1="141.91" y1="50" x2="263.67" y2="50" vector-effect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { GifReader } from 'omggif'
import { gsap, ease_inout } from '../motion.js'
import { local } from '../assets.js'

const type = ref(1)
const ascii = ref('')
const maskboxEl = ref(null)
const glitchEl = ref(null)

const GIF_W = 500
const GIF_H = 500
const CHAR_SETS = [['0', '1'], ['.', '-'], [' ']]

let dead = false
let typeTimer = null

const mask = {
  containr: null,
  width: 0,
  height: 0,
  blocks: [],
  block_max_width: 0,
  block_max_height: 0,
  animaters: [],
  timer: null,
  timer_duration: 1,
  binded_resize: null,
  init() {
    this.containr = maskboxEl.value || document.querySelector('.error_maskbox')
    this.blocks = [...document.querySelectorAll('.error_maskbox rect')]
    this.binded_resize = this.resize.bind(this)
    window.addEventListener('resize', this.binded_resize)
    this.resize()
  },
  resize() {
    if (!this.containr) return
    this.width = innerWidth
    this.height = innerHeight
    this.block_max_width = (innerWidth + innerHeight) / 2 / 2.5
    this.block_max_height = this.block_max_width / 3
    this.containr.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`)
    if (this.animaters.length) this.animaters.forEach((a) => a.kill())
    if (this.timer) clearInterval(this.timer)
    this.move_blocks(true)
    this.move_blocks(false)
    this.timer = setInterval(() => { this.move_blocks(false) }, this.timer_duration * 1000)
  },
  set_block() {
    let a, l, u, c
    const f = innerWidth / 2
    const h = innerHeight / 2
    if (Math.random() > 0.1) {
      a = Math.random() * this.block_max_width / 2 + this.block_max_width / 2
      l = Math.random() * this.block_max_height / 2 + this.block_max_height / 2
      u = f + (Math.random() - 0.5) * a * 1.5 - a / 2
      c = h + (Math.random() - 0.5) * l * 4 - l / 2
    } else {
      a = Math.random() * this.block_max_width / 5
      l = Math.random() * this.block_max_height / 5
      u = f + (Math.random() - 0.5) * innerWidth - a / 2
      c = h + (Math.random() - 0.5) * innerHeight - l / 2
    }
    return { x: u, y: c, w: a, h: l }
  },
  move_blocks(instant) {
    this.blocks.forEach((el, i) => {
      const b = this.set_block()
      this.animaters[i] = gsap.to(el, {
        duration: instant ? 0 : 0.6,
        attr: { x: b.x, y: b.y, width: b.w, height: b.h },
        delay: instant ? 0 : 0.01 * i,
        ease: ease_inout,
      })
    })
  },
  remove() {
    if (this.binded_resize) window.removeEventListener('resize', this.binded_resize)
    this.containr = null
    this.blocks = []
    if (this.animaters) this.animaters.forEach((a) => { a && a.kill() })
    this.animaters = []
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  },
}

const asciiSys = {
  width: GIF_W,
  height: GIF_H,
  texts: [],
  current: 0,
  timer: null,
  async init() {
    try {
      const res = await fetch(local('cdn/404_73d8eb17c3.gif'))
      if (!res.ok) return
      const buf = new Uint8Array(await res.arrayBuffer())
      if (dead) return
      const reader = new GifReader(buf)
      const pixels = new Uint8ClampedArray(reader.width * reader.height * 4)
      for (let i = 0; i < reader.numFrames(); i++) {
        reader.decodeAndBlitFrameRGBA(i, pixels)
        this.create_text(pixels)
      }
      if (dead || !this.texts.length) return
      ascii.value = this.texts[0]
      this.timer = setInterval(() => {
        const n = this.texts.length
        if (n < 2) return
        this.current = (this.current + 1) % (n - 1)
        ascii.value = this.texts[this.current]
      }, 60)
    } catch {
      /* leave empty — do not invent fake ASCII */
    }
  },
  create_text(data) {
    let out = ''
    for (let y = 0; y < this.height; y += 4) {
      let row = ''
      for (let x = 0; x < this.width; x += 4) {
        const p = (y * this.width + x) * 4
        const bright = (data[p] + data[p + 1] + data[p + 2]) / 3
        const bucket = CHAR_SETS[Math.floor(bright / 255 * (CHAR_SETS.length - 1))]
        row += bucket[Math.floor(Math.random() * bucket.length)]
      }
      out += row + '\n'
    }
    this.texts.push(out)
  },
  remove() {
    this.texts = []
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  },
}

const glitch = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  lines_total: 15,
  line_max_width: 0,
  line_max_height: 0,
  animater: null,
  binded_resize: null,
  init() {
    this.canvas = glitchEl.value || document.querySelector('.error_glitchbox')
    if (!this.canvas) return
    this.ctx = this.canvas.getContext('2d')
    this.binded_resize = this.resize.bind(this)
    window.addEventListener('resize', this.binded_resize)
    this.resize()
    this.draw()
  },
  resize() {
    if (!this.canvas) return
    this.canvas.width = this.width = innerWidth * devicePixelRatio
    this.canvas.height = this.height = innerHeight * devicePixelRatio
    this.line_max_width = this.width > this.height ? this.width / 10 : this.height / 10
    this.line_max_height = this.line_max_width / 50
  },
  draw() {
    if (!this.ctx || dead) return
    this.ctx.clearRect(0, 0, this.width, this.height)
    const count = Math.floor(Math.random() * this.lines_total)
    for (let i = 0; i < count; i++) {
      const ox = Math.random() * this.width
      const oy = Math.random() * this.height
      const n = Math.random() > 0.8 ? Math.random() * 10 + 10 : 1
      for (let j = 0; j < n; j++) {
        const x = ox + Math.random() * this.line_max_width - this.line_max_width / 2
        const y = oy + Math.random() * this.line_max_height * 40 - this.line_max_height * 40 / 2
        const w = Math.random() * this.line_max_width
        const h = Math.random() * this.line_max_height
        const r = Math.floor(Math.random() * 256)
        const g = Math.floor(Math.random() * 256)
        const b = Math.floor(Math.random() * 256)
        this.ctx.fillStyle = `rgba(${r},${g},${b},${Math.random() * 0.5 + 0.5})`
        this.ctx.fillRect(x, y, w, h)
      }
    }
    this.animater = requestAnimationFrame(() => { this.draw() })
  },
  remove() {
    if (this.binded_resize) window.removeEventListener('resize', this.binded_resize)
    this.canvas = null
    this.ctx = null
    if (this.animater) cancelAnimationFrame(this.animater)
    this.animater = null
  },
}

function cycleType() {
  typeTimer = setInterval(() => {
    type.value = (type.value % 8) + 1
  }, 900)
}

onMounted(() => {
  mask.init()
  asciiSys.init()
  glitch.init()
  cycleType()
})

onUnmounted(() => {
  dead = true
  mask.remove()
  asciiSys.remove()
  glitch.remove()
  if (typeTimer) clearInterval(typeTimer)
})
</script>
