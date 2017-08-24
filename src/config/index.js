import Vue from 'vue'
import axios from 'axios'
import ElementUI from 'element-ui'
import moment from 'moment'

import store from '@/store'
import router from '@/router'

// axios設定
axios.defaults.baseURL = 'http://192.168.6.60/OrderStockManager/'
// axios.defaults.baseURL = 'http://160.16.178.235/OrderStockManager/'
axios.interceptors.request.use((config) => {
  if (store.getters.isAuthenticated) {
    config.headers['Authorization'] = 'bearer ' + Vue.ls.get('bearer', '')
  } else {
    delete config.headers['Authorization']
  }
  return config
}, (error) => {
  return Promise.reject(error)
})
axios.interceptors.response.use((response) => {
  return response
}, (error) => {
  console.log(error)
  if (error.response.status === 401) {
    if (store.getters.isAuthenticated) {
      ElementUI.Notification.error({
        title: '認証情報が無効になりました',
        message: '時間の経過等により認証情報が無効になりました。再度サインインを行ってください。'
      })
    }
    router.push({ path: '/signin', query: { redirect: router.currentRoute.fullPath } })
    store.dispatch('access_token', {})
    return error
  }
  return Promise.reject(error)
})

Vue.filter('converetDateFormat', function (value, format) {
  try {
    var tmp = moment(value)
    var form = 'YYYY/MM/DD(ddd)'
    if (format !== null && format !== undefined) { form = format }
    return tmp.format(form)
  } catch (e) { return '' }
})
Vue.filter('converetDateTimeFormat', function (value, format) {
  try {
    var tmp = moment(value)
    var form = 'YYYY/MM/DD HH:mm:ss'
    if (format !== null && format !== undefined) { form = format }
    return tmp.format(form)
  } catch (e) { return '' }
})
Vue.filter('deletedMessage', function (value) {
  if (value) {
    return '削除'
  } else {
    return '－'
  }
})
Vue.filter('boolMessage', function (value, trueMessage, falseMessage) {
  if (trueMessage === null || trueMessage === undefined) { trueMessage = 'true' }
  if (falseMessage === null || falseMessage === undefined) { falseMessage = 'false' }
  if (value) {
    return trueMessage
  } else {
    return falseMessage
  }
})

Vue.directive('editinput', {
  update: function (el) {
    // var target = el.children.namedItem('editinput')
    Vue.nextTick(function () {
      // target.focus()
      el.focus()
    })
  }
})
