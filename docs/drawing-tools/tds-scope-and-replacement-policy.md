# TDS 适用范围与替换策略（Wave0/Wave1）

结论
- TDS 不用于替换“核心时间序列 Series”（蜡烛/Candlestick、Line、Area、Bar、Histogram、Volume 等），这些继续沿用现有强耦合 TypeScript/Canvas 实现与模型/坐标/性能管线。
- TDS 主要覆盖“绘图工具与叠加元素（Overlay/Plugin）”：矩形等 Drawing Tools、Watermark、Price Line、Series Markers（char/shape/text）。
- “basic plot element like char/shape” 本质属于 Series Markers，归类到基于集合的系列附属元素，建议以 series-primitive-collection 建模并生成。

术语与分类
- Series Markers 的形状与位置类型见 [ts.SeriesMarkerShape()](lightweight-charts/src/plugins/series-markers/types.ts:20)、[ts.SeriesMarkerPosition()](lightweight-charts/src/plugins/series-markers/types.ts:15)。
- 现有与“上/下标记”相关的插件示例参见 [ts.UpDownMarkersPrimitive()](lightweight-charts/src/plugins/up-down-markers-plugin/primitive.ts:26)，可为 TDS 版本提供行为参考（不直接替换核心 Series）。
- Series 侧附着式原语适配器见 [ts.SeriesPrimitiveAdapter()](lightweight-charts/src/plugins/series-primitive-adapter.ts:36)，便于理解系列层的接线方式。

为何不替换核心时间序列（原则）
- 强耦合模型：核心 Series 与 Chart 模型、价格轴/时间轴、共享状态、BarRenderer 等深度耦合，TDS 很难在不破坏性能与 API 兼容的前提下全量替代。
- 性能与内存：核心渲染路径经过长期优化（批绘制、可见窗口裁剪、比例尺计算、标度缓存等），生成代码难以保证等价性能。
- API 稳定性：对外 API 兼容与 bundle 体积控制要求高，贸然迁移风险大。
- 结论：核心 Series 保持现状；TDS 用于“外围增量能力”和“生成器正确性验证”的影子实现（shadow implementation）。

可由 TDS 覆盖的元素（优先级自下而上）
- Pane 级非交互：Text/Image Watermark（背景层）、简单装饰。
- 绘图工具：Rectangle（Wave0 验证主线），后续延伸 Line/HorizontalLine 等。
- Series 附属 Overlay：
  - Price Line：单实例 series-primitive，锚定 price，提供 pane 线与 priceAxis 标签视图。
  - Series Markers（char/shape/text）：集合型 series-primitive-collection，每个 item 具有 time 与价格/相对位置锚点。

Series Markers（char/shape/text）如何用 TDS 落地
- 数据建模：参考 types 中定义，保持用户可选 text 与 shape 的并存；id 用作 externalId 贯通 hoveredObjectId。
- 与现有类型映射：
  - shape -> [ts.SeriesMarkerShape()](lightweight-charts/src/plugins/series-markers/types.ts:20)
  - position -> [ts.SeriesMarkerPosition()](lightweight-charts/src/plugins/series-markers/types.ts:15)
  - text -> types.ts 中 text 可选字段
  - color/size -> 同名语义
  - id -> externalId（命中测试结果应返回此值）

- 建议的 TDS 规格草案（简化版）：

```json
{
  "name": "series-markers",
  "kind": "series-primitive-collection",
  "anchor": { "type": "price-time" },
  "item": {
    "id": "string",
    "time": "Time",
    "position": "SeriesMarkerPosition",
    "price?": "number",
    "shape?": "circle|square|arrowUp|arrowDown",
    "text?": "string",
    "color": "string",
    "size?": "number"
  },
  "render": {
    "pane": {
      "type": "marker-set",
      "zOrder": "top",
      "hitTest": "shape-or-text"
    }
  },
  "options": {
    "affectsAutoscale": false
  }
}
```

- 命中测试与层级：
  - 每个 item 的 hitTest 应返回 { externalId: id, zOrder }，并根据 shape/text 的像素边界命中。
  - 交互层级：zOrder=top，必要时支持 isBackground 覆盖（与内置元素竞争时遵循 zOrder）。

- Autoscale：
  - 默认不影响 autoscale（affectsAutoscale=false）。如需扩展，可允许 position=atPrice* 的点参与极值。

CLI 使用与产物
- 统一入口命令位于 [src/cli.ts](lightweight-charts/packages/drawing-tools-generator/src/cli.ts:1)，使用示例：

```bash
# 生成 Series Markers（集合型）影子实现（默认输出到 __generated__）
pnpm toolgen generate --spec packages/specs/series-markers.json --outDir src/drawing/tools/__generated__

# 生成 Rectangle（示例，使用内置模板）
pnpm toolgen generate --tool rectangle

# 监听变更
pnpm toolgen generate --watch --spec packages/specs/series-markers.json --outDir src/drawing/tools/__generated__

# 一致性校验（CI 可用）
pnpm toolgen generate --check
```

- 产物与入口边界：
  - 仅 __generated__ 由生成器覆盖，例如：src/drawing/tools/__generated__/series-markers.ts
  - 手写入口稳定在：src/drawing/tools/series-markers.ts（需包含 “// @generated-entry” 守护标记）
  - 通过 check-entries / check-generated / --check 保证边界与一致性。

与现有实现的关系与验证
- 行为参考：渲染与数据流可参考 [ts.UpDownMarkersPrimitive()](lightweight-charts/src/plugins/up-down-markers-plugin/primitive.ts:26) 的 paneViews/updateAllViews/requestUpdate 生命周期，迁移为 TDS 生成的 renderer + wrapper 结构。
- Series 适配：如需附着到某个 Series，可复用 [ts.SeriesPrimitiveAdapter()](lightweight-charts/src/plugins/series-primitive-adapter.ts:36) 的思路在手写入口中接线（不改变核心 Series 内部实现）。
- 事件链：命中测试返回 externalId 后，沿用现有 hoveredObjectId 管线把 id 透传到公开事件。

阶段化推进（自下而上）
- Wave0 / Phase 0A：生成器边界与守护（仅写 __generated__）、Feature Flag 接线（flag 关=不导出/不打包）、几何模块合并与模板对齐。
- Wave0 / Phase 0B：Rectangle 全链路；并行准备 series-markers 与 price-line 的 TDS 规格与模板，但仅做“影子实现”，默认 flag 关闭且不导出。
- Wave0 / Phase 0C：单测/E2E/性能/内存基线；验证 Feature Flag 关闭时零打包差异；样例与文档。

结语
- 回答问题：是的，TDS 不用于替换核心时间序列；basic plot element 的 char/shape 属于 Series Markers，适合用 series-primitive-collection 建模与生成，作为对现有实现的影子验证路径，不影响核心渲染管线与 API 稳定性。