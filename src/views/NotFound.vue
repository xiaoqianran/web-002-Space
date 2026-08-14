<template>
  <div class="error" :class="'error_type' + type">
    <div class="error_asciibox">
      <p class="error_asciibox_chars">{{ noise }}</p>
    </div>
    <div class="error_content">
      <div class="error_content_404">404</div>
      <p class="error_reconnect _font_2">RECONNECT</p>
      <div class="error_content_button" @click="$router.push('/')">
        <svg viewBox="0 0 40 20"><line x1="0" y1="10" x2="40" y2="10" /><rect x="0" y="8" width="4" height="4" /></svg>
        <div class="_font_2">RETURN HOME</div>
        <svg viewBox="0 0 40 20"><line x1="0" y1="10" x2="40" y2="10" /><rect x="36" y="8" width="4" height="4" /></svg>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
const type = ref(1)
const chars = '01/\\<>|*+-=ERRORGLITCH404NOISE#@$%AB'
const noise = ref('')
function regen() {
  let s = ''
  for (let i = 0; i < 900; i++) s += chars[Math.floor(Math.random() * chars.length)]
  noise.value = s
}
regen()
let t
onMounted(() => {
  t = setInterval(() => {
    type.value = (type.value % 8) + 1
    regen()
  }, 900)
})
onUnmounted(() => clearInterval(t))
</script>
