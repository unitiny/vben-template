import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:building-2',
      order: 1,
      title: '组织架构',
    },
    name: 'Organization',
    path: '/organization',
    children: [
      {
        name: 'OrganizationList',
        path: '/organization/list',
        component: () => import('#/views/organization/list/index.vue'),
        meta: {
          icon: 'lucide:building',
          title: '组织管理',
        },
      },
      {
        name: 'DepartmentList',
        path: '/organization/department',
        component: () => import('#/views/organization/department/index.vue'),
        meta: {
          icon: 'lucide:git-branch',
          title: '部门管理',
        },
      },
      {
        name: 'OrganizationTree',
        path: '/organization/tree',
        component: () => import('#/views/organization/tree/index.vue'),
        meta: {
          icon: 'lucide:folder-tree',
          title: '架构树',
        },
      },
    ],
  },
];

export default routes;
