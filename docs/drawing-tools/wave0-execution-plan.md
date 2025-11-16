# Wave0 状态评审、差距与执行计划（含优先级与测试矩阵）

本报告针对 d:\r\lightweight-charts 的绘图能力（特别是矩形/Box）进行代码与文档审阅，并结合 plugin-examples、specs 与内核实现，给出 Wave0 完成度判断、主要差距与问题清单，以及从简单到复杂的引入计划与测试矩阵。内容以中文整理，便于团队落地。

—

## 一、结论摘要（Wave0 是否完成？）
- 结论：Wave0 尚未达到“高质量验收”，但核心闭环已具备，短期可收尾。
  - 已具备：
    - 生成链（TDS→代码/文档/模板）与守护脚本雏形；
    - 基座抽象（DrawingPrimitiveBase、HandlesController、StateMachine、Views 分层）；
    - Rectangle 工具（add/preview/complete/edit/handles/hitTest/autoscale[仅垂直]/serialize/undo/redo/delete/ESC）；
    - Feature Flags（drawingTools、drawingTools.rectangle）运行时守卫；
    - 文档体系（roadmap/phase/gap/flags/design/review）。
    - E2E 单例与 demo 手动验证：矩形绘制闭环在 v0 demo 正常工作。
  - 未完成：
    - CI 守护闭环（drawing-tools:generate --check、flags-off/on 双基线、size-limit、最小 E2E 纳入 CI）。
    - 基座 attach/detach/requestUpdate 的细粒度单测与边界用例（滚动/缩放中的稳定性、BusinessDay 往返拖拽）。
    - 文档与官网示例收尾（特别是“矩形 autoscale 仅垂直范围”的明确说明）。

## 二、主要差距与大问题（代码与流程）
1) Feature Flags 契约稳定性
   - 风险：导出集合不稳定/循环引用可能导致编译/运行时失败；flags-off 构建/E2E 未入 CI。
   - 建议：锁定导出集合 isEnabled/requireEnabled/setFeatureFlags/ensureFeatureFlagEnabled/resetFeatureFlags/allFlags，并配套单测与 flags-off/on 构造用例。

2) 基座职责过重
   - 现状：DrawingPrimitiveBase 同时承担 TTL 坐标缓存、Pointer 工具、订阅管理，复杂度高。
   - 建议（Wave1A）：下沉 TTL 缓存与 Pointer 工具到 utils 层；为 attach/detach/requestUpdate 增加独立单测与日志。

3) 键盘控制器路由策略
   - 现状：集中控制器“最后注册者即活跃”；多实例场景可能非期望。
   - 建议：提供显式激活 API（例：controller.activate(id)），并在 UI 交互中点击激活；Wave1 实施。

4) E2E/CI 稳定性
   - 现状：之前存在时序/未捕获异常导致超时；已在单例用例与 runner 提升稳定性（console 透传、60s case 超时、5min 总超时）。
   - 建议：仅用 Puppeteer 内置浏览器执行；把最小矩形用例纳入 CI；页面 console 透传到 runner 输出。

5) 文档与示例缺口
   - 现状：文档齐备，但官网教程与示例入口不足；
   - 建议：补齐 docs/examples/drawing/rectangle 与 website 教程，明确 autoscale 行为。

6) 入口与生成物边界
   - 建议：生产代码仅从稳定入口（rectangle.ts）导出；禁止 import __generated__；CLI 增加“实现存在性”检查。

## 三、与 TradingView 的能力差距（概览）
- Wave1：Ellipse/Circle、Triangle、Polyline/Path、Text/Note、线族（水平/垂直/射线/线段）。
- Wave2：Long/Short Position、Price/Date Range、Forecast。
- Wave3：Fibonacci Retracement/Extension/Time Zones、Gann Fan、Pitchfork。
- Wave4：Fill Between Lines、背景/主题系统。
- Wave5：绘图集合管理、协同/权限、对外 API 稳定。

## 四、从简单到复杂的引入顺序与优先级（详细）
- P0（Wave0 收尾，1-2 天）
  1) CI 串联：drawing-tools:generate --check → tsc-verify → build:prod → flags-off/on size-limit 双基线 → e2e 单例（矩形）。
  2) 文档/示例：补“矩形 autoscale 仅垂直范围”说明与官网教程；examples/drawing/rectangle 完整示例。
  3) 单测补强：attach/detach/requestUpdate/ESC/undo/redo 边界；滚动/缩放中拖拽稳定性；BusinessDay 往返。

