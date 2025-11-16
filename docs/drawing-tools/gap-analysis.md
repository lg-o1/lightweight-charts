# 绘图能力差距分析（Gap Analysis）

> 目的：系统梳理 Lightweight Charts（LWC）当前与 TradingView 官方图表（TV Chart）在绘图与注释能力上的差距，为各 Wave 的需求优先级、范围和风险提供量化依据。

## 1. 基础图形工具对比
| 工具类型 | TradingView 支持 | LWC 现状 | 计划 Wave | 备注 |
| --- | --- | --- | --- | --- |
| 矩形（Rectangle/Box） | ✅ 完整交互 | ⚠️ Wave0 开发中 | Wave0 | 需完成生成链、状态机、序列化、Flag、测试、文档 |
| 椭圆/圆（Ellipse/Circle） | ✅ | ❌ 缺失 | Wave1 | 依赖中心+半径锚点、旋转/缩放 handle |
| 三角形（Triangle） | ✅ | ❌ 缺失 | Wave1 | 复用多点 polygon 几何；需 handle 控制 |
| 多段线/路径（Polyline/Path） | ✅（含自由绘制） | ⚠️ 插件示例 | Wave1 | 需支持多点录入、撤销最后节点、性能优化 |
| 文本注释（Text/Note） | ✅ 多样式 | ⚠️ 插件/标记 | Wave1 | 需处理文本输入、样式、序列化、多语言 |
| 图标/Emoji | ✅ | ❌ | Wave4 | 可基于文本扩展或 sprite |

## 2. 测量与预测工具对比
| 工具类型 | TradingView 支持 | LWC 现状 | 计划 Wave | 关键差异 |
| --- | --- | --- | --- | --- |
| Long/Short Position | ✅ | ❌ | Wave2 | 盈亏区间计算、标签、背景填色 |
| Price Range / Date Range | ✅ | ❌ | Wave2 | 横/纵向测量与 autoscale |
| Forecast | ✅ | ❌ | Wave2 | 需要时间轴外绘制、未来区域填充 |
| 价格/时间投影 | ✅ | ❌ | Wave3 | 时间预测、对数坐标适配 |

## 3. 高级趋势工具对比
| 工具类型 | TradingView 支持 | LWC 现状 | 计划 Wave | 说明 |
| --- | --- | --- | --- | --- |
| Fibonacci Retracement/Extension | ✅ | ❌ | Wave3 | 多级别比例线、模板配置 |
| Fibonacci Time Zones | ✅ | ❌ | Wave3 | 需要多时间锚点处理 |
| Gann Fan | ✅ | ❌ | Wave3 | 角度/比例计算、正交模式 |
| Pitchfork（Andrews 等） | ✅ | ❌ | Wave3 | 中线+平行支线，需多 anchor |

## 4. UI / 主题扩展
| 能力 | TradingView | LWC 现状 | 计划 Wave | 说明 |
| --- | --- | --- | --- | --- |
| 背景区域填充（Fill Between） | ✅ | ❌ | Wave4 | 需要 Pane overlay 与层级管理 |
| 渐变背景/主题 | ✅ | ⚠️ 自定义有限 | Wave4 | 需提供 Theme API 与绘图同步 |
| 批量操作（复制/粘贴/组合） | ✅ | ❌ | Wave5 | 依赖绘图集合与序列化管理 |
| 协同/共享绘图 | ✅（企业版） | ❌ | Wave5 | 需支持集合、权限、事件 |

## 5. 插件复用评估
| 插件示例 | 类型 | 现状 | 建议 |
| --- | --- | --- | --- |
| rectangle-drawing-tool | 基础矩形 | ✅ 存在 | Wave0 融合，保留对比测试 |
| horizontal-ray/line | 线段类 | ⚠️ 部分 | Wave1 前评估，提炼为核心工具底座 |
| annotation/text | 注释类 | ⚠️ 简单标签 | Wave1 参考，实现更完整文本工具 |
| long-short-position | 未提供 | ❌ | Wave2 新增，根据 TV 行为重构 |
| fibonacci 系列 | 未提供 | ❌ | Wave3 自研，考虑开源社区方案 |

## 6. 优先级与风险摘要
- **P0（立即）**：生成链、基座、Rectangle（Wave0）。
- **P1（高）**：Ellipse/Triangle/Polyline/Text（Wave1）。
- **P2（中）**：Long/Short、Range、Forecast（Wave2）。
- **P3（次）**：Fibonacci/Gann/Pitchfork（Wave3），需大量数学与模板。
- **P4（后）**：UI 主题、图标、批量操作、协同（Wave4-5）。

**主要风险**：
1. 生成链失效 → 在 Wave0 完成 CLI+CI 守护，PR Checklist。
2. 多工具交互复杂 → 引入 `DrawingToolController` 与统一事件路由。
3. 性能回退 → 各 Wave 制定 FPS/内存基准，持续监控。
4. 序列化兼容性 → 自 Wave0 起定义 schemaVersion 与迁移脚本。
5. 插件兼容 → 对所有保留 plugin 提供适配层与测试。

---

> 本文档需随着每个 Wave 的交付更新状态列（⚠️→✅），并记录新增风险或优先级调整。
