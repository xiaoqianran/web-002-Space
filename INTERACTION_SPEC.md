# COSMIC BROTH — Interaction Spec (from original JS)

Source of truth: `/workspace/cosmicbroth-recon/js` (Nuxt/Vite minified bundles) + live `https://www.cosmicbroth.com/`.
Primary files:

| File | Role |
|---|---|
| `entry.js` | Pinia `global` store, `loading`, `ship` (MorphSVG), emergency `ed`, `ad`, 404 `error`, app `beforeEach` |
| `CxtPVY3G.js` | Home `index`: windowview, canvas stars, system/compass, instruction, HUD |
| `X0bsR33V.js` | `menu` overlay |
| `BIgn3gRP.js` | Images `[id]` infinite gallery |
| `BOiTifj-.js` | Portraits `[id]` scatter + viewbox |
| `BvqDcBFr.js` | Records `c[chapter]` |
| `7wabMjxb.js` | World `index` outline page |
| `O5T2XTGK.js` | Global `imageview` lightbox |
| `B4JBhoPa.js` | Inner-page canvas `background` + `scrollbar` |
| `C4gmGO9R.js` | GSAP ScrollTrigger 3.13.0 + Observer |

Libraries actually used: **GSAP 3.13.0** (`gsapWithCSS` / `vt`), **CustomEase**, **MorphSVGPlugin**, **ScrollTrigger**, **Lenis**, **lottie-web**. There is **no separate hex-wipe component** in the original. The honeycomb is the **loading sequence**, reused as the **route transition**.

---

## Global motion language

Assigned in `app.setup` (`entry.js`):

```
gsap.registerPlugin(CustomEase)
ease_in    = CustomEase.create("ease_in",    "M0,0 C0.6,0,0.8,0.4,1,1")
ease_out   = CustomEase.create("ease_out",   "M0,0 C0.2,0.9,0.45,1,1,1")
ease_inout = CustomEase.create("ease_inout", "M0,0 C0.7,0,0.3,1,1,1")
```

Quoted store fields: `ease_in`, `ease_out`, `ease_inout`, `scroll_controler` (sic).

Global Lenis (`entry.js` app `onMounted`):

```
new Lenis({ duration: 1, easing: t => Math.min(1, 1.001 - Math.pow(2, -10*t)), smoothWheel: true, autoRaf: true })
scroll_controler.on("scroll", () => scroll_progress = scroll_controler.progress)
```

Inner Lenis wrappers (same easing) on: `.system_databox .sdm_content_sections`, `.menubox_selecter_box`, `.viewbox` (portraits), `.navigation_chapters` (records).

Theme: `gsap.to("body", { "--color_theme": current_world.color, duration: 0.5, ease: ease_out })` when `route.params.worlds` changes.

Auth: Pinia `authorization_token` (`Bearer …`) on every `fetch` to `https://api.cosmicbroth.com/api`. Recreation already copies this in `src/api.js`.

**Escape is not bound anywhere in the original.** Menu closes via the MENU button. Recreation added Esc — keep it as extra, do not treat as original.

---

## 1. Loading honeycomb = route transition

Quoted: `__name:"loading"`, classes `loading`, `loading_blocks`, `loading_blocks_block`, `loading_codewall`, `loading_middle`, `loading_middle_ship`, `loading_middle_wavebox`, `loading_middle_bottom`. Methods `u.show`, `u.hidden`, `l.play` / `update_code`, store actions `show_loading`, `hidden_loading`, `check_loading`.

### Trigger
`router.beforeEach((to, from, next) => { show_loading(next) })` — **every navigation**, including first paint.

### State
- `u.if_visible = true`
- codewall interval 100ms: 30 concatenated binary strings (`01000111…` / `01100011…`)
- ship MorphSVG timeline `play()`

### Show timeline (`u.show(next)`)
1. `set(blocks, { scale: 1 })`
2. `blocks { opacity: 1, duration: 0.5, ease: ease_out, stagger: { from: "random", each: 0.002 } }`
3. at `<0.3`: `blocks { strokeOpacity: 0, strokeDashoffset: ± calc(var(--scale)*50rem) random, duration: 0.5, ease: ease_out, stagger: { from: "random", each: 0.002 } }`
4. at `<`: `middle { opacity: 1, duration: 1, ease: ease_out }`
5. at `<`: `codewall { opacity: 0.05, duration: 1, ease: ease_out, onComplete: next(); check_loading() }`

