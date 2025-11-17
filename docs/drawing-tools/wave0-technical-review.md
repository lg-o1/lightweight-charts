# Wave0 技术审阅与收尾计划（含优先级与测试矩阵）

本报告针对 `d:\r\lightweight-charts` 当前代码与文档，评估 Wave0 是否达标、存在的主要差距与问题，并给出可操作的收尾计划与后续各波次引入顺序。重点覆盖：矩形工具（Box）、Feature Flags、生成链、测试与示例、与 TradingView 官方能力差距。

---

## 结论：Wave0 尚未达到“高质量验收”，但核心闭环已具备，可在 1-2 天收尾

> 重要更新（2025-11）：已移除 Feature Flags 的构建/运行时门禁，绘图工具默认开启、始终导出。兼容性 API 保留为 no-op，详见 [feature-flags.ts](lightweight-charts/src/feature-flags.ts:1)。CI 与文档已切换为单一基线（不再区分 flags-off/on）。

- 已具备：
  - 文档与路线图：`docs/waves.plan.md`、`docs/drawing-tools/*`（feature-flags、gap-analysis、wave0-design/phase/execution-plan/review）。
  - 构建与导出：绘图导出已默认注入（无需任何环境变量），见 [rollup.config.js](lightweight-charts/rollup.config.js:56)；`src/index.ts` 保持零引用；`src/standalone.ts` 暴露到 `window.LightweightCharts`。
  - 基座与管线：Primitive 接口、Pane/Axis 视图、命中测试（`pane-hit-test.ts`）、zOrder、Series/Pane attach/detach 包装器。
  - 插件对照：`plugin-examples` 提供矩形、趋势线、文本、背景着色等参考实现。
- 未达标项：
  - CI 串联未完整（size-limit 单一基线/E2E/单测未形成强保护）。
  - attach/detach/requestUpdate 的细粒度单测不足（滚动/缩放、BusinessDay 往返）；
  - 示例/官网教程收尾不足（特别是矩形 autoscale 仅影响垂直范围的说明）。
  - Demo 基线可视性不稳定（v0 页面在某些环境“空白”，详见下节排查与建议）。

## Demo 基线问题与建议（K线与成交量必须稳定显示）

- 现象：`lightweight-charts-demo/v0/index.html` 页面在当前环境呈现空白；控制台显示 `chart/series/volume` 已创建且 `setData` 调用成功。
- 已做处理：
  - 统一 vendor 构建与同步脚本（flags-on）：`scripts/sync-standalone-flags-on-to-demo-v0.js`；v0 改为使用 `standalone.development.js`（flags-on）；
  - v0 页面强制 `#chart` 高度 `600px`，避免 flex 初始高度为 0；`shared-demo.js` 强制优先 `addCandlestickSeries` 并生成 `Histogram` 作为成交量（回退到 `addHistogramSeries`）。
- 可能原因：
  1) 首帧布局尺寸为 0，导致内部 `fitContent` 无效；需在初始化后打印 `clientWidth/clientHeight` 并使用固定宽高进行一次 `applyOptions`，再 `fitContent`；
  2) 可视范围未包含数据点，`timeToCoordinate/priceToCoordinate` 返回 `null`；需检查 `setVisibleRange` 的入参是否与 `series.setData` 时间对齐；
  3) 叠加层（overlay）绘制路径虽 `pointerEvents:none`，但若误填充全屏不透明颜色会遮挡底层；建议默认禁用 overlay fallback，仅走 `attachPrimitive`，待基础渲染稳定后再打开。
- 建议的“稳妥可见”最小化策略：
  - 初始化时固定 `width=900,height=500`，打印容器尺寸与可视范围；
  - 初始仅创建 K线与成交量，不启用矩形工具与 overlay；确认可视后再启用绘图。

## 主要差距与大问题（代码与流程）

1) Feature Flags（已移除）
- 说明：Feature Flags 的构建/运行时门禁已删除，改为始终导出与始终可用；参见兼容性存根 [feature-flags.ts](lightweight-charts/src/feature-flags.ts:1)，其中 [isEnabled](lightweight-charts/src/feature-flags.ts:6)/[setFeatureFlags](lightweight-charts/src/feature-flags.ts:19)/[ensureFeatureFlagEnabled](lightweight-charts/src/feature-flags.ts:15) 等均为 no-op。
- 验证：保留单测以确保契约与“始终可用”行为，例如 [feature-flags.spec.ts](lightweight-charts/tests/unittests/drawing/feature-flags.spec.ts:11) 与 [bundle-flags-off.spec.ts](lightweight-charts/tests/unittests/drawing/bundle-flags-off.spec.ts:6)。CI 不再运行 flags-off/on 双基线。

2) 基座职责过重
- 当前 `DrawingPrimitiveBase/包装器` 同时承担坐标缓存、订阅管理、指针工具，复杂度高。
- 方案（Wave1A）：下沉 TTL 缓存与 Pointer 工具到 utils；为 attach/detach/requestUpdate 增加独立单测与更细日志钩子，降低回归概率。

3) 示例与官网教程缺口
- 文档齐备但教程与示例入口不完整；特别需要明确“矩形 autoscale 仅影响垂直范围”。

