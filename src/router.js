import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import WorldView from './views/WorldView.vue'
import RecordView from './views/RecordView.vue'
import PortraitView from './views/PortraitView.vue'
import ImageView from './views/ImageView.vue'
import NotFound from './views/NotFound.vue'
import { store, setTheme, triggerHexWipe, WORLDS_FALLBACK } from './store.js'

const KNOWN = () => ({ ...WORLDS_FALLBACK, ...store.worlds })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/404', name: 'notfound', component: NotFound },
    { path: '/:world', name: 'world', component: WorldView },
    { path: '/:world/records/:id/c:chapter', name: 'record', component: RecordView },
    { path: '/:world/portraits/:id', name: 'portrait', component: PortraitView },
    { path: '/:world/images/:id', name: 'image', component: ImageView },
    { path: '/:pathMatch(.*)*', name: '404', component: NotFound },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const w = to.params.world
  if (!w) return true
  const worlds = KNOWN()
  if (worlds[w]) {
    setTheme(w)
    return true
  }
  if (to.name === 'world' || to.name === 'record' || to.name === 'portrait' || to.name === 'image') {
    return { name: 'notfound' }
  }
  return true
})

router.afterEach((to, from) => {
  if (from.name && to.fullPath !== from.fullPath) {
    triggerHexWipe()
  }
})

export default router
