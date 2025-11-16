cd /d d:\r\lightweight-charts && set PUPPETEER_SKIP_DOWNLOAD=1 && npm ci --prefer-offline --no-audit --progress=false && npm run clean && npm run build:prod && echo ===== DIST CONTENTS ===== && dir dist

exit

为“安全且完整”重建 dist，推荐使用仓库自带的干净构建链：先安装依赖并执行 ts-patch，再清理旧产物，然后按生产模式编译 TypeScript、Rollup 打包并生成声明。对应脚本定义见 [scripts.postinstall](lightweight-charts/package.json:118)、[scripts.clean](lightweight-charts/package.json:120)、[scripts.build](lightweight-charts/package.json:134)、[scripts.build:prod](lightweight-charts/package.json:136)。

说明：
- set PUPPETEER_SKIP_DOWNLOAD=1 用于跳过 puppeteer 的 Chromium 下载，避免 Windows 环境长时间下载。
- npm ci 会运行 [postinstall](lightweight-charts/package.json:118)，自动执行 ts-patch install，保证自定义 transformer 可用。
- npm run clean 清理 [dist/](lightweight-charts/.gitignore:26)、lib（不追踪，但本地可能存在）。
- npm run build:prod 等价于在生产模式下执行 [build](lightweight-charts/package.json:134)：tsc → rollup → dts-bundle-generator。


最安全且“全量重建 dist”的命令（Windows cmd）：
- 完整重建（含依赖安装与 ts-patch）
  - cd /d d:\r\lightweight-charts && set PUPPETEER_SKIP_DOWNLOAD=1 && npm ci --prefer-offline --no-audit --progress=false && npm run clean && npm run build:prod
  - 脚本链路：先跑 [scripts.postinstall](lightweight-charts/package.json:118) 安装 githooks 与 ts‑patch，然后按 [scripts.clean](lightweight-charts/package.json:120) 清理，再执行 [scripts.build:prod](lightweight-charts/package.json:136) → [scripts.build](lightweight-charts/package.json:134)（依次调用 [scripts.tsc](lightweight-charts/package.json:122)、[scripts.rollup](lightweight-charts/package.json:132)、[scripts.bundle-dts](lightweight-charts/package.json:121)）。
  - 产物：dist 下生成开发/生产与 standalone 双套 mjs/js 以及 typings.d.ts；发布范围由 [files dist/**](lightweight-charts/package.json:37) 控制。

- 快速重建（依赖已安装时）
  - cd /d d:\r\lightweight-charts && npm run clean && npm run build:prod

- 双模式重建（可用于 size-limit 对照的两套产物）
  - cd /d d:\r\lightweight-charts && npm run build:prod:flags-off && npm run build:prod:flags-on
  - 对应脚本：[scripts.build:prod:flags-off](lightweight-charts/package.json:138)、[scripts.build:prod:flags-on](lightweight-charts/package.json:139)。rollup 会按 LWC_SIZE_LIMIT_MODE 切换绘图导出策略（参见 [rollup.config.js](lightweight-charts/rollup.config.js)）。

环境与注意事项：
- Node 版本需满足 [engines.node >= 22.3](lightweight-charts/package.json:52)。
- PUPPETEER_SKIP_DOWNLOAD=1 仅为本地环境降噪，不影响构建产物。
- 若仅需验证产物体积与打包正确，可追加：
  - npm run size-limit:flags-off（[scripts.size-limit:flags-off](lightweight-charts/package.json:143)）
  - npm run size-limit:flags-on（[scripts.size-limit:flags-on](lightweight-charts/package.json:144)）

上述完整重建命令已在你的环境成功执行并生成 dist 全量产物，属于最安全的“手动重建”流程。