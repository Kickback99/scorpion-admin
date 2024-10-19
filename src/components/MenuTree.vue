<template>
        <!--多级菜单-->
        <div v-for="menu in listData">
            <el-menu-item :index="handleChildren(menu)" v-if="handleMenuVisible(menu)">
                    <el-icon><Aim /></el-icon> <span>{{menu.meta.title}}</span>
            </el-menu-item>

            <el-sub-menu :index="`/system/${menu.path}`" v-else-if="menu.hidden ===false">
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

const handleMenuVisible = (menu) => {
    if((menu.children == null || menu.children.length == 0) && menu.hidden === false){
        return true
    }
}

const handleChildren = (menu) => {
    // 根据 type 来决定添加哪个前缀
    const prefix = menu.type === 'system'?'system':'content'
    if(menu.path.includes('Log')) {
        // 如果路径中包含 log，则添加 log 父路径
        return `/${prefix}/log/${menu.path}`
    }else return `/${prefix}/${menu.path}`
    // return menu.path.includes('Log') === true ? `/system/log/${menu.path}`:`/system/${menu.path}`
 }

</script>

<style scoped lang="scss">

</style>