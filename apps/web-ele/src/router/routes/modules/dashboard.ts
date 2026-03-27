import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  // 总览 - 顶层菜单，无子菜单
  {
    name: 'Overview',
    path: '/overview',
    component: () => import('#/views/dashboard/overview/index.vue'),
    meta: {
      affixTab: true,
      icon: 'lucide:home',
      order: -10,
      title: $t('page.dashboard.overview'),
    },
  },
  // Dashboard 菜单组（HR系统不显示，保留路由供内部使用）
  {
    meta: {
      hideInMenu: true,
      hideInTab: true,
      icon: 'lucide:layout-dashboard',
      order: -1,
      title: $t('page.dashboard.title'),
    },
    name: 'Dashboard',
    path: '/dashboard',
    children: [
      {
        name: 'Analytics',
        path: '/analytics',
        component: () => import('#/views/dashboard/analytics/index.vue'),
        meta: {
          hideInMenu: true,
          hideInTab: true,
          icon: 'lucide:area-chart',
          title: $t('page.dashboard.analytics'),
        },
      },
      {
        name: 'Workspace',
        path: '/workspace',
        component: () => import('#/views/dashboard/workspace/index.vue'),
        meta: {
          hideInMenu: true,
          hideInTab: true,
          icon: 'carbon:workspace',
          title: $t('page.dashboard.workspace'),
        },
      },
    ],
  },
];

export default routes;
