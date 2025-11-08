<template>
    <h4>用户名：{{tokenStore.savedUsername}}</h4>
    <h4>密码：{{tokenStore.savedPassword}}</h4>
    <div class="wrap">
        <div class="left">
        </div>
        <div class="right"></div>
    </div>
</template>

<script setup>
import { useTokenStore } from '@/store/token';

const  tokenStore = useTokenStore()
</script>

<style scoped lang="scss">
    .wrap {
        @include flex(right,null,null);
        border: 1px solid black;
        .left {
            width: 50px;
            height: 200px;
            background: coral;

        }
        .right {
            width: 50px;
            height: 200px;
            background: red;
        }
    }
</style>