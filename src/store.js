import { reactive } from 'vue'
import { api } from './api.js'
import { gsap, ease_out } from './motion.js'

export const WORLDS_FALLBACK = {
  'cosmic-broth': {
    id: 'cosmic-broth',
    name: '宇宙汤',
    color: '#178ec5',
    time_diff: '15',
    introduce: '以荒谬，赛博朋克，搞笑和黑色幽默为主题的星际世界观。这个宇宙的逻辑糟糕透顶，好在有志者必得所求之物。',
    image_url: 'https://cdn.cosmicbroth.com/1_A561_FDD_060_AE_1_B19_AF_95526_C401_FD_7_A_a9228caba2.png',
    star_image_url: 'https://cdn.cosmicbroth.com/star_80153f61f1.png',
    x: 40, y: 60, r: 1,
    map: {
      records: { yuzhoutang: { id: 'yuzhoutang', name: '宇宙汤' } },
      portraits: { database: { id: 'database', name: 'database' } },
      images: { vlog: { id: 'vlog', name: 'Travel log' } },
    },
  },
  checkerboard: {
    id: 'checkerboard',
    name: '地平世界',
    color: '#4BC0AB',
    time_diff: '100',
    introduce: '即为不科学，不现实的扁平世界——棋盘上世界。在此收录了偏离棋牌室中主线轨道的棋盘故事和一些假想的可能性。',
    image_url: 'https://cdn.cosmicbroth.com/IMG_0871_20250824_220223_78eac5900d.PNG',
    star_image_url: 'https://cdn.cosmicbroth.com/star_7ace939b54.png',
    x: 65, y: 40, r: 1.5,
    map: {
      records: { fate: { id: 'fate', name: '命数' } },
      portraits: { dreamer: { id: 'dreamer', name: 'Dreamer' } },
      images: { maps: { id: 'maps', name: 'Atlas' } },
    },
  },
  'fogbound-box': {
    id: 'fogbound-box',
    name: '迷雾中古',
    color: '#DEC466',
    time_diff: '20',
    introduce: 'Fogbound Box，被迷雾隔离的箱子，即为暗箱。在这个匣子中，是一些独立运行的故事。',
    image_url: 'https://cdn.cosmicbroth.com/IMG_5786_20250817_150321_709d585911.PNG',
    star_image_url: 'https://cdn.cosmicbroth.com/star_5cf82170c3.png',
    x: 55, y: 55, r: 0.6,
    map: {
      records: { Sevener: { id: 'Sevener', name: 'Sevener' } },
      portraits: { rumor: { id: 'rumor', name: 'rumor' } },
      images: { darkroom: { id: 'darkroom', name: 'darkroom' } },
    },
  },
  'meta-room': {
    id: 'meta-room',
    name: '棋盘室',
    color: '#9B3B62',
    time_diff: '50',
    introduce: '克苏鲁神话风格的棋牌室。在上层叙事中，众神在名为世界的游戏沙盘中掷下决定命运的骰子。',
    image_url: 'https://cdn.cosmicbroth.com/original333_751444d005.png',
    star_image_url: 'https://cdn.cosmicbroth.com/star_cd814e141a.png',
    x: 45, y: 40, r: 0.6,
    map: {
      records: {
        goldfish: { id: 'goldfish', name: '金鱼' },
        guovssahas: { id: 'guovssahas', name: '天籁' },
        sickday: { id: 'sickday', name: '病栋' },
      },
      portraits: { Chessmen: { id: 'Chessmen', name: 'Chessmen' } },
      images: { chessboard: { id: 'chessboard', name: 'chessboard' } },
    },
  },
}

export const store = reactive({
  ready: false,
  worlds: { ...WORLDS_FALLBACK },
  introduces: {},
  routerMap: {},
  unknownWorlds: [
    { x: 60, y: 25, r: 1, image_url: 'https://cdn.cosmicbroth.com/star_unknown_1_0edb617d31.png' },
    { x: 20, y: 55, r: 1, image_url: 'https://cdn.cosmicbroth.com/star_unknown_0_87b7b9819b.png' },
  ],
  outlines: {},
  currentWorldId: 'cosmic-broth',
  selectedStarId: null,
  loadingVisible: true,
  loadingReady: false,
  systemOpen: false,
  instructionOpen: false,
  consoleOpen: false,
  emergencyOpen: false,
  adOpen: false,
  hasDragged: false,
  menuOpen: false,
  imageview: { open: false, src: '' },
  shipErrorType: null,
  ease_in: 'ease_in',
  ease_out: 'ease_out',
  ease_inout: 'ease_inout',
  scroll_progress: 0,
})

