<template>
        <!--多级菜单-->
        <div v-for="menu in listData">
            <el-menu-item :index="handleChildren(menu)" v-if="menu.children == null || menu.children.length == 0">
                    <el-icon><Aim /></el-icon> <span>{{menu.meta.title}}</span>
            </el-menu-item>

            <el-sub-menu :index="`/system/${menu.path}`" v-else>
            <template #title>
                <el-icon><Aim /></el-icon> <span>{{ menu.meta.title }}</span>
            </template>
            <!--展开的每一个菜单项-->
                <menu-tree :listData="menu.children"></menu-tree>
            </el-sub-menu>
        </div>
</template>

<script setup>
defineProps(['listData'])

const handleChildren = (menu) => {
        
    return menu.path.includes('Log') === true ? `/system/log/${menu.path}`:`/system/${menu.path}`
 }

</script>

<style scoped lang="scss">

</style>