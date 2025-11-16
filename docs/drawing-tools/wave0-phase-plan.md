# Wave0 阶段计划与设计整合版

> 本文整合了 Wave0 “阶段计划”与“设计说明”两份文档的内容，既保留 Phase 视角的任务拆分，也涵盖架构、TDS、状态机、测试、文档、风险等全部细节。Wave0 的核心目标是在 Lightweight Charts 中建立通用绘图基座，并交付矩形（Rectangle）工具的完整功能闭环。
>
> **提交原则**：任何绘图工具改动必须先补齐对应 Tool Definition Schema（TDS），并通过 `npm run drawing-tools:generate --check` 生成所需代码，严禁手写或直接修改 `src/drawing/**/__generated__` 文件。

**TDS 格式约定**：统一使用 YAML（`.yaml`）存储 spec，便于手写时的可读性、注释支持与多行字符串编写。生成器同时兼容 JSON 解析，若后续自动化链路需要也可将 YAML 转为 JSON 使用。
---

**当前缺口提醒**：
- 生成链虽已支持 `packages/specs/rectangle.yaml` → `src/drawing/tools/__generated__/rectangle.ts` 的生成，但尚未将 `npm run drawing-tools:generate -- --check` 纳入 CI；需补齐模板使 runtime/test/doc 产物具备实际逻辑。
- `RectangleDrawingPrimitive` 仍缺 handles 布局、命中测试、autoscale、序列化、Undo/Redo 等实现。
- `DrawingPrimitiveBase`、HandleController、DrawingStateMachine` 仅完成基础梳理，attach/detach、坐标缓存、防抖机制及相关单测仍未落地。
- Feature Flag (`drawingTools` / `drawingTools.rectangle`) 尚未绑定 chart API，Flag 关闭场景未验证。
- 测试矩阵（单测/E2E/性能/内存）及 `docs/examples/drawing/rectangle` 等文档/示例仍待补齐。
### 执行计划（Step-by-Step）

1. **基座抽象补强（当前优先）**
   - 优化 [`DrawingPrimitiveBase`](lightweight-charts/src/drawing/drawing-primitive-base.ts:1)：补齐 attach/detach 生命周期、坐标缓存过期策略、防抖请求更新、事件订阅解绑等细节。
   - 引入 HandleController：集中管理 handles（创建/更新/命中测试/状态同步），提供拖拽与 hover 生命周期。
   - 为 DrawingStateMachine 扩展多状态流支持与重入 Guard。
   - 补充单元测试覆盖（attach/detach 行为、缓存命中、防抖逻辑、状态机转换、handle 命中测试等）。

2. **Feature Flag 守护 & API 验证**
   - 在 chart API / drawingTools API 入口绑定 `drawingTools` 与 `drawingTools.rectangle` flag。
   - Flag 关闭场景：调用相关 API 时抛出明确错误或提前返回。
   - 新增单测验证开关逻辑。

3. **Rectangle 工具完整实现**
   - 根据 TDS 生成/补写 handles、几何计算、命中测试、autoscale、序列化、Undo/Redo。
   - 与 HandleController/DrawingPrimitiveBase 对齐。

4. **测试矩阵补齐**
   - 单测：几何、handle 拖拽、状态机、序列化、Undo/Redo。
   - E2E：添加→编辑→删除、Flag 切换。
   - 性能/内存脚本：多实例绘制、长时间操作。

5. **文档与示例**
   - `docs/examples/drawing/rectangle` 示例。
   - FAQ/GAP 说明，演示脚本（可选）。

6. **生成链模板完善（收尾）**
   - Runtime、测试、文档模板产出真实骨架；纳入 `drawing-tools:generate -- --check` 守护。
## 1. 背景与范围
- **现状**：LWC 缺乏原生绘图工具，与 TradingView 官方图表在矩形、注释、测量等基础能力上存在明显差距，社区插件实现分散、缺乏统一抽象与测试保障。
- **Wave0 范围**：
  1. 统一绘图抽象（`DrawingPrimitiveBase`、`DrawingStateMachine`、`HandleController`）。
  2. 打通生成链：`packages/specs` → `drawing-tools-generator` → `src/drawing/**/__generated__`。
  3. 实现 Rectangle 工具，支持 add/preview/edit/delete/undo/redo/autoscale/序列化。
  4. 建立单测、E2E、性能、内存测试基线。
  5. 发布 Feature Flag、文档、示例、插件迁移指南。

---

## 2. 阶段拆分（保留 Phase 结构）
| 阶段 | 名称 | 主要任务 | 验收标准 |
| --- | --- | --- | --- |
| Phase 0A | 生成链 & 基座搭建 | Generator CLI/模板、`DrawingPrimitiveBase`、StateMachine、HandleController | `npm run drawing-tools:generate --check` 通过；基座单测 ≥90%；Feature Flag 守护就绪 |
| Phase 0B | Rectangle 工具实现 | TDS → 工具代码生成；实现状态机、handles、渲染、hit-test、autoscale、序列化 | 工具功能完整；`chart.drawingTools().addRectangle()` 可用；Feature Flag 默认关闭 |
| Phase 0C | 测试 & 文档收尾 | 单测/E2E/Perf/Memlab；Docs 示例；插件对照测试 | 测试全部绿灯；文档/示例发布；插件迁移指南上线 |

---

## 3. 架构设计概览
```
packages/
  specs/rectangle.yaml        <- Tool Definition Schema (TDS)
  drawing-tools-generator/    <- CLI + 模板
