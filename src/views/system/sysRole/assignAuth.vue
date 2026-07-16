<template>
    <div class="app-container">
      <div style="margin: 10px 0;">
        授权角色：{{ route.query.roleName }}
      </div>
      <!-- ===== 展开/折叠工具栏 ===== -->
      <div class="auth-toolbar">
        <el-button text size="small" @click="handleExpandAll">
          <el-icon><Expand /></el-icon> 全部展开
        </el-button>
        <el-button text size="small" @click="handleCollapseAll">
          <el-icon><Fold /></el-icon> 全部折叠
        </el-button>
      </div>
      <el-tree
        class="tree-with-line"
        style="margin: 12px 0"
        ref="treeRef"
        :data="sysMenuList"
        node-key="id"
        show-checkbox
        default-expand-all
        :props="defaultProps"
      />
      <div style="padding: 20px 20px;">
        <el-button size="small" type="primary" :loading="loading" @click="save" plain>保存</el-button>
        <el-button size="small" type="info" @click="$router.push('/system/sysRole')" plain>返回</el-button>
      </div>
    </div>
  </template>

<script setup>
import { nextTick, ref } from 'vue';
import {allocMenusApi,doAllocMenusApi} from '@/api/sysmenu';
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user';
import { clearRoute } from '@/utils/remove';
import { loadMenu } from '@/router';
import msg from '@/components/msg'
const route = useRoute()
const router = useRouter()

const props = defineProps({
  id: String,
});

const loading = ref(false);
const sysMenuList = ref([]);
const treeRef = ref(null);
const defaultProps = {
  children: 'children',
  label: 'name',
};

//t_role_request: 获取角色菜单数据请求
const render = async () => {
    const roleId = route.query.id
    if (!roleId) {
      return
    }
    const result = await allocMenusApi(roleId);
    sysMenuList.value = result.data;
    // 等待 el-tree 根据新数据完成 DOM 渲染后再设置勾选状态
    await nextTick()
    const checkedIds = getCheckedIds(sysMenuList.value);
    console.log('getPermissions() checkedIds', checkedIds);
    treeRef.value?.setCheckedKeys(checkedIds)
};

render()

// 得到所有选中的id列表（递归收集所有 select 为 true 的叶子节点）
const getCheckedIds = (auths) => {
    const ids = []
    const walk = (nodes) => {
      nodes.forEach(item => {
        if (item.select && item.children.length === 0) {
          ids.push(item.id)
        } else if (item.children && item.children.length > 0) {
          walk(item.children)
        }
      })
    }
    walk(auths)
    return ids
};

// ============================================================
// 展开/折叠
// ============================================================

/** 全部展开 */
const handleExpandAll = () => {
  const nodes = treeRef.value?.store?.nodesMap || {}
  Object.values(nodes).forEach(node => { node.expanded = true })
}

/** 全部折叠 */
const handleCollapseAll = () => {
  const nodes = treeRef.value?.store?.nodesMap || {}
  Object.values(nodes).forEach(node => { node.expanded = false })
}

const userStore = useUserStore()

//t_role_request: 为角色分配菜单请求
const save = async () => {
    // 获得当前所有选中包括上级所组成的数组
    const allCheckedNodes = treeRef.value.getCheckedNodes(false, true)
    console.log('selectedArr',allCheckedNodes)
     // 获得当前所有选中包括上级所组成的ids
    let idList = allCheckedNodes.map(node => node.id);
    console.log('selectedIds',idList)
    let assignMenuVo = {
          roleId: route.query.id,
          menuIdList: idList
        }
    await doAllocMenusApi(assignMenuVo)
    loading.value = true
    msg.primary('分配权限成功')
    router.push('/system/sysRole')
    /* if(userStore.userInfo.id != 1){
        // 清空路由
        clearRoute(userStore.userMenu)
        // 重新加载路由配置文件和pinia数据
        try {
          await loadMenu(false)
        } catch (error) {
          msg.primary(error)
          //重新加载菜单方式一
          router.push('/')
          userStore.removeUserAuth()

          //重新加载菜单方式二
          router.push('/').then(()=>{
            window.location.reload()
          })
        }
    } */

};

</script>

<style lang="scss" scoped>
// ============================================================
// 授权菜单树
// ============================================================
.auth-toolbar {
  display: flex;
  gap: 4px;
  // padding: 0 20px;
}

// ============================================================
// 树形连接线：竖线+横线均在 .el-tree-node 上，每个节点独立定位
// ============================================================
:deep(.tree-with-line) {
  .el-tree-node {
    position: relative;
    padding-left: 12px;

    // 竖直虚线 — 从节点顶部贯穿到底部
    &::before {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 0;
      height: 100%;
      border-left: 1px dashed var(--el-color-primary);
    }

    // 水平虚线 — width 24px 横跨 padding + icon 区域
    // 父节点：可见 icon 盖住 content 内部分，视觉上只露 padding 段
    // 叶子节点：icon 为 visibility:hidden 不渲染，横线穿透直达复选框
    // hover 时 __content 背景 (z-index:1) 自动盖住越界部分
    &::after {
      content: '';
      position: absolute;
      z-index: 0;
      left: 0;
      top: 12px;
      width: 20px;
      height: 0;
      border-top: 1px dashed var(--el-color-primary);
    }

    // 最后一个子节点：竖线截断，只保留顶部水平连接段
    &:last-child::before {
      height: 14px;
      top: 0;
      bottom: auto;
    }
  }

  .el-tree-node__content {
    position: relative;
    z-index: 1;
    padding-left: 0 !important;
  }

  .el-tree-node__children {
    padding-left: 12px;
  }
}
</style>
