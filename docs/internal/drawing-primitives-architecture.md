# 绘图原语与控制器约定（Internal)

目标
- 统一绘图工具（Rectangle/后续：Ellipse/Triangle/Path/Text 等）的交互结构与事件路由，降低复杂度，避免重复代码
- 明确“状态机 + 原语方法 + 集中式键盘控制器”的分工与约束，提供可复用的实现套路
- 规范序列化/反序列化、时间轴（含 BusinessDay）处理、句柄样式读取、性能与内存管理

适用范围
- 目录：src/drawing/** 下的 DrawingPrimitive 系列实现
- 当前已应用：RectangleDrawingPrimitive（src/drawing/tools/rectangle.impl.ts）
- 后续建议参照本约定实现：Ellipse/Triangle/Path/Text 等

名词约定
- 原语（Primitive Methods）：指工具内部用于承载交互步骤的小而清晰的方法。示例：_beginAnchoring/_completeAnchoring/_beginHandleEdit/_applyHandleDelta/_beginBodyDrag/_applyBodyDelta/_pointerCancel
- 控制器（Controller）：集中式键盘分发（单例），负责把 keydown 事件路由给“最近注册”的活跃工具实例
- 状态机：DrawingStateMachine，负责工具的状态流转（idle/anchoring/preview/editing/completed）
- 句柄（Handle）：可交互的小控件（角点/边点），用于调整几何；统一样式来源 DEFAULT_HANDLE_STYLE

总体架构
- 层次
  - 输入层：指针事件（click/move/cancel/dblclick）与键盘事件（Escape/Delete/Backspace）
  - 路由层：
    - 指针事件 → 工具实例的 handlePointerXxx（内部再调原语方法）
    - 键盘事件 → 控制器单例（getDrawingToolController）→ onKeyDownFromController → 工具内部处理
  - 业务层：原语方法（小而清晰、便于复用与单测）
  - 视图层：pane/axis 视图与句柄渲染
- 依赖方向
  - 工具实例依赖控制器（注册/注销）
  - 句柄样式从 DEFAULT_HANDLE_STYLE 读取，允许 options 局部覆盖（若需要）

状态机与原语分工
- 状态机只负责“状态名 + 迁移”，不承载业务细节
- 工具实现应把主要交互逻辑拆到原语：
  - _beginAnchoring(event): 首次锚定（记录 start，状态 → anchoring）
  - _completeAnchoring(event): 补齐 end，状态 → completed，更新几何并请求刷新
  - _beginHandleEdit(handleId, event): 进入句柄编辑（记录原始锚点用于 ESC 回退）
  - _applyHandleDelta(handleId, event): 根据不同句柄更新 start/end 中相应的轴
  - _beginBodyDrag(event): 进入本体拖拽（记录原始锚点与拖拽起点，状态 → editing）
  - _applyBodyDelta(event): 通过像素空间变换统一更新 start/end（兼容 BusinessDay/UTCTimestamp）
  - _pointerCancel(): 统一处理 cancel（镜像 ESC 语义，anchoring/preview → idle；editing → completed 并回退到原始锚点）
- 外部的 handlePointerClick/Move/Cancel/DblClick 只负责轻薄的决策与原语分派

指针事件与命中测试
- performHitTest(event):
  - 若命中句柄 → 返回 cursor 与 zOrder=top，同时 handlesController().setHovered(handleId)
  - 若命中本体 → 返回移动 cursor 与 zOrder=normal
  - 否则 → 返回 null 并清除 hovered
- updateAllGeometry():
  - 基于工具几何计算句柄位置，使用 BaseHandle + SquareHandleRenderer（或其他 renderer）
  - 统一样式：DEFAULT_HANDLE_STYLE；更新已有句柄时 updateStyle/updateMetadata

键盘事件控制器约定（src/drawing/controller/drawing-tool-controller.ts）
- 单例 + 栈式管理：最近注册的实例视为活跃实例
- 工具实例在 attached() 注册，在 detached() 注销；严禁实例级 window.addEventListener 监听
- 工具需实现 onKeyDownFromController(ev) 入口，内部转发到私有处理（例如 _onKeyDown）
- MVP 语义（已实现）：
  - Escape：anchoring/preview → idle（清空锚点）；editing → completed（回退到原始锚点）
  - Delete/Backspace：删除当前图形 → idle
- Wave1 可选增强：显式激活 API、多工具互斥策略、分组/场景化键盘映射

句柄样式（src/drawing/handles/default-handle-style.ts）
- 统一 DEFAULT_HANDLE_STYLE，避免每个工具硬编码
- renderer 应处理 hovered/active 状态对应的填充色优先级（activeFill > hoverFill > fill）
- 如需选项覆盖，建议：options.handleStyle?: Partial<HandleStyle>；合并策略仅用于渲染，勿写入快照

序列化策略
- toJSON()/fromJSON():
  - 包含版本号与锚点（start/end）+ options 快照（仅可序列化字段）
  - 不包含运行时状态（hovered/active/dragStartPx 等）与函数（formatter 等）
  - 反序列化后，延迟到 attached() 再更新几何（环境依赖）
- 撤销/重做：
  - _undoStack/_redoStack 采用快照；删除/编辑前均 pushUndo，栈深限制（建议 64）

时间轴与 BusinessDay
- 统一通过 environment.coordinateTransform 进行像素空间变换：
  - priceToCoordinate/coordinateToPrice
  - timeToCoordinate/coordinateToTime（支持 UTCTimestamp/BusinessDay/string）
- 本体拖拽必须以像素差（dx/dy）计算，以保证不同时间类型下几何一致

性能与内存
- requestUpdate：在单测环境已做 RAF 合并，业务中仍应避免不必要的反复调用
- 句柄管理：几何无效时调用 handlesController().clear()
- 监听器管理：只通过控制器注册/注销；detached() 必须清理临时状态（_dragTarget/_origStart/_origEnd/_dragStartPx）

单测策略
- 行为单测（已覆盖）
  - 添加/预览/完成状态流转
  - 命中测试（句柄/本体）
  - 轴标签视图存在性
  - autoscale 价格区间与边距
- 控制器路径
  - Escape/Delete 分发行为
- BusinessDay
  - Add → Preview → Complete
  - 本体拖拽像素变换（dx/dy → price/time 更新）
- 边界
  - anchoring/preview 下 ESC 回 idle 且清空锚点

新增工具的实现步骤（建议流程）
1) 在 src/drawing/tools/<tool>.impl.ts 建立骨架，register 状态机（idle/anchoring/preview/editing/completed）
2) 实现命中测试与 updateAllGeometry（驱动句柄）
3) 拆分原语并在 handlePointerXxx 中分派
4) attached/detached 中注册/注销控制器；实现 onKeyDownFromController
5) 实现 toJSON/fromJSON/undo/redo
6) 单测：行为/控制器/BusinessDay/边界

常见 Anti-pattern
- 在工具内部直接绑定 window 键盘事件（应通过控制器）
- 将运行时/函数型字段写入序列化（快照中禁止存函数/DOM/上下文对象）
- 在坐标/时间更新时不走像素空间变换导致 BusinessDay 下行为不一致

未来演进
- 控制器：引入显式激活/焦点机制；多实例互斥策略；多工具快捷键映射
- 原语模板：沉淀到生成器（packages/drawing-tools-generator/templates/runtime.ts.tpl）
- 句柄：可扩展的 handle 渲染与形状（圆/菱形）选择

附：Rectangle 与原语对照
- click 第一次 → _beginAnchoring
- move in anchoring → 状态 → preview（end 跟随鼠标）
- click 完成 → _completeAnchoring （更新 end，状态 → completed）
- click 命中句柄 → _beginHandleEdit；move → _applyHandleDelta
- click 命中本体 → _beginBodyDrag；move → _applyBodyDelta
- cancel/Escape → _pointerCancel（anchoring/preview → idle；editing → completed）
