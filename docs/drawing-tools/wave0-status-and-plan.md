# Wave0 状态评审与分波次落地计划（含代码审阅与测试矩阵）

本文针对 d:\r\lightweight-charts 的绘图能力（尤其是矩形/Box）进行代码与文档审阅，判断 Wave0 是否完成、当前差距与重大问题，并给出从简单到复杂的落地顺序、测试与示例要求，以及与 TradingView 官方图表的差距与弥合路径。内容以中文整理，便于团队执行。

—

## 一、结论摘要：Wave0 是否完成？
- 结论：Wave0 尚未达到“高质量验收”，但核心闭环已具备，可在 1-2 天内完成收尾。
  - 已具备：
    - 生成链（TDS→代码/文档/模板）与守护脚本雏形：`packages/specs/rectangle.(yaml|json)`、`packages/drawing-tools-generator/*`、`src/drawing/tools/__generated__/rectangle.ts`；
    - 基座抽象：`DrawingPrimitiveBase`（坐标缓存/订阅/RAF 合并）、`DrawingStateMachine`、`HandlesController`、`controller/drawing-tool-controller`（集中键盘分发）、`runtime/geometry.ts`；
    - Rectangle（矩形）工具：`rectangle.impl.ts`实现了 add/preview/complete、四角句柄、本体拖拽、命中测试、轴标签视图、axis-pane 着色条、autoscale（仅垂直范围）、序列化/反序列化（v1）、undo/redo、delete/ESC；
    - Feature Flags：已移除构建/运行时门禁；[`src/feature-flags.ts`](lightweight-charts/src/feature-flags.ts:1) 现为兼容性存根（API 恒为开启，均为 no-op）。
    - 文档体系：`docs/waves.plan.md`、`docs/drawing-tools/*`（design/execution/technical-review/review/feature-flags/gap-analysis）。
    - 插件对照：`plugin-examples/src/plugins/rectangle-drawing-tool/*` 等提供参考实现与示例。
  - 未完成：
    - CI 串联与强保护：`drawing-tools:generate --check`、size-limit 单一基线、最小 E2E 入 CI（矩形交互流）；
    - attach/detach/requestUpdate 的细粒度单测与边界用例（缩放/滚动、BusinessDay 往返拖拽一致性）；
    - 官网/示例收尾：补 `docs/examples/drawing/rectangle` 与 website 教程页，明确“矩形 autoscale 仅垂直范围不改变时间轴”。

## 二、主要差距与重大问题（代码/流程）
1) Feature Flags（已移除）
- 说明：构建与运行时门禁已删除，绘图工具默认开启、始终导出；[`src/feature-flags.ts`](lightweight-charts/src/feature-flags.ts:1) 保留兼容性 API（no-op，恒为启用）。
- 方案：保留契约导出单测，统一采用单一 size-limit 基线与 E2E 冒烟用例，不再区分 flags-off/on。

2) 基座职责过重
- 现状：`DrawingPrimitiveBase` 同时承担 TTL 坐标缓存、订阅管理、指针事件工具、RAF 合并，复杂度较高。
- 方案（Wave1A）：下沉 TTL 缓存与 Pointer 工具到 utils；为 attach/detach/requestUpdate 增加独立单测与日志钩子，降低回归风险。

3) 键盘控制器路由策略
- 现状：集中控制器采用“最后注册者即活跃”原则，多实例时可能路由到非期望实例。
- 方案：提供显式激活 API（如 controller.activate(id)），并在 UI 交互中点击激活；Wave1 实施。

4) E2E/CI 稳定性与 Demo 基线
- 现状：E2E 时序/未捕获异常可能导致超时；部分环境 v0 demo 页面空白。
- 方案：仅用 Puppeteer 内置浏览器运行；最小矩形用例入 CI；页面 console 透传到 runner；Demo 初始化固定尺寸、先行 K线+成交量后再启用绘图。

5) 入口与生成物边界
- 要求：生产代码仅通过稳定入口（`src/drawing/tools/rectangle.ts`）转发，禁止直接 import `__generated__`；CLI 增加“实现存在性”检查。

