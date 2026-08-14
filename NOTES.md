# Cosmic Broth · 原站全部子目录（真源码）

来源：`public/data/router.json` + `api/overview.json`（原站 Strapi/Nuxt 路由图）。
GitHub 无官方源码。对照复刻：`ArsvineZhu/cosmicbroth`（离线 API 快照 + HomeSystem 真组件）。

站点：https://www.cosmicbroth.com/
API：https://api.cosmicbroth.com/api
CDN：https://cdn.cosmicbroth.com/

## 首页
- `/`

## 宇宙汤 `cosmic-broth`
- `/cosmic-broth`
- `/cosmic-broth/records/yuzhoutang`
- `/cosmic-broth/records/yuzhoutang/c1`
- `/cosmic-broth/portraits/database`
- `/cosmic-broth/images/vlog`

## 地平世界 `checkerboard`
- `/checkerboard`
- `/checkerboard/records/fate`
- `/checkerboard/records/fate/c1`
- `/checkerboard/portraits/dreamer`
- `/checkerboard/images/maps`

## 迷雾中古 `fogbound-box`
- `/fogbound-box`
- `/fogbound-box/records/Sevener`
- `/fogbound-box/records/Sevener/c1` … `c6`
- `/fogbound-box/portraits/rumor`
- `/fogbound-box/images/darkroom`

## 棋盘室 `meta-room`
- `/meta-room`
- `/meta-room/records/goldfish` + `c1`…`c12`
- `/meta-room/records/guovssahas` + `c1`…`c20`
- `/meta-room/records/sickday` + `c1`…`c14`
- `/meta-room/portraits/Chessmen`
- `/meta-room/images/chessboard`

## CONSOLE（右下角系统层，不是独立 URL）
首页点 CONSLOE 打开 `.system`：
- 左：`世界名 / records|portraits|images / 作品名` + 图 + ACCESS->
- 右：四颗 Lottie 球（选中居中，其余 `translateY(-200%)` 沿 45° 弹出）
- 环：RECORDS / PORTRAITS / IMAGES + 外圈文件名

## 本地已落地的章节 JSON
全部 54 个章节文件已在 `public/data/records/`（含 Sevener 6、goldfish 12、guovssahas 20、sickday 14、yuzhoutang 1、fate 1）。
