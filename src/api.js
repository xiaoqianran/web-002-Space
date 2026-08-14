const AUTH =
  'Bearer 8d72e94cc7cf516397fb8db5f5300bf2f441c21f845459b57a7748d987493f8af4ef16aad5d72fddd22378031182d0c7c9ac01e514b07c19a11bb4f043f7d9995c8ad35e7b03b291fa34766cbcf8ce99d688f3b1c98e9c58880c95e66074eb9b8b4e614b66c674d24254dca3041a774f516e9fc998e9e4e788bfa8770621f934'
const LIVE = 'https://api.cosmicbroth.com/api'
const BASE = import.meta.env.BASE_URL
const local = (p) => `${BASE}${p.replace(/^\//, '')}`

async function fetchJson(url, headers) {
  const res = await fetch(url, headers ? { headers } : undefined)
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

export async function loadJson(localPath, livePath) {
  try {
    return await fetchJson(localPath)
  } catch (err) {
    console.warn('local miss', localPath, err)
    try {
      return await fetchJson(`${LIVE}${livePath}`, { Authorization: AUTH })
    } catch (liveErr) {
      console.error('live miss', livePath, liveErr)
      return null
    }
  }
}

export const api = {
  overview: () => loadJson(local('/data/worlds.json'), '/overview'),
  introduces: () => loadJson(local('/data/introduces.json'), '/introduces'),
  router: () => loadJson(local('/data/router.json'), '/router'),
  unknownWorlds: () => loadJson(local('/data/unknownWorlds.json'), '/unknownWorlds'),
  outline: (world) => loadJson(local(`/data/outline/${world}.json`), `/outline/${world}`),
  recordMeta: (id) => loadJson(local(`/data/records/${id}.json`), `/records/${id}`),
  recordChapter: (id, chapter) =>
    loadJson(local(`/data/records/${id}_${chapter}.json`), `/records/${id}/${chapter}`),
  portraits: (id) => loadJson(local(`/data/portraits/${id}.json`), `/portraits/${id}`),
  images: (id) => loadJson(local(`/data/images/${id}.json`), `/images/${id}`),
}
