# Wave0 CLI Replacement Assessment for Lightweight Charts

目标
- 给出“用 TDS + CLI 生成器替换现有可视元素”的系统性可行性评估与落地路线，作为验证 CLI 设计正确性的真实对照基线。
- 优先选择“可无缝引入/并行对照、可跑既有 E2E”的元素，尽量不破坏现有稳定对外 API，在 PR 中以 Feature Flag/Shadow 实现为主。

范围说明
- “可视元素”聚焦 pane/series 层的绘制/命中/轴标签视图这类“注释/绘图/装饰”范畴。
- 核心引擎对象（Series 本体、Crosshair、Grid、Axes/Scales）不属于 TDS/CLI 替换目标（非“绘图工具/注释”）。

—

一、现有元素清单与替换评估

A. 插件类（src/plugins）
1) Series Markers
- 代码参照：
  - [SeriesMarkersRenderer.hitTest()](lightweight-charts/src/plugins/series-markers/renderer.ts:64)
  - [SeriesMarkersPaneView](lightweight-charts/src/plugins/series-markers/pane-view.ts:146)
  - 目录： [series-markers](lightweight-charts/src/plugins/series-markers/renderer.ts)
- 功能概述：
  - 在 series 上按 time/position/price 渲染箭头/圆/方/文本，支持 hoveredObjectId（通过 externalId）。
  - autoscale 受 barSpacing/shapeMargin 等影响。
- 替换评估：可替换，需扩展 TDS 为“集合（collection）工具”，生成 per-item 渲染/命中与 autoscale 边距逻辑。参考 [fillSizeAndY()](lightweight-charts/src/plugins/series-markers/pane-view.ts:69)。

2) Text Watermark / Image Watermark
- 代码参照：
  - [text-watermark/primitive.ts](lightweight-charts/src/plugins/text-watermark/primitive.ts:1)
  - [image-watermark/primitive.ts](lightweight-charts/src/plugins/image-watermark/primitive.ts:1)
  - 包装器： [Pane.attachPrimitive()](lightweight-charts/src/model/pane.ts:399)、[PanePrimitiveWrapper](lightweight-charts/src/model/pane-primitive-wrapper.ts:107)、[PrimitiveRendererWrapper.drawBackground()](lightweight-charts/src/model/pane-primitive-wrapper.ts:30)
- 功能概述：
  - pane 级非交互元素，常走 drawBackground（底层）或 bottom/normal/top 的 zOrder。
- 替换评估：高度可替换，最小模板（pane-primitive，无 anchors/handles，可选命中）。

3) Up/Down Markers Plugin
- 目录： [up-down-markers-plugin](lightweight-charts/src/plugins/up-down-markers-plugin/primitive.ts)
- 功能概述：
  - 变种 markers/集合工具，可能带“过期管理/窗口内清理”等。
- 替换评估：同 Series Markers 路线，作为集合工具的扩展用例。

B. 内建价格线（非插件）
1) Custom Price Line / 系列“价格线”
- 代码参照：
  - 工厂与管理：
    - [Series.createPriceLine()](lightweight-charts/src/model/series.ts:292)
    - [CustomPriceLine](lightweight-charts/src/model/custom-price-line.ts:14)
  - 视图：
    - [CustomPriceLinePaneView](lightweight-charts/src/views/pane/custom-price-line-pane-view.ts:7)
    - [CustomPriceLinePriceAxisView](lightweight-charts/src/views/price-axis/custom-price-line-price-axis-view.ts:11)
    - [SeriesPriceLinePaneView](lightweight-charts/src/views/pane/series-price-line-pane-view.ts:6)
  - 选项/默认：
    - [PriceLineOptions](lightweight-charts/src/model/price-line-options.ts:5)
    - [series-options defaults（priceLine*）](lightweight-charts/src/api/options/series-options-defaults.ts:14)
- 功能概述：
  - price-only 锚点（y 坐标），在 pane 绘制无限水平线并在 priceAxis 显示标签，支持 hoveredObjectId 命中。
- 替换评估：可替换（建议“生成器版价格线”为影子实现，不直接替换公开 API）。作为 series-primitive 工具：anchors=price；pane 视图 renderer=infinite-hline；priceAxis 标签视图；命中为“线粗度矩形”。

C. 非目标（不建议替换）
- Crosshair、Grid、Series 主渲染、Axes/Scales 等引擎基础设施。