src/drawing/
  drawing-primitive-base.ts   <- 手写基类
  state/state-machine.ts      <- 状态机
  handles/*.ts                <- Handle 控制
  runtime/geometry/*.ts       <- 几何工具
  tools/rectangle.ts          <- 入口（@generated-entry）
  tools/__generated__/        <- 生成的工具实现
```
- **TDS**：定义 toolId、anchors、handles、states、views、autoscale、serialization、options。
- **Generator**：将 TDS 转为源码，生成工具类、runtime geometry wrapper、测试模板和文档片段。
- **DrawingPrimitiveBase**：统一 attach/detach、state machine 转发、坐标缓存、requestUpdate、防抖；提供 `afterStateTransition` 等扩展钩子。
- **HandleController**：管理 handle 集合，提供命中测试、拖拽回调。
- **DrawingStateMachine**：驱动 `idle`→`anchoring`→`preview`→`completed`→`editing` 的状态流，处理 pointer 事件。

---

## 4. Rectangle 工具详细设计
### 4.1 TDS 示例
```json
{
  "toolId": "rectangle",
  "featureFlag": "drawingTools.rectangle",
  "anchors": [
    { "id": "start", "type": "price-time" },
    { "id": "end", "type": "price-time" }
  ],
  "states": ["idle", "anchoring", "preview", "editing", "completed"],
  "handles": [
    { "id": "topLeft", "type": "vertex", "cursor": "nwse-resize" },
    { "id": "topRight", "type": "vertex", "cursor": "nesw-resize" },
    { "id": "bottomLeft", "type": "vertex", "cursor": "nesw-resize" },
    { "id": "bottomRight", "type": "vertex", "cursor": "nwse-resize" }
  ],
  "views": {
    "pane": { "renderer": "rectangle-fill", "options": { "supportsPreview": true } },
    "handles": { "renderer": "square-handle", "zOrder": "top" },
    "timeAxis": { "labels": [{ "anchor": "start" }, { "anchor": "end" }] },
    "priceAxis": { "labels": [{ "anchor": "start" }, { "anchor": "end" }] }
  },
  "autoscale": { "mode": "bounding-vertical", "padding": 0 },
  "serialization": { "version": 1, "snapshot": ["anchors.start", "anchors.end", "options"] },
  "options": [
    { "name": "fillColor", "type": "color", "default": "rgba(200, 50, 100, 0.75)" },
    { "name": "previewFillColor", "type": "color", "default": "rgba(200, 50, 100, 0.25)" },
    { "name": "labelColor", "type": "color", "default": "rgba(200, 50, 100, 1)" },
    { "name": "labelTextColor", "type": "color", "default": "#ffffff" },
    { "name": "showLabels", "type": "boolean", "default": true }
  ]
}
```

... (rest content unchanged)

## 附录：drawing-tools-generator CLI 实施步骤（Wave0 必备）

1. **目录结构与入口命令**
   - 在 [`packages/drawing-tools-generator`](lightweight-charts/packages/drawing-tools-generator/) 下实现统一 CLI。
   - 入口命令约定为 `toolgen generate <tool>`，支持 `--tool rectangle`（默认）、`--spec <relative/path>`、`--outDir`, `--watch`, `--check` 等参数。
   - 所有路径使用 `fileURLToPath` + `path.resolve` 解析到仓库根目录，避免工作目录差异。

2. **Schema 加载与校验**
   - CLI 先定位 `packages/specs/<tool>.json|yaml`，若不存在立即抛出友好错误。
   - 使用 JSON Schema（或统一校验模块）检查 anchors、handles、views、autoscale、serialization、options 字段完整性。
   - 对缺失或不支持的字段输出清晰提示，阻止继续生成。

3. **模板渲染与输出**
   - 模板目录规划：
     - `templates/runtime/*` → geometry/handle/controller 桩代码。
     - `templates/tool/*` → `src/drawing/tools/__generated__/<tool>.ts` 等。
     - `templates/tests/*` → 单测/E2E stub。
     - `templates/docs/*` → 文档片段（示例说明、配置表）。
   - 默认输出到 `src/drawing/**/__generated__`，若指定 `--outDir` 则覆盖。
   - 对应文件存在时可选择覆盖或在 `--check` 模式仅比较。

4. **比较与校验模式**
   - `toolgen generate --check <tool>`：生成到临时目录，与现有生成物做深度比较；若有差异返回退出码 1 并提示运行不带 `--check` 的命令。
   - `toolgen generate --watch`：监听 spec/模板变更，实时生成（开发辅助）。

5. **脚本封装与 CI 集成**
   - 在 [`package.json`](lightweight-charts/package.json:116) 添加：
     - `"drawing-tools:generate": "node packages/drawing-tools-generator/dist/cli.mjs generate"`
     - `"drawing-tools:generate:check": "npm run drawing-tools:generate -- --check"`
   - 将 `"npm run drawing-tools:generate -- --check"` 纳入 `verify` 或独立的 CI 工作流，确保 PR 必须先同步生成物。

6. **文档与开发者指南**
   - 在本文件及 `docs/drawing-tools/gap-analysis.md` 中补充 CLI 使用说明，涵盖：
     - 如何编写 TDS。
     - 常用命令示例。
     - `--check` 与 CI 的配合方式。
     - 常见错误及排查手册。
   - 在 PR 模板或贡献指南中加入 “运行 `npm run drawing-tools:generate` 并附带产物” 的检查项。

7. **后续扩展规划**
   - 生成器导出的类型/枚举应集中暴露，方便 Wave1+ 工具复用。
  - 后续可加入 `toolgen list`（列出所有可用 spec）与 `toolgen validate`（仅做 schema 校验）等命令，为更复杂的流水线预留空间。
  - 结合 `--watch` 模式，支撑未来 VSCode Task 或 IDE 插件的自动生成。

> 完成以上步骤后，Wave0 及后续所有 Wave 的绘图工具都能遵循 “先写 TDS → 运行 CLI → 生成/校验 → 再实现业务逻辑” 的闭环流程，显著降低人工失误与生成链漂移风险。