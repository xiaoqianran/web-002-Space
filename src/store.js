import { reactive } from 'vue'
import { api } from './api.js'
import { gsap, ease_out } from './motion.js'
import { cdn, localizeDeep, preload, criticalBootUrls } from './assets.js'

export const WORLDS_FALLBACK = localizeDeep({
  'cosmic-broth': {
    id: 'cosmic-broth',
    name: '宇宙汤',
    color: '#178ec5',
    time_diff: '15',
    introduce: '以荒谬，赛博朋克，搞笑和黑色幽默为主题的星际世界观。这个宇宙的逻辑糟糕透顶，好在有志者必得所求之物。',
    image_url: '/cdn/1_A561_FDD_060_AE_1_B19_AF_95526_C401_FD_7_A_a9228caba2.png',
    star_image_url: '/cdn/star_80153f61f1.png',
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
    image_url: '/cdn/IMG_0871_20250824_220223_78eac5900d.PNG',
    star_image_url: '/cdn/star_7ace939b54.png',
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
    image_url: '/cdn/IMG_5786_20250817_150321_709d585911.PNG',
    star_image_url: '/cdn/star_5cf82170c3.png',
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
    image_url: '/cdn/original333_751444d005.png',
    star_image_url: '/cdn/star_cd814e141a.png',
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
})

export const store = reactive({
  ready: false,
  worlds: { ...WORLDS_FALLBACK },
  introduces: {},
  routerMap: {},
  unknownWorlds: localizeDeep([
    { x: 60, y: 25, r: 1, image_url: '/cdn/star_unknown_1_0edb617d31.png' },
    { x: 20, y: 55, r: 1, image_url: '/cdn/star_unknown_0_87b7b9819b.png' },
  ]),
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
  adCountdown: 1,
  currentAd: null,
  currentEmergency: null,
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
let _criticalReady = Promise.resolve()
let _dialogTimer = null
let _adCountAnim = null

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

export function markCriticalReady(p) {
  _criticalReady = Promise.resolve(p)
}

/** Honeycomb is a transition, not a wait-for-all-images gate. */
export function check_loading() {
  if (_checkTimer) {
    clearTimeout(_checkTimer)
    _checkTimer = null
  }
  let done = false
  const finish = () => {
    if (done) return
    done = true
    if (_checkTimer) {
      clearTimeout(_checkTimer)
      _checkTimer = null
    }
    window.scrollTo(0, 0)
    hidden_loading()
  }
  _checkTimer = setTimeout(finish, 800)
  Promise.resolve(_criticalReady).then(finish).catch(finish)
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
  const w = store.worlds[store.currentWorldId]
  const intro = store.introduces?.[store.currentWorldId] || {}
  const thumbs = []
  if (w?.image_url) thumbs.push(w.image_url)
  for (const node of Object.values(intro)) {
    for (const item of Object.values(node || {})) {
      if (item?.image_url) thumbs.push(item.image_url)
    }
  }
  preload(thumbs.slice(0, 8))
}

export function closeSystem() {
  store.systemOpen = false
}

export function showImageview(src) {
  store.imageview.src = cdn(src)
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
  const [worlds, introduces, routerMap, unknown, ads, errors] = await Promise.all([
    api.overview(),
    api.introduces(),
    api.router(),
    api.unknownWorlds(),
    api.ads(),
    api.errors(),
  ])
  if (worlds && typeof worlds === 'object') {
    for (const [id, w] of Object.entries(worlds)) {
      store.worlds[id] = { ...store.worlds[id], ...w }
    }
  }
  if (introduces) store.introduces = introduces
  if (routerMap) store.routerMap = routerMap
  if (Array.isArray(unknown) && unknown.length) store.unknownWorlds = unknown
  if (Array.isArray(ads) && ads.length) ADS.splice(0, ADS.length, ...ads)
  if (Array.isArray(errors) && errors.length) EMERGENCIES.splice(0, EMERGENCIES.length, ...errors)
  setTheme(store.currentWorldId)
  const critical = preload(criticalBootUrls(store.worlds, store.unknownWorlds))
  markCriticalReady(critical)
  store.ready = true
}

export const ADS = [
  {
    title: '喆仙租房请加群',
    scrolltext: '喆仙租房 | 现房 | 实拍 | 喆仙租房 | 现房 | 实拍 | 喆仙租房 | 现房 | 实拍 | ',
    info: '位置绝佳，远离公墓，闹鬼少。全屋通透。家具家电全新。无拥挤感。广告在房在。',
    image: 'img/ads/5.Hb5gBE_Q.jpg',
  },
  {
    title: '单击进入金鱼缸',
    scrolltext: '类人 | 多眼 | 纯爱 | 绿色皮肤 | 类人 | 多眼 | 纯爱 | ',
    info: '点击广告，立刻进入。欢迎会员。更多观看：[母神星观光]，[虫族伴侣与我]，[O0347眩晕时光]，[单击进入金鱼缸]，[海盗之王]。',
    image: 'img/ads/3.Clfc2ouy.gif',
  },
]

export const EMERGENCIES = [
  { quadrant: 1, title: '故障001', log: '第一象限检测到[外来生物入侵]\n→ 入侵类型：真菌体扩散\n→ 系统状态：异常\n→ 已启动自动排查与隔离程序\n→ 建议：\n1. 允许执行健康测试\n2. 批准启用消杀模式' },
  { quadrant: 2, title: '故障002', log: '第二象限检测到[外部受击]\n→ 受击类型：高能武器轰击\n→ 系统状态：异常\n→ 威胁等级：一级\n→ 建议：\n1. 批准进入反击模式\n2. 允许暂时破坏保密协议' },
  { quadrant: 3, title: '故障003', log: '第三象限检测到[密令空洞]\n→ 系统状态：正常\n→ 威胁等级：三级\n→ 已解除引擎开启漂流模式\n→ 建议：\n1. 保持镇定并安静\n2. 请警惕周身异常' },
  { quadrant: 4, title: '故障004', log: '第四象限检测到[？？？]\n→ 系统状态：？？？\n→ 威胁等级：四级\n→ 未知威胁更名为[亚空间灾难]\n→ 建议：\n1. 请求协议者支援\n2. 对第四象限进行断联处理' },
]

function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}

export function hideAd() {
  if (_adCountAnim) {
    _adCountAnim.kill()
    _adCountAnim = null
  }
  store.adOpen = false
  store.adCountdown = 1
  ready_dialog()
}

export function hideEmergency() {
  store.emergencyOpen = false
  store.shipErrorType = null
  ready_dialog()
}

export function showAd() {
  if (!ADS.length) return
  store.currentAd = pick(ADS)
  store.adCountdown = 1
  store.adOpen = true
  const s = { nums: 1 }
  if (_adCountAnim) _adCountAnim.kill()
  _adCountAnim = gsap.timeline().to(s, {
    nums: 0,
    duration: 6,
    ease: 'linear',
    onUpdate: () => { store.adCountdown = s.nums },
    onComplete: () => hideAd(),
  })
}

export function showEmergency() {
  if (!EMERGENCIES.length) return
  const e = pick(EMERGENCIES)
  store.currentEmergency = e
  store.shipErrorType = e
  store.emergencyOpen = true
}

export function ready_dialog() {
  if (_dialogTimer) clearTimeout(_dialogTimer)
  const wait = (Math.random() * 60 + 60) * 1000
  _dialogTimer = setTimeout(() => {
    if (store.systemOpen || store.instructionOpen || store.menuOpen || store.adOpen || store.emergencyOpen) {
      ready_dialog()
      return
    }
    if (Math.random() > 0.45) showAd()
    else showEmergency()
  }, wait)
}

export function startDialogs() {
  ready_dialog()
}
