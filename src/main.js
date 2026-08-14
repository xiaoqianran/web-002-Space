import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import './styles/global.css'
import 'lenis/dist/lenis.css'
import { local, cdn } from './assets.js'

const BASE = import.meta.env.BASE_URL
const font = document.createElement('style')
font.textContent = `@font-face{font-family:zpix;src:url('${BASE}fonts/zpix.ttf');font-display:swap}`
document.head.appendChild(font)

const app = createApp(App)
app.config.globalProperties.$asset = (p) => local(p)
app.config.globalProperties.$cdn = (u) => cdn(u)
app.use(router).mount('#app')
