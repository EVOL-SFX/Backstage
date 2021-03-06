import Vue from 'vue'
import VueRouter from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.use(VueRouter)

const routes = [
  { path: '/login', name: 'login', component: () => import('@/views/login') },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/views/home'),
    redirect: '/welcome', // 路由重定向
    children: [
      // 欢迎页面子路由配置
      { path: '/welcome', name: 'welcome', component: () => import('@/views/welcome') },
      { path: '/article', name: 'article', component: () => import('@/views/article') },
      { path: '/material', name: 'material', component: () => import('@/views/material') },
      { path: '/articleadd', name: 'articleadd', component: () => import('@/views/articleadd') },
      { path: '/articleedit/:aid', name: 'articleedit', component: () => import('@/views/articleedit') },
      { path: '/account', name: 'account', component: () => import('@/views/account') },
      { path: '/fans', name: 'fans', component: () => import('@/views/fans') },
      { path: '/discuss', name: 'discuss', component: () => import('@/views/discuss') }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 守卫设置
// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 开启进度条
  NProgress.inc()
  let userinfo = window.sessionStorage.getItem('userinfo')

  // 如果其他应用要用userinfo用户信息，其是字符串类型，需要通过JSON.parse()转换后才可以使用

  // 用户如果是"非登录"状态，并且其还要访问 非登录 页面，那么就强制登录去
  if (!userinfo && to.path !== '/login') {
    // 路由导航到登录页面
    return next('/login')
  }
  next()// return的返回值
})
router.afterEach((to, from, next) => {
  // 完成进度条显示了
  NProgress.done()
})

export default router
