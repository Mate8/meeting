import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import './plugins/element.js'
import WebChannel from './plugins/webchannel'
import CreateHttp from './plugins/http'
import { urls } from './plugins/urls'
const axios = require('axios')

// eslint-disable-next-line camelcase
function CreateToken (round_num) {
  // eslint-disable-next-line camelcase
  const result_list = []
  const consttable = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 }
  const _ = require('crypto').createHash('md5')
  const $ = require('crypto').createHash('sha256')
  const date = new Date()
  date.setMilliseconds(0)
  // eslint-disable-next-line camelcase
  _.update(parseInt(date.getTime() / 1000).toString() + round_num.toString())
  // eslint-disable-next-line camelcase
  $.update(parseInt(date.getTime() / 1000).toString() + round_num.toString())
  const result = _.digest('hex').slice(0, 16) + $.digest('hex').slice(32, 48)
  new Array(4).fill(true).forEach((_, index) => {
    index++
    new Array(4).fill(true).forEach(($, num) => {
      num++
      const firstnum = result.slice(index * 8 - 8, index * 8); const secondnum = result.slice(num * 8 - 8, num * 8); let firstsum = 1; let secondsum = 1
      for (const item in firstnum) {
        firstsum ^= consttable[firstnum[item]]
      }
      for (const item in secondnum) {
        secondsum ^= consttable[secondnum[item]]
      }
      result_list.push(result.slice(0, 16) + Math.abs(parseInt(firstsum | secondsum)) + result.slice(16))
    })
  })
  // eslint-disable-next-line camelcase
  return result_list
}

Vue.prototype.CreateToken = CreateToken

Vue.config.productionTip = false

// 创建HTTP请求源
Vue.prototype.CreateHttpSource = function ($) {
  const $http = new CreateHttp(`//${JSON.parse($).request_url}`, urls)
  $http.SetRequestInter((config) => {
    config.headers.common.token = CreateToken(JSON.parse($).code).join(',')
    config.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    return config
  })
  if (JSON.parse($).websocket_url) {
    const $ws = new WebChannel(`ws://${JSON.parse($).websocket_url}`, true, true)
    $ws.CreateEvent('open', () => {
      $ws.SendMessage({ code: 0, tokens: CreateToken(JSON.parse($).code).join(','), type: 'screen', ModuleName: 'meeting' })
    })
    $ws.Connect()
    Vue.prototype.$ws = $ws
  }
  Vue.prototype.$http = $http
}

Vue.prototype.$http = axios

Vue.prototype.GetEnData = function () {
  const name = store.state.user.BaseKey || window.document.getElementById('_').value
  this.$store.commit('user/SetDeCode', window.decodeURIComponent(store.state.user.private_key || window.document.getElementById('$').value))
  window.document.getElementById('_').remove()
  window.document.getElementById('$').remove()
  return name
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
