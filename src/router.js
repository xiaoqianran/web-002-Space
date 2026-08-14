import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import WorldView from './views/WorldView.vue'
import RecordView from './views/RecordView.vue'
import PortraitView from './views/PortraitView.vue'
import ImageView from './views/ImageView.vue'
import NotFound from './views/NotFound.vue'
import { store, setTheme, show_loading, WORLDS_FALLBACK } from './store.js'

const KNOWN = () => ({ ...WORLDS_FALLBACK, ...store.worlds })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/404', name: 'notfound', component: NotFound },
    { path: '/:world', name: 'world', component: WorldView },
    { path: '/:world/records/:id/c:chapter', name: 'record', component: RecordView },
    { path: '/:world/records/:id', redirect: (to) => `/${to.params.world}/records/${to.params.id}/c1` },
    { path: '/:world/portraits/:id', name: 'portrait', component: PortraitView },
    { path: '/:world/images/:id', name: 'image', component: ImageView },
    { path: '/:pathMatch(.*)*', name: '404', component: NotFound },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const w = to.params.world
  if (w) {
    const worlds = KNOWN()
    if (worlds[w]) {
      setTheme(w)
    } else if (to.name === 'world' || to.name === 'record' || to.name === 'portrait' || to.name === 'image') {
      next({ name: 'notfound' })
      return
    }
  }
  const chapterHop =
    from.name === 'record' &&
    to.name === 'record' &&
    from.params.world === to.params.world &&
    from.params.id === to.params.id
  if (chapterHop) {
    next()
    return
  }
  const inWorld = (n) => n === 'world' || n === 'record' || n === 'portrait' || n === 'image'
  const sameWorldHop =
    from.params.world &&
    to.params.world &&
    from.params.world === to.params.world &&
    inWorld(from.name) &&
    inWorld(to.name)
  if (sameWorldHop) {
    next()
    return
  }
  show_loading(next)
})

export default router