—

二、命中/事件与 zOrder 通路（生成器产物必须遵守）

- 模型层聚合与 zOrder 竞争：
  - pane 命中： [hitTestPane()](lightweight-charts/src/model/pane-hit-test.ts:107)
  - primitive 命中返回结构： [PrimitiveHoveredItem](lightweight-charts/src/model/ipane-primitive.ts:82)
  - pane 聚合 primitive 与 dataSources 命中优先级（top/normal/bottom + isBackground）。
- hoveredObjectId 映射链：
  - GUI 侧封装： [ChartWidget._getMouseEventParamsImpl()](lightweight-charts/src/gui/chart-widget.ts:775)
  - API 暴露： [ChartApi._convertMouseParams()](lightweight-charts/src/api/chart-api.ts:425)
- 包装器/接线：
  - pane 原生包装： [PanePrimitiveWrapper](lightweight-charts/src/model/pane-primitive-wrapper.ts:107)、[PrimitiveWrapper.hitTest()](lightweight-charts/src/model/pane-primitive-wrapper.ts:102)
  - 插件侧包装（pane API）： [plugins/pane-primitive-wrapper.ts](lightweight-charts/src/plugins/pane-primitive-wrapper.ts:35)

说明：生成器模板的 renderer.hitTest 必须返回 externalId/zOrder，确保与现有 E2E 一致。

—

三、TDS 能力缺口与模板需求（覆盖现有元素）

A. 工具类型（kind）
- 'pane-primitive'：水印/非交互注释，可选命中，支持 draw/drawBackground、zOrder。
- 'series-primitive'：附着 series 的单实例（价格线/线段/水平带等）。
- 'series-primitive-collection'：集合性（markers），per-item 渲染/命中、数据订阅、autoscale 边距。

B. Anchors/Views/Labels/Handles
- anchors: [] | ['price'] | ['price-time', ...]（支持 price-only/infinite-line）
- views:
  - pane: { renderer: 'text' | 'image' | 'rectangle-fill' | 'infinite-hline' | 'marker-set', zOrder, drawBackground? }
  - timeAxis / priceAxis: { labels: [...] }（价格线/矩形的轴标签）
  - handles: zOrder='top'、cursor 样式
- states（交互工具）：idle/anchoring/preview/completed/editing（Wave0 已有）

C. 集合（collection）
- collection.items: { idKey, fields: [time, price?, position, shape, color, text, size] }
- autoscale：marker 边距策略（抽象自 [SeriesMarkersPaneView 填充逻辑](lightweight-charts/src/plugins/series-markers/pane-view.ts:69)）

D. 坐标/几何/性能
- 媒体/位图坐标处理；horizontal/vertical pixel ratio；文本测宽缓存（TextWidthCache）
- autoscale 与 barSpacing/shapeMargin 耦合点

E. 命中/事件
- renderer.hitTest → [PrimitiveHoveredItem](lightweight-charts/src/model/ipane-primitive.ts:82)：{ externalId, zOrder, cursorStyle?, isBackground? }

F. 序列化/Options
- options 默认值深合并（applyOptions）、snapshot 键路径列表

G. Feature Flag/入口守护
- // @generated-entry；公共导出走 Flag 守护（flag off 不导出/不打包）

—

四、可替换矩阵（建议推进顺序）

Wave0（立即可落地）
- Text Watermark（pane-primitive，无交互）：验证 drawBackground/zOrder，最小模板。
- Image Watermark（pane-primitive，无交互）：同上，附图片加载适配。
- Rectangle（交互工具）：Wave0 核心，覆盖 handles/state-machine/axis labels/autoscale/序列化。

Wave1（短期）
- Price Line（series-primitive，生成器影子版）：price-only/infinite-hline + priceAxis 标签 + hoveredObjectId 命中。
- 基础线段/水平带/价格范围（同类扩展）。

Wave1/2（集合）
- Series Markers / Up-Down Markers（series-primitive-collection）：per-item 渲染/命中、文本测宽缓存、autoscale 边距与 zOrder。

非目标
- Crosshair/Grid/Series/Axes/Scales。

—

五、对照验证（沿用现有 E2E）

