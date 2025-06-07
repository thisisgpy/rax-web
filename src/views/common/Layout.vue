<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authMockApi } from '@/api/modules/authMock'
import logoImage from '@/assets/logo_64x64.png'
import GlobalSettings from '@/components/GlobalSettings.vue'
import { useCurrencySettings } from '@/composables/useCurrencySettings'
import { 
  Fold, 
  Expand,
  Setting,
  User,
  SwitchButton,
  ArrowDown
} from '@element-plus/icons-vue'

/** 用户信息 */
const userInfo = ref<UserInfo | null>(null)

/** 侧边栏折叠状态 */
const isCollapsed = ref(false)

/** 设置弹窗显示状态 */
const showSettings = ref(false)

/** 路由实例 */
const router = useRouter()
const route = useRoute()

/** 货币设置 */
const { globalSettings, getCurrentCurrencyInfo } = useCurrencySettings()

/** 菜单项接口 */
interface MenuItem {
  index: string
  title: string
  icon?: any
  path?: string
  children?: MenuItem[]
}

/** 从路由配置生成菜单 */
const menuItems = computed(() => {
  const routes = router.getRoutes()
  const menus: MenuItem[] = []
  
  // 找到 Layout 路由
  const layoutRoute = routes.find(route => route.name === 'Layout')
  if (!layoutRoute || !layoutRoute.children) {
    return menus
  }
  
  // 过滤出需要显示在菜单中的子路由
  const menuRoutes = layoutRoute.children
    .filter(route => {
      const meta = route.meta as any
      return meta?.requiresAuth && !meta?.hidden && meta?.menuOrder
    })
    .sort((a, b) => {
      const aOrder = (a.meta as any)?.menuOrder || 999
      const bOrder = (b.meta as any)?.menuOrder || 999
      return aOrder - bOrder
    })

  menuRoutes.forEach((route, index) => {
    const meta = route.meta as any
    const menuItem: MenuItem = {
      index: (index + 1).toString(),
      title: meta.title,
      icon: meta.icon,
      path: '/' + route.path
    }

    // 处理子路由
    if (route.children && route.children.length > 0) {
      menuItem.children = route.children.map((child, childIndex) => ({
        index: `${index + 1}-${childIndex + 1}`,
        title: (child.meta as any)?.title || child.name as string,
        path: '/' + route.path + '/' + child.path
      }))
    }

    menus.push(menuItem)
  })

  return menus
})

/** 当前选中的菜单 */
const activeMenu = ref('1')

/** 加载用户信息 */
const loadUserInfo = () => {
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    userInfo.value = JSON.parse(userInfoStr)
  }
}

/** 初始化当前激活菜单 */
const initActiveMenu = () => {
  const currentPath = route.path
  
  // 查找匹配当前路径的菜单项
  const findMenuByPath = (items: MenuItem[], path: string): string | null => {
    for (const item of items) {
      if (item.path === path) {
        return item.index
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.path === path) {
            return child.index
          }
        }
      }
    }
    return null
  }
  
  const menuIndex = findMenuByPath(menuItems.value, currentPath)
  if (menuIndex) {
    activeMenu.value = menuIndex
  }
}

/** 切换侧边栏折叠状态 */
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

/** 处理菜单选择 */
const handleMenuSelect = (index: string) => {
  activeMenu.value = index
  
  // 查找对应的菜单项并导航
  const findMenuItemByIndex = (items: MenuItem[], targetIndex: string): MenuItem | null => {
    for (const item of items) {
      if (item.index === targetIndex) {
        return item
      }
      if (item.children) {
        const found = findMenuItemByIndex(item.children, targetIndex)
        if (found) return found
      }
    }
    return null
  }
  
  const menuItem = findMenuItemByIndex(menuItems.value, index)
  if (menuItem?.path) {
    router.push(menuItem.path)
  }
}

/** 打开设置弹窗 */
const openSettings = () => {
  showSettings.value = true
}

/** 处理设置变更 */
const handleSettingsChange = (settings: any) => {
  console.log('Layout: 全局设置已更新:', settings)
  // 强制触发全局状态更新
  globalSettings.value = { ...settings }
}

/** 处理登出 */
const handleLogout = async () => {
  try {
    await authMockApi.logout()
  } catch (error) {
    console.error('登出请求失败:', error)
  } finally {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userInfo')
    location.href = '/login'
  }
}

onMounted(() => {
  loadUserInfo()
  initActiveMenu()
})
</script>

