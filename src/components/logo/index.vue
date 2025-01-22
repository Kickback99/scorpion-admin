<template>
    <div class="logo">
        <img :src="settingStore.logo" alt="" :style="{marginLeft:settingStore.isCollapse?27 +'px': '0'}">
        <p :style="{color:colorStore.logoTitleColor}"> {{ settingStore.title }} </p>
    </div>
</template>

<script setup>
import { useSettingStore } from '@/setting';
import { useColorStore } from '@/store/color';

const settingStore = useSettingStore()
const colorStore = useColorStore()
</script>

<style scoped lang="scss">
    .logo {
        @include flex(center,center,null);
        color: white;
        font-weight: bold;
        margin: 20px 0;
        height: $base-menu-logo-height;
        padding: 5px 0;
        gap: 10px;
            img {
                width: 50px;
                border-radius: 50%;
            }

            p {
                font-size:17px;
            }

    }
</style>