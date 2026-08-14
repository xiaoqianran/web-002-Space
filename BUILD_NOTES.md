# BUILD NOTES

## Interaction pass (this commit)

Replaced invented HexWipe / click-to-ACCESS loading with the original honeycomb as the only route transition (`router.beforeEach` → `show_loading(next)` → `check_loading` → `hidden_loading`). GSAP CustomEase (`ease_in` / `ease_out` / `ease_inout`) and global Lenis (duration 1, expo wheel easing, `smoothWheel`, `autoRaf`) are installed.

Navigation graph now matches the original:
- Star EXPLORE → `router.push('/'+worldId)` only (WorldView). Does not open the system overlay.
- HUD CONSOLE (`.umc_button`) → `store.systemOpen` / system overlay. Fake `console-panel` removed from the binding.
- System ACCESS-> → `/:world/:node/:id` (records keep `/c1` suffix). Id ticks rotate; they do not navigate.
- Ship HUD (`.uibox_shipbox_info`) → instruction overlay.
- Unknown stars are visual only. Empty space plays the info-card hide timeline.

Also implemented:
- Loading 10×10 pointy hex grid, binary codewall 100ms, GSAP stagger show/hide (random dashoffset, scale-from-center hide). Automatic — no click ACCESS.
- `boot()` no longer strips `world.compass`. Lottie compass loads when overview data includes it.
- Windowview GSAP pan (`Δ/innerWidth*500/dpr`, 1s ease_out, stars 0.8 parallax), 500 bouncing canvas stars, info-card clip/dash timeline, lagged mousetip.
- System: drag-rotate `atan2`, 1.5s node/id rotates, compass draw-on, databox height/stagger, inner Lenis.
- Ship breath loop on the six original path pairs via flubber (MorphSVG is Club-only).
- Image gallery inertia (`ease *= 0.95`), wrap, 500ms dragtip, 1.3s viewbox.
- Portrait `--x` scatter, system HUD 0.2/1, viewbox intro, snap-to-center.
- Instruction GSAP show/hide. Imageview 1s intro + 0.3s eased drag/zoom + Lenis stop.
- Theme `--color_theme` 0.5s GSAP. Vite `BASE_PATH` / router `BASE_URL` / `$asset` unchanged. HexWipe deleted.

Fullscreen 1280×800 layout lock (min-width 1100 + min-aspect 3/2): HUD stays one wide bar; world page stays ~60/40 bleed+prose; MENU stays two columns. Instruction overlay uses the original OPERATING INSTRUCTIONS guide art (① CLICK / ② SWIPE UP / ③ URL warning). Portrait DATA SYSTEM panel is centered and translucent. Loading honeycomb is the original 10×10 / n=80 grid (~7 hexes across at 1280).

Leftover / next wave: menu clip-path accordion, world-page ScrollTrigger + hover grid, record readmode GSAP, dialog scheduler + 4 emergencies + 7 ads, 404 turbulence stack, MorphSVG mousetip halo (approximated with CSS circles).
