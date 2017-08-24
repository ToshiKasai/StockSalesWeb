import Vue from 'vue'
import axios from 'axios'
import moment from 'moment'
import 'moment/locale/ja'

// 追加機能
import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/ja'
import 'element-ui/lib/theme-default/index.css'
import Meta from 'vue-meta'
import VueLocalStorage from 'vue-ls'
import Vue2Filters from 'vue2-filters'
import VueSmoothScroll from 'vue-smoothscroll'
import DataTables from 'vue-data-tables'

// アプリケーション
import App from './App'
import router from './router'
import store from './store'

// 外部設定の読み込み
import './config/index'
import './styles/common.scss'
import './styles/animation.less'

// Vue設定
Vue.use(ElementUI, { locale })
Vue.use(Meta)
Vue.use(VueLocalStorage, { namespace: 'vuejs__' })
Vue.use(Vue2Filters)
Vue.use(VueSmoothScroll)
Vue.use(DataTables)

Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

moment.locale('ja')

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
