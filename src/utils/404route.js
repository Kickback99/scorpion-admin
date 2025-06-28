// 工具函数：添加404路由
export const add404Routes = (router) => {
  if (!router.hasRoute('NotFound')) {
    router.addRoute({
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      redirect: '/404'
    });
    router.addRoute({
      path: '/404',
      name: '404',
      component: () => import('@/views/404/index.vue')
    });
  }
};