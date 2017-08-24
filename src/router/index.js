import Vue from 'vue'
import Router from 'vue-router'
import ElementUI from 'element-ui'

import store from '@/store'

Vue.use(Router)

// ルーティング定義
const routes = [
  { path: '/', component: require('./../components/Wellcome.vue') },
  { path: '/signin', component: require('./../components/Signin.vue'), props: (route) => ({ redirect: route.query.redirect }) },
  { path: '/menu', component: require('./../components/Mainmenu.vue'), meta: { requiresAuth: true } },
  {
    path: '/mainte',
    component: require('./../components/Maintenance.vue'),
    children: [
      { path: '', redirect: 'maintemenu' },
      { path: 'maintemenu', component: require('./../components/maintenance/Menu.vue') },
      { path: 'users', component: require('./../components/maintenance/UserList.vue'), meta: { requiresUser: true } },
      { path: 'users/:id/edit', component: require('./../components/maintenance/UserEdit.vue'), name: 'useredit', props: true, meta: { requiresUser: true } },
      { path: 'users/add', component: require('./../components/maintenance/UserAdd.vue'), name: 'useradd', meta: { requiresUser: true } },
      { path: 'users/:id/roles', component: require('./../components/maintenance/UserRoles.vue'), name: 'userroles', props: true, meta: { requiresUser: true } },
      { path: 'users/:id/makers', component: require('./../components/maintenance/UserMakers.vue'), name: 'usermakers', props: true, meta: { requiresUser: true } },
      { path: 'makers', component: require('./../components/maintenance/MakerList.vue'), meta: { requiresMaker: true } },
      { path: 'products', component: require('./../components/maintenance/ProductList.vue'), meta: { requiresProduct: true } },
      { path: 'groups', component: require('./../components/maintenance/GroupList.vue'), meta: { requiresProduct: true } },
      { path: 'groups/:id/edit', component: require('./../components/maintenance/GroupEdit.vue'), name: 'groupedit', props: true, meta: { requiresUser: true } },
      { path: 'groups/add', component: require('./../components/maintenance/GroupAdd.vue'), name: 'groupadd', meta: { requiresUser: true } },
      { path: 'groups/:id/products', component: require('./../components/maintenance/GroupProducts.vue'), name: 'groupproduct', props: true, meta: { requiresUser: true } }
    ],
    meta: { requiresAuth: true }
  },
  { path: '/makerselect', component: require('./../components/application/MakerSelect.vue'), meta: { requiresAuth: true } },
  { path: '/groupselect', component: require('./../components/application/GroupSelect.vue'), meta: { requiresAuth: true } },
  { path: '/salesviews', component: require('./../components/application/ProductList.vue'), meta: { requiresAuth: true } },
  { path: '/salesdetail/:id', component: require('./../components/application/ProductDetail.vue'), name: 'salesdetail', props: true, meta: { requiresAuth: true } },
  { path: '/planupload', component: require('./../components/application/PlanUpload.vue'), meta: { requiresAuth: true } },
  { path: '*', redirect: '/' }
]

const router = new Router({
  scrollBehavior: (to, from, savedPosition) => ({ x: 0, y: 0 }),
  routes: routes
})

// ルーティングエラー時の表示
router.onError((error) => {
  ElementUI.Notification.warning({ title: 'NG', message: error.message })
})

// ルートガード
router.beforeEach((to, from, next) => {
  let result = true
  let auth = store.getters.isAuthenticated
  let notify = { title: '', message: '' }
  if (to.matched.some(record => record.meta.requiresAuth) && store.getters.isAuthenticated === false) {
    result = false
    notify = { title: 'ログインが確認できません', message: 'ログインを行ってください' }
  }
  if ((to.matched.some(record => record.meta.requiresAdmin) && store.getters.isAdminRole === false) ||
    (to.matched.some(record => record.meta.requiresUser) && store.getters.isUserRole === false) ||
    (to.matched.some(record => record.meta.requiresMaker) && store.getters.isMakerRole === false) ||
    (to.matched.some(record => record.meta.requiresGroup) && store.getters.isGroupRole === false) ||
    (to.matched.some(record => record.meta.requiresProduct) && store.getters.isProductRole === false) ||
    (to.matched.some(record => record.meta.requiresLogview) && store.getters.isLogviewRole === false)) {
    result = false
    notify = { title: '機能が利用できません', message: '権限が不足しているために機能を利用することが出来ません' }
  }

  if (result === false) {
    // next(new Error("遷移できんぞ"))
    ElementUI.Notification.error(notify)
    if (auth === false) {
      next({ path: '/signin', query: { redirect: to.fullPath } })
    } else {
      next(false)
    }
  } else {
    next()
  }
})

export default router