- Price Line 用例：
  - [tests/e2e/interactions/test-cases/price-line/hovered-object-hit-test.js](lightweight-charts/tests/e2e/interactions/test-cases/price-line/hovered-object-hit-test.js)
  - [tests/e2e/interactions/test-cases/price-line/hovered-object-miss-test.js](lightweight-charts/tests/e2e/interactions/test-cases/price-line/hovered-object-miss-test.js)
- Markers 用例：
  - [tests/e2e/interactions/test-cases/markers/text-hit-test.js](lightweight-charts/tests/e2e/interactions/test-cases/markers/text-hit-test.js)
  - [tests/e2e/interactions/test-cases/markers/price-positioned-text-hit-test.js](lightweight-charts/tests/e2e/interactions/test-cases/markers/price-positioned-text-hit-test.js)
  - [tests/e2e/interactions/test-cases/markers/hit-test-after-timescale-change.js](lightweight-charts/tests/e2e/interactions/test-cases/markers/hit-test-after-timescale-change.js)
  - [tests/e2e/interactions/test-cases/markers/hit-test-priceline-overlap.js](lightweight-charts/tests/e2e/interactions/test-cases/markers/hit-test-priceline-overlap.js)
- Plugins 命中：
  - [tests/e2e/interactions/test-cases/plugins/pane-primitive-hit-test.js](lightweight-charts/tests/e2e/interactions/test-cases/plugins/pane-primitive-hit-test.js)
  - [tests/e2e/interactions/test-cases/plugins/hit-test-top.js](lightweight-charts/tests/e2e/interactions/test-cases/plugins/hit-test-top.js)
  - [tests/e2e/interactions/test-cases/plugins/custom-series-mouse-params.js](lightweight-charts/tests/e2e/interactions/test-cases/plugins/custom-series-mouse-params.js)

策略
- 为每个“生成器版元素”建立等价 E2E，尽量复用现用例；通过 hoveredObjectId/zOrder/命中范围一致性证明 CLI 正确性。
- Flag OFF 时 size-limit 验证“不打包”；Flag ON 校验新增体积阈值。

—

六、TDS 草案（示例）

A. Text Watermark（pane-primitive）
```json
{
  "toolId": "text-watermark",
  "kind": "pane-primitive",
  "anchors": [],
  "views": { "pane": { "renderer": "text", "zOrder": "bottom", "drawBackground": true } },
  "options": [
    { "name": "text", "type": "string", "default": "Lightweight Charts" },
    { "name": "fontFamily", "type": "string", "default": "system-ui" },
    { "name": "fontSize", "type": "number", "default": 48 },
    { "name": "color", "type": "color", "default": "rgba(0,0,0,0.08)" },
    { "name": "align", "type": "enum", "values": ["center","left","right"], "default": "center" }
  ],
  "serialization": { "version": 1, "snapshot": ["options"] }
}
```

B. Price Line（series-primitive，影子实现）
```json
{
  "toolId": "price-line",
  "kind": "series-primitive",
  "anchors": [{ "id": "price", "type": "price" }],
  "views": {
    "pane": { "renderer": "infinite-hline", "zOrder": "normal" },
    "priceAxis": { "labels": [{ "anchor": "price" }] }
  },
  "options": [
    { "name": "color", "type": "color", "default": "#FF0000" },
    { "name": "width", "type": "number", "default": 1 },
    { "name": "style", "type": "enum", "values": ["solid","dashed","dotted"], "default": "dashed" },
    { "name": "title", "type": "string", "default": "" }
  ],
  "hitTest": { "shape": "line-thickness", "cursorStyle": "default", "hoverExternalId": "TEST" },
  "serialization": { "version": 1, "snapshot": ["anchors.price", "options"] }
}
```

C. Series Markers（series-primitive-collection）
```json
{
  "toolId": "series-markers",
  "kind": "series-primitive-collection",
  "collection": {
    "idKey": "id",
    "item": {
      "fields": [
        { "name": "time", "type": "time" },
        { "name": "position", "type": "enum", "values": ["inBar","aboveBar","belowBar","atPriceTop","atPriceMiddle","atPriceBottom"] },
        { "name": "price", "type": "number", "optional": true },
        { "name": "shape", "type": "enum", "values": ["arrowUp","arrowDown","square","circle"] },
        { "name": "color", "type": "color" },
        { "name": "text", "type": "string", "optional": true },
        { "name": "size", "type": "number", "default": 1 }
      ]
    },
    "autoscale": { "mode": "marker-margins" }
  },
  "views": { "pane": { "renderer": "marker-set", "zOrder": "normal" } },
  "hitTest": { "shape": ["text-rect","marker-shape"], "cursorStyle": "pointer", "hoverExternalId": "$item.id" },
  "serialization": { "version": 1, "snapshot": ["collection"] }
}
```

