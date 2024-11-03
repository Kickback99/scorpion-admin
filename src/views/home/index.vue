<template>
    <div class="wrap">
        <div class="left"></div>
        <div class="right"></div>
    </div>
</template>

<script setup>

</script>

<style scoped lang="scss">
    .wrap {
        @include flex(right,null,null);
        border: 1px solid black;
        .left {
            width: 50px;
            height: 200px;
            background: $color;

        }
        .right {
            width: 50px;
            height: 200px;
            background: red;
        }
    }
</style>