Hex grid: **10×10** pointy hexes, `n=80`, `i = √3/2 * n`. Each `<polygon class="loading_blocks_block" fill="#000013">`.

### Hide (`check_loading` → `hidden_loading`)
`setInterval` 300ms until `document.readyState === "complete"`, then:

1. `set(blocks, { strokeDashoffset: ±50rem random })`
2. `blocks { strokeOpacity: 1, strokeDashoffset: 0, duration: 0.5, ease: ease_out, stagger: { from: "random", each: 0.002 } }`
3. at `<`: `[middle, codewall] { opacity: 0, duration: 1, ease: ease_out }`
4. at `<0.2`: `blocks { scale: 0, opacity: 0, duration: 1, ease: ease_out, stagger: { from: "center", each: 0.004 }, onComplete: stop code + pause ship + if_visible=false }`

There is **no click-to-ACCESS**. Bottom copy is static `[LOADING] → ACCESS SYSTEM...`. The sequence is automatic.

### Recreation
- `Loading.vue`: decorative hex SVG + static code wall + 2.5s timeout + **click ACCESS**. Missing GSAP stagger, dashoffset, scale-from-center hide, live binary wall, ship play/pause.
- `HexWipe.vue` + `triggerHexWipe()` on `afterEach`: **invented**. Original has no overlay wipe. Replace HexWipe with this loading timeline.

### Resulting view
Next route is already committed (`next()` during show). When DOM is complete, honeycomb collapses and the destination is visible.

---

## 2. Ship MorphSVG breath

Quoted: `__name:"ship"`, classes `ship`, `ship_back_p1/p2`, `ship_front_p1…p4`, `ship_hole`, `ship_stroke`, `ship_stroke_error_quadrant{1-4}`. Plugin `MorphSVGPlugin`.

### Trigger
`onMounted` → looping timeline. Loading `show` plays it; `hidden` pauses it. Emergency passes `error_type` to tint a quadrant.

### Animation (repeat: -1)
Six path pairs (`path_before` → `path_after`) with delays `[0.2, 0, 0.4, 0, 0.3, 0.15]`:

- `to(paths, { transform: translate(each.translate), morphSVG: path_after, delay, duration: 2, ease: ease_inout })`
- `to(hole, { strokeWidth: 0, duration: 1.5, ease: ease_inout }, "<")`
- at `<1.8`: morph back to `path_before`, `translate(0)`, duration 2
- hole `strokeWidth: 15`, duration 1.5

Exact `path_before` / `path_after` / `translate` live in `entry.js` `__name:"ship"` (BUILD_NOTES leftover: “original ship path data”).

### Recreation
`Ship.vue` is a static geometric stand-in. **No MorphSVG, no path data, no error-quadrant class.**

---

## 3. Windowview drag + canvas starfield + mousetip

Quoted controller `s` in `CxtPVY3G.js` `index`. Classes: `windowview`, `windowview_backgroud` (sic), `windowview_backgroud_image`, `windowview_backgroud_stars`, `windowview_stars`, `windowview_stars_star`, `windowview_stars_star_clickable`, `windowview_stars_star_unknown`, `windowview_stars_empty`, `windowview_mousetip`, `windowview_mousetip_halo`, `windowview_dragtip_{left,right,top}`.

### 3a. Pan
**Trigger:** `mousedown` / `touchstart` on `.windowview` → `if_movable=true`. `mousemove` / `touchmove` (preventDefault) call `move(x,y)`.

**Math:**
```
distance_x += (x - mouse_x) / innerWidth * 500 / devicePixelRatio
distance_y += (y - mouse_y) / innerWidth * 500 / devicePixelRatio
clamp to [min_x, max_x] / [min_y, max_y]  // (bgSize - viewport) / 2
```

**Animation (every move):**
```
gsap.timeline()
  .to(backgroud, { x: distance_x, y: distance_y, duration: 1, ease: ease_out })
  .to(stars,     { x: distance_x*0.8, y: distance_y*0.8, duration: 1, ease: ease_out }, "<")
  .set(dragtip L/R paths, { strokeDashoffset: f => mouseY - H/2 (+20 on odd) }, "<")
  .set(dragtip top paths, { strokeDashoffset: f => mouseX - W/2 (+20 on odd) }, "<")
```

