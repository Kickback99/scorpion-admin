<template>
    <div class="app-container">
      <div style="padding: 20px 20px 0 20px;">
        授权角色：{{ route.query.roleName }}
      </div>
      <el-tree
        style="margin: 20px 0"
        ref="treeRef"
        :data="sysMenuList"
        node-key="id"
        show-checkbox
        default-expand-all
        :props="defaultProps"
      />
      <div style="padding: 20px 20px;">
        <el-button :loading="loading" type="primary" icon="el-icon-check" size="mini" @click="save">保存</el-button>
        <el-button @click="$router.push('/system/sysRole')" size="mini" icon="el-icon-refresh-right">返回</el-button>
      </div>
    </div>
  </template>

<script setup>
import { ref} from 'vue';
import {allocMenusApi,doAllocMenusApi} from '@/api/sysmenu';
import { useRoute, useRouter } from 'vue-router'
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
    const result = await allocMenusApi(roleId);
    sysMenuList.value = result.data;
    const checkedIds = getCheckedIds(sysMenuList.value);
    console.log('getPermissions() checkedIds', checkedIds);
    treeRef.value.setCheckedKeys(checkedIds)
    // ...省略其他逻辑
};

render()

    //得到所有选中的id列表
const getCheckedIds = (auths, initArr = []) => {
    return auths.reduce((pre, item) => {
          if (item.select && item.children.length === 0) {
            pre.push(item.id)
          } else if (item.children) {
            getCheckedIds(item.children, initArr)
          }
          return pre
        }, initArr)
};

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
    ElMessage.success('分配权限成功')
    router.push('/system/sysRole')
};

</script>
