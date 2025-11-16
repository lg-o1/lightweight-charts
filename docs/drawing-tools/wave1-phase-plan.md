# Wave1 阶段计划与设计整合版

> Wave1 在 Wave0 基座稳定（生成链与 Rectangle 工具全部验收）后启动。本文件整合 Wave1 阶段计划与设计，保留 Phase 拆分，同时覆盖架构扩展、TDS 规范、状态机要求、测试矩阵、文档及风险分析。
>
> **提交原则**：Wave1 新增的每个绘图工具必须先定义 TDS（存于 `packages/specs`），再通过 `npm run drawing-tools:generate` 生成代码；不得直接手写或修改 `src/drawing/**/__generated__` 文件。

---

## 1. 前置条件（Wave1 启动前）
1. **生成链闭环**：`packages/specs/*.yaml|json` → `drawing-tools-generator` → `src/drawing/**/__generated__` 全再生成；CI 含 `npm run drawing-tools:generate --check`。
2. **基座统一**：`DrawingPrimitiveBase`、HandleController、StateMachine 与 Wave0 一致，Feature Flag 校验完备。
3. **矩形工具验收**：Wave0 所有功能、测试、文档、示例、性能指标完成。
4. **测试框架**：`tests/unittests/drawing/**`、`tests/e2e/drawing/**` 已建立并通过。
5. **文档模板**：Rectangle 示例与官网说明作为后续工具模板。
6. **插件评估**：`plugin-examples` 内相关工具复用程度已记录。

### Pre-Wave1 加固项（Wave0 加固 gating）

为确保 Wave1 顺利推进，Wave0 在进入 Wave1 前需完成以下加固，并在 CI 中以 scripts.verify 执行为准（含 flags-off 与 flags-on 双模式）：

- 交互复杂度拆解（统一实现模板）
  - 将当前工具中的“点击/移动”大函数拆分为更小的交互原语：开始锚定、完成锚定、开始句柄编辑、应用句柄增量、开始主体拖拽、应用主体增量、取消指针等；要求每个原语具备独立单测与最小副作用。
  - 要求：任何工具不得在实现层直接订阅键盘事件；键盘事件统一由控制器转发（见“键盘事件集中管理”）。
  - 参考实现目录：[src/drawing/tools](lightweight-charts/src/drawing/tools) 与运行时几何：[src/drawing/runtime/geometry.ts](lightweight-charts/src/drawing/runtime/geometry.ts)。

- 样式与配置统一（上移到 TDS/options/集中默认）
  - 将句柄样式、光环、游标、hover/active 视觉状态等从具体工具实现层上移到 TDS/options 或集中默认配置，以便主题一致性与复用。
  - 生成模板需支持读取集中默认配置并允许工具覆写（schema 增加 handle 样式段）。
  - 涉及模板：
    - [packages/drawing-tools-generator/src/templates/tool.ts.tpl](lightweight-charts/packages/drawing-tools-generator/src/templates/tool.ts.tpl)
    - [packages/drawing-tools-generator/src/templates/runtime.ts.tpl](lightweight-charts/packages/drawing-tools-generator/src/templates/runtime.ts.tpl)
    - [packages/drawing-tools-generator/src/templates/doc.md.tpl](lightweight-charts/packages/drawing-tools-generator/src/templates/doc.md.tpl)

- 键盘事件集中管理（DrawingToolController）
  - 引入控制器统一路由 Esc、Backspace、Enter、双击结束、多工具互斥与激活/取消；工具仅暴露“可取消/可完成/可删除/可撤销”等能力接口，由控制器调度。
  - E2E 要求：多工具切换互斥无冲突、键盘事件不会泄漏到非激活工具。
  - 建议新增入口与文档，目录与文件名在设计评审后落地。

- BusinessDay 专项测试（时间轴一致性）
  - 在 BusinessDay 时间轴上补充：添加、主体拖拽往返（像素→时间→像素）一致性、跨非交易日边界、锚点量化/取整策略、序列化往返。
  - 测试位置建议：
    - E2E 交互：[tests/e2e/interactions/test-cases/drawing](lightweight-charts/tests/e2e/interactions/test-cases/drawing)
    - 单测矩阵：[tests/unittests/drawing](lightweight-charts/tests/unittests/drawing)

