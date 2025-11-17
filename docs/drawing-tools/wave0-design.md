# Wave0 设计：矩形（Box）绘图工具
目标：在 Lightweight Charts 内核中以统一抽象落地矩形绘图工具，涵盖 add/preview/edit/delete/undo/redo/autoscale/序列化，保持与 TradingView 绘图体验一致的基础能力，同时保证性能、内存与可维护性。

一、设计原则
- 统一抽象：基于 DrawingPrimitiveBase、StateMachine、HandlesController、Views 分层（pane、axis、axis-pane），避免耦合系列数据与价格轴。
- 生成链（TDS）：以 Tool Definition Schema 为单一事实来源，生成 __generated__ 元数据与测试模板，手写实现仅在非 __generated__ 层。
- 绘图工具默认开启、始终导出；兼容性 API 为 no-op（详见 src/feature-flags.ts），无需任何 Feature Flag。
- 性能与内存：坐标变换缓存、requestUpdate 合并与 RAF 调度；多实例与长拖拽性能基线纳入 CI。
- 兼容与演进：影子入口类稳定导出，内核实现置于单独文件，避免未来合并冲突。

二、TDS 规范（Rectangle）
- toolId：rectangle

- anchors：start、end（price-time）
- states：idle、anchoring、preview、editing、completed
- handles：四角句柄（topLeft、topRight、bottomLeft、bottomRight）
- views：pane（矩形填充）、handles（正方形句柄）、timeAxis/priceAxis（起止标签）
- autoscale：vertical-bounds（不改变水平范围）
- serialization：version=1；snapshot=[anchors.start, anchors.end, options]
- options：
  - fillColor、previewFillColor、labelColor、labelTextColor、showLabels
- testing：
  - unit：几何归一化、状态流转、句柄移动、autoscale、序列化往返
  - e2e：add-preview-complete、handle-drag-edit、delete-undo-redo、autoscale 验证
  - performance：maxInstances=200、targetFps=60

三、实现映射（核心文件）
- 生成元数据：src/drawing/tools/__generated__/rectangle.ts
- 稳定入口影子类：src/drawing/tools/rectangle.ts
- 内核实现类：src/drawing/tools/rectangle.impl.ts
- 插件参考（对照/迁移）：plugin-examples/src/plugins/rectangle-drawing-tool/rectangle-drawing-tool.ts

四、交互流程与状态机
- idle：
  - 首次点击设置 start 锚点，进入 anchoring。
- anchoring：
  - 移动定义 end 预览，进入 preview。
  - 再次点击确定 end，进入 completed。
- preview：
  - 移动更新 end 预览，保持 preview。
  - 点击确定 end，进入 completed。
- editing：
  - 句柄拖拽调整对应角坐标。
  - 本体拖拽整体平移（后续补充）。
- completed：
  - 可进入编辑或序列化、删除等操作。

五、句柄与命中测试
- 句柄：
  - 四角句柄，统一样式与渲染（正方形、hover/active 颜色）。
  - 通过 HandlesController 维护，updateAllGeometry 刷新坐标与样式。
- 命中测试：
  - 优先句柄命中，返回 zOrder=top 与光标类型。
  - 其次矩形本体命中，返回 zOrder=normal 与移动光标。
  - 未命中返回 null。

六、视图分层与轴标签
- pane：
  - 矩形填充视图（normal z-order）。
  - 句柄层视图（top z-order）。
- axis：
  - priceAxis/timeAxis 视图各自生成起止标签（可配置是否显示）。
- axis-pane（可选）：
  - 可在后续阶段扩展区间着色条等。

七、autoscale 策略
- 垂直范围：
  - 从 anchors.start/end 的价格范围合并出 min/max，并返回 AutoscaleInfo。
- 水平范围：
  - 不改变时间轴范围，避免影响系列数据显示。
- 性能：
  - 坐标查询使用 environment.coordinateTransform 缓存与 TTL，减少重复计算。

八、序列化与反序列化
- 快照结构：
  - version: 1
  - anchors.start: { time, price }
  - anchors.end: { time, price }
  - options: { fillColor, previewFillColor, labelColor, labelTextColor, showLabels }
