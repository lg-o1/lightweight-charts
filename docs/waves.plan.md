# Lightweight Charts 绘图能力 Roadmap

> 目标：在保持核心库轻量、稳定的前提下，分波次引入用户最常用的绘图与注释工具，实现从基础形状到高级测量工具的完整覆盖，同时保证生成链、测试、文档、性能、可维护性全面达标。
>
> **提交原则**：所有新绘图工具必须先定义 Tool Definition Schema（TDS），再运行 `npm run drawing-tools:generate` 生成代码，并通过 `npm run drawing-tools:generate --check` 校验，禁止直接手写或修改 `src/drawing/**/__generated__`。

> 重要更新（2025-11）
>
> - 已移除 Feature Flags 的构建/运行时门禁，绘图工具默认开启、始终导出。兼容性 API 仍保留但均为 no-op，详见 [feature-flags.ts](lightweight-charts/src/feature-flags.ts:1)（例如 [isEnabled()](lightweight-charts/src/feature-flags.ts:6)、[setFeatureFlags()](lightweight-charts/src/feature-flags.ts:19)、[ensureFeatureFlagEnabled()](lightweight-charts/src/feature-flags.ts:15) 均恒为“允许”）。
> - Rollup 始终注入绘图导出（无需任何环境变量），见 [rollup.config.js](lightweight-charts/rollup.config.js:56)。
> - 文档中提到的“flags-off/flags-on 体积基线、dot-key 开关”等均为历史内容。现统一使用单一 size-limit 与完整 E2E/内存/性能基线；旧的 flags-off 用例已更新为“默认包应包含绘图导出”，参见 [bundle-flags-off.spec.ts](lightweight-charts/tests/unittests/drawing/bundle-flags-off.spec.ts:6) 与 [feature-flags.spec.ts](lightweight-charts/tests/unittests/drawing/feature-flags.spec.ts:11)。
> - Demo 与示例无需再调用 `setFeatureFlags`/`ensureFeatureFlagEnabled`；若残留调用，它们为 no-op，不影响行为，后续可逐步删除以简化脚本。
> - E2E/验收不再区分 flags-off/on，统一验证：Add → Preview → Complete → Handle Drag → Body Drag → Delete → Undo/Redo → Autoscale（BusinessDay/UTCTimestamp）与 attach/detach 内存回收。

## 1. 总体策略

- **渐进式交付**：以 Wave0-Wave5 递进方式实施，确保每一波次都有可验证成果与可回滚策略。
- **TDS 优先**：任何绘图工具变更均以 TDS 为单一事实来源，由 generator 生成工具代码、测试模板、文档片段。手写代码仅限抽象层与配套逻辑。
- **双轨生成体系**：在生成工具代码的同时，同步生成/更新运行时几何、handle 控制、测试、文档，确保一致性。
- **Feature Flag 守护**：引入总开关 `drawingTools` 与子开关，默认关闭，通过文档指导用户启用 Beta 功能。
- **测试先行**：建立单测、E2E、内存/性能基线，所有新工具必须补齐测试矩阵和文档后才可开放。
- **插件共存**：评估 `plugin-examples` 中的现有工具，决定复用、迁移或保留插件形态，并提供兼容指引。

## 2. 阶段概览

| Wave | 主题 | 主要交付 | 验收重点 |
| --- | --- | --- | --- |
| Wave0 | 基座 + 矩形工具 | TDS/生成链、DrawingPrimitiveBase、Rectangle | Feature Flag、状态机、命中测试、文档/示例 |
| Wave1 | 基础形状 & 注释 | 椭圆、三角、多段线、文本 | 多点锚点、动态 handles、性能基线 |
| Wave2 | 测量 & 预测 | Long/Short Position、Price/Date Range、Forecast | 数值计算、轴外绘制、序列化 |
| Wave3 | 高级趋势/比例 | Fibonacci 系列、Gann Fan、Pitchfork | 多段几何、模板化配置、可扩展样式 |
| Wave4 | UI & 主题扩展 | Icons/Emoji、背景填充、主题系统 | 渲染层隔离、批量渲染性能 |
| Wave5 | 生态 & 稳定化 | 绘图集合、协同接口、对外 API 稳定 | 版本迁移、文档、插件迁移工具 |

## 3. TDS 管理与生成体系

- **Schema 位置**：所有工具在 `packages/specs/<tool>.yaml|json` 定义 TDS，包括 anchors、handles、states、views、autoscale、serialization、options、performance 配置。
- **生成流程**：运行 `npm run drawing-tools:generate` 生成 `src/drawing/**/__generated__`、runtime geometry、handle 控制器、测试模板、文档片段。
- **CI 守护**：
  - `npm run drawing-tools:generate --check` 确保生成物同步。
  - Lint 禁止直接从 `__generated__` 引入或修改。
  - 检查 `src/drawing/tools/<tool>.ts` 包含 `// @generated-entry`。
- **Schema 版本**：维护 `schemaVersion`，在工具升级时提供迁移脚本与文档说明。
- **文档**：`docs/drawing-tools/gap-analysis.md`、各 Wave 设计文档需记录 TDS 状态与变更。