## 三、与 TradingView 能力差距（概览）
- Wave1：Ellipse/Circle、Triangle、Polyline/Path、Text/Note、线族（水平/垂直/射线/线段）。
- Wave2：Long/Short Position、Price/Date Range、Forecast。
- Wave3：Fibonacci Retracement/Extension/Time Zones、Gann Fan、Pitchfork。
- Wave4：Fill Between Lines、背景填充/主题系统、Icons/Emoji（可并入文本工具）。
- Wave5：绘图集合管理、协同接口/权限、对外 API 稳定与迁移工具。

## 四、从简单到复杂的引入顺序与优先级
- P0（Wave0 收尾，1-2 天）
  1) CI 串联：`drawing-tools:generate --check → tsc-verify → build:prod → size-limit → e2e:rectangle`。
  2) 文档/示例：补“矩形 autoscale 仅垂直范围”说明与官网教程；`docs/examples/drawing/rectangle`。
  3) 单测补强：attach/detach/requestUpdate/ESC/undo/redo 边界；缩放/滚动拖拽稳定性；BusinessDay 往返一致性。

- P1（Wave1 基础形状与注释）
  1) 线族（水平/垂直/射线/线段）
     - TDS：anchors=两点/无限端；states=idle/anchoring/preview/editing/completed；handles 支持拖拽与吸附；
     - 测试矩阵：Add/Preview/Edit/Handles/HitTest/Autoscale（无限线）/Serialize/Undo/Redo；性能：大量线段命中优先级与 zOrder；
     - 示例：独立/集成 demo 页面与官网教程。
  2) 椭圆/圆、三角
     - 椭圆：中心+半轴/半径；旋转/缩放句柄；
     - 三角：三点 anchors；
     - 测试：多点锚点、旋转句柄、命中与 autoscale；序列化。
  3) Polyline/Path（含自由绘制）
     - 多段节点录入、撤销最后节点、节点编辑；
     - 性能：大节点数压力测试与缓存；
  4) Text/Note
     - 文本输入与样式；序列化；命中区域=文本矩形；字体测宽缓存。

- P2（Wave2 测量与预测）
  1) Long/Short Position：盈亏区间、标签、背景填色、轴外标签。
  2) Price/Date Range：横/纵测量、数值显示、autoscale 与命中。
  3) Forecast：未来时间绘制；timeScale 交互；序列化。

- P3（Wave3 高级趋势/比例）
  - Fibonacci 系列、Gann Fan、Pitchfork：多段几何与模板系统、吸附/对齐；性能关注。

- P4（Wave4 UI/主题）
  - Fill Between Lines、主题系统、Icons/Emoji；渲染层隔离与批量性能优化。

## 五、每个新元素的统一要求（TDS/交互/视图/测试）
- TDS：`packages/specs/<tool>.yaml|json` 定义 anchors/handles/states/views/autoscale/serialization/options/performance。
- 交互：Add/Preview/Complete/Edit（句柄/本体）/Delete/Undo/Redo/ESC；dblclick 进入编辑（如适用）；hover cursor 与 zOrder 命中优先级正确。
- 视图：pane/handles/timeAxis/priceAxis/axis-pane（如需）。
- 时间轴/坐标：UTCTimestamp/BusinessDay（字符串与对象）等价路径；像素/坐标缓存一致性（环境变换+TTL）。
- autoscale：明确策略（垂直范围/无限端）；不得改变 timeScale 水平范围（除测量/预测工具另有设计）。
- 序列化：`version` 与迁移器；往返测试；集合管理预留。
- 性能与内存：200+ 实例压力、5s 长拖拽、RAF/节流/合并；attach/detach 无泄漏（句柄/视图释放）。
- E2E：最小交互流；多实例；console 透传到 runner；超时控制。
- 示例：`docs/examples/drawing/<tool>` 与官网教程页；插件对照迁移说明。

## 六、代码审阅与改进建议（核心文件）
- `src/feature-flags.ts`
  - 现状：兼容性存根（always-on）；契约导出保留且均为 no-op。
  - 建议：
    - 保留导出集合并以单测确认行为恒为允许；清理文档与示例中的 Flag 调用。
    - CI 仅保留单一 size-limit 基线与构造冒烟用例。