- API 建议：
  - toJSON(): Snapshot
  - fromJSON(snapshot: Snapshot): RectangleDrawingPrimitive
- 演进：
  - 后续版本通过 schemaVersion 与迁移器处理字段变化。

九、撤销/重做与删除
- 操作定义：
  - AnchorChange、OptionsChange、Delete
- 栈结构：
  - undoStack、redoStack，编辑时推入；删除时记录快照用于还原。
- 删除：
  - detach 并清理句柄与视图；触发 requestUpdate。

十、性能与内存准线
- 多实例：
  - 200+ 矩形同时存在时保持 60 FPS；句柄重绘与几何更新需合并与节流。
- 长拖拽：
  - 持续 5s 拖拽保持稳定帧率与低 GC 压力。
- 内存：
  - 创建/删除循环后无显著泄漏，句柄与视图对象正确释放。

十一、测试矩阵（Wave0）
- Unit：
  - 元数据一致性（spec）与影子入口导出。
  - 状态机流转：点击/移动从 idle 到 completed。
  - 句柄生成与命中：四角命中、光标类型、zOrder。
  - 本体命中与移动光标。
  - autoscale：垂直范围合并正确。
  - 序列化/反序列化：快照往返。
  - requestUpdate：合并与 RAF 调度（在单测中劫持 requestAnimationFrame 同步执行）。
- E2E：
  - add → preview → complete → handle drag → edit → delete → undo/redo。
- 性能/内存：
  - 200+ 矩形压测、5s 拖拽、GC 稳定性。

十二、与插件示例的关系
- 矩形插件：
  - 具备点击/预览/完成与轴标签；但缺少统一句柄控制、状态机、序列化与撤销重做。
  - 内核实现取代插件作为正式能力，插件保留为演示与迁移参考。
- 背景着色与带状区域：
  - 插件通过系列渲染器实现背景着色；矩形需用 Pane Primitive 独立图层避免影响价格轴。
- 趋势线与文本：
  - 作为 Wave1 的基线工具，参考插件实现与内核抽象统一。

十三、生成链与 CLI
- 目标：
  - 提供 drawing-tools:generate 与 drawing-tools:generate --check 两个命令。
  - 从 packages/specs/<tool>.yaml|json 读取 TDS，生成 __generated__、测试模板与文档片段。
- 验证：
  - 在 CI 中强制执行 --check，禁止直接修改 __generated__。
- 目录：
  - packages/drawing-tools-generator 为 CLI 位置；在 test/ 中已有基础用例，需补齐 CLI 实现与集成。

十四、文档与示例交付
- 文档：
  - 本设计文档位于 docs/drawing-tools/wave0-design.md，与 Roadmap 对齐。
  - 官网 website/docs 增加“矩形工具”页面与使用教程。
- 示例：
  - 在 lightweight-charts/demos 新增 demo-annotations 页面，演示 add/preview/edit/delete/undo/redo。
- gap 分析：
  - 维护 docs/drawing-tools/gap-analysis.md，与 TradingView 绘图能力对照更新进度。

十五、迭代与验收（M0）
- 代码完成：
  - 完成矩形内核实现（交互、句柄、命中、autoscale）与序列化/撤销重做/删除。
- 测试通过：
  - 单测、E2E、性能/内存基线全绿。
- 文档就绪：
  - 设计文档、官网教程与示例完成。
- 生成链上线：
  - CLI 命令与 CI 校验工作流完成。

十六、后续优先级（进入 Wave1）
- 线族（水平/垂直/射线/线段）：优先交付。
- 椭圆/三角/多边形/路径：多点锚点与句柄机制复用。
- 文本注释（富文本框）：自由定位与样式选项。
- 均按上述抽象与测试矩阵推进，逐步拉近与 TradingView 的差距。

附录：关键代码映射（影子入口与实现类）
- 影子入口：src/drawing/tools/rectangle.ts 提供稳定导出，衔接 __generated__ spec 与外部 API。
- 实现类：src/drawing/tools/rectangle.impl.ts 承载状态机、句柄、命中、视图与 autoscale，保持与影子入口分离以降低合并冲突。
