// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios'
import md5 from "./utils/md5";
import {getLocalStorage,
  setLocalStorage,
  getObjectLocalStorage,
  setObjectLocalStorage,
  removeLocalStorage}
  from "./utils/storage";

Vue.prototype.$axios=axios;
Vue.prototype.$getLocalStorage=getLocalStorage;
Vue.prototype.$setLocalStorage=setLocalStorage;
Vue.prototype.$getObjectLocalStorage=getObjectLocalStorage;
Vue.prototype.$setObjectLocalStorage=setObjectLocalStorage;
Vue.prototype.$removeLocalStorage=removeLocalStorage;
Vue.use(ElementUI);
Vue.use(md5)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
