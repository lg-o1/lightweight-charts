# 矩形（Rectangle）绘图工具示例与使用说明

目标

- 演示在默认包（绘图始终开启）环境下创建与交互矩形绘图工具的最小用法。
- 覆盖：创建图表/序列、附加 `RectangleDrawingPrimitive`、交互要点（添加/编辑/删除/撤销重做/序列化）。

前置条件

- 使用 `dist/lightweight-charts.standalone.development.js` 或生产版 Standalone/ESM 入口；无需任何 Feature Flag。
- 请通过本地 HTTP 服务器访问页面（避免 `file://` 导致的模块加载限制/CORS）。

示例（最小 HTML 页面）

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <title>Rectangle Drawing Tool Demo</title>
    <style>
      #container { width: 800px; height: 600px; }
    </style>
  </head>
  <body>
    <div id="container"></div>
    <!-- 引入 Standalone 构建（绘图已默认开启） -->
    <script src="./lightweight-charts.standalone.development.js"></script>
    <script>
      (function () {
        const LWC = window.LightweightCharts;

        // 无需任何 Feature Flag。直接使用绘图工具。

        // 1) 创建图表与序列
        const container = document.getElementById('container');
        const chart = LWC.createChart(container);
        const series = chart.addSeries(LWC.LineSeries);
        const data = [];
        const t0 = Math.floor(Date.now() / 1000);
        for (let i = 0; i < 300; i++) {
          data.push({ time: t0 + i * 3600, value: 100 + Math.sin(i / 10) * 10 });
        }
        series.setData(data);

        // 2) 创建并附加矩形绘图实例
        const rect = new LWC.RectangleDrawingPrimitive();
        series.attachPrimitive(rect);

        // 3) 交互说明
        // - 点击一次：设置起点（进入 anchoring）
        // - 移动鼠标：预览终点（进入 preview）
        // - 再次点击：完成（进入 completed）
        // - 点击四角句柄：进入 editing，拖动以调整
        // - 点击矩形内部：进入 editing，拖动整体平移
        // - Esc：取消当前编辑并回到 completed（或在 anchoring/preview 回到 idle）
        // - Delete：删除并回到 idle
        // - 双击：在 completed 状态下进入 editing

        // 4) 序列化/撤销重做示例（仅演示，不绑定按钮）
        const snapshot = () => rect.toJSON();
        const restore = (snap) => {
          const rect2 = LWC.RectangleDrawingPrimitive.fromJSON(snap);
          series.attachPrimitive(rect2);
          return rect2;
        };
        window.__demo_rect = rect;
        window.__demo_snapshot = snapshot;
        window.__demo_restore = restore;

        // 5) 标签 formatter（可选）
        // 默认实现为 String()，可按需设置：
        // const opts = rect.getOptions();
        // opts.priceLabelFormatter = (p) => p.toFixed(2);
        // opts.timeLabelFormatter = (t) => {
        //   if (typeof t === 'string') return t;
        //   const d = new Date(t * 1000);
        //   return d.toISOString().slice(0, 10);
        // };

        // 6) 适配 BusinessDay
        // 本体拖拽采用像素坐标变换，兼容 UTC/BusinessDay 时间类型，无需额外配置。
      })();
    </script>
  </body>
</html>
```

使用提示

- 默认包已包含绘图导出，开箱即用；可使用 Standalone 或通过打包器引入 ESM 入口。
- Feature Flags 已移除；`setFeatureFlags`/`ensureFeatureFlagEnabled` 等 API 仍导出但为兼容性 no-op（可安全删除相关调用）。

故障排查

- 若 `RectangleDrawingPrimitive` 构造时报错，请确认：
  - 是否正确通过本地 HTTP 服务器加载（避免 `file://`），以及 dist/ESM 路径是否无 404。
  - 使用的构建版本是否与示例路径匹配，浏览器网络面板无模块解析错误。
- 若性能抖动：请减少同时存在的绘图实例数；建议控制在 200 以下，并评估拖拽帧率。