4) 入口与生成物边界
- 生产代码应仅通过稳定入口（例如 `src/drawing/tools/rectangle.ts`）转发到 `__generated__`；禁止直接 import `__generated__`。

## 与 TradingView 官方能力差距（按波次）
- Wave1：线族（水平/垂直/射线/线段）、椭圆/圆、三角、Polyline/Path、文本/注释。
- Wave2：Long/Short Position、Price/Date Range、Forecast。
- Wave3：Fibonacci 系列、Gann Fan、Pitchfork。
- Wave4：Fill Between Lines、背景与主题系统。
- Wave5：绘图集合、协同接口、权限、GA 对外 API 与迁移工具。

## Wave0 收尾计划（P0，1-2 天）

- Demo 基线稳定：禁用 overlay fallback，K线+成交量必须显示；初始化固定尺寸与日志打印；
- CI 串联（Windows 兼容）：
  - `npm ci` → `drawing-tools:generate --check` → `tsc-verify` → `build:prod` → `size-limit` → `e2e:rectangle`（最小交互流）。
- 单测补强：attach/detach/requestUpdate/ESC/undo/redo 边界；滚动/缩放拖拽稳定性；BusinessDay 往返一致性。
- 文档与示例：官网教程页与 `docs/examples/drawing/rectangle` 更新，显式说明 autoscale 行为。

## Wave1 引入顺序（基础形状与注释）

1) 线族（P1.1，优先）
- TDS：两点/无限端；状态机 `idle/anchoring/preview/editing/completed`；handles 支持拖拽与吸附；
- 测试矩阵：Add/Preview/Edit/Handles/HitTest/Autoscale（无限线）/Serialize/Undo/Redo；200+ 实例性能压测；
- 示例：独立与集成 demo 页面。

2) 椭圆/圆（P1.2）
- 锚点：中心+半轴/半径；旋转句柄；
- 测试：命中/handles/旋转与 autoscale；序列化。

3) 三角（P1.3）
- 三点 anchors；handles 与命中；
- 测试与示例同上。

4) Polyline/Path（P1.4）
- 多段节点录入、撤销最后节点、节点编辑；大节点数缓存优化；
- 测试：性能与内存基线；序列化。

5) Text/Note（P1.5）
- 文本输入与样式；命中区域=文本矩形；字体测宽缓存；序列化。

## Wave2（测量与预测）
- Long/Short Position：盈亏区间、标签、背景填色、轴外标签；
- Price/Date Range：横/纵测量、数值显示、autoscale 与命中；
- Forecast：未来时间区域绘制，timeScale 交互与序列化。

## Wave3（高级趋势/比例）
- Fibonacci（Retracement/Extension/Time Zones）、Gann Fan、Pitchfork：多段几何与模板系统、吸附/对齐；性能关注。

## Wave4（UI 与主题）
- Fill Between Lines、背景/主题系统、Icons/Emoji；渲染层隔离与批量性能优化。

## Wave5（生态与稳定化）
- 绘图集合管理、协同接口、权限；GA API 与迁移工具。

## 统一测试矩阵（所有新元素必须满足）

- 功能：Add/Preview/Complete/Edit（句柄/本体）/Delete/Undo/Redo/Serialize/Autoscale/HitTest。
- 交互：ESC/Del/Backspace；dblclick 进入编辑（如适用）；hover cursor 与 zOrder 命中优先级正确；
- 视图：pane/handles/timeAxis/priceAxis/axis-pane（如需）。
- 时间轴与坐标：UTCTimestamp/BusinessDay 等价路径；像素/坐标缓存与一致性；
- 性能与内存：200+ 实例压力、5s 长拖拽、合并/节流；attach/detach 无泄漏（句柄/视图释放）。
- E2E：最小用例与多实例用例；page console 透传到 runner；超时控制。
- 示例：`docs/examples/drawing/<tool>` 与官网教程页；插件对照说明。

## 代码审阅要点与建议（当前库）

- `rollup.config.js`：已支持 flags-on 注入导出；建议在 `package.json` 固定 `build:prod:flags-on` 与 size-limit 双基线并纳入 CI。
- `src/index.ts` / `src/standalone.ts`：保持零引用策略（默认入口不导出绘图），避免包体积回归；
- primitives/包装器/命中测试：结构清晰，建议为缓存与生命周期释放增加单测与日志；
- `docs/drawing-tools/feature-flags.md`：已更新为“绘图默认开启，无需 Flag”，并保留 autoscale 垂直范围说明；需在官网教程页同步；
- demo：建议最小化路径先只演示 K线与成交量，确认基础可视，随后再启用矩形与 overlay。

## 最终交付清单（Wave0 收尾）

- Demo 可视性稳定（K线+成交量必须显示，禁用 overlay fallback 验证 attachPrimitive）。
- CI：串联脚本（单一 size-limit 基线）；矩形最小 E2E 入 CI。
- 单测：attach/detach/requestUpdate、滚动/缩放与 BusinessDay 边界；
- 文档与示例：autoscale 行为说明、官网教程与 examples 完整。

---

> 若要调整优先级或新增功能，需同步更新 TDS 与本文档并走设计评审。
