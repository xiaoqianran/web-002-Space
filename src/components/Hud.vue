<template>
  <div class="uibox">
    <div class="uibox_shipbox uibox_edge">
      <div class="uibox_shipbox_info" @click="store.instructionOpen = true">
        <div class="uibox_shipbox_info_ship">
          <Ship />
        </div>
        <div class="uibox_shipbox_info_data">
          <div v-for="b in bars" :key="b.k">
            <p class="_font_1">{{ b.k }}</p>
            <div :style="{ '--l': b.l }"></div>
          </div>
        </div>
      </div>
      <div class="uibox_edge_blocks" style="display:flex">
        <div class="ueb_block _clip_edge">
          <svg class="ueb_block_dotted" viewBox="0 0 50 50"><rect x="2" y="2" width="46" height="46" fill="none" /></svg>
          <svg class="ueb_block_t1" viewBox="0 0 50 50" style="--d:0s">
            <rect x="8" y="8" width="34" height="34" />
            <line x1="25" y1="10" x2="25" y2="40" style="--d:0s" />
            <line x1="10" y1="25" x2="40" y2="25" style="--d:.4s" />
          </svg>
        </div>
        <div class="ueb_block _clip_edge">
          <svg class="ueb_block_t2" viewBox="0 0 50 50" style="--d:.2s">
            <g><rect x="10" y="10" width="30" height="30" /></g>
            <g><circle cx="25" cy="25" r="10" /></g>
          </svg>
        </div>
      </div>
    </div>

    <div class="uibox_middle">
      <div class="uibox_middle_time uibox_middle_edge">
        <div class="uibox_middle_time_tip">
          <p class="_font_2">{{ world.name }}<span>:</span> {{ worldDate }}</p>
        </div>
        <svg class="uibox_middle_line" viewBox="0 0 259 16">
          <path d="M0 12.9749H185.816L198.5 3.3H259" />
        </svg>
        <p class="_font_5">{{ clock }}</p>
      </div>

      <div class="uibox_middle_console">
        <div class="umc_border"></div>
        <svg class="umc_web" viewBox="0 0 200 200">
          <rect x="20" y="20" width="160" height="160" />
          <circle cx="40" cy="40" r="2" style="--d:0" />
          <circle cx="160" cy="50" r="2" style="--d:1" />
          <circle cx="70" cy="150" r="2" style="--d:2" />
        </svg>
        <div class="umc_button" @click="openConsole">
          <div class="umc_button_background"></div>
          <div class="umc_button_layer umc_button_layer1"><div style="--a:20deg;--d:1"></div></div>
          <div class="umc_button_layer umc_button_layer2"><div style="--a:-30deg;--d:-1"></div></div>
          <div class="umc_button_layer umc_button_layer3"><div style="--a:50deg;--d:1"></div></div>
          <div class="umc_button_layer umc_button_layer4"><div style="--a:-10deg;--d:-1"></div></div>
          <p class="_font_2">CONSLOE</p>
        </div>
      </div>

      <div class="uibox_middle_links uibox_middle_edge">
        <div class="uibox_middle_links_tip">
          <p class="_font_2">External Links</p>
        </div>
        <svg class="uibox_middle_line" viewBox="0 0 259 16">
          <path d="M0 12.9749H185.816L198.5 3.3H259" />
        </svg>
        <div class="uibox_middle_links_icons">
          <a href="https://weibo.com/u/5652161753" target="_blank" rel="noreferrer" class="_clip_edge">
            <div></div>
            <img :src="$asset('img/social/weibo.svg')" alt="weibo" />
          </a>
          <a href="https://b23.tv/0kFykcQ" target="_blank" rel="noreferrer" class="_clip_edge">
            <div></div>
            <img :src="$asset('img/social/bilibili.svg')" alt="bilibili" />
          </a>
          <a :href="NOVEL" target="_blank" rel="noreferrer" class="_clip_edge">
            <div></div>
            <img :src="$asset('img/social/novel.svg')" alt="novel" />
          </a>
        </div>
      </div>
    </div>

    <div class="uibox_instructionbox uibox_edge">
      <div class="uibox_instructionbox_info" @click="store.instructionOpen = true">
        <div class="uibox_instructionbox_info_icon">
          <div></div>
          <img :src="$asset('img/guide.png')" alt="help" />
        </div>
        <div class="uibox_instructionbox_info_tip">
          <p class="_font_4">Need Help?</p>
          <div>
            <div class="_dot"></div>
            <svg viewBox="0 0 50 2"><line x1="0" y1="1" x2="50" y2="1" /></svg>
            <div class="_dot"></div>
          </div>
          <p class="_font_2">Check Instruction</p>
        </div>
      </div>
      <div class="uibox_edge_blocks" style="display:flex">
        <div class="ueb_block _clip_edge">
          <svg class="ueb_block_t3" viewBox="0 0 50 50" style="--d:.3s">
            <circle cx="25" cy="25" r="16" />
            <circle cx="25" cy="25" r="3" />
            <line x1="25" y1="8" x2="25" y2="42" />
          </svg>
        </div>
        <div class="ueb_block _clip_edge">
          <svg class="ueb_block_t4" viewBox="0 0 50 50" style="--d:.6s">
            <polyline points="10,25 20,10 30,40 40,18" />
            <rect x="22" y="22" width="6" height="6" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { store, currentWorld, worldYearDate, openSystem } from '../store.js'
import Ship from './Ship.vue'

const NOVEL = 'https://changdunovel.com/wap/share-v2.html?&book_id=7522080164855942206&share_code=xqpvRmoYGDWFCVOrdvXQC__rR3BMUmS67C6Ik5kwfL8%3D'
const bars = [
  { k: 'EN', l: 0.8 },
  { k: 'HI', l: 0.5 },
  { k: 'PSI', l: 0.3 },
  { k: 'CQL', l: 0.5 },
]
const world = computed(() => currentWorld())
const worldDate = computed(() => worldYearDate(world.value))
const clock = ref('00:00:00')
let timer
function tick() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  clock.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
function openConsole() {
  store.consoleOpen = false
  openSystem()
}
onMounted(() => { tick(); timer = setInterval(tick, 1000) })
onUnmounted(() => clearInterval(timer))
</script>