### 3b. Canvas starfield (`a`)
`.windowview_backgroud_stars` 2D canvas. **500** stars. `max_radius = (W+H)/2000 * dpr`, `min_radius = max/5`, `max_speed = (W+H)/8000 * dpr`, `min_speed = max/10`. Each star: random pos, speed, ±direction, radius, alpha. `move_star`: integrate, bounce at edges, `alpha += (rand-0.5)*0.2` clamped 0–1. Fill `rgba(255,255,255,alpha)`. rAF loop.

### 3c. Mousetip (desktop only)
Disabled when `navigator.maxTouchPoints > 0`. Three halo `<path>`s MorphSVG-loop `path_data[i][0..2]` with `duration: random*0.1+0.05`, `ease: "linear"`, `repeat: -1`. Follow: `gsap.to(ele, { x, y, duration: 0.6, ease: ease_out })`. `mouseenter` scale 1 / `mouseleave` scale 0, duration 0.8. Copy: `CLICK` / `DRAG` + live `mouse_x` / `mouse_y`. Hovering a clickable star sets `if_clickable=true` (CSS `windowview_mousetip_click`).

### Recreation
`WindowView.vue` has pointer pan (1:1, no GSAP, no 0.8 parallax, no 500/dpr gain, no dashoffset dragtips). Canvas ~180 twinkle dots, not 500 bouncing motes. Mousetip is CSS circles snapped to cursor — **no MorphSVG halo, no 0.6s lag**.

---

## 4. Star click → info card → EXPLORE → world page

Quoted: `check_show_information`, `show_information`, `hidden_information`, `check_hidden_information`. Classes `windowview_stars_information`, `wsi_line`, `wsi_container`, `wsi_title`, `wsi_button_text`.

### Trigger
Click `.windowview_stars_star_clickable` → `s.check_show_information(worldId, event.target)`. Click `.windowview_stars_empty` → `check_hidden_information()`. Unknown stars have **no click handler** (visual only).

### Show (if no timeline active and different star)
If another card is open, queue `hidden_information` then `show_information`:
1. `set(information, { left: star.offsetLeft+width, top: star.offsetTop+height })`
2. `line_circle { transform: scale(1), duration: 0.3, ease: ease_out }` → `if_information_visible=true`, `current_star=id`
3. at `<0.1`: `line_line { strokeDashoffset: 0, duration: 0.8 }`
4. at `<0.3`: `title { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1 }`
5. at `<`: `wsi_container { opacity: 1, duration: 1 }`

### Hide
`information { opacity: 0, duration: 0.3, ease: "linear" }` then instant reset: circle `scale(0)`, line dash `calc(var(--scale)*4rem)`, title clip `polygon(0 0, 0 0, 0 100%, 0 100%)`, container opacity 0.

### EXPLORE
`wsi_button_text` click → `router.push("/" + current_star)` → **world outline page** (`7wabMjxb.js` `__name:"index"`). Does **not** open the system overlay.

### Recreation gaps
- Card appears instantly (no line/clip/opacity timeline).
- Unknown stars are clickable (original: not).
- `explore()` does `openSystem(id)` **and** `router.push('/'+id)` — wrong graph. EXPLORE must only go to `/:world`.
- Clicking empty space does not play the hide timeline.

---

## 5. CONSOLE button → system overlay (compass)

Quoted controller `l` (system) + `n` (databox). Classes: `system`, `system_background`, `system_databox`, `system_pagebox`, `system_pagebox_compass`, `system_pagebox_worlds`, `spw_world`, `spw_world_icon`, `spc_node`, `spc_id`, `spc_pattern_solidline/dashline/dropline`, `sdb_button`, `umc_button`.

### Trigger (this is the real “console”)
HUD `.umc_button` (`CONSLOE` typo is original) → `l.show()`. **Not** a credits panel.

Ship HUD `.uibox_shipbox_info` click → `o.show()` (instruction), **not** emergency.

