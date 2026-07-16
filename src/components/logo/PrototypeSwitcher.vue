<!--
  PROTOTYPE — 浮动底栏切换器
  底部居中 fixed bar，左右箭头切换 variant，支持键盘 ← →
  评估完成后删除
-->
<template>
  <div v-if="isDev" class="prototype-switcher" @click.stop>
    <button class="switcher-btn" @click="prev" title="上一个 (←)">◀</button>
    <span class="switcher-label">{{ current }} — {{ label }}</span>
    <button class="switcher-btn" @click="next" title="下一个 (→)">▶</button>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  variants: { type: Array, required: true },
  labels: { type: Object, default: () => ({}) }
})

const router = useRouter()
const route = useRoute()
const isDev = import.meta.env.MODE !== 'production'

const current = computed(() => route.query.variant || props.variants[0])
const label = computed(() => props.labels[current.value] || current.value)

function switchTo(v) {
  router.replace({ query: { ...route.query, variant: v } })
}

function prev() {
  const idx = props.variants.indexOf(current.value)
  const next = idx <= 0 ? props.variants.length - 1 : idx - 1
  switchTo(props.variants[next])
}

function next() {
  const idx = props.variants.indexOf(current.value)
  const next = idx >= props.variants.length - 1 ? 0 : idx + 1
  switchTo(props.variants[next])
}

function onKeydown(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return
  if (e.key === 'ArrowLeft')  { e.preventDefault(); prev() }
  if (e.key === 'ArrowRight') { e.preventDefault(); next() }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped lang="scss">
.prototype-switcher {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 20px;
  border-radius: 24px;
  background: rgba(30, 30, 30, 0.92);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.switcher-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  line-height: 1;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
}

.switcher-label {
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  min-width: 180px;
  text-align: center;
  letter-spacing: 0.5px;
}
</style>