- 二级入口最小 API（默认入口零引用）
  - 规划二级入口 `lightweight-charts/drawing-tools`，仅暴露最小 API（例如 `chart.drawingTools().addRectangle(options)`），与 flags-on 按需导出结合，确保默认入口不引用绘图代码。
  - 需在打包与导出层添加映射与 Flag 守卫：
    - [rollup.config.js](lightweight-charts/rollup.config.js)
    - [package.json](lightweight-charts/package.json)
  - 增加 flags-off/flags-on 双模式 E2E 打包对照，验证“默认包不含绘图导出”。

- CI 与基线要求（作为 Wave0 验收 gating）
  - 运行 [package.json](lightweight-charts/package.json) 的 scripts.verify 全链路通过，含：
    - 生成链校验（generate --check / check-entries / check-generated）
    - 构建产物校验（tsc-verify / build:prod）
    - 单测 / 类型测试 / E2E（交互 + 内存）/ size-limit 双模式
  - 性能：≥200 形状实例下连续 5s 拖拽稳定（无掉帧预警、无控制台错误）。
  - 内存：memlab attach/detach 循环、销毁图表后可回收，泄漏基线通过。
  - 文档：新增矩形示例与教程，作为 Wave1 工具文档模板：
    - [docs/examples/drawing/rectangle/README.md](../examples/drawing/rectangle/README.md)

- DoD（Definition of Done）
  - 完成本节所有项并在 CI 中以 scripts.verify 严格通过，方可切换到 Wave1 Phase 1A。
---

## 2. 阶段拆分
| 阶段 | 名称 | 主要任务 | 验收标准 |
| --- | --- | --- | --- |
| Phase 1A | 基座加固 & 能力扩展 | 扩充 Handle/StateMachine、DrawingToolController、Feature Flag 子项、生成模板 | 单测更新；Feature Flag 框架就绪；插件评估文档完成 |
| Phase 1B | 基础几何工具 | 椭圆、三角形、多段线/路径工具（TDS→生成→实现） | 各工具功能闭环 + 单测/E2E/性能报告 + 示例/文档 |
| Phase 1C | 注释工具 & 收尾 | 文本注释/图标扩展、序列化 Beta、文档与插件对照测试 | 文本工具可用；序列化 Beta；全部文档/示例发布 |

---

## 3. 架构扩展
- **DrawingToolController**：管理工具激活、事件路由、toolbar 交互，提供 `activateTool/cancelActive/listActive` 等接口。
- **HandleController**：新增 handle descriptor，支持边中点、旋转柄、中心柄、文本对齐柄。
- **DrawingStateMachine**：支持 `multi-anchor` 流程（polyline），双击结束、Esc 取消、文本编辑状态。
- **Runtime Geometry**：实现 `ellipse.ts`, `triangle.ts`, `polyline.ts`, `text.ts`，提供归一化、hit-test、包围盒、吸附工具方法。
- **API**：`chart.drawingTools()` 增加 `addEllipse/addTriangle/addPolyline/addText`，全部受子 Feature Flag 控制。
- **序列化**：扩展 `chart.saveDrawings()/loadDrawings()` Beta（Flag），引入 `schemaVersion` 概念。

---

## 4. Phase 1A 任务
| # | 任务 | 内容 | 验收 |
| --- | --- | --- | --- |
| 1A.1 | HandleController 扩展 | 支持多种 handle 类型、旋转柄、拖拽钩子、吸附策略 | 新 handle 单测；API 文档更新 |
| 1A.2 | StateMachine 增强 | `multi-anchor`、双击结束、Esc 取消、文本编辑状态 | 状态机单测覆盖；日志验证 |
| 1A.3 | DrawingToolController | 统一工具激活与互斥；与 Feature Flag 集成 | 单测 + E2E 验证多工具切换 |
| 1A.4 | 生成模板更新 | TDS schema 扩展；模板支持 ellipse/triangle/polyline/text | CLI 生成骨架成功；`--check` 通过 |
| 1A.5 | 插件评估文档 | `docs/drawing-tools/plugin-migration.md` 初版 | 说明可复用 vs 重写的插件 |

