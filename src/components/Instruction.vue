<template>
  <div v-if="store.instructionOpen" class="instruction" @click.self="store.instructionOpen = false">
    <div class="instruction_background" @click="store.instructionOpen = false"></div>
    <div class="instruction_main _clip_edge">
      <svg viewBox="0 0 1600 900">
        <polygon points="40,8 1592,8 1592,892 8,892 8,48" />
        <circle class="instruction_main_circle" cx="40" cy="40" r="4" />
        <rect x="80" y="8" width="40" height="6" />
      </svg>
      <div class="instruction_list">
        <div v-for="item in items" :key="item.n" class="instruction_item">
          <p class="instruction_item_n _font_3">{{ item.n }}</p>
          <div class="instruction_item_txt">
            <p class="_font_2">{{ item.cn }}</p>
            <p class="_font_1">{{ item.en }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="instruction_return" @click="store.instructionOpen = false">
      <ReturnButton />
    </div>
  </div>
</template>
<script setup>
import { store } from '../store.js'
import ReturnButton from './ReturnButton.vue'

const items = [
  { n: '01', cn: '点击星体，展开世界卡片', en: 'CLICK' },
  { n: '02', cn: '拖拽星空，环顾四周', en: 'SWIPE' },
  { n: '03', cn: '在地址栏输入世界路径', en: 'type URL' },
]
</script>
