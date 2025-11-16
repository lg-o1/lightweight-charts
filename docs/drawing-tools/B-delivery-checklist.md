# Wave0 收尾（B 交付）执行清单与脚本说明

目标：优先接通 CI 校验与最小 E2E，确保 Rectangle 基本交互闭环在 CI 中稳定可回归；随后再完善模板与文档。

一、已接通的校验与运行脚本
- 生成链/规范校验
  - drawing-tools:generate:check —— 生成物一致性校验（禁止手改 __generated__）
  - drawing-tools:check-entries —— 手写入口需包含 “// @generated-entry”，且生产代码禁止直接 import __generated__
  - drawing-tools:check-generated —— 对所有 spec 做生成物对比（--check 模式）
  - drawing-tools:lint-specs（新增）—— 校验 TDS：featureFlag 与 toolId 对齐、options 默认值/类型/enum 合法性、serializableOptions 类型等
- E2E（交互）
  - e2e:rectangle（新增）—— 仅运行矩形最小交互流：Add→Complete→Body Edit→Handle Edit→Undo/Redo→Autoscale→Delete
  - e2e:rectangle-flags-off（新增）—— 在 flags 关闭时构造 Rectangle 应失败（运行时守卫）
  - e2e:interactions —— 既有全量交互回归（flags-on 构建）
  - e2e:memleaks —— 既有内存泄漏回归（含 rectangle-no-leak.js）
- Size-limit（双基线）
  - size-limit:flags-off —— 确保默认构建不含绘图工具（零引用）
  - size-limit:flags-on —— 暂与 base 等价；待二级入口暴露后补绘图专属体积阈值
- 一键校验流程
  - verify（已串联：clean → drawing-tools:generate:check → check-entries → check-generated → lint-specs → lint → tsc-verify → 单测 → 两套 size-limit → dts 检查 → e2e:rectangle → e2e:rectangle-flags-off → e2e:interactions → e2e:memleaks → 类型检查）

二、如何本地快速验证（Windows）
1) 在仓库根目录执行：
   - npm run drawing-tools:lint-specs
   - npm run drawing-tools:generate:check
2) 构建并跑最小 E2E：
   - npm run build:prod
   - npm run e2e:rectangle
3) 运行 flags-off/flags-on 体积基线：
   - npm run size-limit:flags-off
   - npm run size-limit:flags-on
4) 全量验证（CI 等效）：
   - npm run verify

三、后续待办（持续 B）
- 模板与文档增强
  - tests 模板：选项去重/类型一致性、serializableOptions 覆盖
  - docs 模板：Feature Flag 启用示例、BusinessDay 注意事项、“水平范围不变”的 autoscale 说明
- 控制器改进提案（Wave1 执行）
  - 显式激活 & 多实例互斥策略，减少“最后注册者即活跃”的歧义

说明：本清单与脚本说明将随着 Wave0 收尾与 Wave1 推进持续更新。