### System show
Guard: skip if `animater.isActive()`. `if_visible=true`, `reset()`, `n.reset()`, then:
1. `container { opacity: 1, duration: 0.8, ease: ease_out }` + add `system_pagebox_compass_show`
2. at `<0.5`: solidline[0,2] `strokeDashoffset: 0`, 1.2s
3. at `<0.3`: solidline[1,3] same
4. at `<`: dashline `strokeDasharray: "1, 10"`, 1s; dropline `"0, 48"` / offset 20, 1s
5. at `<0.3`: `[node, id] { opacity: 1, duration: 1, stagger: 0.2 }` + `n.show()`
6. at `<`: `icon_svg { scale: 1, opacity: 1, duration: 1, stagger: 0.1 }`

Reset sets solidline dash 460/300, dashline `"0, 80"`, dropline `"0, 500"`, node/id opacity 0, icons scale 0.5 opacity 0.

### Databox show (`n.show`)
1. container opacity 1, 1s
2. title `y: 0`, 0.8s (from `y: 100%`)
3. codes `scale: 1`, 1s, `ease: ease_in`, `stagger: 0.02`
4. at `<0.2`: image `height: calc(var(--scale)*15rem)`, 1.2s, `ease_inout`
5. at `<0.3`: content opacity 1, 2s, `ease_inout`
6. at `<`: button opacity 1, 1.5s, `ease_in`

Inner Lenis on `.sdm_content_sections` (same 1s expo easing). `scroll_progress` drives `.sdm_content_scrollline`.

### Lottie compass
Each world in `/overview` has `compass` (Lottie JSON, 13-key dict). `lottie.loadAnimation({ container: .spw_world_icon div div, renderer: "svg", loop: true, autoplay: true, animationData: world.compass })`. Recreation **explicitly strips** this: `store.worlds[id] = { …w, compass: undefined }`.

### Drag-rotate worlds
`.system_pagebox_worlds` mousedown → `if_worlds_rotatable`. Move:
```
E = atan2(x1*y0 - x0*y1, x0*x1 + y0*y1) * 180/π
angle_rotate -= E
```
CSS `--angle_rotate`. Click a world → `select_world(id, el)`: swap `--index` with current, add/remove `spw_world_icon_outter`, `n.hidden_content()`, fade node/id 0.6s, reset rotate, then fade in + `n.show_content()` with new map.

### Node / id
`select_node(key, index)`: rotate `.spc_node` to `-index * angle_node` (45°) over **1.5s**, fade id, swap `id_selections`, `n.show_content()`.
`select_id(item, index)`: rotate `.spc_id` to `-index * angle_id` (30°) over **1.5s**, swap databox copy.

### ACCESS->
`l.jump()` → `router.push("/" + world + "/" + node + "/" + id)`.
Records land on `/:world/records/:id` (original Nuxt then resolves chapter). Recreation should keep `/c1` suffix as a compatibility fix.

Hide: container opacity 0, 1s, then `if_visible=false`. Return button `.system_return` / background click.

### Recreation gaps
- CONSOLE opens a homemade credits panel (`console-panel`) instead of `l.show()`.
- System overlay exists but: no Lottie, no GSAP draw-on, no drag-rotate, no databox height/stagger timeline, no node/id rotate, ACCESS goes to `/:world` (world page) not `/:world/:node/:id`.
- Ship box does not open instruction.

---

## 6. Instruction overlay

Quoted controller `o`. Classes `instruction`, `instruction_main`, `instruction_main_block`, `instruction_main_circle`, `instruction_return`.

### Trigger
`.uibox_shipbox_info` click → `o.show()`. Close via `.instruction_return` (`[返回]::close()`).

### Animation
Reset: container opacity 0, main scale 1.1, blocks+circles opacity 0.
Show: container opacity 1, 1s; main scale 1, 1s; blocks opacity 0.4, 0.8s, `stagger: { from: "random", each: 0.1 }`; circles opacity 1, 0.8s, `stagger: { from: "random", each: 0.05 }`.
Hide: opacity 0, 0.8s.

### Recreation
`Instruction.vue` is a click-toggle list (01 CLICK / 02 SWIPE / 03 type URL). Missing GSAP, missing ship-box trigger, missing original artwork blocks/circles.

---

## 7. Emergency + ad dialog scheduler

Quoted: store `dialog_methods[]`, `dialog_timer`, `dialog_duration: 60`, `ready_dialog()`. Components `__name:"error"` (class `ed` — emergency, **not** 404) and `__name:"ad"`.

### Trigger
`app.onMounted` → `ready_dialog()`. After any dialog hides, it calls `ready_dialog()` again.

