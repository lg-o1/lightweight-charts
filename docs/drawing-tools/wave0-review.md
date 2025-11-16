# Wave0 评审与差距报告（Rectangle / 生成链 / 基座）

本文基于以下资料与代码自查：
- docs/waves.plan.md、docs/drawing-tools/wave0-design.md、wave0-phase-plan.md、gap-analysis.md、feature-flags.md、tds-scope-and-replacement-policy.md、cli-replacement-assessment.md
- 插件对照：plugin-examples/src/plugins/rectangle-drawing-tool/* 及相关插件
- 当前实现：src/drawing/tools/rectangle.impl.ts、src/drawing/controller/drawing-tool-controller.ts、src/drawing/handles/default-handle-style.ts 及单测
- 生成器：packages/drawing-tools-generator/src/cli.mjs 与模板

结论摘要
- Wave0 未完全“验收完成”，但核心闭环已基本成形，剩余项可在短期内补齐：
  - 已完成：基座抽象（初版）、Rectangle 核心交互（add/preview/edit/drag/handles/hitTest/axis labels/autoscale/serialize/undo/redo/delete）、集中键盘控制器（MVP）、默认句柄样式集中化、文档（内部架构/roadmap/设计/phase/gap/flags/TDS 范围/CLI 评估）、部分单测（BusinessDay、控制器分发、ESC 边界）。
  - 未完成/需补齐：E2E/性能/内存基线、官网/示例完善、CI 集成（generate --check、flags-off/flags-on、size-limit 双基线）、公共按需二级入口（可延后到 Wave0C/B 交付末尾）。

一、Wave0 验收标准与现状对照
- 生成链（TDS → 代码/测试/文档生成）
  - 现状：CLI 与模板存在；本次已增强 validateSpec 与新增 lint-specs 命令；check-entries/restricted-imports/check-generated 就绪。
  - 差距：CI 未强制 drawing-tools:generate --check；模板产出仍以“元数据/桩”为主（已去除明显 TODO），需在 Wave1 渐进完善。
- 基座抽象与 Feature Flags
  - 现状：DrawingPrimitiveBase/StateMachine/HandlesController 已接线；ensureFeatureFlagEnabled 守护接入；集中式键盘控制器（MVP）上线。
  - 差距：基座 attach/detach/requestUpdate 的细粒度单测与 TTL 缓存策略未覆盖；Flags-off 构建/E2E 未入 CI。
- Rectangle 工具（矩形）
  - 现状：实现 add/preview/complete、handles（四角）、本体拖拽、命中测试、axis 标签视图、autoscale（垂直范围）、序列化、undo/redo、delete/ESC；交互原语拆解完成；BusinessDay/控制器/ESC 单测。
  - 差距：E2E + 性能/内存基线；文档/示例补充；更多边界用例（跨周末往返拖拽、缩放/滚动时的交互稳定性）。
- 文档与示例
  - 现状：Roadmap/设计/Phase/GAP/Flags/TDS 范围/CLI 评估/内部架构文档已经齐备；examples/drawing/rectangle/ 存在。
  - 差距：官网教程页与 demo 统一入口；示例与当前实现联调说明；迁移指南（plugin → 内核）。

二、与 TradingView 的能力差距（核心项）
- Wave1 基础形状与注释：Ellipse/Circle、Triangle、Polyline/Path、Text/Note、基本线族（水平/垂直/射线/线段）、Icon/Emoji（可延到 Wave4）。
- Wave2 测量与预测：Long/Short Position、Price/Date Range、Forecast。
- Wave3 高级趋势/比例：Fibonacci Retracement/Extension/Time Zones、Gann Fan、Pitchfork。
- Wave4 UI/主题：Fill Between Lines/区域、渐变背景、主题系统。
- Wave5 生态：绘图集合、复制/组合、协同、权限与对外 API 稳定。

三、分波次落地计划（从简单到复杂）
- Wave0（收尾）
  1) CI 接线：drawing-tools:generate --check、tsc-verify、flags-off/flags-on、size-limit 双基线；E2E 最小用例（矩形套件）。
  2) 示例与文档：examples/drawing/rectangle 补完整 + 官网页；插件对照说明。
  3) 边界单测：跨周末往返拖拽、缩放/滚动过程中的 hover/drag 稳定性。
- Wave1
  1) 线族：水平线/垂直线/射线/线段（优先级 P0）。测试矩阵：add/preview/edit/命中/axis 标签/序列化/undo/redo；特殊：无限线 autoscale 与命中。
  2) 椭圆/圆（基于中心+半轴/半径），Triangle（多点）；测试：多点锚点、旋转/缩放句柄、hitTest。
  3) Polyline/Path：多段线/自由绘制，节点管理（撤销最后节点）、性能（节点数大）。
  4) Text/Note：文本输入、样式选项、序列化；命中区域=文本矩形；多语言/字体测宽缓存。
- Wave2
  1) Long/Short Position：盈亏计算、区域填充、标签；轴外标签；撤销/序列化。
  2) Price/Date Range：横/纵测量；显示范围数值；autoscale 与 hitTest。
  3) Forecast：未来时间区域绘制；与 timeScale 交互；序列化。
- Wave3
  - Fibonacci/Gann/Pitchfork：多段几何、模板配置、样式复合；吸附/对齐；性能注意。
- Wave4
  - Fill Between Lines、背景/主题 API、Icon/Emoji；渲染层隔离、批量渲染性能优化。
- Wave5
  - 集合管理/组合/复制、协同与权限、API 稳定、迁移工具。

四、每个新元素的测试与示例要求（统一清单）
- 功能：Add/Preview/Complete/Edit（句柄/本体）/Delete/Undo/Redo/Serialize/Autoscale/HitTest。
- 交互：keyboard（ESC/Del/Backspace）、dblclick 进入编辑（如适用）、hover cursor 正确。
- 视图：pane/handles/timeAxis/priceAxis/axis-pane（如需）。
- 时间轴：UTCTimestamp/BusinessDay 字符串/对象的等价性；像素空间变换一致性。
- 性能：200+ 实例/5s 长拖拽稳定；RAF 合并；最小 GC 压力；无内存泄漏（attach/detach 清理）。
- E2E：hoveredObjectId、命中优先级（zOrder）、交互流程。
- 示例：docs/examples/drawing/<tool>；官网教程更新；插件对照迁移说明。

五、代码评审要点与发现（当前实现）
- rectangle.impl.ts（优点）
  - 状态机与交互原语拆分清晰；BusinessDay/像素变换路径正确；undo/redo/序列化（v1）到位；axis 标签与 axis-pane 着色可选；集中键盘控制器替代实例级监听，消除 DOM 直绑。
- 风险/改进项
  1) 键盘控制器“最后注册者即活跃”：多实例时可能路由到非期望实例。建议 Wave1 提供显式激活 API 与多实例管理策略。
  2) updateAllGeometry 每次 new SquareHandleRenderer：可微调为单例/复用（低风险，当前无明显性能瓶颈）。
  3) 边界用例：缩放/滚动中拖拽的稳定性、跨非交易日往返拖拽的可逆性；建议补充单测。
  4) autoscale 仅垂直范围：符合设计，但需在文档解释不改变水平范围避免误解。
  5) Feature Flags：实现端已调用 ensureFeatureFlagEnabled，但需在 CI 中加入 flags-off/flags-on 构建与测试脚本，保证“未开不打包/开启可用”。
  6) 入口边界：生产代码禁止导入 __generated__（已有 CLI 守护）；影子入口（rectangle.ts）需确保存在并仅转发实现与 spec（检查通过后加入 verify）。

六、与 plugin-examples 的关系与复用
- 矩形插件：已被内核矩形覆盖并优化（handles/状态机/序列化/撤销重做/控制器）。建议保留插件用作迁移对照测试与示例参考。
- 线段/水平线/文本/markers 等：可在 Wave1 以 TDS 影子实现并对照插件/E2E；逐步迁移。

七、Wave0 收尾待办（可在 1-2 个工作日内完成）
1) CI/脚本：
   - drawing-tools:generate --check 纳入 verify；flags-off/flags-on size-limit 双基线脚本；最小 E2E（矩形）纳入 CI。
2) 示例/文档：
   - 完成 examples/drawing/rectangle 与官网教程页；补充“矩形 autoscale 与水平范围不变”的说明；插件迁移指南。
3) 单测补强：
   - 缩放/滚动中拖拽稳定性、跨周末往返一致性；多实例时控制器路由风险的暂时规避（例如点击激活最近交互实例）。

八、后续波次优先级（高→中→低）
- 高：线族、Ellipse/Triangle、Polyline、Text、Price Line（影子）。
- 中：Long/Short、Range、Forecast。
- 低：Fibonacci/Gann/Pitchfork、Fill Between、主题、Icon/Emoji、协同/批量操作。

九、附：矩形（Rectangle）当前能力清单（核对）
- add/preview/complete：已实现
- edit：四角句柄与本体拖拽：已实现
- delete/ESC：已实现（控制器分发）
- undo/redo：已实现（栈深 64）
- autoscale（vertical bounds）：已实现
- serialize/deserialize（v1）：已实现
- axis labels/timeAxis/priceAxis：已实现（可关闭）
- axis-pane 着色条：已实现（可选效果）
- BusinessDay：单测覆盖（字符串与对象语义兼容路径需继续覆盖）
- E2E/性能/内存：待补

——
更新记录：本报告将随 Wave0 收尾与 Wave1 推进滚动更新。
