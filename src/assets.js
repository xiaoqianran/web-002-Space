const BASE = import.meta.env.BASE_URL || '/'

export const STARFIELD = 'cdn/background_436870b549.jpg'

export function local(p) {
  if (!p) return ''
  const s = String(p)
  if (s.startsWith('data:') || s.startsWith('blob:') || s.startsWith('http://') || s.startsWith('https://')) return s
  return `${BASE}${s.replace(/^\//, '')}`
}

/** Prefer a local public/cdn (or public/img) copy; never hotlink when we have the file. */
export function cdn(url) {
  if (!url) return ''
  const s = String(url)
  if (s.startsWith('data:') || s.startsWith('blob:')) return s
  const m = s.match(/https?:\/\/cdn\.cosmicbroth\.com\/(.+)$/i)
  if (m) return local('cdn/' + decodeURIComponent(m[1]))
  if (s.startsWith('/cdn/') || s.startsWith('cdn/')) return local(s.replace(/^\//, ''))
  if (s.startsWith('/img/') || s.startsWith('img/')) return local(s.replace(/^\//, ''))
  if (s.startsWith(BASE)) return s
  if (s.startsWith('/') && !s.startsWith('//')) return local(s)
  return s
}

export function localizeDeep(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(localizeDeep)
    return obj
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'string' && looksLikeAsset(v)) obj[k] = cdn(v)
      else if (v && typeof v === 'object') localizeDeep(v)
    }
  }
  return obj
}

function looksLikeAsset(v) {
  return (
    v.includes('cdn.cosmicbroth.com') ||
    v.startsWith('/cdn/') ||
    v.startsWith('cdn/') ||
    v.startsWith('/img/') ||
    v.startsWith('img/')
  )
}

export function preload(urls, concurrency = 6) {
  const list = [...new Set((urls || []).filter(Boolean).map((u) => cdn(u)))]
  if (!list.length) return Promise.resolve()
  let i = 0
  const workers = Array.from({ length: Math.min(concurrency, list.length) }, async () => {
    while (i < list.length) {
      const src = list[i++]
      await new Promise((resolve) => {
        const img = new Image()
        img.decoding = 'async'
        img.onload = img.onerror = () => resolve()
        img.src = src
      })
    }
  })
  return Promise.all(workers)
}

export function criticalBootUrls(worlds, unknown) {
  const urls = [STARFIELD, 'img/logo.png', 'img/guide.png']
  for (const w of Object.values(worlds || {})) {
    if (w?.image_url) urls.push(w.image_url)
    if (w?.star_image_url) urls.push(w.star_image_url)
  }
  for (const u of unknown || []) {
    if (u?.image_url) urls.push(u.image_url)
  }
  return urls
}