## 4. 各 Wave 关键目标

### Wave0（基座 + 矩形）

- 建立 TDS → 生成链 → 基座抽象。
- 实现 Rectangle（矩形）工具，涵盖 add/preview/edit/delete/undo/redo/autoscale/序列化。
- Feature Flag：`drawingTools`、`drawingTools.rectangle`。
- 测试：单测、E2E、性能、memlab。
- 文档：示例、官网教程、gap 分析、插件迁移指南。

### Wave1（基础形状 & 注释）

- Phase 1A：扩展 Handle、StateMachine、DrawingToolController；更新模板。
- Phase 1B：TDS 驱动椭圆、三角、多段线/路径工具；各工具补齐测试与文档。
- Phase 1C：文本注释（及图标/emoji 扩展）、序列化 Beta、插件对照测试。

### Wave2（测量 & 预测）

- 基于 TDS 实现 Long/Short Position、Price/Date Range、Forecast。
- 引入数据标签、未来时间绘制、复杂 autoscale。
- 序列化升级；性能与内存测试强化。

### Wave3（高级趋势/比例）

- Fibonacci 系列、Gann Fan、Pitchfork 等工具 TDS；模板化配置与多层渲染。
- 加强吸附、对齐、模板导入导出。

### Wave4（UI & 主题）

- Icons/Emoji、背景填充、主题系统整合。
- 绘图层级隔离、批量渲染性能优化。

### Wave5（生态 & 稳定化）

- 绘图集合管理、协同接口、权限控制。
- 对外 API GA、版本迁移工具、插件适配器。

## 5. 里程碑与验收

| 里程碑 | 条件 | 产出 |
| --- | --- | --- |
| M0 | Wave0 验收 | 生成链上线、Rectangle 工具 Beta、文档/示例/测试齐备 |
| M1 | Wave1 Phase A | 基座扩展、Feature Flag 框架、插件评估文档 |
| M2 | Wave1 Phase B | 椭圆/三角/Polyline 工具 + 测试 + 性能报告 |
| M3 | Wave1 Phase C | 文本工具 + 序列化 Beta + 插件对照 |
| M4 | Wave2 完成 | 测量工具集 + 数据验证 + E2E |
| M5 | Wave3 完成 | 高级趋势工具 + 模板系统 |
| M6 | Wave4 完成 | 主题化/批量渲染能力 |
| M7 | Wave5 完成 | 生态 API GA + 文档收官 |

## 6. 测试与质量策略

- 单测覆盖几何算法、状态机、handles、序列化。
- E2E 验证交互流程（Add/Preview/Edit/Delete/Undo/Redo/Autoscale/序列化）。
- 性能基线：FPS、内存、批量绘图压力测试；纳入 CI。
- Feature Flag 测试：关闭时所有测试应通过；开启后新增测试集。
- 回归防护：禁止手写 `__generated__`；入口脚本校验；PR checklist 强制 reviewer 验证。

## 7. 文档与示例策略

- 每个工具交付时同步更新：`docs/examples/drawing/<tool>`、官网教程、API 文档、Known Issues。
- gap-analysis 标记 TradingView 对照进度。
- 发布操作演示（可选）、CHANGELOG、UPGRADE-GUIDE。

## 8. 风险与缓解

- **生成链不稳定**：完善 TDS 模板、CI 检查；在 Wave0 完成 CLI 及守护脚本。
- **性能退化**：每波设定性能基准；若回归超阈值，阻止合并。
- **功能扩散**：未完成前的 Wave 禁止跨波次需求插队；必要时通过 RFC 评估。
- **插件兼容**：提供 `DrawingPrimitiveBaseAdapter`、插件迁移文档和对照测试。
- **团队认知缺口**：建立共享文档、状态机设计、handles 指南；定期演练。

## 9. Wave0 复盘与防回归清单

本节记录 Wave0 暴露出的关键问题、成因分析与 Wave1 的防回归方案，作为后续迭代的强制实践清单。

- 问题 A：Feature Flags 破坏（编译与运行时双失败）
  - 症状：
    - 生成产物中引用的 ensureFeatureFlagEnabled 无法正确导入或执行；编译报 TS1128/TS1161（常见于注释未闭合/BOM/拼写错误）。
  - 成因：
    - 对 [feature-flags.ts](lightweight-charts/src/feature-flags.ts:1) 进行手工修改时缺少 tsc 全量校验和单测兜底；
    - 生成产物依赖的导出契约不稳定，或曾引入循环/别名导出导致类型系统混乱。
  - 预防/修复：
    - “契约锁定”：固定导出集合 isEnabled()、requireEnabled()、setFeatureFlags()、ensureFeatureFlagEnabled()、resetFeatureFlags()、allFlags()，新增导出时必须附带单测；
    - CI 强制 tsc-verify 与 flags-off/flags-on 构造用例（参考 [feature-flags.spec.ts](lightweight-charts/tests/unittests/drawing/feature-flags.spec.ts:14)）；
    - 启用“受限导入”检查，禁止生产代码从 `__generated__` 直接导入（由 CLI 守护，见 [cli.mjs](lightweight-charts/packages/drawing-tools-generator/src/cli.mjs:500)）。