—

七、模板与 CLI 生成要点

- 渲染器模板：
  - text/image/rectangle/arrow/circle/square/polyline、infinite-hline
  - 坐标空间：媒体/位图一致性；pixel ratio 修正；文本测宽缓存
- 命中模板：
  - 文本矩形、形状 hitTest、线粗度范围；返回 [PrimitiveHoveredItem](lightweight-charts/src/model/ipane-primitive.ts:82)
- 视图模板：
  - pane zOrder + draw/drawBackground；timeAxis/priceAxis 标签视图
- 适配与包装：
  - 通过 [PanePrimitiveWrapper](lightweight-charts/src/model/pane-primitive-wrapper.ts:107) 接入；series 侧提供 ISeriesPrimitive 适配
- 集合工具：
  - per-item 渲染/命中循环、数据订阅/更新、autoscale 边距
- 守护：
  - // @generated-entry；Feature Flag 导出；—check 校验 schemaVersion/生成物一致性

—

八、风险与非目标

- 风险
  - 将“生成器版”直接替换公开 API 实现，短期风险高；建议先影子并行，对照 E2E 达标后再讨论替换。
  - 集合工具在性能/内存与文本测宽缓存上需谨慎；E2E + 性能基线与 size-limit 必须齐全。
- 非目标
  - Crosshair、Grid、Series/Axes/Scales 不在 TDS/CLI 替换范围。

—

九、建议执行序（并行于“CLI 本体”开发）

S0（Wave0 内）
- 生成器版 Text/Image Watermark（pane-primitive，最小模板）
- 生成器版 Rectangle 工具（Wave0 目标）

S1
- 生成器版 Price Line（series-primitive，影子实现），回放 price-line E2E

S2
- 生成器版 Series Markers（series-primitive-collection），对照 markers E2E

S3
- Up/Down Markers（可选）

验收
- E2E：沿用上述测试文件（hoveredObjectId 命中/未命中、zOrder 竞争）
- size-limit：Flag OFF/ON 双基线；Flag OFF 确保“不打包”
- attach/detach：pane 侧生命周期断言
- 文档：示例页与迁移指南

—

十、与 Wave0 计划对齐

- Phase 0A：补齐模板与守护（check-entries/check-generated/—check/schemaVersion），Feature Flag 接入公共出口/构建
- Phase 0B：Rectangle 闭环 + 影子 Price Line
- Phase 0C：E2E/性能/内存基线、示例/迁移指南；Flag ON/OFF 体积阈值

参考关键代码入口
- 命中聚合与优先级： [hitTestPane()](lightweight-charts/src/model/pane-hit-test.ts:107)
- 悬停外部 ID 传递： [ChartWidget._getMouseEventParamsImpl()](lightweight-charts/src/gui/chart-widget.ts:775) → [ChartApi._convertMouseParams()](lightweight-charts/src/api/chart-api.ts:425)
- primitive 包装接入： [Pane.attachPrimitive()](lightweight-charts/src/model/pane.ts:399)、[PanePrimitiveWrapper](lightweight-charts/src/model/pane-primitive-wrapper.ts:107)
- Series Markers 渲染/命中： [SeriesMarkersPaneView](lightweight-charts/src/plugins/series-markers/pane-view.ts:146)、[SeriesMarkersRenderer.hitTest()](lightweight-charts/src/plugins/series-markers/renderer.ts:64)
- Price Line 组成： [Series.createPriceLine()](lightweight-charts/src/model/series.ts:292)、[CustomPriceLine](lightweight-charts/src/model/custom-price-line.ts:14)、[CustomPriceLinePaneView](lightweight-charts/src/views/pane/custom-price-line-pane-view.ts:7)、[CustomPriceLinePriceAxisView](lightweight-charts/src/views/price-axis/custom-price-line-price-axis-view.ts:11)

结语
- 按上述路线推进，可在 Wave0 内完成“pane-primitive + Rectangle”的生成器验证，并在 Wave1 将 Price Line/Markers 纳入影子对照，实现以真实 E2E/大小/性能指标证明 CLI 设计与实现的正确性。