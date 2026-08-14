import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import Lenis from 'lenis'

gsap.registerPlugin(CustomEase)

export const ease_in = CustomEase.create('ease_in', 'M0,0 C0.6,0,0.8,0.4,1,1')
export const ease_out = CustomEase.create('ease_out', 'M0,0 C0.2,0.9,0.45,1,1,1')
export const ease_inout = CustomEase.create('ease_inout', 'M0,0 C0.7,0,0.3,1,1,1')

export { gsap }

const LENIS_BASE = {
  duration: 1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  autoRaf: true,
}

export function createLenis(opts = {}) {
  return new Lenis({ ...LENIS_BASE, ...opts })
}

export let scroll_controler = null
export let scroll_progress = 0

export function initGlobalLenis() {
  if (scroll_controler) return scroll_controler
  scroll_controler = createLenis()
  scroll_controler.on('scroll', () => {
    scroll_progress = scroll_controler.progress
  })
  return scroll_controler
}
