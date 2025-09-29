<!-- 创建通用卡片组件 -->
<template>
  <div 
    class="card" 
    :class="{ 
      'hover-effect': hoverEffect,
      [className]: className 
    }"
  >
    <slot name="header"></slot>
    <div class="card-content">
      <slot></slot>
    </div>
    <slot name="footer"></slot>
  </div>
</template>

<script setup>
defineProps({
  hoverEffect: {
    type: Boolean,
    default: true
  },
  className: {
    type: String,
    default: ''
  }
});
</script> 