---

## 5. Phase 1B：基础几何工具
### 5.1 椭圆（Ellipse）
- **TDS**：`price-time-center-radius` 锚点；handles（上下左右、四角、旋转柄）。
- **几何**：中心 + 半径 → Canvas；旋转支持；hit-test 使用椭圆公式。
- **测试**：单测（半径 0、旋转、缩放）、E2E（添加→编辑→删除、Undo/Redo、Autoscale）、性能（多实例）。
- **示例**：`docs/examples/drawing/ellipse`。

### 5.2 三角形（Triangle）
- **TDS**：三顶点锚点；handles 包含顶点、边中点、中心。
- **测试**：单测（退化情况）、E2E（多点编辑、Undo/Redo）。
- **示例**：`docs/examples/drawing/triangle`。

### 5.3 多段线/路径（Polyline/Path）
- **模式**：折线与自由绘切换；支持连续添加节点、双击结束、Backspace 删除。
- **测试**：单测（节点集合、序列化、Autoscale）、E2E（拖拽、撤销、≥400 节点性能）。
- **示例**：`docs/examples/drawing/polyline`。

---

## 6. Phase 1C：注释工具 & 收尾
### 6.1 文本注释（Text）
- 功能：文本内容编辑、字体/字号/对齐/背景；考虑 HTML overlay vs Canvas。
- 序列化：存储文本内容、样式、定位。
- 测试：单测（属性/序列化/国际化）、E2E（输入流程、Undo/Redo）、性能（≥500 文本实例）
- 示例：`docs/examples/drawing/text`。

### 6.2 图标/Emoji（可选）
- 基于文本工具扩展，支持 emoji 或 sprite；若延期到 Wave4，需在计划中标注。

### 6.3 序列化 Beta
- 扩展 `saveDrawings/loadDrawings`，引入 `schemaVersion`，提供迁移脚手架。
- 文档：`docs/drawing-tools/serialization-guide.md`（若延期需记录）。

### 6.4 文档 & 兼容
- 更新 `docs/drawing-tools/gap-analysis.md`、官网文档、示例、Known Issues。
- 插件对照测试：核心 vs 插件（line、annotation 等）。

---

## 7. 测试矩阵
| 项目 | 内容 |
| --- | --- |
| 功能流程 | Add → Preview → Finalize → Edit → Delete → Undo/Redo → Autoscale → 序列化 |
| 交互 | handle 拖拽、双击、Esc/Backspace、toolbar 激活 |
| 性能 | 多实例渲染（Polyline ≥400 点、Text ≥500 实例）保持 60 FPS |
| 内存 | memlab 长时间操作无泄漏 |
| Feature Flag | 子 Flag 关闭时 API 抛错；打开后测试通过 |
| 兼容性 | 多 Pane、对数/线性、未来时间、负价格 |

---

## 8. 文档与示例
- 每个工具发布：`docs/examples/drawing/<tool>`、官网文档章节、操作演示（可选）、gap-analysis 更新。
- 发布 `docs/drawing-tools/plugin-migration.md`，指导插件迁移。
- 更新 `CHANGELOG`、`UPGRADE-GUIDE`，记录新增 API 与 Feature Flag。

---

## 9. 风险与缓解
- **生成链漂移**：Phase 1A 完善模板 + CI；禁止手改生成文件。
- **多工具冲突**：`DrawingToolController` 管理互斥；单测/E2E 覆盖工具切换。
- **性能/内存回退**：建立基线；合并前运行 perf/memlab 测试。
- **序列化兼容**：设计 schemaVersion；提供迁移脚本；文档说明限制。
- **插件兼容**：评估文档、适配器、对照测试。
- **团队认知差异**：加强文档、注释、知识分享。

---

