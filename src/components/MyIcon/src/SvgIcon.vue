<template>
    <svg aria-hidden="true" :style="{width,height}">
      <use :xlink:href="symbolId" :fill="color" />
    </svg>
  </template>
  
  <script>
  import { defineComponent, computed } from 'vue'
  
  export default defineComponent({
    name: 'SvgIcon',
    props: {
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
        default: '32px'
      },
      height :{
        type:String,
        default: '32px'
      }
    },
    setup(props) {
      const symbolId = computed(() => `#${props.prefix}-${props.icon}`)
      return { symbolId }
    },
  })
  </script>