```
ready_dialog() {
  dialog_timer = setTimeout(
    () => dialog_methods[floor(random * length)](),
    (random * 60 + 60) * 1000   // 60–120s
  )
}
```

Both `ed.show` and `ad.show` push themselves into `dialog_methods` on mount.

### Emergency (`ed`)
Random one of 4 `current_error_type`:
- Q1 故障001 外来生物入侵
- Q2 故障002 外部受击
- Q3 故障003 密令空洞
- Q4 故障004 亚空间灾难

Show: `ed { y: 1, opacity: 1, duration: 0.5, ease: ease_out }`. Ship gets `error_type` → `ship_stroke_error_quadrantN`. Button `执行已授权操作` → hide `{ y: "50%", opacity: 0, duration: 0.5 }` then `ready_dialog()`. Mask `.mask` toggles with `hidden`.

### Ad
Random one of **7** ads (DESPOT 营养液 / 肉联厂 / 别点黄片 / 宠物摄影 / � 肉联厂 / 别点黄片 / 宠物摄影 / 喆仙租房 / 复古鱼油 / 棋盘室桌游) with image + marquee + 6s linear countdown (`--l` on `.ad_line`). Same 0.5s y/opacity in-out. Close button or countdown end → `ready_dialog()`.

### Recreation
- Emergency is a stub opened only from the fake console “执行已授权操作”. No 4-fault table, no quadrant ship, no scheduler.
- Ad: one hardcoded 喆仙租房, `setTimeout 12000`, no 6s countdown, no random pool, no GSAP.

---

## 8. Menu overlay

Quoted: `X0bsR33V.js` `__name:"menu"`. Classes `nav`, `button`, `button_open` / `button_shut`, `menubox`, `menubox_mask`, `menubox_egde`, `menubox_worldview_box`, `msb_worlds`, `msb_nodes`, `msb_ids`, `msb_selection_selected_world/node`.

### Trigger
`.button` click → `change_button_state()` → `show()` / `hidden()`. Logo click → `router.push("/")`. Route change forces `if_visible=false` and `scroll_controler.start()`.

### Show
`scroll_controler.stop()`. Reset clip `polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)`, mask `y:0`, edges `scale:1.2, opacity:0`.
Then: container clip → `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`, **0.6s ease_inout**; at `<0.2` mask `y: 100%`, 0.6s ease_inout; at `<` edges `{ scale: 1, opacity: 1, duration: 1, ease: ease_out }`.

### Hide
mask `y: 0`, 0.5s ease_out; at `<0.2` clip back to zero-height, 0.5s, then `if_visible=false`. `scroll_controler.start()`.

### Accordion
`toggle_height(sel, collapse, immediate)` → `gsap.to(sel, { height: collapse ? 0 : "auto", duration: immediate ? 0 : 0.5, ease: ease_out, onComplete: scroll_controler.resize })`.
`select_world`: collapse open node, set world, expand new `.msb_nodes_container`. Worldview box: `x: 110%` 0.3s ease_in, then from `x: -110%` to 0, 0.4s ease_out at `<0.45` (swap `tem_current_world`).
`select_node`: height-toggle `.msb_ids_container`.
`select_id`: `router.push("/"+world+"/"+node+"/"+id)`.
EXPLORE in preview: `router.push("/"+current_world)` (world page).

Lenis on `.menubox_selecter_box`.

### Recreation
`MenuOverlay.vue` + `SiteHeader.vue`: v-if show, CSS open class, Esc close. Missing clip-path wipe, mask slide, edge scale, GSAP height accordion, worldview x-slide, Lenis. Preview EXPLORE is correct-ish (world page). Item push adds `/c1` for records (OK).

---

## 9. World outline page

Quoted: `7wabMjxb.js` `__name:"index"`. Classes `background`, `container`, `scrollline`, `scrollline_line1/2/3`, `content_title`, `content_sections`, `content_sections_section`, `content_sections_warp`.

### Trigger
Route `/:worlds`. Fetch `/outline/:world`. `ScrollTrigger` + window scroll.

### Animations
- Each `.content_sections_section`: ST `start: "top 100%"`, `onEnter` → `gsap.to(el, { opacity: 1, y: 0, duration: 1.5, ease: ease_out })`.
- Each `.content_sections_warp`: ST enter/leave/back swaps `current_index` → `change_background`:
  `bg { opacity: 0, 0.3s, ease_in }` then at `<0.4` `{ opacity: 1, 0.8s, ease_out }` with new `images[index]`.
