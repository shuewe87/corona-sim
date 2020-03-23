import Vue from 'vue'
import App from './App.vue'


Vue.config.productionTip = false
var app = new Vue({
  render: h => h(App),
}).$mount('#app')
app.width = 100

window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app.constructor;
Vue.config.devtools = true;