- 问题 B：Rectangle “生成物 vs 实现”职责误读
  - 症状：
    - 误以为生成文件需包含交互/句柄/序列化等全部逻辑，导致评估为“缺失能力”。
  - 成因：
    - 未明确“`__generated__` 仅含元数据/空钩子”的责任边界，真实行为在实现层。
  - 预防/修复：
    - 在设计与文档中强调分层：生成产物 [`__generated__/rectangle.ts`](lightweight-charts/src/drawing/tools/__generated__/rectangle.ts:1) 仅承载 spec/守护；行为落在实现层 [rectangle.impl.ts](lightweight-charts/src/drawing/tools/rectangle.impl.ts:30)；稳定入口 [rectangle.ts](lightweight-charts/src/drawing/tools/rectangle.ts:1) 只转发实现；
    - CLI 增加“实现存在性”检查与最小行为用例模板，防止只有生成骨架而无实现的情况。

- 问题 C：DrawingPrimitiveBase 体量过大、attach/detach/requestUpdate 复杂
  - 症状：
    - 回归概率高、阅读与调试成本大。
  - 成因：
    - 基座一次性承载过多职责（TTL 坐标缓存、指针事件工具、订阅管理）。
  - 预防/修复：
    - Wave1A 做“最小抽取”：将 TTL 缓存与 Pointer 工具下沉到 utils 层，保留对外 API 不变；为 attach/detach/requestUpdate 增加独立单测；
    - 引入更细粒度的状态机日志/钩子，便于问题定位（基于 [state-machine.ts](lightweight-charts/src/drawing/state/state-machine.ts:1)）。

- 问题 D：CLI 测试解析失败（多行字面量/模板字符串/ESM 差异）
  - 症状：
    - Node:test 在解析阶段报错，导致 CLI 套件无法全部运行。
  - 预防/修复：
    - 将长文本转移到 fixtures，通过 fs 读取；按主题拆分用例文件，降低交叉副作用；
    - 在 CI 固定 Node/OS 矩阵，确保跨平台一致性；CLI 的“--check/--watch/--generate”各分支单独覆盖。

- 问题 E：打包与 flags-off 用例无法本地通过
  - 症状：
    - [bundle-flags-off.spec.ts](lightweight-charts/tests/unittests/drawing/bundle-flags-off.spec.ts:4) 依赖 dist 生产包；本地 Windows 缺 cross-env/npm-run-all 或 npm 安装 EBUSY（puppeteer/memlab）。
  - 预防/修复：
    - CI 先行构建：npm ci → drawing-tools:generate --check → build:prod → test → size-limit；
    - 本地文档化：提供 Windows 指南与降级路径（npx cross-env、--no-optional、--ignore-scripts），明确“该用例以 CI 结果为准”。

- 问题 F：Axis-Pane 区间着色未内核化、Demo/Docs 未交付
  - 症状：
    - 插件矩形已包含轴 Pane 区间条，内核暂未实现；官网示例与教程空缺。
  - 预防/修复：
    - 在 Wave0 收尾明确“是否纳入内核矩形”，否则在文档中标注延期到 Wave1；
    - 文档/示例列为验收门槛（见下方最佳实践）。

### Wave1 防回归最佳实践（强制执行）

- 生成链与入口
  - 只从稳定入口导出（例如 [rectangle.ts](lightweight-charts/src/drawing/tools/rectangle.ts:1)），生产代码禁止 import `__generated__`（由 [cli.mjs.restricted-imports()](lightweight-charts/packages/drawing-tools-generator/src/cli.mjs:506) 守护）；
  - PR 必须通过 drawing-tools:generate --check，禁止手改 `__generated__`。

- Feature Flags 守护
  - 保持 [feature-flags.ts](lightweight-charts/src/feature-flags.ts:1) 导出契约稳定；新增 Flag 必须有“关闭报错/开启通过”的构造用例；
  - 面向“默认生产包零绘图导出”的打包策略，确保 flags-off 用例可在 CI 严格通过。

- CI 阶段顺序（硬约束）
  - npm ci → drawing-tools:generate --check → tsc-verify → build:prod → unit（含 flags-off 校验）→ size-limit → e2e/perf/memlab。

- 测试矩阵门槛
  - 每个工具必须具备：Add/Preview/Complete/Edit/Handles/HitTest/Autoscale/Serialize/Undo/Redo；
  - 性能与内存基线（200+ 实例/长拖拽），以及 demo 驱动的 E2E。

- 文档/示例门槛
  - 发布 `docs/examples/drawing/<tool>` 与官网教程页；插件迁移指南明确差异与迁移建议；
  - 在 [docs/drawing-tools/feature-flags.md](lightweight-charts/docs/drawing-tools/feature-flags.md:25) 更新“二级入口/Flag 使用”说明。

---

> Roadmap 会随着每波验收结果更新。若需调整优先级或新增功能，必须提交设计评审并同步更新本文档与相关 TDS。
