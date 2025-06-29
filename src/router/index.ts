import { createRouter, createWebHistory } from 'vue-router'
import type { Component } from 'vue'

// 定义路由元数据类型
interface RouteMeta {
  title: string
  requiresAuth: boolean
  icon?: Component
  hidden?: boolean
  menuOrder?: number
}

// 导入图标
import { 
  House,
  Setting,
  Box
} from '@element-plus/icons-vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/auth/Login.vue'),
      meta: {
        title: '用户登录',
        requiresAuth: false,
        hidden: true
      }
    },
    {
      path: '/',
      name: 'Layout',
      component: () => import('../views/common/Layout.vue'),
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/dashboard/Dashboard.vue'),
          meta: {
            title: '首页',
            requiresAuth: true,
            icon: House,
            menuOrder: 1
          }
        },
        {
          path: 'system',
          name: 'System',
          meta: {
            title: '系统配置',
            requiresAuth: true,
            icon: Setting,
            menuOrder: 9
          },
          children: [
            {
              path: 'organization',
              name: 'Organization',
              component: () => import('../views/system/organization/index.vue'),
              meta: {
                title: '组织架构',
                requiresAuth: true,
                menuOrder: 1
              }
            },
            {
              path: 'dict',
              name: 'Dict',
              component: () => import('../views/system/dict/index.vue'),
              meta: {
                title: '字典管理',
                requiresAuth: true,
                menuOrder: 2
              }
            },
            {
              path: 'bank',
              name: 'Bank',
              component: () => import('../views/system/bank/index.vue'),
              meta: {
                title: '银行管理',
                requiresAuth: true,
                menuOrder: 3
              }
            },
            {
              path: 'user',
              name: 'UserManagement',
              component: () => import('../views/system/user/index.vue'),
              meta: {
                title: '用户管理',
                requiresAuth: true,
                menuOrder: 4
              }
            },
            {
              path: 'role',
              name: 'RoleManagement',
              component: () => import('../views/system/role/index.vue'),
              meta: {
                title: '角色管理',
                requiresAuth: true,
                menuOrder: 5
              }
            },
            {
              path: 'resource',
              name: 'ResourceManagement',
              component: () => import('../views/system/resource/index.vue'),
              meta: {
                title: '资源管理',
                requiresAuth: true,
                menuOrder: 6
              }
            }
          ]
        },
        {
          path: 'asset',
          name: 'Asset',
          meta: {
            title: '资产管理',
            requiresAuth: true,
            icon: Box,
            menuOrder: 3
          },
          children: [
            {
              path: 'fixed',
              name: 'FixedAsset',
              component: () => import('../views/asset/fixed/index.vue'),
              meta: {
                title: '固定资产',
                requiresAuth: true,
                menuOrder: 1
              }
            }
          ]
        }
      ]
    }
  ]
})

// 导出路由配置的类型
export type { RouteMeta }

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  if (to.meta?.title) {
    document.title = `${to.meta.title} - 融安心`
  }
  
  // 检查是否需要登录
  const token = localStorage.getItem('token')
  
  if (to.meta?.requiresAuth && !token) {
    // 需要登录但没有token，跳转到登录页
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录用户访问登录页，跳转到仪表板
    next('/dashboard')
  } else {
    next()
  }
})

export default router 