- P1（Wave1 基础形状与注释）
  1) 线族（水平线/垂直线/射线/线段）
     - TDS：anchors=两点/无限端；states=idle/anchoring/preview/editing/completed；
     - 测试矩阵：Add/Preview/Edit/Handles/HitTest/Autoscale（无限线）/Serialize/Undo/Redo；
     - 性能：大量线段命中优先级与 zOrder。
  2) 椭圆/圆、三角
     - 椭圆：中心+半轴/半径；旋转/缩放句柄；
     - 三角：三点 anchors；
     - 测试：多点锚点、旋转句柄、命中与 autoscale。
  3) Polyline/Path（含自由绘制）
     - 功能：多段节点录入、撤销最后节点、节点编辑；
     - 性能：大节点数压力测试与缓存；
  4) Text/Note
     - 文本输入与样式；序列化；命中区域=文本矩形；字体测宽缓存。

- P2（Wave2 测量与预测）
  1) Long/Short Position：盈亏区间、标签、背景填色、轴外标签。
  2) Price/Date Range：横/纵测量、数值显示、autoscale 与命中。
  3) Forecast：未来时间区域绘制；timeScale 交互；序列化。

- P3（Wave3 高级趋势/比例）
  - Fibonacci/Gann/Pitchfork：多段几何与模板配置；吸附/对齐；性能关注。

- P4（Wave4 UI/主题）
  - Fill Between Lines、主题系统、图标/Emoji；渲染层隔离与批量性能。

## 五、统一测试矩阵（所有新元素必须满足）
- 功能：Add/Preview/Complete/Edit（句柄/本体）/Delete/Undo/Redo/Serialize/Autoscale/HitTest。
- 交互：ESC/Del/Backspace；dblclick 进入编辑（如适用）；hover cursor 正确；
- 视图：pane/handles/timeAxis/priceAxis/axis-pane（如需）。
- 时间轴：UTCTimestamp/BusinessDay（字符串与对象）等价路径；像素变换一致性（env.coordinateTransform）。
- 性能：200+ 实例；5s 长拖拽；合并/节流；低 GC 压力；
- 内存：attach/detach 无泄漏；句柄/视图释放；
- E2E：hoveredObjectId、zOrder 命中优先级、交互流程；
- 示例：docs/examples/drawing/<tool> 与官网教程。

## 六、插件复用与迁移建议（plugin-examples）
- rectangle-drawing-tool：功能较简单（点击/预览/完成、轴标签），缺少统一句柄/状态机/序列化/撤销重做；已由内核矩形覆盖。保留为迁移参考与对照测试。
- horizontal/vertical/trend-line、annotation/text：可作为 Wave1 影子实现的参考；对照 E2E；逐步迁移到内核抽象。
- 背景着色（background-shade-series）：提供“填充区域”视觉参考，但不应作为绘图工具实现（避免影响价格轴与 series）。

## 七、代码审阅要点与建议（核心文件）
- src/drawing/tools/rectangle.impl.ts
  - 优点：状态机/交互原语拆分；像素缓存支持 BusinessDay 命中；undo/redo/序列化与 axis 视图齐备；集中键盘控制器。
  - 改进：
    1) 键盘路由：提供显式激活 API（Wave1）。
    2) HandlesRenderer 复用：当前每次 new SquareHandleRenderer，可考虑复用/单例（低风险）。
    3) 边界单测：缩放/滚动中拖拽稳定性；BusinessDay 往返一致性。
    4) attached/detached：增加单测覆盖清理与重新接线；
    5) autoscale：文档需明确仅垂直范围，不改变水平范围。

- src/feature-flags.ts
  - 建议：导出集合契约锁定并加单测；flags-off/on 构造用例加入 CI。

- packages/specs/rectangle.yaml|json
  - 建议：对 options/defaults/states/handles/views/autoscale/serialization 明确 schemaVersion，并为 generator 增加“实现存在性”检查。

## 八、CI 串联脚本建议（Windows）
- verify:beta（CI）
  - npm ci
  - drawing-tools:generate --check
  - tsc-verify
  - build:prod
  - build:prod:flags-off && size-limit:flags-off
  - build:prod:flags-on && size-limit:flags-on
  - e2e:rectangle（仅 Puppeteer 内置浏览器）

## 九、文档与官网示例收尾
- docs/drawing-tools/feature-flags.md：已明确“dot-key”启用与 autoscale 行为；继续补官网教程页与 examples。
- website：新增“矩形工具”教程，演示 add/preview/edit/delete/undo/redo 与 autoscale 行为说明。

## 十、最终交付清单（Wave0 收尾）
- CI：新增/串联脚本与 flags 双基线；矩形最小 E2E 入 CI。
- 单测：attach/detach/requestUpdate、滚动/缩放与 BusinessDay 边界；
- 文档与示例：autoscale 行为说明、官网教程与 examples 完整。

—

> 本计划将随 Wave0 收尾与 Wave1 推进滚动更新；如需调整优先级，请在文档与 TDS 同步更新，并提交设计评审。