## 10. 里程碑
| 里程碑 | 时间 | 交付物 |
| --- | --- | --- |
| M1：Phase 1A 完成 | 第 1 周 | 基座扩展 + Feature Flag 框架 + 插件评估文档 |
| M2：Phase 1B 验收 | 第 3 周 | 椭圆/三角/Polyline 工具 + 测试 + 示例/文档 |
| M3：Phase 1C 验收 | 第 4 周 | 文本工具 + 序列化 Beta + 插件对照测试 + 文档收尾 |
| M4：Wave1 稳定 | 第 5 周 | 全量测试通过、gap-analysis 更新、Wave2 调研准备 |

---

## 11. Wave0 复盘 → Wave1 防回归最佳实践

- Feature Flags 守护
  - 锁定导出契约：isEnabled()、requireEnabled()、setFeatureFlags()、ensureFeatureFlagEnabled()、allFlags()、resetFeatureFlags()，对应单测与 tsc-verify。
  - 生成产物构造路径统一由 ensureFeatureFlagEnabled 守护（参考 [feature-flags.ts](lightweight-charts/src/feature-flags.ts:1) 与 [feature-flags.spec.ts](lightweight-charts/tests/unittests/drawing/feature-flags.spec.ts:14)）。
- 生成物 vs 实现分层
  - __generated__ 仅承载 spec、空钩子与守护（参考 [__generated__/rectangle.ts](lightweight-charts/src/drawing/tools/__generated__/rectangle.ts:1)），行为在实现层（参考 [rectangle.impl.ts](lightweight-charts/src/drawing/tools/rectangle.impl.ts:30)）；
  - 生产代码禁止直接 import __generated__，由 [cli.mjs.restricted-imports()](lightweight-charts/packages/drawing-tools-generator/src/cli.mjs:506) 守护。
- 基座最小抽取（Wave1A）
  - 将 TTL 坐标缓存、Pointer 工具抽成 utils，attach/detach/requestUpdate 增加独立单测。
- CLI 测试稳定
  - 长文本移入 fixtures；按主题拆分用例；CI 锁定 Node/OS 矩阵；覆盖 generate/check-entries/check-generated/watch 分支（参考 [cli.mjs](lightweight-charts/packages/drawing-tools-generator/src/cli.mjs:551)）。
- 打包与 flags-off 校验
  - CI 顺序：npm ci → drawing-tools:generate --check → tsc-verify → build:prod → unit（含 [bundle-flags-off.spec.ts](lightweight-charts/tests/unittests/drawing/bundle-flags-off.spec.ts:4)）→ size-limit → e2e/perf/memlab。
  - 默认生产包不含绘图导出；本地 Windows 提供 npx cross-env/--no-optional/--ignore-scripts 降噪指引，以 CI 结果为准。
- Axis-Pane 区间着色策略
  - 在 Wave1A 决策：纳入矩形内核或标注延期；若纳入，参照插件 [rectangle-drawing-tool.ts](lightweight-charts/plugin-examples/src/plugins/rectangle-drawing-tool/rectangle-drawing-tool.ts:163) 与 [rectangle-drawing-tool.ts](lightweight-charts/plugin-examples/src/plugins/rectangle-drawing-tool/rectangle-drawing-tool.ts:172) 实现 priceAxisPane/timeAxisPane 视图。
- DoD（Definition of Done）
  - 每个工具必须具备：Add/Preview/Complete/Edit/Handles/HitTest/Autoscale/Serialize/Undo/Redo；
  - 文档与示例：docs/examples/drawing/<tool>、官网教程、插件迁移指南；
  - 性能与内存：≥200 实例、长拖拽稳定、memlab 基线通过。

## 12. Wave2 展望
- Wave1 完成后进入 Wave2 的测量/预测工具（Long/Short Position、Range、Forecast），继续完善序列化、性能与插件兼容策略。
- 详细规划见 `waves.plan.md` 与后续 spec。

---

> Wave1 的目标是把基础形状与注释工具纳入核心，建立可复用的状态机、handle、序列化与性能测试体系。完成后，LWC 在基础绘图能力上将接近 TradingView 官方图表，为 Wave2 高级工具铺路。
