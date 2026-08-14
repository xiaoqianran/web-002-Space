# BUILD NOTES

Added this pass:
- WorldView at `/:world` — full page (not system overlay): #000013 + 48px theme grid, left bleed illustration, right title chip + outline prose, `: ··· .: .` glyphs, vertical SCROLL ////.
- Global MENU overlay (Esc closes): thumbnail preview + terminal, `c:\cosmicbroth\database` accordion, 3 social links, theme sweep hover.
- SiteHeader (logo + GRAND-STARRS-RAY / A C S & 星际航路 + MENU ☰/✕) on inner pages.
- HexWipe honeycomb (~1.2s) on router afterEach.
- EXPLORE / ACCESS-> `router.push('/'+worldId)`.
- Portrait scatter + angular clip; image viewfinder / infinite wrap / barcode footer; record barcode + decode PREFETCH; 404 RECONNECT; HUD `世界名: YYYY/MM/DD` via time_diff.
- Fixes: record ReturnButton moved to bottom (no 返/TITLE overlap); system orbit + world strip clickable; ad hidden under system/instruction/menu (z-index 80).

Leftover: Lottie compass, GSAP/Lenis, original ship path data.