- `--p: scroll_controler.progress` on `.scrollline` (3 decorative SVG paths).
- Inner-page `background` canvas (`B4JBhoPa.js`): 5vw grid, mousemove activates 3×3 neighborhood (50% chance), theme-colored stroke fade `alpha -= 0.03` per frame. `scrollbar` width `--p`.

### Recreation
`WorldView.vue`: static bleed image + stacked paragraphs + “SCROLL ////”. No ST fade-up, no multi-image crossfade, no 3 scrollline SVGs, no hover-grid canvas, no Lenis progress.

---

## 10. Image gallery (infinite wrap + inertia)

Quoted: `BIgn3gRP.js` controllers `s` (movers), `r` (dragtip), `_` (viewbox). Classes `scrollbox`, `scrollbox_actived`, `scrollbox_mover`, `dragtip`, `dragtip_hidden`, `viewbox`, `viewbox_imagebox_image`, `viewbox_instrution_line_{left,right}`.

### Trigger
`mousedown`/`touchstart` on `.scrollbox` → `if_movable`. `mousemove` uses `movementX/Y`. Wheel: `move(0, 10 * sign(wheelDeltaY))` unless viewbox open.

### Inertia
```
ease.x += dx * 0.02 * scale_nums
ease.y += dy * 0.02 * scale_nums
ease.damping = e => e * 0.95
rAF until |ease| < 0.01
```
Each mover translates; if it exits the tiled bounds it wraps by `±(total + margin)` and reindexes `img.src` / tip number. Scale: `scale_nums = innerHeight/300 + innerWidth/300`; tile `12*2.4*scale` × `18*2.4*scale`, odd columns offset half-row. Data padded to a rectangular factor grid, then tiled.

### Dragtip
Visible on enter. First move → `hidden()` after **500ms**. `mouseup`/`mouseleave` cancels. Class `dragtip_hidden`. Copy: `DRAG SCREEN / TO BROWSE IMAGES` + `→ Infinite scrolling is ready` + `<Codeline>`.

### Select
`mouseup` on mover only if `mouse.x==click_x && mouse.y==click_y` → `_.show()`.

### Viewbox
Reset: viewbox opacity 0, shadow 0, lines `translateX(±50%)`, image `pointerEvents: none`.
Show: opacity 1 **1.3s**, shadow 1.3s, lines 1s, pointerEvents auto at `<0.6`.
Hide: opacity 0 **0.8s**; shadow/lines 0.5s.
Image click → `global.show_imageview(url)`.

### Recreation
`ImageView.vue`: 4 copies + wrap-on-pan, no 0.95 damping rAF, no scale_nums, no staggered brick, no 500ms dragtip delay, viewbox is a CSS popup (no 1.3s line wipe). Wheel is ±40px instant.

---

## 11. Portrait scatter + viewbox

Quoted: `BOiTifj-.js` controllers `x` (list) + `o` (viewbox). Classes `paortraitsbox_portrait`, `paortraitsbox_portrait_content_show`, `paortraitsbox_portrait_arrow_show`, `system` (DATA SYSTEM HUD), `viewbox_dragline_*`.

### Scatter / scroll
Each card `--x: Math.random()+1` (CSS uses it for offset). Arrow left/right alternates. `ScrollTrigger.create({ trigger: content, start: "top 100%", onEnter: add paortraitsbox_portrait_content_show })` — letter spans already have `--d: i*0.04s`.
`scroll` + `resize`: arrow line `gsap.set(rotate)` toward viewport center (`atan` of vector from arrow to screen center).

### Hover
`mouseenter`/`touchstart` → add `…_arrow_show`, `gsap.to(.system, { opacity: 1, duration: 0.5, delay: 0.1 })`, typewriter information: `gsap.to("span", { opacity: 1, duration: 0.05, stagger: 0.01 })`.
Leave → remove arrow class, system opacity **0.2**, 0.5s delay 0.1.

### Open viewbox
Card click → `o.ready_show(index)`: load that role’s portraits, reset x, Lenis `scrollTo(0,{immediate:true})`, then show:
- viewbox opacity 1, **1s**
- dragline_edge scale 1, **1.2s**
- instruction `translateY:0, opacity:1`, **1.5s**
- dragline_arrow `scaleY:1`, **2s**

