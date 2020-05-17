import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Mining from '@/components/Mining'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/mining',
      name: 'mining',
      component: Mining
    },
    {
      path: '*',
      redirect: '/home'
    }
  ]
})
