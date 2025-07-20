import { useUserStore } from "@/store/user"

// 获取动态路由组件 (重构后的版本)
export function getDynamicRouteComponents(excludes = []) {
  const userStore = useUserStore()
  const menuData = userStore.userMenu
  
  // 递归扁平化路由树
  const flattenRoutes = (routes) => {
    return routes.flatMap(route => {
      const components = []

      // 检查是否在排除列表中
      const shouldExclude = excludes.includes(route.name)
      
      // 添加当前路由组件 (排除Layout组件和指定名称的组件)
      if (route.component && route.component.__name !== 'Layout' && !shouldExclude) {
        components.push({
          path: route.path,
          name: route.name,
          component: route.component
        })
      }
      
      // 递归处理子路由
      if (route.children && !shouldExclude) {
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

export function generateNameFromPath(path) {
  // 去掉首尾斜杠
  let cleanedPath = path.replace(/^\/|\/$/g, '')
  
  // 判断是否包含多个斜杠
  if (path.split('/').length > 2) {
    // 多个斜杠的情况：替换中间斜杠为短横线
    return cleanedPath.replace(/\//g, '-')
  }
  
  console.log('cleanedPath',cleanedPath)

  // 单个斜杠的情况：直接返回去掉首尾斜杠的结果
  return cleanedPath
}