Drag strip: `mousemove` `move_images(movementX, live=true)` (duration 0). On release, snap by `check_images_x()` (nearest to center) duration **0.5s**. Clamp distance `[ -imagebox.width, 0 ]`. Dragline `strokeDashoffset` tracks distance, 0.2s. Caption swap: content `y: -100%` 0.3s then from `y:100%` to 0, 0.3s at `<0.15`.
Click image only if `start_x == event.x` (no drag) → `show_imageview`.
Hide: opacity 0, **0.6s**. Lenis on `.viewbox`.

### Recreation
`PortraitView.vue`: hardcoded 2-col % positions + rotate, JS typewriter 18ms. No ST, no `--x`, no arrow-to-center, no system opacity 0.2/1, no dragline GSAP, no snap-to-center, no Lenis, no 1–2s intro timeline. Click image immediately opens lightbox (no “no-drag” guard).

---

## 12. Records + read mode

Quoted: `BvqDcBFr.js` `__name:"c[chapter]"`. Classes `records`, `information_*`, `chapter`, `navigation_chapters`, `navigation_readmode`, `navigation_readmode_light`.

### Trigger
Fetch `/records/:id` + `/records/:id/c:chapter`. Prev/next + chapter list → `router.push("/:world/records/:id/cN")`.

### Animations
Lenis on `.navigation_chapters` (same 1s expo).
`toggle_readmode_state`:
```
gsap.to(".records", {
  "--tem_color_black": light ? "#f3f3f3" : "#000013",
  "--tem_color_white": light ? "#000013" : "#f3f3f3",
  duration: 0.5, ease: ease_out
})
```
Background canvas `stroke_color` flips with readmode. Decode block is live: first 16 chars of `instrution` → high-byte binary, plus `[DECODE] memory.fragment[chapter_N]`.

### Recreation
`RecordView.vue`: chapter nav + CSS `.light` class. Missing Lenis, GSAP CSS-var tween, live binary decode, hover-grid canvas, barcode `<Codeline>`.

---

## 13. Imageview lightbox (global)

Quoted: `O5T2XTGK.js` `__name:"imageview"`. Assigned to `global.show_imageview`.

### Show
`scroll_controler.stop()`. From opacity 0→1, **1s**; image `{ scale: 1.1, x:0, y:0 } → { scale: 1 }`, 1s; then bind events. Tip visible.

### Drag / zoom
Move: accumulate `move_x/y`, `gsap.to(image, { x, y, duration: 0.3, ease: ease_out })`, hide tip.
Wheel: `scale(sign(wheelDeltaY))`. Pinch: hypot of two touches. `scroll_nums` clamp **0.5–3**, step 0.1, `gsap.to({ scale, duration: 0.3 })`.

### Hide
opacity 0, **0.6s**, then reset + `scroll_controler.start()`. Route change also `reset()`.

### Recreation
`App.vue`: instant open, 1:1 drag, wheel ±0.1 no GSAP, no 1.1→1 intro, no Lenis stop, no 0.3s eased follow, pinch not implemented (comment only).

---

## 14. 404 glitch

Quoted: second `__name:"error"` in `entry.js`. Classes `error`, `error_type{1-8}`, `error_maskbox`, `error_asciibox`, `error_glitchbox`, `error_content_404`.

### Trigger
Unknown route. Three rAF systems: SVG feTurbulence mask (`baseFrequency` 0→0.5, 1s loop, displacement scale 100), cycling ASCII `pre`, canvas random colored rects. Class hopper: 95% of ticks `random*100`ms, else 2–3s, sets `error_type1…8`. Button → `router.replace("/")` labeled **RECONNECT**.

### Recreation
`NotFound.vue`: 900ms class cycle + random charset. Missing turbulence mask, glitch canvas, ASCII pages, original button SVGs.

---

## Navigation graph (original vs recreation)

