<template>
  <div class="home">
    <WindowView />
    <Hud />
    <SystemOverlay />
    <Instruction />

    <div class="ed" :class="{ show: store.emergencyOpen }" v-show="store.emergencyOpen">
      <div class="ed_title"><p class="_font_2">{{ emergency.title || 'EMERGENCY' }}</p></div>
      <div class="ed_content">
        <div class="ed_content_shipbox">
          <div class="ed_content_shipbox_ship"><Ship stroke :error_type="store.shipErrorType" /></div>
        </div>
        <div class="ed_content_info">
          <p class="ed_content_info_title _font_2">飞船实时状态监测反馈</p>
          <div class="ed_content_info_log _font_1">{{ emergency.log }}</div>
          <div class="ed_content_info_button _font_1" @click="hideEmergency()">执行已授权操作</div>
        </div>
      </div>
    </div>
    <div class="mask" :class="{ hidden: !store.emergencyOpen }"></div>

    <div class="ad" :class="{ show: store.adOpen && !store.systemOpen && !store.instructionOpen && !store.menuOpen }" v-show="store.adOpen && !store.systemOpen && !store.instructionOpen && !store.menuOpen">
      <div class="ad_title">
        <p class="_font_2" style="color:#000">{{ ad.title }}</p>
        <div class="ad_title_button" @click="hideAd()"></div>
      </div>
      <div class="ad_content">
        <div class="ad_content_image" v-if="ad.image">
          <img :src="$cdn(ad.image)" alt="ad" decoding="async" />
        </div>
        <div class="ad_content_scrolltext"><p class="_font_2">{{ ad.scrolltext }}{{ ad.scrolltext }}</p></div>
        <p class="ad_content_info _font_1">{{ ad.info }}</p>
      </div>
      <div class="ad_line" :style="{ '--l': store.adCountdown }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { store, closeSystem, hideAd, hideEmergency, startDialogs } from '../store.js'
import WindowView from '../components/WindowView.vue'
import Hud from '../components/Hud.vue'
import SystemOverlay from '../components/SystemOverlay.vue'
import Instruction from '../components/Instruction.vue'
import Ship from '../components/Ship.vue'

const ad = computed(() => store.currentAd || {})
const emergency = computed(() => store.currentEmergency || { title: 'EMERGENCY', log: '' })

onMounted(() => {
  closeSystem()
  startDialogs()
})
</script>