<template>
  <div class="admin-layout">
    <el-container class="layout-container">
      <!-- 侧边栏 -->
      <el-aside class="layout-sidebar" :width="isCollapsed ? '64px' : '200px'">
        <!-- Logo 区域 -->
        <div class="sidebar-logo">
          <div class="logo-content">
            <div class="logo-icon">
              <img :src="logoImage" alt="融安心" class="logo-image" />
            </div>
            <transition name="fade">
              <span v-show="!isCollapsed" class="logo-text">融安心</span>
            </transition>
          </div>
        </div>

        <!-- 导航菜单 -->
        <el-scrollbar class="sidebar-scrollbar">
          <el-menu
            :default-active="activeMenu"
            :collapse="isCollapsed"
            :unique-opened="true"
            background-color="#304156"
            text-color="#bfcbd9"
            active-text-color="#409eff"
            @select="handleMenuSelect"
          >
            <template v-for="item in menuItems" :key="item.index">
              <!-- 有子菜单的项 -->
              <el-sub-menu v-if="item.children" :index="item.index">
                <template #title>
                  <el-icon><component :is="item.icon" /></el-icon>
                  <span>{{ item.title }}</span>
                </template>
                <el-menu-item
                  v-for="child in item.children"
                  :key="child.index"
                  :index="child.index"
                >
                  {{ child.title }}
                </el-menu-item>
              </el-sub-menu>
              
              <!-- 无子菜单的项 -->
              <el-menu-item v-else :index="item.index">
                <el-icon><component :is="item.icon" /></el-icon>
                <span>{{ item.title }}</span>
              </el-menu-item>
            </template>
          </el-menu>
        </el-scrollbar>
      </el-aside>

      <!-- 右侧主要内容区域 -->
      <el-container class="layout-main">
        <!-- 顶部导航栏 -->
        <el-header class="layout-header">
          <div class="header-left">
            <!-- 折叠按钮 -->
            <el-button
              text
              :icon="isCollapsed ? Expand : Fold"
              @click="toggleSidebar"
              class="collapse-btn"
            />
          </div>
          
          <div class="header-right">
            <!-- 设置按钮 -->
            <el-button 
              text 
              :icon="Setting" 
              class="header-btn"
              @click="openSettings"
              title="全局设置"
            />
            
            <!-- 用户下拉菜单 -->
            <el-dropdown trigger="click" class="user-dropdown">
              <div class="user-info">
                <el-avatar 
                  :size="28" 
                  :src="userInfo?.avatar"
                  class="user-avatar"
                >
                  {{ userInfo?.realName?.charAt(0) || userInfo?.username?.charAt(0) }}
                </el-avatar>
                <span class="username">{{ userInfo?.realName || userInfo?.username }}</span>
                <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item :icon="User">个人中心</el-dropdown-item>
                  <el-dropdown-item :icon="Setting">账户设置</el-dropdown-item>
                  <el-dropdown-item divided :icon="SwitchButton" @click="handleLogout">
                    退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 主内容区域 - 使用 router-view 加载页面组件 -->
        <el-main class="layout-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>

    <!-- 全局设置弹窗 -->
    <GlobalSettings 
      v-model:visible="showSettings"
      @settings-change="handleSettingsChange"
    />
  </div>
</template>

<style scoped>
.admin-layout {
  width: 100vw;
  height: 100vh;
  background: #f0f2f5;
}

.layout-container {
  width: 100%;
  height: 100vh;
}

/* ==================== 侧边栏样式 ==================== */
.layout-sidebar {
  background: #304156;
  transition: width 0.3s;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
}

.sidebar-logo {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2b3a4a;
  border-bottom: 1px solid #1d2935;
  padding: 0;
  width: 100%;
}

.logo-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.logo-text {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Logo 在折叠状态下的样式 */
.layout-sidebar[style*="width: 64px"] .logo-content {
  justify-content: center;
}

.layout-sidebar[style*="width: 64px"] .logo-content .logo-icon {
  margin: 0;
}

.sidebar-scrollbar {
  height: calc(100vh - 48px);
}

.sidebar-scrollbar :deep(.el-scrollbar__view) {
  padding: 12px 0;
}

/* 折叠状态下减少 padding */
.layout-sidebar[style*="width: 64px"] .sidebar-scrollbar :deep(.el-scrollbar__view) {
  padding: 12px 0;
}

.sidebar-scrollbar :deep(.el-menu) {
  border-right: none;
}

.sidebar-scrollbar :deep(.el-menu-item),
.sidebar-scrollbar :deep(.el-sub-menu__title) {
  height: 40px;
  line-height: 40px;
  margin: 0 8px 3px;
  border-radius: 6px;
}

.sidebar-scrollbar :deep(.el-menu-item.is-active) {
  background-color: #409eff !important;
  color: #ffffff !important;
}

.sidebar-scrollbar :deep(.el-menu-item:hover),
.sidebar-scrollbar :deep(.el-sub-menu__title:hover) {
  background-color: #263445 !important;
}

/* ==================== 折叠状态样式 ==================== */
.sidebar-scrollbar :deep(.el-menu--collapse) {
  width: 64px;
}

.sidebar-scrollbar :deep(.el-menu--collapse .el-menu-item),
.sidebar-scrollbar :deep(.el-menu--collapse .el-sub-menu__title) {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 12px 3px;
  padding: 0 !important;
  text-align: center;
  width: 40px;
  height: 40px;
}

.sidebar-scrollbar :deep(.el-menu--collapse .el-menu-item .el-icon),
.sidebar-scrollbar :deep(.el-menu--collapse .el-sub-menu__title .el-icon) {
  margin: 0 !important;
  font-size: 16px;
}

.sidebar-scrollbar :deep(.el-menu--collapse .el-menu-item span),
.sidebar-scrollbar :deep(.el-menu--collapse .el-sub-menu__title span) {
  display: none;
}

.sidebar-scrollbar :deep(.el-menu--collapse .el-sub-menu .el-icon.el-sub-menu__icon-arrow) {
  display: none;
}

/* ==================== 头部样式 ==================== */
.layout-header {
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 48px !important;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.collapse-btn {
  font-size: 16px;
  color: #5a6169;
  padding: 6px;
}

.collapse-btn:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: 0;
}

.header-btn {
  font-size: 16px;
  color: #5a6169;
  padding: 6px;
}

.header-btn:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

.user-dropdown {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-size: 14px;
  color: #303133;
}

.dropdown-icon {
  font-size: 12px;
  color: #909399;
}

/* ==================== 主内容样式 ==================== */
.layout-content {
  padding: 24px;
  background: #f0f2f5;
  overflow-y: auto;
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .layout-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1001;
  }

  .layout-content {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .header-right {
    gap: 8px;
  }

  .username {
    display: none;
  }
}
</style> 