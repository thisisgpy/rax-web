export type MenuListType = {
  id: number
  path: string // 路由路径
  name: string // 组件名称
  component?: string // 组件加载路径
  meta: {
    title: string // 菜单名称
    icon?: string // 菜单图标
    isHide?: boolean // 是否在菜单中隐藏
    keepAlive: boolean // 是否缓存
    authList?: Array<string> // 可操作权限
  }
  children?: MenuListType[] // 子菜单
}