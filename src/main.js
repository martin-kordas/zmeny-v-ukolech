import Vue from 'vue'
import App from './App.vue'
import VueLogger from 'vuejs-logger'
import router from "./router"
import "./filters/cisla.filter"

import 'bootstrap/dist/css/bootstrap.min.css'
//import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/main.css';

const isProduction = process.env.NODE_ENV === 'production'

Vue.use(VueLogger, { logLevel: isProduction? 'error': 'debug' })
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
