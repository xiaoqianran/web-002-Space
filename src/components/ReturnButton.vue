<template>
  <div class="rbtn button" @click="$emit('click')">
    <svg viewBox="0 0 200 150">
      <path d="M55.59,2.95L0,75l55.59,72.05H200V2.95H55.59z M168.48,89.53H65.27V60.16h103.21V89.53z"/>
    </svg>
    <p class="_font_2">[返回]::close()</p>
  </div>
</template>
<script setup>
defineEmits(['click'])
</script>
