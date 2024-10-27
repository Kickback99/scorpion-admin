<template>
    <svg aria-hidden="true" :style="{width,height}">
      <use :xlink:href="symbolId" :fill="color" />
    </svg>
  </template>
  
  <script setup>
  import { computed } from 'vue'
    const props = defineProps({
      prefix: {
        type: String,
        default: 'icon',
      },
      icon: {
        type: String,
        required: true,
      },
      color: {
        type: String,
        default: '',
      },
      width :{
        type:String,
        default: '18px'
      },
      height :{
        type:String,
        default: '18px'
      }
    })
    const symbolId = computed(() => `#${props.prefix}-${props.icon}`)

  </script>