let _loading = null
let _pendingShow = []
let _ship = { play() {}, pause() {} }
let _checkTimer = null

export function registerLoading(api) {
  _loading = api
  if (!api) return
  const queued = _pendingShow.splice(0)
  queued.forEach((fn) => fn())
}

export function registerShip(api) {
  if (api) _ship = api
}

export function playShip() {
  _ship.play && _ship.play()
}

export function pauseShip() {
  _ship.pause && _ship.pause()
}

export function show_loading(next) {
  const run = () => {
    if (_loading && _loading.show) _loading.show(next)
    else if (typeof next === 'function') next()
  }
  if (_loading) run()
  else _pendingShow.push(run)
}

export function hidden_loading() {
  if (_loading && _loading.hidden) _loading.hidden()
}

export function check_loading() {
  if (_checkTimer) clearInterval(_checkTimer)
  _checkTimer = setInterval(() => {
    if (document.readyState === 'complete') {
      clearInterval(_checkTimer)
      _checkTimer = null
      window.scrollTo(0, 0)
      hidden_loading()
    }
  }, 300)
}

export function worldList() {
  return Object.values(store.worlds)
}

export function currentWorld() {
  return store.worlds[store.currentWorldId] || store.worlds['cosmic-broth']
}

export function setTheme(worldId) {
  if (!store.worlds[worldId]) return
  store.currentWorldId = worldId
  const color = store.worlds[worldId].color
  try {
    gsap.to('body', { '--color_theme': color, duration: 0.5, ease: ease_out })
  } catch {
    document.documentElement.style.setProperty('--color_theme', color)
  }
  document.documentElement.style.setProperty('--color_theme', color)
}

export function openSystem(worldId) {
  if (worldId) setTheme(worldId)
  store.selectedStarId = null
  store.systemOpen = true
}

export function closeSystem() {
  store.systemOpen = false
}

export function showImageview(src) {
  store.imageview.src = src
  store.imageview.open = true
}

export function hideImageview() {
  store.imageview.open = false
}

export function toggleMenu(v) {
  store.menuOpen = typeof v === 'boolean' ? v : !store.menuOpen
}

export function worldYearDate(world) {
  const d = new Date()
  const diff = parseInt(world?.time_diff || '0', 10) || 0
  const y = d.getFullYear() + diff
  const pad = (n) => String(n).padStart(2, '0')
  return `${y}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`
}

export async function boot() {
  const [worlds, introduces, routerMap, unknown] = await Promise.all([
    api.overview(),
    api.introduces(),
    api.router(),
    api.unknownWorlds(),
  ])
  if (worlds && typeof worlds === 'object') {
    for (const [id, w] of Object.entries(worlds)) {
      store.worlds[id] = { ...store.worlds[id], ...w }
    }
  }
  if (introduces) store.introduces = introduces
  if (routerMap) store.routerMap = routerMap
  if (Array.isArray(unknown) && unknown.length) store.unknownWorlds = unknown
  setTheme(store.currentWorldId)
  store.ready = true
}

export const ADS = [
  {
    title: '喆仙租房请加群',
    scrolltext: '喆仙租房 | 现房 | 实拍 | 喆仙租房 | 现房 | 实拍 | 喆仙租房 | 现房 | 实拍 | ',
    info: '位置绝佳，远离公墓，闹鬼少。全屋通透。家具家电全新。无拥挤感。广告在房在。',
  },
  {
    title: '单击进入金鱼缸',
    scrolltext: '类人 | 多眼 | 纯爱 | 绿色皮肤 | 类人 | 多眼 | 纯爱 | ',
    info: '点击广告，立刻进入。欢迎会员。更多观看：[母神星观光]，[虫族伴侣与我]，[O0347眩晕时光]，[单击进入金鱼缸]，[海盗之王]。',
  },
]
