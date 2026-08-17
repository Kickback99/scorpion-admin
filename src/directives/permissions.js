import { watchEffect } from 'vue'
import { useConfigStore } from '@/store/config'
import { hasPerm } from '@/utils/permissions'

/**
 * v-perm 按钮权限指令
 * 用法：<el-button v-perm="'btn.xx.xx'" ...>
 * 无权限按钮的展示方式由 configStore.buttonPermissionMode 全局决定：
 *   - 'hide'    → display:none（可逆，等价 v-show=false）
 *   - 'disable' → 原生 disabled + is-disabled class（等价 :disabled）
 * 有权限时不做任何修改；指令只撤销自己做过的事，不覆盖模板自身的 :disabled 绑定。
 */

// 每个元素的指令状态（WeakMap：不污染元素、卸载后自动回收）
const stateMap = new WeakMap()

/**
 * 应用权限展示状态。
 * el 是 el-button 根 <button>（Vue 会把组件 vnode 上的指令转移到根元素 vnode）。
 * state.baseDisabled 记录模板 :disabled 渲染出的基线（mounted/updated 时捕获），
 * 恢复时用基线还原，避免覆盖复合条件里业务部分的禁用状态。
 */
function apply(el, value) {
  const state = stateMap.get(el)
  if (!state) return // 已卸载

  const mode = useConfigStore().buttonPermissionMode || 'hide'

  // 先撤销指令上一轮的修改（隐藏/禁用互切、权限恢复都靠这里）
  if (state.hidden) {
    el.style.display = state.origDisplay
    state.hidden = false
    state.origDisplay = undefined
  }
  if (state.disabledByPerm) {
    el.classList.remove('is-disabled')
    el.disabled = state.baseDisabled
    state.disabledByPerm = false
  }

  if (hasPerm(value)) return // 有权限：恢复完即止

  if (mode === 'hide') {
    state.origDisplay = el.style.display
    state.hidden = true
    el.style.display = 'none'
  } else {
    state.disabledByPerm = true
    el.disabled = true
    el.classList.add('is-disabled')
  }
}

export const setPerm = (app) => {
  app.directive('perm', {
    mounted(el, binding) {
      // 挂载时 DOM 已按模板渲染完成，el.disabled 即模板绑定的基线值
      const state = {
        baseDisabled: el.disabled,
        hidden: false,
        disabledByPerm: false,
        origDisplay: undefined,
        stop: null,
      }
      stateMap.set(el, state)
      // 响应式核心：userPerm 或 buttonPermissionMode 任一变化立即重算。
      // 将来 WebSocket 推送权限 → setUserPerm 写入 → 此处自动触发。
      state.stop = watchEffect(() => apply(el, binding.value))
    },
    updated(el, binding) {
      const state = stateMap.get(el)
      if (!state) return
      // el-button 自渲染会按自身 props 重置 disabled 属性，
      // updated 在子组件 patch 之后执行，此时 el.disabled 是模板最新渲染结果，重新捕获基线。
      state.baseDisabled = el.disabled
      apply(el, binding.value)
    },
    unmounted(el) {
      const state = stateMap.get(el)
      if (state) {
        state.stop && state.stop()
        stateMap.delete(el)
      }
    },
  })
}
