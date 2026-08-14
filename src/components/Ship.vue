<template>
  <svg class="ship" viewBox="0 0 200 200" :class="{ ship_stroke: stroke }">
    <g class="ship_back">
      <circle cx="100" cy="100" r="92" fill="#919090" />
      <circle cx="100" cy="100" r="78" fill="#565656" />
    </g>
    <g class="ship_front">
      <circle class="ship_front_p1" cx="100" cy="100" r="64" fill="var(--color_white)" />
      <circle class="ship_front_p2" cx="100" cy="100" r="50" fill="none" stroke="#000013" stroke-width="2" />
      <circle class="ship_front_p3" cx="100" cy="100" r="36" fill="none" stroke="#000013" stroke-width="1.5" />
      <circle class="ship_front_p4" cx="100" cy="100" r="22" fill="none" stroke="#000013" stroke-width="1.2" />
      <g stroke="#000013" stroke-width="1.4">
        <line v-for="i in 6" :key="i" x1="100" y1="100"
          :x2="100 + 64 * Math.cos((i-1)*Math.PI/3)"
          :y2="100 + 64 * Math.sin((i-1)*Math.PI/3)" />
      </g>
    </g>
    <g class="ship_eye">
      <circle cx="100" cy="100" r="16" />
      <circle cx="100" cy="100" r="10" />
      <circle cx="100" cy="100" r="5" />
    </g>
    <circle class="ship_hole" cx="100" cy="100" r="70" />
  </svg>
</template>
<script setup>
defineProps({ stroke: { type: Boolean, default: false } })
</script>
