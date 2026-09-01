<template>
    <div class="smart-captcha" :class="{ 'is-verified': verified }">
        <!-- ===== 文本验证码（算术/中文/英文/数字/混合/GIF） ===== -->
        <template v-if="isTextType">
            <div class="captcha-text-row">
                <img
                    v-if="vo.backgroundImage"
                    :src="vo.backgroundImage"
                    class="captcha-text-img"
                    alt="验证码"
                    title="点击刷新"
                    @click="generate"
                >
                <el-button text :icon="Refresh" @click="generate" :disabled="verified"></el-button>
            </div>
            <el-input
                v-model="answer"
                placeholder="请输入验证码"
                clearable
                :disabled="verified"
                @keyup.enter="handleTextVerify"
            >
                <template #prefix><el-icon><Key /></el-icon></template>
            </el-input>
        </template>

        <!-- ===== 滑块验证码 ===== -->
        <template v-else>
            <div ref="boxRef" class="captcha-slider-box">
                <img
                    v-if="vo.backgroundImage"
                    :src="vo.backgroundImage"
                    class="captcha-bg"
                    :style="{ height: vo.backgroundImageHeight * scale + 'px' }"
                    alt="滑块背景"
                >
                <img
                    v-if="vo.templateImage"
                    :src="vo.templateImage"
                    class="captcha-piece"
                    draggable="false"
                    :style="{ left: dragX + 'px', width: vo.templateImageWidth * scale + 'px', height: vo.templateImageHeight * scale + 'px' }"
                    alt="滑块"
                    @pointerdown="onPointerDown"
                >
                <el-button
                    text
                    size="small"
                    class="captcha-refresh"
                    :icon="Refresh"
                    @click="generate"
                ></el-button>
                <div v-if="!vo.backgroundImage" class="captcha-placeholder">加载中…</div>
            </div>
        </template>

        <!-- ===== 验证通过遮罩 ===== -->
        <div v-if="verified" class="captcha-success">
            <el-icon color="#67c23a" :size="20"><SuccessFilled /></el-icon>
            <span>验证通过</span>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useEventListener, useElementSize } from '@vueuse/core'
import { Refresh, Key, SuccessFilled } from '@element-plus/icons-vue'
import { captchaGenerateApi, captchaVerifyApi } from '@/api/captcha'

// ============================================================
// 数据
// ============================================================

const props = defineProps({
    type: {
        type: String,
        default: 'slider'
    }
})

const emit = defineEmits(['success', 'fail'])

const TEXT_TYPES = ['default', 'chinese', 'english', 'number', 'mixed', 'gif']
const isTextType = computed(() => TEXT_TYPES.includes(props.type))

const vo = reactive({
    id: '',
    type: '',
    backgroundImage: '',
    templateImage: '',
    backgroundImageWidth: 0,
    backgroundImageHeight: 0,
    templateImageWidth: 0,
    templateImageHeight: 0
})

const verifying = ref(false)
const verified = ref(false)

// ============================================================
// 滑块：拖拽 + 轨迹采集
// ============================================================

const boxRef = ref(null)
const { width: boxWidth } = useElementSize(boxRef)
// 展示缩放系数：背景图按容器宽度等比缩放，轨迹需换算回自然像素（未测量到宽度时兜底为 1）
const scale = computed(() => (vo.backgroundImageWidth && boxWidth.value ? boxWidth.value / vo.backgroundImageWidth : 1))
// 滑块最大可拖动的相对偏移（渲染像素）
const maxDrag = computed(() => Math.max(0, boxWidth.value - vo.templateImageWidth * scale.value))

// 相对拖动偏移（渲染像素，起点为 0）
const dragX = ref(0)
const isDragging = ref(false)
const trackList = ref([])
const dragStartTime = ref(0)
let startClientX = 0
let lastSampleAt = 0

const onPointerDown = (e) => {
    if (verified.value) return
    isDragging.value = true
    startClientX = e.clientX
    dragStartTime.value = Date.now()
    trackList.value = [{ x: 0, y: 0, t: 0 }]
    lastSampleAt = 0
}

const onPointerMove = (e) => {
    if (!isDragging.value) return
    dragX.value = Math.max(0, Math.min(e.clientX - startClientX, maxDrag.value))
    const t = Date.now() - dragStartTime.value
    if (t - lastSampleAt < 8) return
    lastSampleAt = t
    trackList.value.push({ x: Math.round(dragX.value / scale.value), y: 0, t })
}

const onPointerUp = () => {
    if (!isDragging.value) return
    isDragging.value = false
    const t = Date.now() - dragStartTime.value
    trackList.value.push({ x: Math.round(dragX.value / scale.value), y: 0, t })
    if (trackList.value.length > 1) handleSliderVerify()
}

useEventListener(window, 'pointermove', onPointerMove)
useEventListener(window, 'pointerup', onPointerUp)

// ============================================================
// 生成
// ============================================================

const generate = async () => {
    verified.value = false
    verifying.value = true
    try {
        const res = await captchaGenerateApi(props.type)
        if (res.code === 200 && res.data) {
            Object.assign(vo, res.data)
        }
        dragX.value = 0
        trackList.value = []
    } catch (e) {
        console.error('生成验证码失败:', e)
    } finally {
        verifying.value = false
    }
}

onMounted(() => {
    generate()
})

// ============================================================
// 校验
// ============================================================

const answer = ref('')

const handleTextVerify = async () => {
    if (!answer.value || verified.value) return
    verifying.value = true
    try {
        const res = await captchaVerifyApi({ id: vo.id, type: props.type, answer: answer.value })
        if (res.code === 200 && res.data) {
            verified.value = true
            emit('success', res.data)
        }
    } catch (e) {
        answer.value = ''
        generate()
        emit('fail')
    } finally {
        verifying.value = false
    }
}

const handleSliderVerify = async () => {
    verifying.value = true
    try {
        const track = {
            bgImageWidth: vo.backgroundImageWidth,
            bgImageHeight: vo.backgroundImageHeight,
            templateImageWidth: vo.templateImageWidth,
            templateImageHeight: vo.templateImageHeight,
            startTime: dragStartTime.value,
            stopTime: Date.now(),
            trackList: trackList.value
        }
        const res = await captchaVerifyApi({ id: vo.id, type: props.type, track })
        if (res.code === 200 && res.data) {
            verified.value = true
            emit('success', res.data)
        }
    } catch (e) {
        generate()
        emit('fail')
    } finally {
        verifying.value = false
    }
}
</script>

<style lang="scss" scoped>
.smart-captcha {
    position: relative;
    width: 100%;

    .captcha-text-row {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-bottom: 4px;

        .captcha-text-img {
            height: 40px;
            cursor: pointer;
            border: 1px solid var(--el-border-color);
            border-radius: 4px;
        }
    }

    .captcha-slider-box {
        position: relative;
        width: 100%;
        min-height: 90px;
        overflow: hidden;
        border-radius: 4px;

        .captcha-bg {
            width: 100%;
            display: block;
        }

        .captcha-piece {
            position: absolute;
            top: 0;
            left: 0;
            cursor: grab;
            touch-action: none;
            user-select: none;
        }

        .captcha-refresh {
            position: absolute;
            top: 2px;
            right: 2px;
            z-index: 10;
        }

        .captcha-placeholder {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--el-text-color-secondary);
            font-size: 12px;
        }
    }

    .captcha-success {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.75);
        font-size: 14px;
        color: var(--el-color-success);
        z-index: 20;
        border-radius: 4px;
        pointer-events: none;
    }
}
</style>