```
HOME windowview
  star click        → info card (stay on /)
  EXPLORE           → /:world                  (world outline)
  CONSOLE (umc)     → system overlay (stay on /)
  ACCESS->          → /:world/:node/:id        (record/portrait/image)
  ship HUD click    → instruction overlay
  MENU (inner)      → menubox; EXPLORE → /:world; id → /:world/:node/:id
  any router change → loading honeycomb, then destination

RECREATION WRONG EDGES
  star EXPLORE      → openSystem + /:world     (should be world page only)
  CONSOLE           → console-panel            (should be system overlay)
  system ACCESS     → /:world                  (should be /:world/:node/:id)
  HexWipe afterEach → invented overlay
  loading           → click ACCESS after 2.5s  (should be automatic honeycomb)
```

---

## Recreation inventory

| Chain | Original | Recreation | Verdict |
|---|---|---|---|
| CustomEase + global Lenis | yes | no | missing |
| Loading honeycomb as `beforeEach` | yes | click-to-dismiss hex + separate HexWipe | **wrong model** |
| Ship MorphSVG | yes | static SVG | missing |
| Windowview GSAP pan / 0.8 parallax / dash tips | yes | 1:1 pointer pan | partial |
| Canvas 500 bouncing stars | yes | 180 twinkles | partial |
| MorphSVG mousetip | yes | CSS circles | missing |
| Star info GSAP card | yes | instant card | partial |
| EXPLORE → world page | yes | EXPLORE opens system + navigates | **wrong** |
| CONSOLE → system | yes | fake console panel | **wrong** |
| Lottie compass | yes (`world.compass`) | stripped `compass: undefined` | missing |
| System GSAP + drag-rotate + node/id rotate | yes | CSS orbit, click-only | partial |
| ACCESS → /:world/:node/:id | yes | /:world | **wrong** |
| Instruction GSAP | yes | static list | partial |
| Dialog scheduler 60–120s | yes | ad at 12s only | missing |
| Emergency 4 faults + quadrant ship | yes | stub | missing |
| 7 ads + 6s countdown | yes | 1 ad | missing |
| Menu clip-path + accordion GSAP | yes | v-if + CSS | partial |
| World ST fade + bg crossfade + grid canvas | yes | static page | missing |
| Image inertia 0.95 + wrap + viewbox 1.3s | yes | copies + instant wrap | partial |
| Portrait ST / arrows / dragline / Lenis | yes | % scatter + typewriter | partial |
| Record readmode GSAP + Lenis | yes | CSS `.light` | partial |
| Imageview GSAP + pinch + Lenis stop | yes | raw transform | partial |
| 404 turbulence + glitch canvas | yes | noise text | partial |
| Esc closes menu | no | yes | extra (keep) |
| zpix pixel font | yes | yes | ok |
| Theme `--color_theme` | yes (0.5s GSAP) | instant setProperty | partial |

---

## Priority — implement first

1. **Replace HexWipe with the real loading honeycomb** (`show_loading` / `hidden_loading` / `check_loading`) on `beforeEach`. This is the site’s only page transition.
2. **Install GSAP CustomEase + Lenis** and use the three quoted curves everywhere below.
3. **Fix the navigation graph**: star EXPLORE → `/:world` only; CONSOLE → `system.show`; ACCESS → `/:world/:node/:id`; ship HUD → instruction.
4. **Windowview motion**: GSAP pan (`*500/dpr`, 1s ease_out), 0.8 star parallax, dashoffset dragtips, MorphSVG mousetip, 500-star canvas, info-card clip/dash timeline.
5. **System overlay**: restore `world.compass` Lottie, GSAP compass draw + databox, drag-rotate worlds, 1.5s node/id rotates.
6. **Ship MorphSVG** with the six original path pairs (and emergency quadrant classes).
7. **Image gallery inertia** (`ease *= 0.95`, wrap-reindex, 500ms dragtip, 1.3s viewbox).
8. **Portrait ScrollTrigger + viewbox** (arrow-to-center, system 0.2/1, dragline snap, Lenis, 1–2s intro).

Next wave: menu clip-path/accordion, world-page ST + bg crossfade + hover grid, record readmode GSAP + Lenis, imageview eased drag/pinch, dialog scheduler + 4 emergencies + 7 ads, 404 glitch stack.

---

## Do not copy

- Recreation `HexWipe.vue` timing (1.2–1.4s CSS cells) — not original.
- Recreation `console-panel` as the CONSOLE target.
- Click-to-dismiss loading.
- `compass: undefined` strip in `boot()`.
- Treating EXPLORE and ACCESS as the same route.
