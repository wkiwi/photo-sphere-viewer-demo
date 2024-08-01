import { createRouter, createWebHistory } from 'vue-router'
import HomeIndex from '@/views/HomeIndex.vue'

// 路由配置
const routes = [{ path: '/', component: HomeIndex, name: 'HomeIndex' }]

// 创建router实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
