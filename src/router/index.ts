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
  DataAnalysis,
  Document,
  User,
  Setting,
  Monitor
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
            menuOrder: 2
          },
          children: [
            {
              path: 'organization',
              name: 'Organization',
              component: () => import('../views/system/OrganizationManage.vue'),
              meta: {
                title: '组织架构',
                requiresAuth: true,
                menuOrder: 1
              }
            },
            {
              path: 'dict',
              name: 'Dict',
              component: () => import('../views/system/DictManage.vue'),
              meta: {
                title: '字典管理',
                requiresAuth: true,
                menuOrder: 2
              }
            },
            {
              path: 'bank',
              name: 'Bank',
              component: () => import('../views/common/CommonPage.vue'),
              meta: {
                title: '银行管理',
                requiresAuth: true,
                menuOrder: 3
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
router.beforeEach((to, from, next) => {
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