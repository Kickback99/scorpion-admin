import { useUserStore } from "@/store/user"

// 获取动态路由组件 (重构后的版本)
export function getDynamicRouteComponents() {
  const userStore = useUserStore()
  const menuData = userStore.userMenu
  
  // 递归扁平化路由树
  const flattenRoutes = (routes) => {
    return routes.flatMap(route => {
      const components = []
      
      // 添加当前路由组件 (排除Layout组件)
      if (route.component && route.component.__name !== 'Layout') {
        components.push({
          path: route.path,
          name: route.name,
          component: route.component
        })
      }
      
      // 递归处理子路由
      if (route.children) {
        components.push(...flattenRoutes(route.children))
      }
      
      return components
    })
  }
  
  // 获取扁平化后的路由组件
  const flatComponents = flattenRoutes(menuData)
  
  // 转换为目标格式
  return convertToDesiredFormat(flatComponents)
}

// 转换格式函数
const convertToDesiredFormat = (components) => {
  return components.map(item => ({
    path: item.path,
    name: item.name ? item.name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-') : 'index',
    component: item.component
  }))
}