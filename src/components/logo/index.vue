<template>
    <div class="logo">
        <img :src="settingStore.logo" alt="">
        <p> {{ settingStore.title }} </p>
    </div>
</template>

<script setup>
import { useSettingStore } from '@/store/setting';

const settingStore = useSettingStore()
</script>

<style scoped lang="scss">
    .logo {
        @include flex(center,center,null);
        color: white;
        font-weight: bold;
        margin-top: 20px;
        gap: 10px;
            img {
                width: 50px;
                border-radius: 50%;
            }

    }
</style>