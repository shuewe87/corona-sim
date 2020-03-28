import Vue from 'vue'
import VueI18n from 'vue-i18n'
import App from './App.vue'
import messages from './lang';

Vue.use(VueI18n);
Vue.config.productionTip = false


if(window.lang==undefined){
  window.lang = "en";
}

const i18n = new VueI18n({
  locale: window.lang, // set locale
  fallbackLocale: "en",
  messages, // set locale messages
})
var app = new Vue({ i18n,
  render: h => h(App),
}).$mount('#app');

window.appdata = {instance: app.$children[0],humans: app.$children[0].humans, infected: app.$children[0].infected, survived : app.$children[0].survived, dead : app.$children[0].dead,neverInfected : app.$children[0].neverInfected};


window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app.constructor;
Vue.config.devtools = true;