- `src/drawing/drawing-primitive-base.ts`
  - 优点：生命周期清晰、TTL 缓存与 RAF 合并、统一订阅管理；抽象扩展点完备（collectViews/performHitTest/updateAllGeometry等）。
  - 改进：
    - 下沉 TTL 缓存与指针工具；attach/detach/requestUpdate 增加单测与日志钩子。
    - `_flushUpdate` 清理缓存策略在高频拖拽下注意性能；可引入分层缓存或局部失效。

- `src/drawing/controller/drawing-tool-controller.ts`
  - 优点：集中键盘分发，避免每实例绑 DOM 事件；安装/卸载自洽。
  - 改进：显式激活 API；多实例路由策略与焦点管理；E2E 覆盖 ESC/Delete。

- `src/drawing/handles/*`
  - 优点：句柄数据结构清晰、渲染器抽象；命中测试简单鲁棒。
  - 改进：`updateAllGeometry` 每次 `new SquareHandleRenderer()` 可微调复用；引入“halo”或更丰富命中区域策略；统一默认样式。

- `src/drawing/runtime/geometry.ts`
  - 优点：像素空间几何简洁可靠；兼容 BusinessDay/time → px 映射失败返回 null。
  - 改进：抽取公共几何工具，后续可复用到线段/椭圆等；增加单测覆盖边界（null/NaN/极值）。

- `src/drawing/tools/rectangle.impl.ts`
  - 优点：状态机与交互原语拆解，undo/redo/序列化（v1）到位；axis 标签与 axis-pane 着色条可选；像素缓存支持 BusinessDay fallback。
  - 改进建议：
    1) 键盘路由：多实例激活管理（Wave1）。
    2) `updateAllGeometry` 的渲染器实例复用；`HandleStyle` 合并策略统一。
    3) 边界单测：缩放/滚动中拖拽稳定性、跨非交易日往返一致性；`attached/detached` 清理验证。
    4) 文档明确 autoscale 仅垂直范围，避免误解为改变时间轴。

- `plugin-examples/src/plugins/rectangle-drawing-tool/*`
  - 结论：插件实现更简单（点击/预览/完成、轴标签），缺少统一状态机/句柄控制/序列化/撤销重做/集中键盘；内核矩形已覆盖并增强。保留为对照测试与迁移参考。

## 七、插件复用与迁移建议（plugin-examples）
- 线段/水平线/文本/markers：作为 Wave1 影子实现参考；对照 E2E；逐步迁移到内核抽象。
- 背景着色（background-shade-series）：提供“填充区域”视觉参考，但不应作为绘图工具实现（避免影响价格轴）。

## 八、CI 与脚本建议（Windows 兼容）
- verify（CI）：
  - `npm ci`
  - `drawing-tools:generate --check`
  - `tsc-verify`
  - `build:prod`
  - `size-limit`
  - `e2e:rectangle`（仅 Puppeteer 内置浏览器）

## 九、验收门槛（所有新工具统一）
- 功能与交互：Add/Preview/Complete/Edit（句柄/本体）/Delete/Undo/Redo/Serialize/Autoscale/HitTest/ESC/Del/Backspace/dblclick（如适用）。
- 视图层：pane/handles/timeAxis/priceAxis/axis-pane（如需）；zOrder 命中优先级正确。
- 坐标与时间轴：UTCTimestamp/BusinessDay 等价路径；像素/坐标缓存与一致性。
- 性能与内存：200+ 实例/5s 长拖拽、RAF 合并与节流；attach/detach 无泄漏。
- E2E：最小交互流与多实例；console 透传；严格超时控制。
- 示例与文档：`docs/examples/drawing/<tool>` 与官网教程页；插件迁移说明。

## 十、Wave0 收尾行动清单（P0，1-2 天）
1) CI/脚本：串联并纳入 verify；单一 size-limit 基线；最小 E2E（矩形）。
2) 单测：attach/detach/requestUpdate、缩放/滚动拖拽稳定性、BusinessDay 往返一致性。
3) 文档与示例：autoscale 行为说明；examples 与官网教程页；插件迁移指南。

——
本文将随 Wave0 收尾与 Wave1 推进滚动更新。若需调整优先级或新增功能，需同步更新 TDS 与本文档并走设计评审。
