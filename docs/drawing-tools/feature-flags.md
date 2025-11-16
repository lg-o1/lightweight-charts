# Wave0 Feature Flags 接线与按需打包草案

概述
- 目标：在 Feature Flag 关闭时不导出、不被打包；在开启时可按需暴露能力，避免影响默认体积与兼容性。
- 范围：公共入口、生成产物入口、打包与 size 限制校验。
- 当前选择“并行推进”：不改变现有公共导出，仅落地导出侧零引用策略与 size-limit 双基线脚本骨架。

相关文件
- 公共入口：[src/index.ts](lightweight-charts/src/index.ts)
- 独立构建入口（浏览器 UMD/Standalone）：[src/standalone.ts](lightweight-charts/src/standalone.ts)
- Feature Flags 定义与工具：[src/feature-flags.ts](lightweight-charts/src/feature-flags.ts)
- Drawing Tool 稳定包装入口（手写）：[src/drawing/tools/rectangle.ts](lightweight-charts/src/drawing/tools/rectangle.ts)
- Drawing Tool 生成产物（只允许写入此处）：[src/drawing/tools/__generated__/rectangle.ts](lightweight-charts/src/drawing/tools/__generated__/rectangle.ts)
- 体积基线配置： [.size-limit.js](lightweight-charts/.size-limit.js)
- 脚本配置： [package.json](lightweight-charts/package.json)

设计原则
- 公共入口不静态引用任何 Drawing Tools。保持零引用意味着在 Flag 关闭时实现“零导出/零打包”。
- 生成器仅写入 __generated__ 目录；稳定包装入口由手写维护并打上 “@generated-entry” 标记。
- 将来若需要对外暴露 Drawing Tools，采用独立的二级入口路径避免污染默认入口，保证 tree-shaking 可裁剪。
- 运行时 Flag 仅作为“最后防线”（阻止误用），真正的“未开不打包”依赖构建期零引用与 tree-shaking。

导出接线方案（草案）
1) 保持现状：不在 [src/index.ts](lightweight-charts/src/index.ts) 增加任何 Drawing Tools 的导出。
2) 生成器产物只经由稳定包装入口暴露：例如 [src/drawing/tools/rectangle.ts](lightweight-charts/src/drawing/tools/rectangle.ts)，其内部再转发到 [src/drawing/tools/__generated__/rectangle.ts](lightweight-charts/src/drawing/tools/__generated__/rectangle.ts)。
3) 未来新增“按需入口”（计划中，暂不启用）：提供一个二级入口路径（例如 lightweight-charts/drawing-tools），仅在需要时由应用显式导入，从而维持默认包的零引用。
4) 二级入口内部将基于 Feature Flag 决定暴露哪些包装入口，但不会在默认入口产生任何静态 import。

构建与打包策略
- 保持 [src/index.ts](lightweight-charts/src/index.ts) 与 [src/standalone.ts](lightweight-charts/src/standalone.ts) 不引用 Drawing Tools。
- 生成产物与包装入口的存在不影响默认构建，只要没有从公共入口导入，它们不会进入产物。
- 运行时对 Flag 的检查已由生成产物负责（构造/attach 时进行断言），用于防止误用；但这不会引入到默认包中，因为默认包没有引用这些模块。

size-limit 双基线（脚本骨架）
- 在 [.size-limit.js](lightweight-charts/.size-limit.js) 中加入模式开关，支持通过环境变量区分 flags-off 与 flags-on 模式。
- 在 [package.json](lightweight-charts/package.json) 中新增脚本：size-limit:flags-off 与 size-limit:flags-on。
- 目前两个模式均复用基础场景；待公共按需入口接线完成后，将在 flags-on 模式追加对二级入口的体积校验项。

建议的验证路径
- 保持默认 verify 流程不变，观察 size-limit 是否稳定。
- 手动运行 size-limit:flags-off 与 size-limit:flags-on 以确认脚本可用（当前两者等价，后续会在 flags-on 增加二级入口校验）。

后续工作
- 接入公共按需入口（轻量曝光）：创建独立入口文件并仅在 flags-on 校验时引用。
- 在 [.size-limit.js](lightweight-charts/.size-limit.js) 的 flags-on 模式下，新增“二级入口”体积阈值项，建立 OFF/ON 双基线报告。
- 在 CI 中分别运行两个 size-limit 模式，形成对比与回归（Phase 0C - size-limit 双基线）。
- 等待上游对公共导出的需求明确后，再切换到“二级入口”暴露策略，继续保持默认入口零引用。

注意
- 请勿从公共入口直接或间接导入任何 src/drawing/tools/*，否则会破坏“未开不打包”的保证。
- 仅允许生成器写入 __generated__ 子目录；稳定入口文件必须手写维护并带注释 “@generated-entry”。

## 启用方式（必须使用 dot-key）

- Beta 工具必须通过 dot-key 启用：`drawingTools.<tool>`，同时主开关 `drawingTools` 需要开启。
- 以矩形为例，必须如下启用（仅设置 canonical 键 `rectangle` 不会生效）：

```js
import { setFeatureFlags } from 'lightweight-charts/feature-flags';
setFeatureFlags({
  drawingTools: true,
  'drawingTools.rectangle': true,
});
```

- 运行时守卫以 dot-key 为准，参考构造阶段的双重校验入口（见 [function ensureFeatureFlagEnabled](lightweight-charts/src/feature-flags.ts:230) 与 [class RectangleDrawingPrimitive](lightweight-charts/src/drawing/tools/rectangle.impl.ts:76)）。