import { useUserStore } from '@/store/user'

export const getSiblingRouteComponents = async (currentRouteName) => {
  const userStore = useUserStore()
  const menuData = userStore.userMenu
  
  // 递归查找当前路由
  const findRoute = (routes, name) => {
    for (const route of routes) {
      if (route.name === name) return route
      if (route.children) {
        const found = findRoute(route.children, name)
        if (found) return found
      }
    }
    return null
  }
  
  // 找到当前路由
  const currentRoute = findRoute(menuData, currentRouteName)
  console.log('currentRoute',currentRoute)
  if (!currentRoute) return {}
  
  // 收集所有需要加载的组件
  const components = {}
  
  // 递归处理路由项
  const processRouteItem = async (item) => {
    // 特性1: 处理Layout组件或component为undefined但有children的情况
    if (
      (item.component?.__name === 'Layout' || item.component === undefined) && 
      Array.isArray(item.children) && 
      item.children.length > 0
    ) {
      // 遍历children并处理每个子路由
      for (const child of item.children) {
        await processRouteItem(child)
      }
    } 
    // 特性2: 处理有component且没有children的路由
    else if (item.component && !item.children) {
      try {
        // 执行动态导入函数获取组件
        const component = await item.component?.()
        components[item.name] = component.default || component
      } catch (error) {
        console.error(`Failed to load component for route ${item.name}:`, error)
      }
    }
  }
  
  // 从根开始处理整个路由树
  for (const route of menuData) {
    await processRouteItem(route)
  }
  
  return convertToDesiredFormat(components)
}






const convertToDesiredFormat = (data) => {
  return Object.entries(data).map(([name, component]) => ({
    name: name.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-') || 'index',
    component
  }));
};
