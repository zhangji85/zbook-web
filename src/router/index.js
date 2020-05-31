import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'

Vue.use(Router)

export default new Router({
  mode:'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: resolve => require(['../views/base'], resolve),
      children:[
        {
          path: '/HelloWorld',
          name: 'HelloWorld',
          component: resolve => require(['../components/HelloWorld'], resolve)
        },
      ]
    }
  ]
})
