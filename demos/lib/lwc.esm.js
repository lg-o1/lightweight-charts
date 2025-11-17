// ../lib/prod/src/api/options/series-options-defaults.js
var customStyleDefaults = {
  color: "#2196f3"
};
var seriesOptionsDefaults = {
  title: "",
  visible: true,
  lastValueVisible: true,
  priceLineVisible: true,
  priceLineSource: 0,
  priceLineWidth: 1,
  priceLineColor: "",
  priceLineStyle: 2,
  baseLineVisible: true,
  baseLineWidth: 1,
  baseLineColor: "#B2B5BE",
  baseLineStyle: 0,
  priceFormat: {
    type: "price",
    precision: 2,
    minMove: 0.01
  }
};

// ../lib/prod/src/renderers/draw-line.js
var LineType;
(function(LineType2) {
  LineType2[LineType2["Simple"] = 0] = "Simple";
  LineType2[LineType2["WithSteps"] = 1] = "WithSteps";
  LineType2[LineType2["Curved"] = 2] = "Curved";
})(LineType || (LineType = {}));
var LineStyle;
(function(LineStyle2) {
  LineStyle2[LineStyle2["Solid"] = 0] = "Solid";
  LineStyle2[LineStyle2["Dotted"] = 1] = "Dotted";
  LineStyle2[LineStyle2["Dashed"] = 2] = "Dashed";
  LineStyle2[LineStyle2["LargeDashed"] = 3] = "LargeDashed";
  LineStyle2[LineStyle2["SparseDotted"] = 4] = "SparseDotted";
})(LineStyle || (LineStyle = {}));
function setLineStyle(ctx, style) {
  const dashPatterns = {
    [
      0
      /* LineStyle.Solid */
    ]: [],
    [
      1
      /* LineStyle.Dotted */
    ]: [ctx.lineWidth, ctx.lineWidth],
    [
      2
      /* LineStyle.Dashed */
    ]: [2 * ctx.lineWidth, 2 * ctx.lineWidth],
    [
      3
      /* LineStyle.LargeDashed */
    ]: [6 * ctx.lineWidth, 6 * ctx.lineWidth],
    [
      4
      /* LineStyle.SparseDotted */
    ]: [ctx.lineWidth, 4 * ctx.lineWidth]
  };
  const dashPattern = dashPatterns[style];
  ctx.setLineDash(dashPattern);
}
function drawHorizontalLine(ctx, y, left, right) {
  ctx.beginPath();
  const correction = ctx.lineWidth % 2 ? 0.5 : 0;
  ctx.moveTo(left, y + correction);
  ctx.lineTo(right, y + correction);
  ctx.stroke();
}
function drawVerticalLine(ctx, x, top, bottom) {
  ctx.beginPath();
  const correction = ctx.lineWidth % 2 ? 0.5 : 0;
  ctx.moveTo(x + correction, top);
  ctx.lineTo(x + correction, bottom);
  ctx.stroke();
}
function strokeInPixel(ctx, drawFunction) {
  ctx.save();
  if (ctx.lineWidth % 2) {
    ctx.translate(0.5, 0.5);
  }
  drawFunction();
  ctx.restore();
}

// ../lib/prod/src/helpers/assertions.js
function assert(condition, message) {
  if (!condition) {
    throw new Error("Assertion failed" + (message ? ": " + message : ""));
  }
}
function ensureDefined(value) {
  if (value === void 0) {
    throw new Error("Value is undefined");
  }
  return value;
}
function ensureNotNull(value) {
  if (value === null) {
    throw new Error("Value is null");
  }
  return value;
}
function ensure(value) {
  return ensureNotNull(ensureDefined(value));
}
function ensureNever(value) {
}

// ../lib/prod/src/helpers/delegate.js
var Delegate = class {
  constructor() {
    this._listeners = [];
  }
  subscribe(callback, linkedObject, singleshot) {
    const listener = {
      callback,
      linkedObject,
      singleshot: singleshot === true
    };
    this._listeners.push(listener);
  }
  unsubscribe(callback) {
    const index = this._listeners.findIndex((listener) => callback === listener.callback);
    if (index > -1) {
      this._listeners.splice(index, 1);
    }
  }
  unsubscribeAll(linkedObject) {
    this._listeners = this._listeners.filter((listener) => listener.linkedObject !== linkedObject);
  }
  fire(param1, param2, param3) {
    const listenersSnapshot = [...this._listeners];
    this._listeners = this._listeners.filter((listener) => !listener.singleshot);
    listenersSnapshot.forEach((listener) => listener.callback(param1, param2, param3));
  }
  hasListeners() {
    return this._listeners.length > 0;
  }
  destroy() {
    this._listeners = [];
  }
};

// ../lib/prod/src/helpers/strict-type-checks.js
function merge(dst, ...sources) {
  for (const src of sources) {
    for (const i in src) {
      if (src[i] === void 0 || !Object.prototype.hasOwnProperty.call(src, i) || ["__proto__", "constructor", "prototype"].includes(i)) {
        continue;
      }
      if ("object" !== typeof src[i] || dst[i] === void 0 || Array.isArray(src[i])) {
        dst[i] = src[i];
      } else {
        merge(dst[i], src[i]);
      }
    }
  }
  return dst;
}
function isNumber(value) {
  return typeof value === "number" && isFinite(value);
}
function isInteger(value) {
  return typeof value === "number" && value % 1 === 0;
}
function isString(value) {
  return typeof value === "string";
}
function isBoolean(value) {
  return typeof value === "boolean";
}
function clone(object) {
  const o = object;
  if (!o || "object" !== typeof o) {
    return o;
  }
  let c;
  if (Array.isArray(o)) {
    c = [];
  } else {
    c = {};
  }
  let p;
  let v;
  for (p in o) {
    if (o.hasOwnProperty(p)) {
      v = o[p];
      if (v && "object" === typeof v) {
        c[p] = clone(v);
      } else {
        c[p] = v;
      }
    }
  }
  return c;
}
function notNull(t) {
  return t !== null;
}
function undefinedIfNull(t) {
  return t === null ? void 0 : t;
}

// ../lib/prod/src/helpers/make-font.js
var defaultFontFamily = `-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif`;
function makeFont(size3, family, style) {
  if (style !== void 0) {
    style = `${style} `;
  } else {
    style = "";
  }
  if (family === void 0) {
    family = defaultFontFamily;
  }
  return `${style}${size3}px ${family}`;
}

// ../lib/prod/src/renderers/price-axis-renderer-options-provider.js
var RendererConstants;
(function(RendererConstants2) {
  RendererConstants2[RendererConstants2["BorderSize"] = 1] = "BorderSize";
  RendererConstants2[RendererConstants2["TickLength"] = 5] = "TickLength";
})(RendererConstants || (RendererConstants = {}));
var PriceAxisRendererOptionsProvider = class {
  constructor(chartModel) {
    this._rendererOptions = {
      borderSize: 1,
      tickLength: 5,
      fontSize: NaN,
      font: "",
      fontFamily: "",
      color: "",
      paneBackgroundColor: "",
      paddingBottom: 0,
      paddingInner: 0,
      paddingOuter: 0,
      paddingTop: 0,
      baselineOffset: 0
    };
    this._chartModel = chartModel;
  }
  options() {
    const rendererOptions = this._rendererOptions;
    const currentFontSize = this._fontSize();
    const currentFontFamily = this._fontFamily();
    if (rendererOptions.fontSize !== currentFontSize || rendererOptions.fontFamily !== currentFontFamily) {
      rendererOptions.fontSize = currentFontSize;
      rendererOptions.fontFamily = currentFontFamily;
      rendererOptions.font = makeFont(currentFontSize, currentFontFamily);
      rendererOptions.paddingTop = 2.5 / 12 * currentFontSize;
      rendererOptions.paddingBottom = rendererOptions.paddingTop;
      rendererOptions.paddingInner = currentFontSize / 12 * rendererOptions.tickLength;
      rendererOptions.paddingOuter = currentFontSize / 12 * rendererOptions.tickLength;
      rendererOptions.baselineOffset = 0;
    }
    rendererOptions.color = this._textColor();
    rendererOptions.paneBackgroundColor = this._paneBackgroundColor();
    return this._rendererOptions;
  }
  _textColor() {
    return this._chartModel.options()["layout"].textColor;
  }
  _paneBackgroundColor() {
    return this._chartModel.backgroundTopColor();
  }
  _fontSize() {
    return this._chartModel.options()["layout"].fontSize;
  }
  _fontFamily() {
    return this._chartModel.options()["layout"].fontFamily;
  }
};

// ../lib/prod/src/model/colors.js
function normalizeRgbComponent(component) {
  if (component < 0) {
    return 0;
  }
  if (component > 255) {
    return 255;
  }
  return Math.round(component) || 0;
}
function normalizeAlphaComponent(component) {
  if (component <= 0 || component > 1) {
    return Math.min(Math.max(component, 0), 1);
  }
  return Math.round(component * 1e4) / 1e4;
}
function rgbaToGrayscale(rgbValue) {
  const redComponentGrayscaleWeight = 0.199;
  const greenComponentGrayscaleWeight = 0.687;
  const blueComponentGrayscaleWeight = 0.114;
  return redComponentGrayscaleWeight * rgbValue[0] + greenComponentGrayscaleWeight * rgbValue[1] + blueComponentGrayscaleWeight * rgbValue[2];
}
function getRgbStringViaBrowser(color) {
  const element = document.createElement("div");
  element.style.display = "none";
  document.body.appendChild(element);
  element.style.color = color;
  const computed = window.getComputedStyle(element).color;
  document.body.removeChild(element);
  return computed;
}
var ColorParser = class {
  constructor(customParsers, initialCache) {
    this._rgbaCache = /* @__PURE__ */ new Map();
    this._customParsers = customParsers;
    if (initialCache) {
      this._rgbaCache = initialCache;
    }
  }
  /**
   * We fallback to RGBA here since supporting alpha transformations
   * on wider color gamuts would currently be a lot of extra code
   * for very little benefit due to actual usage.
   */
  applyAlpha(color, alpha) {
    if (color === "transparent") {
      return color;
    }
    const originRgba = this._parseColor(color);
    const originAlpha = originRgba[3];
    return `rgba(${originRgba[0]}, ${originRgba[1]}, ${originRgba[2]}, ${alpha * originAlpha})`;
  }
  generateContrastColors(background) {
    const rgba = this._parseColor(background);
    return {
      background: `rgb(${rgba[0]}, ${rgba[1]}, ${rgba[2]})`,
      // no alpha
      foreground: rgbaToGrayscale(rgba) > 160 ? "black" : "white"
    };
  }
  colorStringToGrayscale(background) {
    return rgbaToGrayscale(this._parseColor(background));
  }
  gradientColorAtPercent(topColor, bottomColor, percent) {
    const [topR, topG, topB, topA] = this._parseColor(topColor);
    const [bottomR, bottomG, bottomB, bottomA] = this._parseColor(bottomColor);
    const resultRgba = [
      normalizeRgbComponent(topR + percent * (bottomR - topR)),
      normalizeRgbComponent(topG + percent * (bottomG - topG)),
      normalizeRgbComponent(topB + percent * (bottomB - topB)),
      normalizeAlphaComponent(topA + percent * (bottomA - topA))
    ];
    return `rgba(${resultRgba[0]}, ${resultRgba[1]}, ${resultRgba[2]}, ${resultRgba[3]})`;
  }
  _parseColor(color) {
    const cached = this._rgbaCache.get(color);
    if (cached) {
      return cached;
    }
    const computed = getRgbStringViaBrowser(color);
    const match = computed.match(/^rgba?\s*\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d*\.?\d+))?\)$/);
    if (!match) {
      if (this._customParsers.length) {
        for (const parser of this._customParsers) {
          const result = parser(color);
          if (result) {
            this._rgbaCache.set(color, result);
            return result;
          }
        }
      }
      throw new Error(`Failed to parse color: ${color}`);
    }
    const rgba = [
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3], 10),
      match[4] ? parseFloat(match[4]) : 1
    ];
    this._rgbaCache.set(color, rgba);
    return rgba;
  }
};

// ../lib/prod/src/renderers/composite-renderer.js
var CompositeRenderer = class {
  constructor() {
    this._renderers = [];
  }
  setRenderers(renderers) {
    this._renderers = renderers;
  }
  draw(target, isHovered, hitTestData) {
    this._renderers.forEach((r) => {
      r.draw(target, isHovered, hitTestData);
    });
  }
};

// ../lib/prod/src/renderers/bitmap-coordinates-pane-renderer.js
var BitmapCoordinatesPaneRenderer = class {
  draw(target, isHovered, hitTestData) {
    target.useBitmapCoordinateSpace((scope) => this._drawImpl(scope, isHovered, hitTestData));
  }
};

// ../lib/prod/src/renderers/marks-renderer.js
var PaneRendererMarks = class extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    this._data = null;
  }
  setData(data) {
    this._data = data;
  }
  _drawImpl({ context: ctx, horizontalPixelRatio, verticalPixelRatio }) {
    if (this._data === null || this._data.visibleRange === null) {
      return;
    }
    const visibleRange = this._data.visibleRange;
    const data = this._data;
    const tickWidth = Math.max(1, Math.floor(horizontalPixelRatio));
    const correction = tickWidth % 2 / 2;
    const draw = (radiusMedia) => {
      ctx.beginPath();
      for (let i = visibleRange.to - 1; i >= visibleRange.from; --i) {
        const point = data.items[i];
        const centerX = Math.round(point.x * horizontalPixelRatio) + correction;
        const centerY = point.y * verticalPixelRatio;
        const radius3 = radiusMedia * verticalPixelRatio + correction;
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius3, 0, Math.PI * 2);
      }
      ctx.fill();
    };
    if (data.lineWidth > 0) {
      ctx.fillStyle = data.backColor;
      draw(data.radius + data.lineWidth);
    }
    ctx.fillStyle = data.lineColor;
    draw(data.radius);
  }
};

// ../lib/prod/src/views/pane/crosshair-marks-pane-view.js
function createEmptyMarkerData() {
  return {
    items: [{
      x: 0,
      y: 0,
      time: 0,
      price: 0
    }],
    lineColor: "",
    backColor: "",
    radius: 0,
    lineWidth: 0,
    visibleRange: null
  };
}
var rangeForSinglePoint = { from: 0, to: 1 };
var CrosshairMarksPaneView = class {
  constructor(chartModel, crosshair, pane) {
    this._compositeRenderer = new CompositeRenderer();
    this._markersRenderers = [];
    this._markersData = [];
    this._invalidated = true;
    this._chartModel = chartModel;
    this._crosshair = crosshair;
    this._pane = pane;
    this._compositeRenderer.setRenderers(this._markersRenderers);
  }
  update(updateType) {
    this._createMarkerRenderersIfNeeded();
    this._invalidated = true;
  }
  renderer() {
    if (this._invalidated) {
      this._updateImpl();
      this._invalidated = false;
    }
    return this._compositeRenderer;
  }
  _createMarkerRenderersIfNeeded() {
    const serieses = this._pane.orderedSources();
    if (serieses.length !== this._markersRenderers.length) {
      this._markersData = serieses.map(createEmptyMarkerData);
      this._markersRenderers = this._markersData.map((data) => {
        const res = new PaneRendererMarks();
        res.setData(data);
        return res;
      });
      this._compositeRenderer.setRenderers(this._markersRenderers);
    }
  }
  _updateImpl() {
    const forceHidden = this._crosshair.options().mode === 2 || !this._crosshair.visible();
    const serieses = this._pane.orderedSeries();
    const timePointIndex = this._crosshair.appliedIndex();
    const timeScale = this._chartModel.timeScale();
    this._createMarkerRenderersIfNeeded();
    serieses.forEach((s, index) => {
      const data = this._markersData[index];
      const seriesData = s.markerDataAtIndex(timePointIndex);
      const firstValue = s.firstValue();
      if (forceHidden || seriesData === null || !s.visible() || firstValue === null) {
        data.visibleRange = null;
        return;
      }
      data.lineColor = seriesData.backgroundColor;
      data.radius = seriesData.radius;
      data.lineWidth = seriesData.borderWidth;
      data.items[0].price = seriesData.price;
      data.items[0].y = s.priceScale().priceToCoordinate(seriesData.price, firstValue.value);
      data.backColor = seriesData.borderColor ?? this._chartModel.backgroundColorAtYPercentFromTop(data.items[0].y / s.priceScale().height());
      data.items[0].time = timePointIndex;
      data.items[0].x = timeScale.indexToCoordinate(timePointIndex);
      data.visibleRange = rangeForSinglePoint;
    });
  }
};

// ../lib/prod/src/renderers/crosshair-renderer.js
var CrosshairRenderer = class extends BitmapCoordinatesPaneRenderer {
  constructor(data) {
    super();
    this._data = data;
  }
  _drawImpl({ context: ctx, bitmapSize, horizontalPixelRatio, verticalPixelRatio }) {
    if (this._data === null) {
      return;
    }
    const vertLinesVisible = this._data.vertLine.visible;
    const horzLinesVisible = this._data.horzLine.visible;
    if (!vertLinesVisible && !horzLinesVisible) {
      return;
    }
    const x = Math.round(this._data.x * horizontalPixelRatio);
    const y = Math.round(this._data.y * verticalPixelRatio);
    ctx.lineCap = "butt";
    if (vertLinesVisible && x >= 0) {
      ctx.lineWidth = Math.floor(this._data.vertLine.lineWidth * horizontalPixelRatio);
      ctx.strokeStyle = this._data.vertLine.color;
      ctx.fillStyle = this._data.vertLine.color;
      setLineStyle(ctx, this._data.vertLine.lineStyle);
      drawVerticalLine(ctx, x, 0, bitmapSize.height);
    }
    if (horzLinesVisible && y >= 0) {
      ctx.lineWidth = Math.floor(this._data.horzLine.lineWidth * verticalPixelRatio);
      ctx.strokeStyle = this._data.horzLine.color;
      ctx.fillStyle = this._data.horzLine.color;
      setLineStyle(ctx, this._data.horzLine.lineStyle);
      drawHorizontalLine(ctx, y, 0, bitmapSize.width);
    }
  }
};

// ../lib/prod/src/views/pane/crosshair-pane-view.js
var CrosshairPaneView = class {
  constructor(source, pane) {
    this._invalidated = true;
    this._rendererData = {
      vertLine: {
        lineWidth: 1,
        lineStyle: 0,
        color: "",
        visible: false
      },
      horzLine: {
        lineWidth: 1,
        lineStyle: 0,
        color: "",
        visible: false
      },
      x: 0,
      y: 0
    };
    this._renderer = new CrosshairRenderer(this._rendererData);
    this._source = source;
    this._pane = pane;
  }
  update() {
    this._invalidated = true;
  }
  renderer(pane) {
    if (this._invalidated) {
      this._updateImpl();
      this._invalidated = false;
    }
    return this._renderer;
  }
  _updateImpl() {
    const visible = this._source.visible();
    const crosshairOptions = this._pane.model().options().crosshair;
    const data = this._rendererData;
    if (crosshairOptions.mode === 2) {
      data.horzLine.visible = false;
      data.vertLine.visible = false;
      return;
    }
    data.horzLine.visible = visible && this._source.horzLineVisible(this._pane);
    data.vertLine.visible = visible && this._source.vertLineVisible();
    data.horzLine.lineWidth = crosshairOptions.horzLine.width;
    data.horzLine.lineStyle = crosshairOptions.horzLine.style;
    data.horzLine.color = crosshairOptions.horzLine.color;
    data.vertLine.lineWidth = crosshairOptions.vertLine.width;
    data.vertLine.lineStyle = crosshairOptions.vertLine.style;
    data.vertLine.color = crosshairOptions.vertLine.color;
    data.x = this._source.appliedX();
    data.y = this._source.appliedY();
  }
};

// ../lib/prod/src/helpers/canvas-helpers.js
function fillRectInnerBorder(ctx, x, y, width, height, borderWidth) {
  ctx.fillRect(x + borderWidth, y, width - borderWidth * 2, borderWidth);
  ctx.fillRect(x + borderWidth, y + height - borderWidth, width - borderWidth * 2, borderWidth);
  ctx.fillRect(x, y, borderWidth, height);
  ctx.fillRect(x + width - borderWidth, y, borderWidth, height);
}
function clearRect(ctx, x, y, w, h, clearColor) {
  ctx.save();
  ctx.globalCompositeOperation = "copy";
  ctx.fillStyle = clearColor;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}
function changeBorderRadius(borderRadius, offset) {
  return borderRadius.map((x) => x === 0 ? x : x + offset);
}
function drawRoundRect(ctx, x, y, w, h, radii) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radii);
    return;
  }
  ctx.lineTo(x + w - radii[1], y);
  if (radii[1] !== 0) {
    ctx.arcTo(x + w, y, x + w, y + radii[1], radii[1]);
  }
  ctx.lineTo(x + w, y + h - radii[2]);
  if (radii[2] !== 0) {
    ctx.arcTo(x + w, y + h, x + w - radii[2], y + h, radii[2]);
  }
  ctx.lineTo(x + radii[3], y + h);
  if (radii[3] !== 0) {
    ctx.arcTo(x, y + h, x, y + h - radii[3], radii[3]);
  }
  ctx.lineTo(x, y + radii[0]);
  if (radii[0] !== 0) {
    ctx.arcTo(x, y, x + radii[0], y, radii[0]);
  }
}
function drawRoundRectWithBorder(ctx, left, top, width, height, backgroundColor, borderWidth = 0, outerBorderRadius = [0, 0, 0, 0], borderColor = "") {
  ctx.save();
  if (!borderWidth || !borderColor || borderColor === backgroundColor) {
    drawRoundRect(ctx, left, top, width, height, outerBorderRadius);
    ctx.fillStyle = backgroundColor;
    ctx.fill();
    ctx.restore();
    return;
  }
  const halfBorderWidth = borderWidth / 2;
  const radii = changeBorderRadius(outerBorderRadius, -halfBorderWidth);
  drawRoundRect(ctx, left + halfBorderWidth, top + halfBorderWidth, width - borderWidth, height - borderWidth, radii);
  if (backgroundColor !== "transparent") {
    ctx.fillStyle = backgroundColor;
    ctx.fill();
  }
  if (borderColor !== "transparent") {
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColor;
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}
function clearRectWithGradient(ctx, x, y, w, h, topColor, bottomColor) {
  ctx.save();
  ctx.globalCompositeOperation = "copy";
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(1, bottomColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// ../lib/prod/src/renderers/price-axis-view-renderer.js
var PriceAxisViewRenderer = class {
  constructor(data, commonData) {
    this.setData(data, commonData);
  }
  setData(data, commonData) {
    this._data = data;
    this._commonData = commonData;
  }
  height(rendererOptions, useSecondLine) {
    if (!this._data.visible) {
      return 0;
    }
    return rendererOptions.fontSize + rendererOptions.paddingTop + rendererOptions.paddingBottom;
  }
  draw(target, rendererOptions, textWidthCache, align) {
    if (!this._data.visible || this._data.text.length === 0) {
      return;
    }
    const textColor = this._data.color;
    const backgroundColor = this._commonData.background;
    const geometry = target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      ctx.font = rendererOptions.font;
      const geom = this._calculateGeometry(scope, rendererOptions, textWidthCache, align);
      const gb = geom.bitmap;
      if (geom.alignRight) {
        drawRoundRectWithBorder(ctx, gb.xOutside, gb.yTop, gb.totalWidth, gb.totalHeight, backgroundColor, gb.horzBorder, [gb.radius, 0, 0, gb.radius], backgroundColor);
      } else {
        drawRoundRectWithBorder(ctx, gb.xInside, gb.yTop, gb.totalWidth, gb.totalHeight, backgroundColor, gb.horzBorder, [0, gb.radius, gb.radius, 0], backgroundColor);
      }
      if (this._data.tickVisible) {
        ctx.fillStyle = textColor;
        ctx.fillRect(gb.xInside, gb.yMid, gb.xTick - gb.xInside, gb.tickHeight);
      }
      if (this._data.borderVisible) {
        ctx.fillStyle = rendererOptions.paneBackgroundColor;
        ctx.fillRect(geom.alignRight ? gb.right - gb.horzBorder : 0, gb.yTop, gb.horzBorder, gb.yBottom - gb.yTop);
      }
      return geom;
    });
    target.useMediaCoordinateSpace(({ context: ctx }) => {
      const gm = geometry.media;
      ctx.font = rendererOptions.font;
      ctx.textAlign = geometry.alignRight ? "right" : "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = textColor;
      ctx.fillText(this._data.text, gm.xText, (gm.yTop + gm.yBottom) / 2 + gm.textMidCorrection);
    });
  }
  _calculateGeometry(scope, rendererOptions, textWidthCache, align) {
    const { context: ctx, bitmapSize, mediaSize, horizontalPixelRatio, verticalPixelRatio } = scope;
    const tickSize = this._data.tickVisible || !this._data.moveTextToInvisibleTick ? rendererOptions.tickLength : 0;
    const horzBorder = this._data.separatorVisible ? rendererOptions.borderSize : 0;
    const paddingTop = rendererOptions.paddingTop + this._commonData.additionalPaddingTop;
    const paddingBottom = rendererOptions.paddingBottom + this._commonData.additionalPaddingBottom;
    const paddingInner = rendererOptions.paddingInner;
    const paddingOuter = rendererOptions.paddingOuter;
    const text = this._data.text;
    const actualTextHeight = rendererOptions.fontSize;
    const textMidCorrection = textWidthCache.yMidCorrection(ctx, text);
    const textWidth = Math.ceil(textWidthCache.measureText(ctx, text));
    const totalHeight = actualTextHeight + paddingTop + paddingBottom;
    const totalWidth = rendererOptions.borderSize + paddingInner + paddingOuter + textWidth + tickSize;
    const tickHeightBitmap = Math.max(1, Math.floor(verticalPixelRatio));
    let totalHeightBitmap = Math.round(totalHeight * verticalPixelRatio);
    if (totalHeightBitmap % 2 !== tickHeightBitmap % 2) {
      totalHeightBitmap += 1;
    }
    const horzBorderBitmap = horzBorder > 0 ? Math.max(1, Math.floor(horzBorder * horizontalPixelRatio)) : 0;
    const totalWidthBitmap = Math.round(totalWidth * horizontalPixelRatio);
    const tickSizeBitmap = Math.round(tickSize * horizontalPixelRatio);
    const yMid = this._commonData.fixedCoordinate ?? this._commonData.coordinate;
    const yMidBitmap = Math.round(yMid * verticalPixelRatio) - Math.floor(verticalPixelRatio * 0.5);
    const yTopBitmap = Math.floor(yMidBitmap + tickHeightBitmap / 2 - totalHeightBitmap / 2);
    const yBottomBitmap = yTopBitmap + totalHeightBitmap;
    const alignRight = align === "right";
    const xInside = alignRight ? mediaSize.width - horzBorder : horzBorder;
    const xInsideBitmap = alignRight ? bitmapSize.width - horzBorderBitmap : horzBorderBitmap;
    let xOutsideBitmap;
    let xTickBitmap;
    let xText;
    if (alignRight) {
      xOutsideBitmap = xInsideBitmap - totalWidthBitmap;
      xTickBitmap = xInsideBitmap - tickSizeBitmap;
      xText = xInside - tickSize - paddingInner - horzBorder;
    } else {
      xOutsideBitmap = xInsideBitmap + totalWidthBitmap;
      xTickBitmap = xInsideBitmap + tickSizeBitmap;
      xText = xInside + tickSize + paddingInner;
    }
    return {
      alignRight,
      bitmap: {
        yTop: yTopBitmap,
        yMid: yMidBitmap,
        yBottom: yBottomBitmap,
        totalWidth: totalWidthBitmap,
        totalHeight: totalHeightBitmap,
        // TODO: it is better to have different horizontal and vertical radii
        radius: 2 * horizontalPixelRatio,
        horzBorder: horzBorderBitmap,
        xOutside: xOutsideBitmap,
        xInside: xInsideBitmap,
        xTick: xTickBitmap,
        tickHeight: tickHeightBitmap,
        right: bitmapSize.width
      },
      media: {
        yTop: yTopBitmap / verticalPixelRatio,
        yBottom: yBottomBitmap / verticalPixelRatio,
        xText,
        textMidCorrection
      }
    };
  }
};

// ../lib/prod/src/views/price-axis/price-axis-view.js
var PriceAxisView = class {
  constructor(ctor) {
    this._commonRendererData = {
      coordinate: 0,
      background: "#000",
      additionalPaddingBottom: 0,
      additionalPaddingTop: 0
    };
    this._axisRendererData = {
      text: "",
      visible: false,
      tickVisible: true,
      moveTextToInvisibleTick: false,
      borderColor: "",
      color: "#FFF",
      borderVisible: false,
      separatorVisible: false
    };
    this._paneRendererData = {
      text: "",
      visible: false,
      tickVisible: false,
      moveTextToInvisibleTick: true,
      borderColor: "",
      color: "#FFF",
      borderVisible: true,
      separatorVisible: true
    };
    this._invalidated = true;
    this._axisRenderer = new (ctor || PriceAxisViewRenderer)(this._axisRendererData, this._commonRendererData);
    this._paneRenderer = new (ctor || PriceAxisViewRenderer)(this._paneRendererData, this._commonRendererData);
  }
  text() {
    this._updateRendererDataIfNeeded();
    return this._axisRendererData.text;
  }
  coordinate() {
    this._updateRendererDataIfNeeded();
    return this._commonRendererData.coordinate;
  }
  update() {
    this._invalidated = true;
  }
  height(rendererOptions, useSecondLine = false) {
    return Math.max(this._axisRenderer.height(rendererOptions, useSecondLine), this._paneRenderer.height(rendererOptions, useSecondLine));
  }
  getFixedCoordinate() {
    return this._commonRendererData.fixedCoordinate || 0;
  }
  setFixedCoordinate(value) {
    this._commonRendererData.fixedCoordinate = value;
  }
  isVisible() {
    this._updateRendererDataIfNeeded();
    return this._axisRendererData.visible || this._paneRendererData.visible;
  }
  isAxisLabelVisible() {
    this._updateRendererDataIfNeeded();
    return this._axisRendererData.visible;
  }
  renderer(priceScale) {
    this._updateRendererDataIfNeeded();
    this._axisRendererData.tickVisible = this._axisRendererData.tickVisible && priceScale.options().ticksVisible;
    this._paneRendererData.tickVisible = this._paneRendererData.tickVisible && priceScale.options().ticksVisible;
    this._axisRenderer.setData(this._axisRendererData, this._commonRendererData);
    this._paneRenderer.setData(this._paneRendererData, this._commonRendererData);
    return this._axisRenderer;
  }
  paneRenderer() {
    this._updateRendererDataIfNeeded();
    this._axisRenderer.setData(this._axisRendererData, this._commonRendererData);
    this._paneRenderer.setData(this._paneRendererData, this._commonRendererData);
    return this._paneRenderer;
  }
  _updateRendererDataIfNeeded() {
    if (this._invalidated) {
      this._axisRendererData.tickVisible = true;
      this._paneRendererData.tickVisible = false;
      this._updateRendererData(this._axisRendererData, this._paneRendererData, this._commonRendererData);
    }
  }
};

// ../lib/prod/src/views/price-axis/crosshair-price-axis-view.js
var CrosshairPriceAxisView = class extends PriceAxisView {
  constructor(source, priceScale, valueProvider) {
    super();
    this._source = source;
    this._priceScale = priceScale;
    this._valueProvider = valueProvider;
  }
  _updateRendererData(axisRendererData, paneRendererData, commonRendererData) {
    axisRendererData.visible = false;
    if (this._source.options().mode === 2) {
      return;
    }
    const options = this._source.options().horzLine;
    if (!options.labelVisible) {
      return;
    }
    const firstValue = this._priceScale.firstValue();
    if (!this._source.visible() || this._priceScale.isEmpty() || firstValue === null) {
      return;
    }
    const colors = this._priceScale.colorParser().generateContrastColors(options.labelBackgroundColor);
    commonRendererData.background = colors.background;
    axisRendererData.color = colors.foreground;
    const additionalPadding = 2 / 12 * this._priceScale.fontSize();
    commonRendererData.additionalPaddingTop = additionalPadding;
    commonRendererData.additionalPaddingBottom = additionalPadding;
    const value = this._valueProvider(this._priceScale);
    commonRendererData.coordinate = value.coordinate;
    axisRendererData.text = this._priceScale.formatPrice(value.price, firstValue);
    axisRendererData.visible = true;
  }
};

// ../lib/prod/src/renderers/time-axis-view-renderer.js
var optimizationReplacementRe = /[1-9]/g;
var radius = 2;
var TimeAxisViewRenderer = class {
  constructor() {
    this._data = null;
  }
  setData(data) {
    this._data = data;
  }
  draw(target, rendererOptions) {
    if (this._data === null || this._data.visible === false || this._data.text.length === 0) {
      return;
    }
    const textWidth = target.useMediaCoordinateSpace(({ context: ctx }) => {
      ctx.font = rendererOptions.font;
      return Math.round(rendererOptions.widthCache.measureText(ctx, ensureNotNull(this._data).text, optimizationReplacementRe));
    });
    if (textWidth <= 0) {
      return;
    }
    const horzMargin = rendererOptions.paddingHorizontal;
    const labelWidth = textWidth + 2 * horzMargin;
    const labelWidthHalf = labelWidth / 2;
    const timeScaleWidth = this._data.width;
    let coordinate = this._data.coordinate;
    let x1 = Math.floor(coordinate - labelWidthHalf) + 0.5;
    if (x1 < 0) {
      coordinate = coordinate + Math.abs(0 - x1);
      x1 = Math.floor(coordinate - labelWidthHalf) + 0.5;
    } else if (x1 + labelWidth > timeScaleWidth) {
      coordinate = coordinate - Math.abs(timeScaleWidth - (x1 + labelWidth));
      x1 = Math.floor(coordinate - labelWidthHalf) + 0.5;
    }
    const x2 = x1 + labelWidth;
    const y1 = 0;
    const y2 = Math.ceil(y1 + rendererOptions.borderSize + rendererOptions.tickLength + rendererOptions.paddingTop + rendererOptions.fontSize + rendererOptions.paddingBottom);
    target.useBitmapCoordinateSpace(({ context: ctx, horizontalPixelRatio, verticalPixelRatio }) => {
      const data = ensureNotNull(this._data);
      ctx.fillStyle = data.background;
      const x1scaled = Math.round(x1 * horizontalPixelRatio);
      const y1scaled = Math.round(y1 * verticalPixelRatio);
      const x2scaled = Math.round(x2 * horizontalPixelRatio);
      const y2scaled = Math.round(y2 * verticalPixelRatio);
      const radiusScaled = Math.round(radius * horizontalPixelRatio);
      ctx.beginPath();
      ctx.moveTo(x1scaled, y1scaled);
      ctx.lineTo(x1scaled, y2scaled - radiusScaled);
      ctx.arcTo(x1scaled, y2scaled, x1scaled + radiusScaled, y2scaled, radiusScaled);
      ctx.lineTo(x2scaled - radiusScaled, y2scaled);
      ctx.arcTo(x2scaled, y2scaled, x2scaled, y2scaled - radiusScaled, radiusScaled);
      ctx.lineTo(x2scaled, y1scaled);
      ctx.fill();
      if (data.tickVisible) {
        const tickX = Math.round(data.coordinate * horizontalPixelRatio);
        const tickTop = y1scaled;
        const tickBottom = Math.round((tickTop + rendererOptions.tickLength) * verticalPixelRatio);
        ctx.fillStyle = data.color;
        const tickWidth = Math.max(1, Math.floor(horizontalPixelRatio));
        const tickOffset = Math.floor(horizontalPixelRatio * 0.5);
        ctx.fillRect(tickX - tickOffset, tickTop, tickWidth, tickBottom - tickTop);
      }
    });
    target.useMediaCoordinateSpace(({ context: ctx }) => {
      const data = ensureNotNull(this._data);
      const yText = y1 + rendererOptions.borderSize + rendererOptions.tickLength + rendererOptions.paddingTop + rendererOptions.fontSize / 2;
      ctx.font = rendererOptions.font;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = data.color;
      const textYCorrection = rendererOptions.widthCache.yMidCorrection(ctx, "Apr0");
      ctx.translate(x1 + horzMargin, yText + textYCorrection);
      ctx.fillText(data.text, 0, 0);
    });
  }
};

// ../lib/prod/src/views/time-axis/crosshair-time-axis-view.js
var CrosshairTimeAxisView = class {
  constructor(crosshair, model, valueProvider) {
    this._invalidated = true;
    this._renderer = new TimeAxisViewRenderer();
    this._rendererData = {
      visible: false,
      background: "#4c525e",
      color: "white",
      text: "",
      width: 0,
      coordinate: NaN,
      tickVisible: true
    };
    this._crosshair = crosshair;
    this._model = model;
    this._valueProvider = valueProvider;
  }
  update() {
    this._invalidated = true;
  }
  renderer() {
    if (this._invalidated) {
      this._updateImpl();
      this._invalidated = false;
    }
    this._renderer.setData(this._rendererData);
    return this._renderer;
  }
  _updateImpl() {
    const data = this._rendererData;
    data.visible = false;
    if (this._crosshair.options().mode === 2) {
      return;
    }
    const options = this._crosshair.options().vertLine;
    if (!options.labelVisible) {
      return;
    }
    const timeScale = this._model.timeScale();
    if (timeScale.isEmpty()) {
      return;
    }
    data.width = timeScale.width();
    const value = this._valueProvider();
    if (value === null) {
      return;
    }
    data.coordinate = value.coordinate;
    const currentTime = timeScale.indexToTimeScalePoint(this._crosshair.appliedIndex());
    data.text = timeScale.formatDateTime(ensureNotNull(currentTime));
    data.visible = true;
    const colors = this._model.colorParser().generateContrastColors(options.labelBackgroundColor);
    data.background = colors.background;
    data.color = colors.foreground;
    data.tickVisible = timeScale.options().ticksVisible;
  }
};

// ../lib/prod/src/model/data-source.js
var DataSource = class {
  constructor() {
    this._priceScale = null;
    this._zorder = 0;
  }
  zorder() {
    return this._zorder;
  }
  setZorder(zorder) {
    this._zorder = zorder;
  }
  priceScale() {
    return this._priceScale;
  }
  setPriceScale(priceScale) {
    this._priceScale = priceScale;
  }
  labelPaneViews(pane) {
    return [];
  }
  timeAxisViews() {
    return [];
  }
  visible() {
    return true;
  }
};

// ../lib/prod/src/model/crosshair.js
var CrosshairMode;
(function(CrosshairMode2) {
  CrosshairMode2[CrosshairMode2["Normal"] = 0] = "Normal";
  CrosshairMode2[CrosshairMode2["Magnet"] = 1] = "Magnet";
  CrosshairMode2[CrosshairMode2["Hidden"] = 2] = "Hidden";
  CrosshairMode2[CrosshairMode2["MagnetOHLC"] = 3] = "MagnetOHLC";
})(CrosshairMode || (CrosshairMode = {}));
var Crosshair = class extends DataSource {
  constructor(model, options) {
    super();
    this._pane = null;
    this._price = NaN;
    this._index = 0;
    this._visible = false;
    this._priceAxisViews = /* @__PURE__ */ new Map();
    this._subscribed = false;
    this._crosshairPaneViewCache = /* @__PURE__ */ new WeakMap();
    this._markersPaneViewCache = /* @__PURE__ */ new WeakMap();
    this._x = NaN;
    this._y = NaN;
    this._originX = NaN;
    this._originY = NaN;
    this._model = model;
    this._options = options;
    const valuePriceProvider = (rawPriceProvider, rawCoordinateProvider) => {
      return (priceScale) => {
        const coordinate = rawCoordinateProvider();
        const rawPrice = rawPriceProvider();
        if (priceScale === ensureNotNull(this._pane).defaultPriceScale()) {
          return { price: rawPrice, coordinate };
        } else {
          const firstValue = ensureNotNull(priceScale.firstValue());
          const price = priceScale.coordinateToPrice(coordinate, firstValue);
          return { price, coordinate };
        }
      };
    };
    const valueTimeProvider = (rawIndexProvider, rawCoordinateProvider) => {
      return () => {
        const time = this._model.timeScale().indexToTime(rawIndexProvider());
        const coordinate = rawCoordinateProvider();
        if (!time || !Number.isFinite(coordinate)) {
          return null;
        }
        return {
          time,
          coordinate
        };
      };
    };
    this._currentPosPriceProvider = valuePriceProvider(() => this._price, () => this._y);
    const currentPosTimeProvider = valueTimeProvider(() => this._index, () => this.appliedX());
    this._timeAxisView = new CrosshairTimeAxisView(this, model, currentPosTimeProvider);
  }
  options() {
    return this._options;
  }
  saveOriginCoord(x, y) {
    this._originX = x;
    this._originY = y;
  }
  clearOriginCoord() {
    this._originX = NaN;
    this._originY = NaN;
  }
  originCoordX() {
    return this._originX;
  }
  originCoordY() {
    return this._originY;
  }
  setPosition(index, price, pane) {
    if (!this._subscribed) {
      this._subscribed = true;
    }
    this._visible = true;
    this._tryToUpdateViews(index, price, pane);
  }
  appliedIndex() {
    return this._index;
  }
  appliedX() {
    return this._x;
  }
  appliedY() {
    return this._y;
  }
  visible() {
    return this._visible;
  }
  clearPosition() {
    this._visible = false;
    this._setIndexToLastSeriesBarIndex();
    this._price = NaN;
    this._x = NaN;
    this._y = NaN;
    this._pane = null;
    this.clearOriginCoord();
    this.updateAllViews();
  }
  paneViews(pane) {
    let crosshairPaneView = this._crosshairPaneViewCache.get(pane);
    if (!crosshairPaneView) {
      crosshairPaneView = new CrosshairPaneView(this, pane);
      this._crosshairPaneViewCache.set(pane, crosshairPaneView);
    }
    let markersPaneView = this._markersPaneViewCache.get(pane);
    if (!markersPaneView) {
      markersPaneView = new CrosshairMarksPaneView(this._model, this, pane);
      this._markersPaneViewCache.set(pane, markersPaneView);
    }
    return [crosshairPaneView, markersPaneView];
  }
  horzLineVisible(pane) {
    return pane === this._pane && this._options.horzLine.visible;
  }
  vertLineVisible() {
    return this._options.vertLine.visible;
  }
  priceAxisViews(pane, priceScale) {
    if (!this._visible || this._pane !== pane) {
      this._priceAxisViews.clear();
    }
    const views = [];
    if (this._pane === pane) {
      views.push(this._createPriceAxisViewOnDemand(this._priceAxisViews, priceScale, this._currentPosPriceProvider));
    }
    return views;
  }
  timeAxisViews() {
    return this._visible ? [this._timeAxisView] : [];
  }
  pane() {
    return this._pane;
  }
  updateAllViews() {
    this._model.panes().forEach((pane) => {
      this._crosshairPaneViewCache.get(pane)?.update();
      this._markersPaneViewCache.get(pane)?.update();
    });
    this._priceAxisViews.forEach((value) => value.update());
    this._timeAxisView.update();
  }
  _priceScaleByPane(pane) {
    if (pane && !pane.defaultPriceScale().isEmpty()) {
      return pane.defaultPriceScale();
    }
    return null;
  }
  _tryToUpdateViews(index, price, pane) {
    if (this._tryToUpdateData(index, price, pane)) {
      this.updateAllViews();
    }
  }
  _tryToUpdateData(newIndex, newPrice, newPane) {
    const oldX = this._x;
    const oldY = this._y;
    const oldPrice = this._price;
    const oldIndex = this._index;
    const oldPane = this._pane;
    const priceScale = this._priceScaleByPane(newPane);
    this._index = newIndex;
    this._x = isNaN(newIndex) ? NaN : this._model.timeScale().indexToCoordinate(newIndex);
    this._pane = newPane;
    const firstValue = priceScale !== null ? priceScale.firstValue() : null;
    if (priceScale !== null && firstValue !== null) {
      this._price = newPrice;
      this._y = priceScale.priceToCoordinate(newPrice, firstValue);
    } else {
      this._price = NaN;
      this._y = NaN;
    }
    return oldX !== this._x || oldY !== this._y || oldIndex !== this._index || oldPrice !== this._price || oldPane !== this._pane;
  }
  _setIndexToLastSeriesBarIndex() {
    const lastIndexes = this._model.serieses().map((s) => s.bars().lastIndex()).filter(notNull);
    const lastBarIndex = lastIndexes.length === 0 ? null : Math.max(...lastIndexes);
    this._index = lastBarIndex !== null ? lastBarIndex : NaN;
  }
  _createPriceAxisViewOnDemand(map, priceScale, valueProvider) {
    let view = map.get(priceScale);
    if (view === void 0) {
      view = new CrosshairPriceAxisView(this, priceScale, valueProvider);
      map.set(priceScale, view);
    }
    return view;
  }
};

// ../lib/prod/src/model/default-price-scale.js
var DefaultPriceScaleId;
(function(DefaultPriceScaleId2) {
  DefaultPriceScaleId2["Left"] = "left";
  DefaultPriceScaleId2["Right"] = "right";
})(DefaultPriceScaleId || (DefaultPriceScaleId = {}));
function isDefaultPriceScale(priceScaleId) {
  return priceScaleId === "left" || priceScaleId === "right";
}

// ../lib/prod/src/model/invalidate-mask.js
var InvalidationLevel;
(function(InvalidationLevel2) {
  InvalidationLevel2[InvalidationLevel2["None"] = 0] = "None";
  InvalidationLevel2[InvalidationLevel2["Cursor"] = 1] = "Cursor";
  InvalidationLevel2[InvalidationLevel2["Light"] = 2] = "Light";
  InvalidationLevel2[InvalidationLevel2["Full"] = 3] = "Full";
})(InvalidationLevel || (InvalidationLevel = {}));
function mergePaneInvalidation(beforeValue, newValue) {
  if (beforeValue === void 0) {
    return newValue;
  }
  const level = Math.max(beforeValue.level, newValue.level);
  const autoScale = beforeValue.autoScale || newValue.autoScale;
  return { level, autoScale };
}
var TimeScaleInvalidationType;
(function(TimeScaleInvalidationType2) {
  TimeScaleInvalidationType2[TimeScaleInvalidationType2["FitContent"] = 0] = "FitContent";
  TimeScaleInvalidationType2[TimeScaleInvalidationType2["ApplyRange"] = 1] = "ApplyRange";
  TimeScaleInvalidationType2[TimeScaleInvalidationType2["ApplyBarSpacing"] = 2] = "ApplyBarSpacing";
  TimeScaleInvalidationType2[TimeScaleInvalidationType2["ApplyRightOffset"] = 3] = "ApplyRightOffset";
  TimeScaleInvalidationType2[TimeScaleInvalidationType2["Reset"] = 4] = "Reset";
  TimeScaleInvalidationType2[TimeScaleInvalidationType2["Animation"] = 5] = "Animation";
  TimeScaleInvalidationType2[TimeScaleInvalidationType2["StopAnimation"] = 6] = "StopAnimation";
})(TimeScaleInvalidationType || (TimeScaleInvalidationType = {}));
var InvalidateMask = class _InvalidateMask {
  constructor(globalLevel) {
    this._invalidatedPanes = /* @__PURE__ */ new Map();
    this._timeScaleInvalidations = [];
    this._globalLevel = globalLevel;
  }
  invalidatePane(paneIndex, invalidation) {
    const prevValue = this._invalidatedPanes.get(paneIndex);
    const newValue = mergePaneInvalidation(prevValue, invalidation);
    this._invalidatedPanes.set(paneIndex, newValue);
  }
  fullInvalidation() {
    return this._globalLevel;
  }
  invalidateForPane(paneIndex) {
    const paneInvalidation = this._invalidatedPanes.get(paneIndex);
    if (paneInvalidation === void 0) {
      return {
        level: this._globalLevel
      };
    }
    return {
      level: Math.max(this._globalLevel, paneInvalidation.level),
      autoScale: paneInvalidation.autoScale
    };
  }
  setFitContent() {
    this.stopTimeScaleAnimation();
    this._timeScaleInvalidations = [{
      type: 0
      /* TimeScaleInvalidationType.FitContent */
    }];
  }
  applyRange(range) {
    this.stopTimeScaleAnimation();
    this._timeScaleInvalidations = [{ type: 1, value: range }];
  }
  setTimeScaleAnimation(animation) {
    this._removeTimeScaleAnimation();
    this._timeScaleInvalidations.push({ type: 5, value: animation });
  }
  stopTimeScaleAnimation() {
    this._removeTimeScaleAnimation();
    this._timeScaleInvalidations.push({
      type: 6
      /* TimeScaleInvalidationType.StopAnimation */
    });
  }
  resetTimeScale() {
    this.stopTimeScaleAnimation();
    this._timeScaleInvalidations = [{
      type: 4
      /* TimeScaleInvalidationType.Reset */
    }];
  }
  setBarSpacing(barSpacing) {
    this.stopTimeScaleAnimation();
    this._timeScaleInvalidations.push({ type: 2, value: barSpacing });
  }
  setRightOffset(offset) {
    this.stopTimeScaleAnimation();
    this._timeScaleInvalidations.push({ type: 3, value: offset });
  }
  timeScaleInvalidations() {
    return this._timeScaleInvalidations;
  }
  merge(other) {
    for (const tsInvalidation of other._timeScaleInvalidations) {
      this._applyTimeScaleInvalidation(tsInvalidation);
    }
    this._globalLevel = Math.max(this._globalLevel, other._globalLevel);
    other._invalidatedPanes.forEach((invalidation, index) => {
      this.invalidatePane(index, invalidation);
    });
  }
  static light() {
    return new _InvalidateMask(
      2
      /* InvalidationLevel.Light */
    );
  }
  static full() {
    return new _InvalidateMask(
      3
      /* InvalidationLevel.Full */
    );
  }
  _applyTimeScaleInvalidation(invalidation) {
    switch (invalidation.type) {
      case 0:
        this.setFitContent();
        break;
      case 1:
        this.applyRange(invalidation.value);
        break;
      case 2:
        this.setBarSpacing(invalidation.value);
        break;
      case 3:
        this.setRightOffset(invalidation.value);
        break;
      case 4:
        this.resetTimeScale();
        break;
      case 5:
        this.setTimeScaleAnimation(invalidation.value);
        break;
      case 6:
        this._removeTimeScaleAnimation();
    }
  }
  _removeTimeScaleAnimation() {
    const index = this._timeScaleInvalidations.findIndex(
      (inv) => inv.type === 5
      /* TimeScaleInvalidationType.Animation */
    );
    if (index !== -1) {
      this._timeScaleInvalidations.splice(index, 1);
    }
  }
};

// ../lib/prod/src/formatters/formatter-base.js
var FormatterBase = class {
  formatTickmarks(prices) {
    return prices.map((price) => this.format(price));
  }
};

// ../lib/prod/src/formatters/price-formatter.js
var formatterOptions = {
  decimalSign: ".",
  decimalSignFractional: "'"
};
function numberToStringWithLeadingZero(value, length) {
  if (!isNumber(value)) {
    return "n/a";
  }
  if (!isInteger(length)) {
    throw new TypeError("invalid length");
  }
  if (length < 0 || length > 16) {
    throw new TypeError("invalid length");
  }
  if (length === 0) {
    return value.toString();
  }
  const dummyString = "0000000000000000";
  return (dummyString + value.toString()).slice(-length);
}
var PriceFormatter = class extends FormatterBase {
  constructor(priceScale, minMove) {
    super();
    if (!minMove) {
      minMove = 1;
    }
    if (!isNumber(priceScale) || !isInteger(priceScale)) {
      priceScale = 100;
    }
    if (priceScale < 0) {
      throw new TypeError("invalid base");
    }
    this._priceScale = priceScale;
    this._minMove = minMove;
    this._calculateDecimal();
  }
  format(price) {
    const sign = price < 0 ? "\u2212" : "";
    price = Math.abs(price);
    return sign + this._formatAsDecimal(price);
  }
  _calculateDecimal() {
    this._fractionalLength = 0;
    if (this._priceScale > 0 && this._minMove > 0) {
      let base = this._priceScale;
      while (base > 1) {
        base /= 10;
        this._fractionalLength++;
      }
    }
  }
  _formatAsDecimal(price) {
    const base = this._priceScale / this._minMove;
    let intPart = Math.floor(price);
    let fracString = "";
    const fracLength = this._fractionalLength !== void 0 ? this._fractionalLength : NaN;
    if (base > 1) {
      let fracPart = +(Math.round(price * base) - intPart * base).toFixed(this._fractionalLength);
      if (fracPart >= base) {
        fracPart -= base;
        intPart += 1;
      }
      fracString = formatterOptions.decimalSign + numberToStringWithLeadingZero(+fracPart.toFixed(this._fractionalLength) * this._minMove, fracLength);
    } else {
      intPart = Math.round(intPart * base) / base;
      if (fracLength > 0) {
        fracString = formatterOptions.decimalSign + numberToStringWithLeadingZero(0, fracLength);
      }
    }
    return intPart.toFixed(0) + fracString;
  }
};

// ../lib/prod/src/formatters/percentage-formatter.js
var PercentageFormatter = class extends PriceFormatter {
  constructor(priceScale = 100) {
    super(priceScale);
  }
  format(price) {
    return `${super.format(price)}%`;
  }
};

// ../lib/prod/src/formatters/volume-formatter.js
var VolumeFormatter = class extends FormatterBase {
  constructor(precision) {
    super();
    this._precision = precision;
  }
  format(vol) {
    let sign = "";
    if (vol < 0) {
      sign = "-";
      vol = -vol;
    }
    if (vol < 995) {
      return sign + this._formatNumber(vol);
    } else if (vol < 999995) {
      return sign + this._formatNumber(vol / 1e3) + "K";
    } else if (vol < 999999995) {
      vol = 1e3 * Math.round(vol / 1e3);
      return sign + this._formatNumber(vol / 1e6) + "M";
    } else {
      vol = 1e6 * Math.round(vol / 1e6);
      return sign + this._formatNumber(vol / 1e9) + "B";
    }
  }
  _formatNumber(value) {
    let res;
    const priceScale = Math.pow(10, this._precision);
    value = Math.round(value * priceScale) / priceScale;
    if (value >= 1e-15 && value < 1) {
      res = value.toFixed(this._precision).replace(/\.?0+$/, "");
    } else {
      res = String(value);
    }
    return res.replace(/(\.[1-9]*)0+$/, (e, p1) => p1);
  }
};

// ../lib/prod/src/model/text-width-cache.js
var defaultReplacementRe = /[2-9]/g;
var TextWidthCache = class {
  constructor(size3 = 50) {
    this._actualSize = 0;
    this._usageTick = 1;
    this._oldestTick = 1;
    this._tick2Labels = {};
    this._cache = /* @__PURE__ */ new Map();
    this._maxSize = size3;
  }
  reset() {
    this._actualSize = 0;
    this._cache.clear();
    this._usageTick = 1;
    this._oldestTick = 1;
    this._tick2Labels = {};
  }
  measureText(ctx, text, optimizationReplacementRe2) {
    return this._getMetrics(ctx, text, optimizationReplacementRe2).width;
  }
  yMidCorrection(ctx, text, optimizationReplacementRe2) {
    const metrics = this._getMetrics(ctx, text, optimizationReplacementRe2);
    return ((metrics.actualBoundingBoxAscent || 0) - (metrics.actualBoundingBoxDescent || 0)) / 2;
  }
  _getMetrics(ctx, text, optimizationReplacementRe2) {
    const re = optimizationReplacementRe2 || defaultReplacementRe;
    const cacheString = String(text).replace(re, "0");
    if (this._cache.has(cacheString)) {
      return ensureDefined(this._cache.get(cacheString)).metrics;
    }
    if (this._actualSize === this._maxSize) {
      const oldestValue = this._tick2Labels[this._oldestTick];
      delete this._tick2Labels[this._oldestTick];
      this._cache.delete(oldestValue);
      this._oldestTick++;
      this._actualSize--;
    }
    ctx.save();
    ctx.textBaseline = "middle";
    const metrics = ctx.measureText(cacheString);
    ctx.restore();
    if (metrics.width === 0 && !!text.length) {
      return metrics;
    }
    this._cache.set(cacheString, { metrics, tick: this._usageTick });
    this._tick2Labels[this._usageTick] = cacheString;
    this._actualSize++;
    this._usageTick++;
    return metrics;
  }
};

// ../lib/prod/src/views/pane/pane-price-axis-view.js
var PanePriceAxisViewRenderer = class {
  constructor(textWidthCache) {
    this._priceAxisViewRenderer = null;
    this._rendererOptions = null;
    this._align = "right";
    this._textWidthCache = textWidthCache;
  }
  setParams(priceAxisViewRenderer, rendererOptions, align) {
    this._priceAxisViewRenderer = priceAxisViewRenderer;
    this._rendererOptions = rendererOptions;
    this._align = align;
  }
  draw(target) {
    if (this._rendererOptions === null || this._priceAxisViewRenderer === null) {
      return;
    }
    this._priceAxisViewRenderer.draw(target, this._rendererOptions, this._textWidthCache, this._align);
  }
};
var PanePriceAxisView = class {
  constructor(priceAxisView, dataSource, chartModel) {
    this._priceAxisView = priceAxisView;
    this._textWidthCache = new TextWidthCache(50);
    this._dataSource = dataSource;
    this._chartModel = chartModel;
    this._fontSize = -1;
    this._renderer = new PanePriceAxisViewRenderer(this._textWidthCache);
  }
  renderer() {
    const pane = this._chartModel.paneForSource(this._dataSource);
    if (pane === null) {
      return null;
    }
    const priceScale = pane.isOverlay(this._dataSource) ? pane.defaultVisiblePriceScale() : this._dataSource.priceScale();
    if (priceScale === null) {
      return null;
    }
    const position = pane.priceScalePosition(priceScale);
    if (position === "overlay") {
      return null;
    }
    const options = this._chartModel.priceAxisRendererOptions();
    if (options.fontSize !== this._fontSize) {
      this._fontSize = options.fontSize;
      this._textWidthCache.reset();
    }
    this._renderer.setParams(this._priceAxisView.paneRenderer(), options, position);
    return this._renderer;
  }
};

// ../lib/prod/src/renderers/horizontal-line-renderer.js
var Constants;
(function(Constants14) {
  Constants14[Constants14["HitTestThreshold"] = 7] = "HitTestThreshold";
})(Constants || (Constants = {}));
var HorizontalLineRenderer = class extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    this._data = null;
  }
  setData(data) {
    this._data = data;
  }
  hitTest(x, y) {
    if (!this._data?.visible) {
      return null;
    }
    const { y: itemY, lineWidth, externalId } = this._data;
    if (y >= itemY - lineWidth - 7 && y <= itemY + lineWidth + 7) {
      return {
        hitTestData: this._data,
        externalId
      };
    }
    return null;
  }
  _drawImpl({ context: ctx, bitmapSize, horizontalPixelRatio, verticalPixelRatio }) {
    if (this._data === null) {
      return;
    }
    if (this._data.visible === false) {
      return;
    }
    const y = Math.round(this._data.y * verticalPixelRatio);
    if (y < 0 || y > bitmapSize.height) {
      return;
    }
    ctx.lineCap = "butt";
    ctx.strokeStyle = this._data.color;
    ctx.lineWidth = Math.floor(this._data.lineWidth * horizontalPixelRatio);
    setLineStyle(ctx, this._data.lineStyle);
    drawHorizontalLine(ctx, y, 0, bitmapSize.width);
  }
};

// ../lib/prod/src/views/pane/series-horizontal-line-pane-view.js
var SeriesHorizontalLinePaneView = class {
  constructor(series) {
    this._lineRendererData = {
      y: 0,
      color: "rgba(0, 0, 0, 0)",
      lineWidth: 1,
      lineStyle: 0,
      visible: false
    };
    this._lineRenderer = new HorizontalLineRenderer();
    this._invalidated = true;
    this._series = series;
    this._model = series.model();
    this._lineRenderer.setData(this._lineRendererData);
  }
  update() {
    this._invalidated = true;
  }
  renderer() {
    if (!this._series.visible()) {
      return null;
    }
    if (this._invalidated) {
      this._updateImpl();
      this._invalidated = false;
    }
    return this._lineRenderer;
  }
};

// ../lib/prod/src/views/pane/series-horizontal-base-line-pane-view.js
var SeriesHorizontalBaseLinePaneView = class extends SeriesHorizontalLinePaneView {
  // eslint-disable-next-line no-useless-constructor
  constructor(series) {
    super(series);
  }
  _updateImpl() {
    this._lineRendererData.visible = false;
    const priceScale = this._series.priceScale();
    const mode = priceScale.mode().mode;
    if (mode !== 2 && mode !== 3) {
      return;
    }
    const seriesOptions = this._series.options();
    if (!seriesOptions.baseLineVisible || !this._series.visible()) {
      return;
    }
    const firstValue = this._series.firstValue();
    if (firstValue === null) {
      return;
    }
    this._lineRendererData.visible = true;
    this._lineRendererData.y = priceScale.priceToCoordinate(firstValue.value, firstValue.value);
    this._lineRendererData.color = seriesOptions.baseLineColor;
    this._lineRendererData.lineWidth = seriesOptions.baseLineWidth;
    this._lineRendererData.lineStyle = seriesOptions.baseLineStyle;
  }
};

// ../lib/prod/src/renderers/series-last-price-animation-renderer.js
var SeriesLastPriceAnimationRenderer = class extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    this._data = null;
  }
  setData(data) {
    this._data = data;
  }
  data() {
    return this._data;
  }
  _drawImpl({ context: ctx, horizontalPixelRatio, verticalPixelRatio }) {
    const data = this._data;
    if (data === null) {
      return;
    }
    const tickWidth = Math.max(1, Math.floor(horizontalPixelRatio));
    const correction = tickWidth % 2 / 2;
    const centerX = Math.round(data.center.x * horizontalPixelRatio) + correction;
    const centerY = data.center.y * verticalPixelRatio;
    ctx.fillStyle = data.seriesLineColor;
    ctx.beginPath();
    const centerPointRadius = Math.max(2, data.seriesLineWidth * 1.5) * horizontalPixelRatio;
    ctx.arc(centerX, centerY, centerPointRadius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.fillStyle = data.fillColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, data.radius * horizontalPixelRatio, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.lineWidth = tickWidth;
    ctx.strokeStyle = data.strokeColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, data.radius * horizontalPixelRatio + tickWidth / 2, 0, 2 * Math.PI, false);
    ctx.stroke();
  }
};

// ../lib/prod/src/views/pane/series-last-price-animation-pane-view.js
var Constants2;
(function(Constants14) {
  Constants14[Constants14["AnimationPeriod"] = 2600] = "AnimationPeriod";
  Constants14[Constants14["Stage1Period"] = 0.25] = "Stage1Period";
  Constants14[Constants14["Stage2Period"] = 0.275] = "Stage2Period";
  Constants14[Constants14["Stage3Period"] = 0.475] = "Stage3Period";
  Constants14[Constants14["Stage1StartCircleRadius"] = 4] = "Stage1StartCircleRadius";
  Constants14[Constants14["Stage1EndCircleRadius"] = 10] = "Stage1EndCircleRadius";
  Constants14[Constants14["Stage1StartFillAlpha"] = 0.25] = "Stage1StartFillAlpha";
  Constants14[Constants14["Stage1EndFillAlpha"] = 0] = "Stage1EndFillAlpha";
  Constants14[Constants14["Stage1StartStrokeAlpha"] = 0.4] = "Stage1StartStrokeAlpha";
  Constants14[Constants14["Stage1EndStrokeAlpha"] = 0.8] = "Stage1EndStrokeAlpha";
  Constants14[Constants14["Stage2StartCircleRadius"] = 10] = "Stage2StartCircleRadius";
  Constants14[Constants14["Stage2EndCircleRadius"] = 14] = "Stage2EndCircleRadius";
  Constants14[Constants14["Stage2StartFillAlpha"] = 0] = "Stage2StartFillAlpha";
  Constants14[Constants14["Stage2EndFillAlpha"] = 0] = "Stage2EndFillAlpha";
  Constants14[Constants14["Stage2StartStrokeAlpha"] = 0.8] = "Stage2StartStrokeAlpha";
  Constants14[Constants14["Stage2EndStrokeAlpha"] = 0] = "Stage2EndStrokeAlpha";
  Constants14[Constants14["Stage3StartCircleRadius"] = 14] = "Stage3StartCircleRadius";
  Constants14[Constants14["Stage3EndCircleRadius"] = 14] = "Stage3EndCircleRadius";
  Constants14[Constants14["Stage3StartFillAlpha"] = 0] = "Stage3StartFillAlpha";
  Constants14[Constants14["Stage3EndFillAlpha"] = 0] = "Stage3EndFillAlpha";
  Constants14[Constants14["Stage3StartStrokeAlpha"] = 0] = "Stage3StartStrokeAlpha";
  Constants14[Constants14["Stage3EndStrokeAlpha"] = 0] = "Stage3EndStrokeAlpha";
})(Constants2 || (Constants2 = {}));
var animationStagesData = [
  {
    start: 0,
    end: 0.25,
    startRadius: 4,
    endRadius: 10,
    startFillAlpha: 0.25,
    endFillAlpha: 0,
    startStrokeAlpha: 0.4,
    endStrokeAlpha: 0.8
  },
  {
    start: 0.25,
    end: 0.25 + 0.275,
    startRadius: 10,
    endRadius: 14,
    startFillAlpha: 0,
    endFillAlpha: 0,
    startStrokeAlpha: 0.8,
    endStrokeAlpha: 0
  },
  {
    start: 0.25 + 0.275,
    end: 0.25 + 0.275 + 0.475,
    startRadius: 14,
    endRadius: 14,
    startFillAlpha: 0,
    endFillAlpha: 0,
    startStrokeAlpha: 0,
    endStrokeAlpha: 0
  }
];
function radius2(stage, startRadius, endRadius) {
  return startRadius + (endRadius - startRadius) * stage;
}
var SeriesLastPriceAnimationPaneView = class {
  constructor(series) {
    this._renderer = new SeriesLastPriceAnimationRenderer();
    this._invalidated = true;
    this._stageInvalidated = true;
    this._startTime = performance.now();
    this._endTime = this._startTime - 1;
    this._series = series;
  }
  onDataCleared() {
    this._endTime = this._startTime - 1;
    this.update();
  }
  onNewRealtimeDataReceived() {
    this.update();
    if (this._series.options().lastPriceAnimation === 2) {
      const now = performance.now();
      const timeToAnimationEnd = this._endTime - now;
      if (timeToAnimationEnd > 0) {
        if (timeToAnimationEnd < 2600 / 4) {
          this._endTime += 2600;
        }
        return;
      }
      this._startTime = now;
      this._endTime = now + 2600;
    }
  }
  update() {
    this._invalidated = true;
  }
  invalidateStage() {
    this._stageInvalidated = true;
  }
  visible() {
    return this._series.options().lastPriceAnimation !== 0;
  }
  animationActive() {
    switch (this._series.options().lastPriceAnimation) {
      case 0:
        return false;
      case 1:
        return true;
      case 2:
        return performance.now() <= this._endTime;
    }
  }
  renderer() {
    if (this._invalidated) {
      this._updateImpl();
      this._invalidated = false;
      this._stageInvalidated = false;
    } else if (this._stageInvalidated) {
      this._updateRendererDataStage();
      this._stageInvalidated = false;
    }
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.setData(null);
    const timeScale = this._series.model().timeScale();
    const visibleRange = timeScale.visibleStrictRange();
    const firstValue = this._series.firstValue();
    if (visibleRange === null || firstValue === null) {
      return;
    }
    const lastValue = this._series.lastValueData(true);
    if (lastValue.noData || !visibleRange.contains(lastValue.index)) {
      return;
    }
    const lastValuePoint = {
      x: timeScale.indexToCoordinate(lastValue.index),
      y: this._series.priceScale().priceToCoordinate(lastValue.price, firstValue.value)
    };
    const seriesLineColor = lastValue.color;
    const seriesLineWidth = this._series.options().lineWidth;
    const data = this._animationData(this._duration(), seriesLineColor);
    this._renderer.setData({
      seriesLineColor,
      seriesLineWidth,
      fillColor: data.fillColor,
      strokeColor: data.strokeColor,
      radius: data.radius,
      center: lastValuePoint
    });
  }
  _updateRendererDataStage() {
    const rendererData = this._renderer.data();
    if (rendererData !== null) {
      const data = this._animationData(this._duration(), rendererData.seriesLineColor);
      rendererData.fillColor = data.fillColor;
      rendererData.strokeColor = data.strokeColor;
      rendererData.radius = data.radius;
    }
  }
  _duration() {
    return this.animationActive() ? performance.now() - this._startTime : 2600 - 1;
  }
  _color(seriesLineColor, stage, startAlpha, endAlpha) {
    const alpha = startAlpha + (endAlpha - startAlpha) * stage;
    return this._series.model().colorParser().applyAlpha(seriesLineColor, alpha);
  }
  _animationData(durationSinceStart, lineColor) {
    const globalStage = durationSinceStart % 2600 / 2600;
    let currentStageData;
    for (const stageData of animationStagesData) {
      if (globalStage >= stageData.start && globalStage <= stageData.end) {
        currentStageData = stageData;
        break;
      }
    }
    assert(currentStageData !== void 0, "Last price animation internal logic error");
    const subStage = (globalStage - currentStageData.start) / (currentStageData.end - currentStageData.start);
    return {
      fillColor: this._color(lineColor, subStage, currentStageData.startFillAlpha, currentStageData.endFillAlpha),
      strokeColor: this._color(lineColor, subStage, currentStageData.startStrokeAlpha, currentStageData.endStrokeAlpha),
      radius: radius2(subStage, currentStageData.startRadius, currentStageData.endRadius)
    };
  }
};

// ../lib/prod/src/views/pane/series-price-line-pane-view.js
var SeriesPriceLinePaneView = class extends SeriesHorizontalLinePaneView {
  // eslint-disable-next-line no-useless-constructor
  constructor(series) {
    super(series);
  }
  _updateImpl() {
    const data = this._lineRendererData;
    data.visible = false;
    const seriesOptions = this._series.options();
    if (!seriesOptions.priceLineVisible || !this._series.visible()) {
      return;
    }
    const lastValueData = this._series.lastValueData(
      seriesOptions.priceLineSource === 0
      /* PriceLineSource.LastBar */
    );
    if (lastValueData.noData) {
      return;
    }
    data.visible = true;
    data.y = lastValueData.coordinate;
    data.color = this._series.priceLineColor(lastValueData.color);
    data.lineWidth = seriesOptions.priceLineWidth;
    data.lineStyle = seriesOptions.priceLineStyle;
  }
};

// ../lib/prod/src/views/price-axis/series-price-axis-view.js
var SeriesPriceAxisView = class extends PriceAxisView {
  constructor(source) {
    super();
    this._source = source;
  }
  _updateRendererData(axisRendererData, paneRendererData, commonRendererData) {
    axisRendererData.visible = false;
    paneRendererData.visible = false;
    const source = this._source;
    if (!source.visible()) {
      return;
    }
    const seriesOptions = source.options();
    const showSeriesLastValue = seriesOptions.lastValueVisible;
    const showSymbolLabel = source.title() !== "";
    const showPriceAndPercentage = seriesOptions.seriesLastValueMode === 0;
    const lastValueData = source.lastValueData(false);
    if (lastValueData.noData) {
      return;
    }
    if (showSeriesLastValue) {
      axisRendererData.text = this._axisText(lastValueData, showSeriesLastValue, showPriceAndPercentage);
      axisRendererData.visible = axisRendererData.text.length !== 0;
    }
    if (showSymbolLabel || showPriceAndPercentage) {
      paneRendererData.text = this._paneText(lastValueData, showSeriesLastValue, showSymbolLabel, showPriceAndPercentage);
      paneRendererData.visible = paneRendererData.text.length > 0;
    }
    const lastValueColor = source.priceLineColor(lastValueData.color);
    const colors = this._source.model().colorParser().generateContrastColors(lastValueColor);
    commonRendererData.background = colors.background;
    commonRendererData.coordinate = lastValueData.coordinate;
    paneRendererData.borderColor = source.model().backgroundColorAtYPercentFromTop(lastValueData.coordinate / source.priceScale().height());
    axisRendererData.borderColor = lastValueColor;
    axisRendererData.color = colors.foreground;
    paneRendererData.color = colors.foreground;
  }
  _paneText(lastValue, showSeriesLastValue, showSymbolLabel, showPriceAndPercentage) {
    let result = "";
    const title = this._source.title();
    if (showSymbolLabel && title.length !== 0) {
      result += `${title} `;
    }
    if (showSeriesLastValue && showPriceAndPercentage) {
      result += this._source.priceScale().isPercentage() ? lastValue.formattedPriceAbsolute : lastValue.formattedPricePercentage;
    }
    return result.trim();
  }
  _axisText(lastValueData, showSeriesLastValue, showPriceAndPercentage) {
    if (!showSeriesLastValue) {
      return "";
    }
    if (!showPriceAndPercentage) {
      return lastValueData.text;
    }
    return this._source.priceScale().isPercentage() ? lastValueData.formattedPricePercentage : lastValueData.formattedPriceAbsolute;
  }
};

// ../lib/prod/src/model/price-range-impl.js
function computeFiniteResult(method, valueOne, valueTwo, fallback) {
  const firstFinite = Number.isFinite(valueOne);
  const secondFinite = Number.isFinite(valueTwo);
  if (firstFinite && secondFinite) {
    return method(valueOne, valueTwo);
  }
  return !firstFinite && !secondFinite ? fallback : firstFinite ? valueOne : valueTwo;
}
var PriceRangeImpl = class _PriceRangeImpl {
  constructor(minValue, maxValue) {
    this._minValue = minValue;
    this._maxValue = maxValue;
  }
  equals(pr) {
    if (pr === null) {
      return false;
    }
    return this._minValue === pr._minValue && this._maxValue === pr._maxValue;
  }
  clone() {
    return new _PriceRangeImpl(this._minValue, this._maxValue);
  }
  minValue() {
    return this._minValue;
  }
  maxValue() {
    return this._maxValue;
  }
  length() {
    return this._maxValue - this._minValue;
  }
  isEmpty() {
    return this._maxValue === this._minValue || Number.isNaN(this._maxValue) || Number.isNaN(this._minValue);
  }
  merge(anotherRange) {
    if (anotherRange === null) {
      return this;
    }
    return new _PriceRangeImpl(computeFiniteResult(Math.min, this.minValue(), anotherRange.minValue(), -Infinity), computeFiniteResult(Math.max, this.maxValue(), anotherRange.maxValue(), Infinity));
  }
  scaleAroundCenter(coeff) {
    if (!isNumber(coeff)) {
      return;
    }
    const delta = this._maxValue - this._minValue;
    if (delta === 0) {
      return;
    }
    const center = (this._maxValue + this._minValue) * 0.5;
    let maxDelta = this._maxValue - center;
    let minDelta = this._minValue - center;
    maxDelta *= coeff;
    minDelta *= coeff;
    this._maxValue = center + maxDelta;
    this._minValue = center + minDelta;
  }
  shift(delta) {
    if (!isNumber(delta)) {
      return;
    }
    this._maxValue += delta;
    this._minValue += delta;
  }
  toRaw() {
    return {
      minValue: this._minValue,
      maxValue: this._maxValue
    };
  }
  static fromRaw(raw) {
    return raw === null ? null : new _PriceRangeImpl(raw.minValue, raw.maxValue);
  }
};

// ../lib/prod/src/model/autoscale-info-impl.js
var AutoscaleInfoImpl = class _AutoscaleInfoImpl {
  constructor(priceRange, margins) {
    this._priceRange = priceRange;
    this._margins = margins || null;
  }
  priceRange() {
    return this._priceRange;
  }
  margins() {
    return this._margins;
  }
  toRaw() {
    return {
      priceRange: this._priceRange === null ? null : this._priceRange.toRaw(),
      margins: this._margins || void 0
    };
  }
  static fromRaw(raw) {
    return raw === null ? null : new _AutoscaleInfoImpl(PriceRangeImpl.fromRaw(raw.priceRange), raw.margins);
  }
};

// ../lib/prod/src/model/conflation/constants.js
var CONFLATION_LEVELS = [2, 4, 8, 16, 32, 64, 128, 256, 512];
var MAX_CONFLATION_LEVEL = 512;
var DPR_CONFLATION_THRESHOLD = 1;
var CONFLATION_ERROR_MESSAGES = {
  missingPriceValueBuilder: "Custom series with conflation reducer must have a priceValueBuilder method"
};

// ../lib/prod/src/views/pane/custom-price-line-pane-view.js
var CustomPriceLinePaneView = class extends SeriesHorizontalLinePaneView {
  constructor(series, priceLine) {
    super(series);
    this._priceLine = priceLine;
  }
  _updateImpl() {
    const data = this._lineRendererData;
    data.visible = false;
    const lineOptions = this._priceLine.options();
    if (!this._series.visible() || !lineOptions.lineVisible) {
      return;
    }
    const y = this._priceLine.yCoord();
    if (y === null) {
      return;
    }
    data.visible = true;
    data.y = y;
    data.color = lineOptions.color;
    data.lineWidth = lineOptions.lineWidth;
    data.lineStyle = lineOptions.lineStyle;
    data.externalId = this._priceLine.options().id;
  }
};

// ../lib/prod/src/views/price-axis/custom-price-line-price-axis-view.js
var CustomPriceLinePriceAxisView = class extends PriceAxisView {
  constructor(series, priceLine) {
    super();
    this._series = series;
    this._priceLine = priceLine;
  }
  _updateRendererData(axisRendererData, paneRendererData, commonData) {
    axisRendererData.visible = false;
    paneRendererData.visible = false;
    const options = this._priceLine.options();
    const labelVisible = options.axisLabelVisible;
    const showPaneLabel = options.title !== "";
    const series = this._series;
    if (!labelVisible || !series.visible()) {
      return;
    }
    const y = this._priceLine.yCoord();
    if (y === null) {
      return;
    }
    if (showPaneLabel) {
      paneRendererData.text = options.title;
      paneRendererData.visible = true;
    }
    paneRendererData.borderColor = series.model().backgroundColorAtYPercentFromTop(y / series.priceScale().height());
    axisRendererData.text = this._formatPrice(options.price);
    axisRendererData.visible = true;
    const colors = this._series.model().colorParser().generateContrastColors(options.axisLabelColor || options.color);
    commonData.background = colors.background;
    const textColor = options.axisLabelTextColor || colors.foreground;
    axisRendererData.color = textColor;
    paneRendererData.color = textColor;
    commonData.coordinate = y;
  }
  _formatPrice(price) {
    const firstValue = this._series.firstValue();
    if (firstValue === null) {
      return "";
    }
    return this._series.priceScale().formatPrice(price, firstValue.value);
  }
};

// ../lib/prod/src/model/custom-price-line.js
var CustomPriceLine = class {
  constructor(series, options) {
    this._series = series;
    this._options = options;
    this._priceLineView = new CustomPriceLinePaneView(series, this);
    this._priceAxisView = new CustomPriceLinePriceAxisView(series, this);
    this._panePriceAxisView = new PanePriceAxisView(this._priceAxisView, series, series.model());
  }
  applyOptions(options) {
    merge(this._options, options);
    this.update();
    this._series.model().lightUpdate();
  }
  options() {
    return this._options;
  }
  paneView() {
    return this._priceLineView;
  }
  labelPaneView() {
    return this._panePriceAxisView;
  }
  priceAxisView() {
    return this._priceAxisView;
  }
  update() {
    this._priceLineView.update();
    this._priceAxisView.update();
  }
  yCoord() {
    const series = this._series;
    const priceScale = series.priceScale();
    const timeScale = series.model().timeScale();
    if (timeScale.isEmpty() || priceScale.isEmpty()) {
      return null;
    }
    const firstValue = series.firstValue();
    if (firstValue === null) {
      return null;
    }
    return priceScale.priceToCoordinate(this._options.price, firstValue.value);
  }
};

// ../lib/prod/src/model/data-conflater.js
var DataConflater = class {
  constructor() {
    this._dataCache = /* @__PURE__ */ new WeakMap();
  }
  calculateConflationLevelWithSmoothing(barSpacing, devicePixelRatio, smoothingFactor) {
    const conflationThreshold = DPR_CONFLATION_THRESHOLD / devicePixelRatio * smoothingFactor;
    if (barSpacing >= conflationThreshold) {
      return 1;
    }
    const ratio = conflationThreshold / barSpacing;
    const conflationLevel = Math.pow(2, Math.floor(Math.log2(ratio)));
    return Math.min(conflationLevel, MAX_CONFLATION_LEVEL);
  }
  conflateByFactor(data, barsToMerge, customReducer, isCustomSeries = false, priceValueBuilder) {
    if (data.length === 0 || barsToMerge <= 1) {
      return data;
    }
    const conflationLevel = this._normalizeConflationLevel(barsToMerge);
    if (conflationLevel <= 1) {
      return data;
    }
    const entry = this._getValidatedCacheEntry(data);
    let cachedRows = entry.levelResults.get(conflationLevel);
    if (cachedRows !== void 0) {
      return cachedRows;
    }
    cachedRows = this._buildRecursively(data, conflationLevel, customReducer, isCustomSeries, priceValueBuilder, entry.levelResults);
    entry.levelResults.set(conflationLevel, cachedRows);
    return cachedRows;
  }
  /**
   * Efficiently update the last conflated chunk when new data arrives.
   * This avoids rebuilding all chunks when just the last data point changes.
   */
  updateLastConflatedChunk(originalData, newLastRow, conflationLevel, customReducer, isCustomSeries = false, priceValueBuilder) {
    if (conflationLevel < 1 || originalData.length === 0) {
      return originalData;
    }
    const entry = this._getValidatedCacheEntry(originalData);
    const cachedRows = entry.levelResults.get(conflationLevel);
    if (!cachedRows) {
      return this.conflateByFactor(originalData, conflationLevel, customReducer, isCustomSeries, priceValueBuilder);
    }
    const updatedRows = this._updateLastChunkInCache(originalData, newLastRow, conflationLevel, cachedRows, isCustomSeries, customReducer, priceValueBuilder);
    entry.levelResults.set(conflationLevel, updatedRows);
    return updatedRows;
  }
  _normalizeConflationLevel(barsToMerge) {
    if (barsToMerge <= 2) {
      return 2;
    }
    for (const level of CONFLATION_LEVELS) {
      if (barsToMerge <= level) {
        return level;
      }
    }
    return MAX_CONFLATION_LEVEL;
  }
  _getDataVersion(data) {
    if (data.length === 0) {
      return 0;
    }
    const first = data[0];
    const last = data[data.length - 1];
    return data.length * 31 + first.index * 17 + last.index * 13;
  }
  /**
   * Build conflation recursively, reusing previous level results.
   */
  _buildRecursively(data, targetLevel, customReducer, isCustomSeries = false, priceValueBuilder, levelResults = /* @__PURE__ */ new Map()) {
    if (targetLevel === 2) {
      return this._buildLevelFromOriginal(data, 2, customReducer, isCustomSeries, priceValueBuilder);
    }
    const prevLevel = targetLevel / 2;
    let prevData = levelResults.get(prevLevel);
    if (!prevData) {
      prevData = this._buildRecursively(data, prevLevel, customReducer, isCustomSeries, priceValueBuilder, levelResults);
      levelResults.set(prevLevel, prevData);
    }
    return this._buildLevelFromPrevious(prevData, customReducer, isCustomSeries, priceValueBuilder);
  }
  /**
   * Build a conflation level directly from original data (used for level 2).
   */
  _buildLevelFromOriginal(data, level, customReducer, isCustomSeries = false, priceValueBuilder) {
    const chunks = this._buildChunksFromData(data, level, customReducer, isCustomSeries, priceValueBuilder);
    return this._chunksToSeriesPlotRows(chunks, isCustomSeries);
  }
  /**
   * Build a conflation level from the previous level's result.
   */
  _buildLevelFromPrevious(prevData, customReducer, isCustomSeries = false, priceValueBuilder) {
    const chunks = this._buildChunksFromData(prevData, 2, customReducer, isCustomSeries, priceValueBuilder);
    return this._chunksToSeriesPlotRows(chunks, isCustomSeries);
  }
  _buildChunksFromData(data, mergeFactor, customReducer, isCustomSeries = false, priceValueBuilder) {
    const chunks = [];
    for (let i = 0; i < data.length; i += mergeFactor) {
      const remaining = data.length - i;
      if (remaining >= mergeFactor) {
        const merged = this._mergeTwoRows(data[i], data[i + 1], customReducer, isCustomSeries, priceValueBuilder);
        merged.isRemainder = false;
        chunks.push(merged);
      } else {
        if (chunks.length === 0) {
          chunks.push(this._plotRowToChunk(data[i], true));
        } else {
          const prev = chunks[chunks.length - 1];
          chunks[chunks.length - 1] = this._mergeChunkAndRow(prev, data[i], customReducer, isCustomSeries, priceValueBuilder);
        }
      }
    }
    return chunks;
  }
  _sumCount(a, b) {
    return (a ?? 1) + (b ?? 1);
  }
  _mergeTwoRows(a, b, customReducer, isCustomSeries = false, priceValueBuilder) {
    if (!isCustomSeries || !customReducer || !priceValueBuilder) {
      const high = a.value[
        1
        /* PlotRowValueIndex.High */
      ] > b.value[
        1
        /* PlotRowValueIndex.High */
      ] ? a.value[
        1
        /* PlotRowValueIndex.High */
      ] : b.value[
        1
        /* PlotRowValueIndex.High */
      ];
      const low = a.value[
        2
        /* PlotRowValueIndex.Low */
      ] < b.value[
        2
        /* PlotRowValueIndex.Low */
      ] ? a.value[
        2
        /* PlotRowValueIndex.Low */
      ] : b.value[
        2
        /* PlotRowValueIndex.Low */
      ];
      return {
        startIndex: a.index,
        endIndex: b.index,
        startTime: a.time,
        endTime: b.time,
        open: a.value[
          0
          /* PlotRowValueIndex.Open */
        ],
        high,
        low,
        close: b.value[
          3
          /* PlotRowValueIndex.Close */
        ],
        originalDataCount: this._sumCount(a.originalDataCount, b.originalDataCount),
        conflatedData: void 0,
        isRemainder: false
      };
    }
    const c1 = this._convertToContext(a, priceValueBuilder);
    const c2 = this._convertToContext(b, priceValueBuilder);
    const aggregated = customReducer(c1, c2);
    const prices = priceValueBuilder(aggregated);
    const p = prices.length ? prices[prices.length - 1] : 0;
    return {
      startIndex: a.index,
      endIndex: b.index,
      startTime: a.time,
      endTime: b.time,
      open: a.value[
        0
        /* PlotRowValueIndex.Open */
      ],
      high: Math.max(a.value[
        1
        /* PlotRowValueIndex.High */
      ], p),
      low: Math.min(a.value[
        2
        /* PlotRowValueIndex.Low */
      ], p),
      close: p,
      originalDataCount: this._sumCount(a.originalDataCount, b.originalDataCount),
      conflatedData: aggregated,
      isRemainder: false
    };
  }
  _mergeChunkAndRow(chunk, row, customReducer, isCustomSeries = false, priceValueBuilder) {
    if (!isCustomSeries || !customReducer || !priceValueBuilder) {
      return {
        startIndex: chunk.startIndex,
        endIndex: row.index,
        startTime: chunk.startTime,
        endTime: row.time,
        open: chunk.open,
        high: chunk.high > row.value[
          1
          /* PlotRowValueIndex.High */
        ] ? chunk.high : row.value[
          1
          /* PlotRowValueIndex.High */
        ],
        low: chunk.low < row.value[
          2
          /* PlotRowValueIndex.Low */
        ] ? chunk.low : row.value[
          2
          /* PlotRowValueIndex.Low */
        ],
        close: row.value[
          3
          /* PlotRowValueIndex.Close */
        ],
        originalDataCount: chunk.originalDataCount + (row.originalDataCount ?? 1),
        conflatedData: chunk.conflatedData,
        isRemainder: false
      };
    }
    const prevAgg = chunk.conflatedData;
    const ctx = this._convertToContext(row, priceValueBuilder);
    const prevCtx = prevAgg ? {
      data: prevAgg,
      index: chunk.startIndex,
      originalTime: chunk.startTime,
      time: chunk.startTime,
      priceValues: priceValueBuilder(prevAgg)
    } : null;
    const aggregated = prevCtx ? customReducer(prevCtx, ctx) : ctx.data;
    const prices = prevCtx ? priceValueBuilder(aggregated) : ctx.priceValues;
    const p = prices.length ? prices[prices.length - 1] : 0;
    return {
      startIndex: chunk.startIndex,
      endIndex: row.index,
      startTime: chunk.startTime,
      endTime: row.time,
      open: chunk.open,
      high: Math.max(chunk.high, p),
      low: Math.min(chunk.low, p),
      close: p,
      originalDataCount: chunk.originalDataCount + (row.originalDataCount ?? 1),
      conflatedData: aggregated,
      isRemainder: false
    };
  }
  // fold [start, end) with override at overrideIndex
  // eslint-disable-next-line max-params
  _mergeRangeWithOverride(data, start, end, overrideIndex, overrideRow, customReducer, isCustomSeries = false, priceValueBuilder) {
    const first = start === overrideIndex ? overrideRow : data[start];
    if (end - start === 1) {
      return this._plotRowToChunk(first, true);
    }
    const second = start + 1 === overrideIndex ? overrideRow : data[start + 1];
    let chunk = this._mergeTwoRows(first, second, customReducer, isCustomSeries, priceValueBuilder);
    for (let i = start + 2; i < end; i++) {
      const row = i === overrideIndex ? overrideRow : data[i];
      chunk = this._mergeChunkAndRow(chunk, row, customReducer, isCustomSeries, priceValueBuilder);
    }
    return chunk;
  }
  _convertToContext(item, priceValueBuilder) {
    const itemData = item.data ?? {};
    return {
      data: item.data,
      index: item.index,
      originalTime: item.originalTime,
      time: item.time,
      priceValues: priceValueBuilder(itemData)
    };
  }
  _chunkToSeriesPlotRow(chunk, isCustomSeries = false) {
    const isCustom = isCustomSeries === true;
    const hasCustomData = !!chunk.conflatedData;
    const base = {
      index: chunk.startIndex,
      time: chunk.startTime,
      originalTime: chunk.startTime,
      value: [
        isCustom ? chunk.close : chunk.open,
        chunk.high,
        chunk.low,
        chunk.close
      ],
      originalDataCount: chunk.originalDataCount
    };
    const data = isCustom ? hasCustomData ? chunk.conflatedData : { time: chunk.startTime } : void 0;
    return {
      ...base,
      data
    };
  }
  _chunksToSeriesPlotRows(chunks, isCustomSeries = false) {
    return chunks.map((chunk) => this._chunkToSeriesPlotRow(chunk, isCustomSeries));
  }
  /**
   * Update only the last chunk in cached conflated data efficiently.
   */
  // eslint-disable-next-line max-params
  _updateLastChunkInCache(originalData, newLastRow, conflationLevel, cachedRows, isCustomSeries = false, customReducer, priceValueBuilder) {
    if (cachedRows.length === 0) {
      return cachedRows;
    }
    const lastOriginalIndex = originalData.length - 1;
    const overrideIndex = lastOriginalIndex;
    const chunkStartIndex = Math.floor(lastOriginalIndex / conflationLevel) * conflationLevel;
    const chunkEndIndex = Math.min(chunkStartIndex + conflationLevel, originalData.length);
    if (chunkEndIndex - chunkStartIndex < conflationLevel && originalData.length > conflationLevel) {
      const newOriginalData = originalData.slice();
      newOriginalData[newOriginalData.length - 1] = newLastRow;
      return this.conflateByFactor(originalData, conflationLevel, customReducer, isCustomSeries, priceValueBuilder);
    }
    const lastChunkIndex = Math.floor((lastOriginalIndex - 1) / conflationLevel);
    const newChunkIndex = Math.floor(overrideIndex / conflationLevel);
    if (lastChunkIndex === newChunkIndex || cachedRows.length === 1) {
      const actualEndIndex = Math.min(chunkStartIndex + conflationLevel, originalData.length);
      const count = actualEndIndex - chunkStartIndex;
      if (count <= 0) {
        return cachedRows;
      }
      const mergedChunk = count === 1 ? this._plotRowToChunk(
        chunkStartIndex === overrideIndex ? newLastRow : originalData[chunkStartIndex],
        /* isRemainder*/
        true
      ) : this._mergeRangeWithOverride(originalData, chunkStartIndex, actualEndIndex, overrideIndex, newLastRow, customReducer, isCustomSeries, priceValueBuilder);
      cachedRows[cachedRows.length - 1] = this._chunkToSeriesPlotRow(mergedChunk, isCustomSeries);
      return cachedRows;
    } else {
      const newOriginalData = originalData.slice();
      newOriginalData[newOriginalData.length - 1] = newLastRow;
      return this.conflateByFactor(newOriginalData, conflationLevel, customReducer, isCustomSeries, priceValueBuilder);
    }
  }
  _plotRowToChunk(item, isRemainder = false) {
    const chunk = {
      startIndex: item.index,
      endIndex: item.index,
      startTime: item.time,
      endTime: item.time,
      open: item.value[
        0
        /* PlotRowValueIndex.Open */
      ],
      high: item.value[
        1
        /* PlotRowValueIndex.High */
      ],
      low: item.value[
        2
        /* PlotRowValueIndex.Low */
      ],
      close: item.value[
        3
        /* PlotRowValueIndex.Close */
      ],
      originalDataCount: item.originalDataCount ?? 1,
      conflatedData: item.data,
      isRemainder
    };
    return chunk;
  }
  _getValidatedCacheEntry(data) {
    const entry = this._ensureCacheEntry(data);
    const dataVersion = this._getDataVersion(data);
    if (entry.version !== dataVersion) {
      entry.levelResults.clear();
      entry.version = dataVersion;
    }
    return entry;
  }
  _ensureCacheEntry(data) {
    let entry = this._dataCache.get(data);
    if (entry === void 0) {
      entry = {
        version: this._getDataVersion(data),
        levelResults: /* @__PURE__ */ new Map()
      };
      this._dataCache.set(data, entry);
    }
    return entry;
  }
};

// ../lib/prod/src/model/price-data-source.js
var PriceDataSource = class extends DataSource {
  constructor(model) {
    super();
    this._model = model;
  }
  model() {
    return this._model;
  }
};

// ../lib/prod/src/model/series-bar-colorer.js
var barStyleFnMap = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Bar: (findBar, barStyle, barIndex, precomputedBars) => {
    const upColor = barStyle.upColor;
    const downColor = barStyle.downColor;
    const currentBar = ensureNotNull(findBar(barIndex, precomputedBars));
    const isUp = ensure(currentBar.value[
      0
      /* PlotRowValueIndex.Open */
    ]) <= ensure(currentBar.value[
      3
      /* PlotRowValueIndex.Close */
    ]);
    return {
      barColor: currentBar.color ?? (isUp ? upColor : downColor)
    };
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Candlestick: (findBar, candlestickStyle, barIndex, precomputedBars) => {
    const upColor = candlestickStyle.upColor;
    const downColor = candlestickStyle.downColor;
    const borderUpColor = candlestickStyle.borderUpColor;
    const borderDownColor = candlestickStyle.borderDownColor;
    const wickUpColor = candlestickStyle.wickUpColor;
    const wickDownColor = candlestickStyle.wickDownColor;
    const currentBar = ensureNotNull(findBar(barIndex, precomputedBars));
    const isUp = ensure(currentBar.value[
      0
      /* PlotRowValueIndex.Open */
    ]) <= ensure(currentBar.value[
      3
      /* PlotRowValueIndex.Close */
    ]);
    return {
      barColor: currentBar.color ?? (isUp ? upColor : downColor),
      barBorderColor: currentBar.borderColor ?? (isUp ? borderUpColor : borderDownColor),
      barWickColor: currentBar.wickColor ?? (isUp ? wickUpColor : wickDownColor)
    };
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Custom: (findBar, customStyle, barIndex, precomputedBars) => {
    const currentBar = ensureNotNull(findBar(barIndex, precomputedBars));
    return {
      barColor: currentBar.color ?? customStyle.color
    };
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Area: (findBar, areaStyle, barIndex, precomputedBars) => {
    const currentBar = ensureNotNull(findBar(barIndex, precomputedBars));
    return {
      barColor: currentBar.lineColor ?? areaStyle.lineColor,
      lineColor: currentBar.lineColor ?? areaStyle.lineColor,
      topColor: currentBar.topColor ?? areaStyle.topColor,
      bottomColor: currentBar.bottomColor ?? areaStyle.bottomColor
    };
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Baseline: (findBar, baselineStyle, barIndex, precomputedBars) => {
    const currentBar = ensureNotNull(findBar(barIndex, precomputedBars));
    const isAboveBaseline = currentBar.value[
      3
      /* PlotRowValueIndex.Close */
    ] >= baselineStyle.baseValue.price;
    return {
      barColor: isAboveBaseline ? baselineStyle.topLineColor : baselineStyle.bottomLineColor,
      topLineColor: currentBar.topLineColor ?? baselineStyle.topLineColor,
      bottomLineColor: currentBar.bottomLineColor ?? baselineStyle.bottomLineColor,
      topFillColor1: currentBar.topFillColor1 ?? baselineStyle.topFillColor1,
      topFillColor2: currentBar.topFillColor2 ?? baselineStyle.topFillColor2,
      bottomFillColor1: currentBar.bottomFillColor1 ?? baselineStyle.bottomFillColor1,
      bottomFillColor2: currentBar.bottomFillColor2 ?? baselineStyle.bottomFillColor2
    };
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Line: (findBar, lineStyle, barIndex, precomputedBars) => {
    const currentBar = ensureNotNull(findBar(barIndex, precomputedBars));
    return {
      barColor: currentBar.color ?? lineStyle.color,
      lineColor: currentBar.color ?? lineStyle.color
    };
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Histogram: (findBar, histogramStyle, barIndex, precomputedBars) => {
    const currentBar = ensureNotNull(findBar(barIndex, precomputedBars));
    return {
      barColor: currentBar.color ?? histogramStyle.color
    };
  }
};
var SeriesBarColorer = class {
  constructor(series) {
    this._findBar = (barIndex, precomputedBars) => {
      if (precomputedBars !== void 0) {
        return precomputedBars.value;
      }
      return this._series.bars().valueAt(barIndex);
    };
    this._series = series;
    this._styleGetter = barStyleFnMap[series.seriesType()];
  }
  barStyle(barIndex, precomputedBars) {
    return this._styleGetter(this._findBar, this._series.options(), barIndex, precomputedBars);
  }
};

// ../lib/prod/src/helpers/algorithms.js
function boundCompare(lower, arr, value, compare, start = 0, to = arr.length) {
  let count = to - start;
  while (0 < count) {
    const count2 = count >> 1;
    const mid = start + count2;
    if (compare(arr[mid], value) === lower) {
      start = mid + 1;
      count -= count2 + 1;
    } else {
      count = count2;
    }
  }
  return start;
}
var lowerBound = boundCompare.bind(null, true);
var upperBound = boundCompare.bind(null, false);

// ../lib/prod/src/model/plot-list.js
var MismatchDirection;
(function(MismatchDirection2) {
  MismatchDirection2[MismatchDirection2["NearestLeft"] = -1] = "NearestLeft";
  MismatchDirection2[MismatchDirection2["None"] = 0] = "None";
  MismatchDirection2[MismatchDirection2["NearestRight"] = 1] = "NearestRight";
})(MismatchDirection || (MismatchDirection = {}));
var CHUNK_SIZE = 30;
var PlotList = class {
  constructor() {
    this._items = [];
    this._minMaxCache = /* @__PURE__ */ new Map();
    this._rowSearchCache = /* @__PURE__ */ new Map();
    this._indices = [];
  }
  // @returns Last row
  last() {
    return this.size() > 0 ? this._items[this._items.length - 1] : null;
  }
  firstIndex() {
    return this.size() > 0 ? this._indexAt(0) : null;
  }
  lastIndex() {
    return this.size() > 0 ? this._indexAt(this._items.length - 1) : null;
  }
  size() {
    return this._items.length;
  }
  isEmpty() {
    return this.size() === 0;
  }
  contains(index) {
    return this._search(
      index,
      0
      /* MismatchDirection.None */
    ) !== null;
  }
  valueAt(index) {
    return this.search(index);
  }
  search(index, searchMode = 0) {
    const pos = this._search(index, searchMode);
    if (pos === null) {
      return null;
    }
    return {
      ...this._valueAt(pos),
      index: this._indexAt(pos)
    };
  }
  rows() {
    return this._items;
  }
  minMaxOnRangeCached(start, end, plots) {
    if (this.isEmpty()) {
      return null;
    }
    let result = null;
    for (const plot of plots) {
      const plotMinMax = this._minMaxOnRangeCachedImpl(start, end, plot);
      result = mergeMinMax(result, plotMinMax);
    }
    return result;
  }
  setData(plotRows) {
    this._rowSearchCache.clear();
    this._minMaxCache.clear();
    this._items = plotRows;
    this._indices = plotRows.map((plotRow) => plotRow.index);
  }
  // TimePointIndex values for fulfilled data points
  indices() {
    return this._indices;
  }
  _indexAt(offset) {
    return this._items[offset].index;
  }
  _valueAt(offset) {
    return this._items[offset];
  }
  _search(index, searchMode) {
    const exactPos = this._bsearch(index);
    if (exactPos === null && searchMode !== 0) {
      switch (searchMode) {
        case -1:
          return this._searchNearestLeft(index);
        case 1:
          return this._searchNearestRight(index);
        default:
          throw new TypeError("Unknown search mode");
      }
    }
    return exactPos;
  }
  _searchNearestLeft(index) {
    let nearestLeftPos = this._lowerbound(index);
    if (nearestLeftPos > 0) {
      nearestLeftPos = nearestLeftPos - 1;
    }
    return nearestLeftPos !== this._items.length && this._indexAt(nearestLeftPos) < index ? nearestLeftPos : null;
  }
  _searchNearestRight(index) {
    const nearestRightPos = this._upperbound(index);
    return nearestRightPos !== this._items.length && index < this._indexAt(nearestRightPos) ? nearestRightPos : null;
  }
  _bsearch(index) {
    const start = this._lowerbound(index);
    if (start !== this._items.length && !(index < this._items[start].index)) {
      return start;
    }
    return null;
  }
  _lowerbound(index) {
    return lowerBound(this._items, index, (a, b) => a.index < b);
  }
  _upperbound(index) {
    return upperBound(this._items, index, (a, b) => a.index > b);
  }
  _plotMinMax(startIndex, endIndexExclusive, plotIndex) {
    let result = null;
    for (let i = startIndex; i < endIndexExclusive; i++) {
      const values = this._items[i].value;
      const v = values[plotIndex];
      if (Number.isNaN(v)) {
        continue;
      }
      if (result === null) {
        result = { min: v, max: v };
      } else {
        if (v < result.min) {
          result.min = v;
        }
        if (v > result.max) {
          result.max = v;
        }
      }
    }
    return result;
  }
  _minMaxOnRangeCachedImpl(start, end, plotIndex) {
    if (this.isEmpty()) {
      return null;
    }
    let result = null;
    const firstIndex = ensureNotNull(this.firstIndex());
    const lastIndex = ensureNotNull(this.lastIndex());
    const s = Math.max(start, firstIndex);
    const e = Math.min(end, lastIndex);
    const cachedLow = Math.ceil(s / CHUNK_SIZE) * CHUNK_SIZE;
    const cachedHigh = Math.max(cachedLow, Math.floor(e / CHUNK_SIZE) * CHUNK_SIZE);
    {
      const startIndex = this._lowerbound(s);
      const endIndex = this._upperbound(Math.min(e, cachedLow, end));
      const plotMinMax = this._plotMinMax(startIndex, endIndex, plotIndex);
      result = mergeMinMax(result, plotMinMax);
    }
    let minMaxCache = this._minMaxCache.get(plotIndex);
    if (minMaxCache === void 0) {
      minMaxCache = /* @__PURE__ */ new Map();
      this._minMaxCache.set(plotIndex, minMaxCache);
    }
    for (let c = Math.max(cachedLow + 1, s); c < cachedHigh; c += CHUNK_SIZE) {
      const chunkIndex = Math.floor(c / CHUNK_SIZE);
      let chunkMinMax = minMaxCache.get(chunkIndex);
      if (chunkMinMax === void 0) {
        const chunkStart = this._lowerbound(chunkIndex * CHUNK_SIZE);
        const chunkEnd = this._upperbound((chunkIndex + 1) * CHUNK_SIZE - 1);
        chunkMinMax = this._plotMinMax(chunkStart, chunkEnd, plotIndex);
        minMaxCache.set(chunkIndex, chunkMinMax);
      }
      result = mergeMinMax(result, chunkMinMax);
    }
    {
      const startIndex = this._lowerbound(cachedHigh);
      const endIndex = this._upperbound(e);
      const plotMinMax = this._plotMinMax(startIndex, endIndex, plotIndex);
      result = mergeMinMax(result, plotMinMax);
    }
    return result;
  }
};
function mergeMinMax(first, second) {
  if (first === null) {
    return second;
  } else {
    if (second === null) {
      return first;
    } else {
      const min2 = Math.min(first.min, second.min);
      const max = Math.max(first.max, second.max);
      return { min: min2, max };
    }
  }
}

// ../lib/prod/src/model/series-data.js
function createSeriesPlotList() {
  return new PlotList();
}

// ../lib/prod/src/model/primitive-drawing-utils.js
var drawingUtils = {
  setLineStyle
};

// ../lib/prod/src/model/pane-primitive-wrapper.js
var PrimitiveRendererWrapper = class {
  constructor(baseRenderer) {
    this._baseRenderer = baseRenderer;
  }
  draw(target, isHovered, hitTestData) {
    this._baseRenderer.draw(target, drawingUtils);
  }
  drawBackground(target, isHovered, hitTestData) {
    this._baseRenderer.drawBackground?.(target, drawingUtils);
  }
};
var PrimitivePaneViewWrapper = class {
  constructor(paneView) {
    this._cache = null;
    this._paneView = paneView;
  }
  renderer() {
    const baseRenderer = this._paneView.renderer();
    if (baseRenderer === null) {
      return null;
    }
    if (this._cache?.base === baseRenderer) {
      return this._cache.wrapper;
    }
    const wrapper = new PrimitiveRendererWrapper(baseRenderer);
    this._cache = {
      base: baseRenderer,
      wrapper
    };
    return wrapper;
  }
  zOrder() {
    return this._paneView.zOrder?.() ?? "normal";
  }
};
var PrimitiveWrapper = class {
  constructor(primitive) {
    this._paneViewsCache = null;
    this._primitive = primitive;
  }
  primitive() {
    return this._primitive;
  }
  updateAllViews() {
    this._primitive.updateAllViews?.();
  }
  paneViews() {
    const base = this._primitive.paneViews?.() ?? [];
    if (this._paneViewsCache?.base === base) {
      return this._paneViewsCache.wrapper;
    }
    const wrapper = base.map((pw) => new PrimitivePaneViewWrapper(pw));
    this._paneViewsCache = {
      base,
      wrapper
    };
    return wrapper;
  }
  hitTest(x, y) {
    return this._primitive.hitTest?.(x, y) ?? null;
  }
};
var PanePrimitiveWrapper = class extends PrimitiveWrapper {
  labelPaneViews() {
    return [];
  }
};

// ../lib/prod/src/model/series-primitive-wrapper.js
var SeriesPrimitiveRendererWrapper = class {
  constructor(baseRenderer) {
    this._baseRenderer = baseRenderer;
  }
  draw(target, isHovered, hitTestData) {
    this._baseRenderer.draw(target, drawingUtils);
  }
  drawBackground(target, isHovered, hitTestData) {
    this._baseRenderer.drawBackground?.(target, drawingUtils);
  }
};
var SeriesPrimitivePaneViewWrapper = class {
  constructor(paneView) {
    this._cache = null;
    this._paneView = paneView;
  }
  renderer() {
    const baseRenderer = this._paneView.renderer();
    if (baseRenderer === null) {
      return null;
    }
    if (this._cache?.base === baseRenderer) {
      return this._cache.wrapper;
    }
    const wrapper = new SeriesPrimitiveRendererWrapper(baseRenderer);
    this._cache = {
      base: baseRenderer,
      wrapper
    };
    return wrapper;
  }
  zOrder() {
    return this._paneView.zOrder?.() ?? "normal";
  }
};
function getAxisViewData(baseView) {
  return {
    text: baseView.text(),
    coordinate: baseView.coordinate(),
    fixedCoordinate: baseView.fixedCoordinate?.(),
    color: baseView.textColor(),
    background: baseView.backColor(),
    visible: baseView.visible?.() ?? true,
    tickVisible: baseView.tickVisible?.() ?? true
  };
}
var SeriesPrimitiveTimeAxisViewWrapper = class {
  constructor(baseView, timeScale) {
    this._renderer = new TimeAxisViewRenderer();
    this._baseView = baseView;
    this._timeScale = timeScale;
  }
  renderer() {
    this._renderer.setData({
      width: this._timeScale.width(),
      ...getAxisViewData(this._baseView)
    });
    return this._renderer;
  }
};
var SeriesPrimitivePriceAxisViewWrapper = class extends PriceAxisView {
  constructor(baseView, priceScale) {
    super();
    this._baseView = baseView;
    this._priceScale = priceScale;
  }
  _updateRendererData(axisRendererData, paneRendererData, commonRendererData) {
    const data = getAxisViewData(this._baseView);
    commonRendererData.background = data.background;
    axisRendererData.color = data.color;
    const additionalPadding = 2 / 12 * this._priceScale.fontSize();
    commonRendererData.additionalPaddingTop = additionalPadding;
    commonRendererData.additionalPaddingBottom = additionalPadding;
    commonRendererData.coordinate = data.coordinate;
    commonRendererData.fixedCoordinate = data.fixedCoordinate;
    axisRendererData.text = data.text;
    axisRendererData.visible = data.visible;
    axisRendererData.tickVisible = data.tickVisible;
  }
};
var SeriesPrimitiveWrapper = class extends PrimitiveWrapper {
  constructor(primitive, series) {
    super(primitive);
    this._timeAxisViewsCache = null;
    this._priceAxisViewsCache = null;
    this._priceAxisPaneViewsCache = null;
    this._timeAxisPaneViewsCache = null;
    this._series = series;
  }
  timeAxisViews() {
    const base = this._primitive.timeAxisViews?.() ?? [];
    if (this._timeAxisViewsCache?.base === base) {
      return this._timeAxisViewsCache.wrapper;
    }
    const timeScale = this._series.model().timeScale();
    const wrapper = base.map((aw) => new SeriesPrimitiveTimeAxisViewWrapper(aw, timeScale));
    this._timeAxisViewsCache = {
      base,
      wrapper
    };
    return wrapper;
  }
  priceAxisViews() {
    const base = this._primitive.priceAxisViews?.() ?? [];
    if (this._priceAxisViewsCache?.base === base) {
      return this._priceAxisViewsCache.wrapper;
    }
    const priceScale = this._series.priceScale();
    const wrapper = base.map((aw) => new SeriesPrimitivePriceAxisViewWrapper(aw, priceScale));
    this._priceAxisViewsCache = {
      base,
      wrapper
    };
    return wrapper;
  }
  priceAxisPaneViews() {
    const base = this._primitive.priceAxisPaneViews?.() ?? [];
    if (this._priceAxisPaneViewsCache?.base === base) {
      return this._priceAxisPaneViewsCache.wrapper;
    }
    const wrapper = base.map((pw) => new SeriesPrimitivePaneViewWrapper(pw));
    this._priceAxisPaneViewsCache = {
      base,
      wrapper
    };
    return wrapper;
  }
  timeAxisPaneViews() {
    const base = this._primitive.timeAxisPaneViews?.() ?? [];
    if (this._timeAxisPaneViewsCache?.base === base) {
      return this._timeAxisPaneViewsCache.wrapper;
    }
    const wrapper = base.map((pw) => new SeriesPrimitivePaneViewWrapper(pw));
    this._timeAxisPaneViewsCache = {
      base,
      wrapper
    };
    return wrapper;
  }
  autoscaleInfo(startTimePoint, endTimePoint) {
    return this._primitive.autoscaleInfo?.(startTimePoint, endTimePoint) ?? null;
  }
};

// ../lib/prod/src/model/series.js
function extractPrimitivePaneViews(primitives, extractor, zOrder, destination) {
  primitives.forEach((wrapper) => {
    extractor(wrapper).forEach((paneView) => {
      if (paneView.zOrder() !== zOrder) {
        return;
      }
      destination.push(paneView);
    });
  });
}
function primitivePaneViewsExtractor(wrapper) {
  return wrapper.paneViews();
}
function primitivePricePaneViewsExtractor(wrapper) {
  return wrapper.priceAxisPaneViews();
}
function primitiveTimePaneViewsExtractor(wrapper) {
  return wrapper.timeAxisPaneViews();
}
var lineBasedSeries = ["Area", "Line", "Baseline"];
var Series = class extends PriceDataSource {
  constructor(model, seriesType, options, createPaneView8, customPaneView) {
    super(model);
    this._data = createSeriesPlotList();
    this._priceLineView = new SeriesPriceLinePaneView(this);
    this._customPriceLines = [];
    this._baseHorizontalLineView = new SeriesHorizontalBaseLinePaneView(this);
    this._lastPriceAnimationPaneView = null;
    this._barColorerCache = null;
    this._animationTimeoutId = null;
    this._primitives = [];
    this._dataConflater = new DataConflater();
    this._conflationByFactorCache = /* @__PURE__ */ new Map();
    this._customConflationReducer = null;
    this._options = options;
    this._seriesType = seriesType;
    const priceAxisView = new SeriesPriceAxisView(this);
    this._priceAxisViews = [priceAxisView];
    this._panePriceAxisView = new PanePriceAxisView(priceAxisView, this, model);
    if (lineBasedSeries.includes(this._seriesType)) {
      this._lastPriceAnimationPaneView = new SeriesLastPriceAnimationPaneView(this);
    }
    this._recreateFormatter();
    this._paneView = createPaneView8(this, this.model(), customPaneView);
    if (this._seriesType === "Custom") {
      const paneView = this._paneView;
      if (paneView.conflationReducer) {
        this.setCustomConflationReducer(paneView.conflationReducer);
      }
    }
  }
  destroy() {
    if (this._animationTimeoutId !== null) {
      clearTimeout(this._animationTimeoutId);
    }
  }
  priceLineColor(lastBarColor) {
    return this._options.priceLineColor || lastBarColor;
  }
  lastValueData(globalLast) {
    const noDataRes = { noData: true };
    const priceScale = this.priceScale();
    if (this.model().timeScale().isEmpty() || priceScale.isEmpty() || this._data.isEmpty()) {
      return noDataRes;
    }
    const visibleBars = this.model().timeScale().visibleStrictRange();
    const firstValue = this.firstValue();
    if (visibleBars === null || firstValue === null) {
      return noDataRes;
    }
    let bar;
    let lastIndex;
    if (globalLast) {
      const lastBar = this._data.last();
      if (lastBar === null) {
        return noDataRes;
      }
      bar = lastBar;
      lastIndex = lastBar.index;
    } else {
      const endBar = this._data.search(
        visibleBars.right(),
        -1
        /* MismatchDirection.NearestLeft */
      );
      if (endBar === null) {
        return noDataRes;
      }
      bar = this._data.valueAt(endBar.index);
      if (bar === null) {
        return noDataRes;
      }
      lastIndex = endBar.index;
    }
    const price = bar.value[
      3
      /* PlotRowValueIndex.Close */
    ];
    const barColorer = this.barColorer();
    const style = barColorer.barStyle(lastIndex, { value: bar });
    const coordinate = priceScale.priceToCoordinate(price, firstValue.value);
    return {
      noData: false,
      price,
      text: priceScale.formatPrice(price, firstValue.value),
      formattedPriceAbsolute: priceScale.formatPriceAbsolute(price),
      formattedPricePercentage: priceScale.formatPricePercentage(price, firstValue.value),
      color: style.barColor,
      coordinate,
      index: lastIndex
    };
  }
  barColorer() {
    if (this._barColorerCache !== null) {
      return this._barColorerCache;
    }
    this._barColorerCache = new SeriesBarColorer(this);
    return this._barColorerCache;
  }
  options() {
    return this._options;
  }
  applyOptions(options) {
    const targetPriceScaleId = options.priceScaleId;
    if (targetPriceScaleId !== void 0 && targetPriceScaleId !== this._options.priceScaleId) {
      this.model().moveSeriesToScale(this, targetPriceScaleId);
    }
    const conflationOptionsChanged = options.conflationThresholdFactor !== void 0;
    merge(this._options, options);
    if (conflationOptionsChanged) {
      this._conflationByFactorCache.clear();
      this.model().lightUpdate();
    }
    if (options.priceFormat !== void 0) {
      this._recreateFormatter();
      this.model().fullUpdate();
    }
    this.model().updateSource(this);
    this.model().updateCrosshair();
    this._paneView.update("options");
  }
  setData(data, updateInfo) {
    this._data.setData(data);
    this._conflationByFactorCache.clear();
    const ts = this.model().timeScale();
    const tsOptions = ts.options();
    if (tsOptions.enableConflation && tsOptions.precomputeConflationOnInit) {
      this._precomputeConflationLevels(tsOptions.precomputeConflationPriority);
    }
    this._paneView.update("data");
    if (this._lastPriceAnimationPaneView !== null) {
      if (updateInfo && updateInfo.lastBarUpdatedOrNewBarsAddedToTheRight) {
        this._lastPriceAnimationPaneView.onNewRealtimeDataReceived();
      } else if (data.length === 0) {
        this._lastPriceAnimationPaneView.onDataCleared();
      }
    }
    const sourcePane = this.model().paneForSource(this);
    this.model().recalculatePane(sourcePane);
    this.model().updateSource(this);
    this.model().updateCrosshair();
    this.model().lightUpdate();
  }
  createPriceLine(options) {
    const result = new CustomPriceLine(this, options);
    this._customPriceLines.push(result);
    this.model().updateSource(this);
    return result;
  }
  removePriceLine(line) {
    const index = this._customPriceLines.indexOf(line);
    if (index !== -1) {
      this._customPriceLines.splice(index, 1);
    }
    this.model().updateSource(this);
  }
  priceLines() {
    return this._customPriceLines;
  }
  seriesType() {
    return this._seriesType;
  }
  firstValue() {
    const bar = this.firstBar();
    if (bar === null) {
      return null;
    }
    return {
      value: bar.value[
        3
        /* PlotRowValueIndex.Close */
      ],
      timePoint: bar.time
    };
  }
  firstBar() {
    const visibleBars = this.model().timeScale().visibleStrictRange();
    if (visibleBars === null) {
      return null;
    }
    const startTimePoint = visibleBars.left();
    return this._data.search(
      startTimePoint,
      1
      /* MismatchDirection.NearestRight */
    );
  }
  bars() {
    return this._data;
  }
  setCustomConflationReducer(reducer) {
    this._customConflationReducer = reducer;
    this._conflationByFactorCache.clear();
  }
  /**
   * Check if conflation is currently enabled for this series.
   */
  isConflationEnabled() {
    const timeScale = this.model().timeScale();
    if (!timeScale.options().enableConflation) {
      return false;
    }
    return this._calculateConflationFactor() > 1;
  }
  /**
   * Efficiently update conflation when only the last data point changes.
   * This avoids rebuilding all conflated chunks.
   */
  updateLastConflatedChunk(newLastRow) {
    if (!this.isConflationEnabled()) {
      return;
    }
    const conflationFactor = this._calculateConflationFactor();
    if (!this._conflationByFactorCache.has(conflationFactor)) {
      return;
    }
    const isCustomSeries = this._seriesType === "Custom";
    const customReducer = isCustomSeries ? this._customConflationReducer || void 0 : void 0;
    const priceValueBuilder = isCustomSeries && this._paneView.priceValueBuilder ? (item) => {
      const customPaneView = this._paneView;
      const plotRow = item;
      const result = customPaneView.priceValueBuilder(plotRow);
      return Array.isArray(result) ? result : [typeof result === "number" ? result : 0];
    } : void 0;
    const updatedConflatedRows = this._dataConflater.updateLastConflatedChunk(this._data.rows(), newLastRow, conflationFactor, customReducer, isCustomSeries, priceValueBuilder);
    const conflatedList = createSeriesPlotList();
    conflatedList.setData(updatedConflatedRows);
    this._conflationByFactorCache.set(conflationFactor, conflatedList);
  }
  conflatedBars() {
    const timeScale = this.model().timeScale();
    const conflationEnabled = timeScale.options().enableConflation;
    if (this._seriesType === "Custom" && this._customConflationReducer === null) {
      return this._data;
    }
    if (!conflationEnabled) {
      return this._data;
    }
    const factor = this._calculateConflationFactor();
    const cached = this._conflationByFactorCache.get(factor);
    if (cached) {
      return cached;
    }
    this._regenerateConflatedDataByFactor(factor);
    const built = this._conflationByFactorCache.get(factor);
    return built ?? this._data;
  }
  dataAt(time) {
    const prices = this._data.valueAt(time);
    if (prices === null) {
      return null;
    }
    if (this._seriesType === "Bar" || this._seriesType === "Candlestick" || this._seriesType === "Custom") {
      return {
        open: prices.value[
          0
          /* PlotRowValueIndex.Open */
        ],
        high: prices.value[
          1
          /* PlotRowValueIndex.High */
        ],
        low: prices.value[
          2
          /* PlotRowValueIndex.Low */
        ],
        close: prices.value[
          3
          /* PlotRowValueIndex.Close */
        ]
      };
    } else {
      return prices.value[
        3
        /* PlotRowValueIndex.Close */
      ];
    }
  }
  topPaneViews(pane) {
    const res = [];
    extractPrimitivePaneViews(this._primitives, primitivePaneViewsExtractor, "top", res);
    const animationPaneView = this._lastPriceAnimationPaneView;
    if (animationPaneView === null || !animationPaneView.visible()) {
      return res;
    }
    if (this._animationTimeoutId === null && animationPaneView.animationActive()) {
      this._animationTimeoutId = setTimeout(() => {
        this._animationTimeoutId = null;
        this.model().cursorUpdate();
      }, 0);
    }
    animationPaneView.invalidateStage();
    res.unshift(animationPaneView);
    return res;
  }
  paneViews() {
    const res = [];
    if (!this._isOverlay()) {
      res.push(this._baseHorizontalLineView);
    }
    res.push(this._paneView, this._priceLineView);
    const priceLineViews = this._customPriceLines.map((line) => line.paneView());
    res.push(...priceLineViews);
    extractPrimitivePaneViews(this._primitives, primitivePaneViewsExtractor, "normal", res);
    return res;
  }
  bottomPaneViews() {
    return this._extractPaneViews(primitivePaneViewsExtractor, "bottom");
  }
  pricePaneViews(zOrder) {
    return this._extractPaneViews(primitivePricePaneViewsExtractor, zOrder);
  }
  timePaneViews(zOrder) {
    return this._extractPaneViews(primitiveTimePaneViewsExtractor, zOrder);
  }
  primitiveHitTest(x, y) {
    return this._primitives.map((primitive) => primitive.hitTest(x, y)).filter((result) => result !== null);
  }
  labelPaneViews() {
    return [
      this._panePriceAxisView,
      ...this._customPriceLines.map((line) => line.labelPaneView())
    ];
  }
  priceAxisViews(pane, priceScale) {
    if (priceScale !== this._priceScale && !this._isOverlay()) {
      return [];
    }
    const result = [...this._priceAxisViews];
    for (const customPriceLine of this._customPriceLines) {
      result.push(customPriceLine.priceAxisView());
    }
    this._primitives.forEach((wrapper) => {
      result.push(...wrapper.priceAxisViews());
    });
    return result;
  }
  timeAxisViews() {
    const res = [];
    this._primitives.forEach((wrapper) => {
      res.push(...wrapper.timeAxisViews());
    });
    return res;
  }
  autoscaleInfo(startTimePoint, endTimePoint) {
    if (this._options.autoscaleInfoProvider !== void 0) {
      const autoscaleInfo = this._options.autoscaleInfoProvider(() => {
        const res = this._autoscaleInfoImpl(startTimePoint, endTimePoint);
        return res === null ? null : res.toRaw();
      });
      return AutoscaleInfoImpl.fromRaw(autoscaleInfo);
    }
    return this._autoscaleInfoImpl(startTimePoint, endTimePoint);
  }
  base() {
    const priceFormat = this._options.priceFormat;
    return priceFormat.base ?? 1 / priceFormat.minMove;
  }
  formatter() {
    return this._formatter;
  }
  updateAllViews() {
    this._paneView.update();
    for (const priceAxisView of this._priceAxisViews) {
      priceAxisView.update();
    }
    for (const customPriceLine of this._customPriceLines) {
      customPriceLine.update();
    }
    this._priceLineView.update();
    this._baseHorizontalLineView.update();
    this._lastPriceAnimationPaneView?.update();
    this._primitives.forEach((wrapper) => wrapper.updateAllViews());
  }
  priceScale() {
    return ensureNotNull(super.priceScale());
  }
  markerDataAtIndex(index) {
    const getValue = (this._seriesType === "Line" || this._seriesType === "Area" || this._seriesType === "Baseline") && this._options.crosshairMarkerVisible;
    if (!getValue) {
      return null;
    }
    const bar = this._data.valueAt(index);
    if (bar === null) {
      return null;
    }
    const price = bar.value[
      3
      /* PlotRowValueIndex.Close */
    ];
    const radius3 = this._markerRadius();
    const borderColor = this._markerBorderColor();
    const borderWidth = this._markerBorderWidth();
    const backgroundColor = this._markerBackgroundColor(index);
    return { price, radius: radius3, borderColor, borderWidth, backgroundColor };
  }
  title() {
    return this._options.title;
  }
  visible() {
    return this._options.visible;
  }
  attachPrimitive(primitive) {
    this._primitives.push(new SeriesPrimitiveWrapper(primitive, this));
  }
  detachPrimitive(source) {
    this._primitives = this._primitives.filter((wrapper) => wrapper.primitive() !== source);
  }
  customSeriesPlotValuesBuilder() {
    if (this._seriesType !== "Custom") {
      return void 0;
    }
    return (data) => {
      return this._paneView.priceValueBuilder(data);
    };
  }
  customSeriesWhitespaceCheck() {
    if (this._seriesType !== "Custom") {
      return void 0;
    }
    return (data) => {
      return this._paneView.isWhitespace(data);
    };
  }
  fulfilledIndices() {
    return this._data.indices();
  }
  _isOverlay() {
    const priceScale = this.priceScale();
    return !isDefaultPriceScale(priceScale.id());
  }
  _autoscaleInfoImpl(startTimePoint, endTimePoint) {
    if (!isInteger(startTimePoint) || !isInteger(endTimePoint) || this._data.isEmpty()) {
      return null;
    }
    const plots = this._seriesType === "Line" || this._seriesType === "Area" || this._seriesType === "Baseline" || this._seriesType === "Histogram" ? [
      3
      /* PlotRowValueIndex.Close */
    ] : [
      2,
      1
      /* PlotRowValueIndex.High */
    ];
    const barsMinMax = this._data.minMaxOnRangeCached(startTimePoint, endTimePoint, plots);
    let range = barsMinMax !== null ? new PriceRangeImpl(barsMinMax.min, barsMinMax.max) : null;
    let margins = null;
    if (this.seriesType() === "Histogram") {
      const base = this._options.base;
      const rangeWithBase = new PriceRangeImpl(base, base);
      range = range !== null ? range.merge(rangeWithBase) : rangeWithBase;
    }
    this._primitives.forEach((primitive) => {
      const primitiveAutoscale = primitive.autoscaleInfo(startTimePoint, endTimePoint);
      if (primitiveAutoscale?.priceRange) {
        const primitiveRange = new PriceRangeImpl(primitiveAutoscale.priceRange.minValue, primitiveAutoscale.priceRange.maxValue);
        range = range !== null ? range.merge(primitiveRange) : primitiveRange;
      }
      if (primitiveAutoscale?.margins) {
        margins = primitiveAutoscale.margins;
      }
    });
    return new AutoscaleInfoImpl(range, margins);
  }
  _markerRadius() {
    switch (this._seriesType) {
      case "Line":
      case "Area":
      case "Baseline":
        return this._options.crosshairMarkerRadius;
    }
    return 0;
  }
  _markerBorderColor() {
    switch (this._seriesType) {
      case "Line":
      case "Area":
      case "Baseline": {
        const crosshairMarkerBorderColor = this._options.crosshairMarkerBorderColor;
        if (crosshairMarkerBorderColor.length !== 0) {
          return crosshairMarkerBorderColor;
        }
      }
    }
    return null;
  }
  _markerBorderWidth() {
    switch (this._seriesType) {
      case "Line":
      case "Area":
      case "Baseline":
        return this._options.crosshairMarkerBorderWidth;
    }
    return 0;
  }
  _markerBackgroundColor(index) {
    switch (this._seriesType) {
      case "Line":
      case "Area":
      case "Baseline": {
        const crosshairMarkerBackgroundColor = this._options.crosshairMarkerBackgroundColor;
        if (crosshairMarkerBackgroundColor.length !== 0) {
          return crosshairMarkerBackgroundColor;
        }
      }
    }
    return this.barColorer().barStyle(index).barColor;
  }
  _recreateFormatter() {
    switch (this._options.priceFormat.type) {
      case "custom": {
        const formatter = this._options.priceFormat.formatter;
        this._formatter = {
          format: formatter,
          formatTickmarks: this._options.priceFormat.tickmarksFormatter ?? ((prices) => prices.map(formatter))
        };
        break;
      }
      case "volume": {
        this._formatter = new VolumeFormatter(this._options.priceFormat.precision);
        break;
      }
      case "percent": {
        this._formatter = new PercentageFormatter(this._options.priceFormat.precision);
        break;
      }
      default: {
        const priceScale = Math.pow(10, this._options.priceFormat.precision);
        this._formatter = new PriceFormatter(priceScale, this._options.priceFormat.minMove * priceScale);
      }
    }
    if (this._priceScale !== null) {
      this._priceScale.updateFormatter();
    }
  }
  _extractPaneViews(extractor, zOrder) {
    const res = [];
    extractPrimitivePaneViews(this._primitives, extractor, zOrder, res);
    return res;
  }
  _calculateConflationFactor() {
    const { barSpacing, devicePixelRatio, effectiveSmoothing } = this._getConflationParams();
    return this._dataConflater.calculateConflationLevelWithSmoothing(barSpacing, devicePixelRatio, effectiveSmoothing);
  }
  _getConflationParams() {
    const timeScale = this.model().timeScale();
    const barSpacing = timeScale.barSpacing();
    const devicePixelRatio = window.devicePixelRatio || 1;
    const globalSmoothing = timeScale.options().conflationThresholdFactor;
    const seriesSmoothing = this._options.conflationThresholdFactor;
    const effectiveSmoothing = seriesSmoothing ?? globalSmoothing ?? 1;
    return { barSpacing, devicePixelRatio, effectiveSmoothing };
  }
  _buildConflatedListByFactor(factor) {
    const originalRows = this._data.rows();
    let conflatedRows;
    if (this._seriesType === "Custom" && this._customConflationReducer !== null) {
      const priceValueBuilder = this.customSeriesPlotValuesBuilder();
      if (!priceValueBuilder) {
        throw new Error(CONFLATION_ERROR_MESSAGES.missingPriceValueBuilder);
      }
      conflatedRows = this._dataConflater.conflateByFactor(originalRows, factor, this._customConflationReducer, true, (item) => priceValueBuilder(item));
    } else {
      conflatedRows = this._dataConflater.conflateByFactor(originalRows, factor);
    }
    const list = createSeriesPlotList();
    list.setData(conflatedRows);
    return list;
  }
  _regenerateConflatedDataByFactor(factor) {
    const list = this._buildConflatedListByFactor(factor);
    this._conflationByFactorCache.set(factor, list);
  }
  _precomputeConflationLevels(priority) {
    if (this._seriesType === "Custom" && (this._customConflationReducer === null || !this.customSeriesPlotValuesBuilder())) {
      return;
    }
    this._conflationByFactorCache.clear();
    const conflateFactors = this.model().timeScale().possibleConflationFactors();
    for (const lvl of conflateFactors) {
      const task = () => {
        this._precomputeConflationLevel(lvl);
      };
      const globalObj = typeof window === "object" && window || typeof self === "object" && self;
      if (globalObj?.scheduler?.postTask) {
        void globalObj.scheduler.postTask(() => {
          task();
        }, { priority });
      } else {
        void Promise.resolve().then(() => task());
      }
    }
  }
  _precomputeConflationLevel(factor) {
    if (this._conflationByFactorCache.has(factor)) {
      return;
    }
    const originalRows = this._data.rows();
    if (originalRows.length === 0) {
      return;
    }
    const list = this._buildConflatedListByFactor(factor);
    this._conflationByFactorCache.set(factor, list);
  }
};

// ../lib/prod/src/model/magnet.js
var magnetPlotRowKeys = [
  3
];
var magnetOHLCPlotRowKeys = [
  0,
  1,
  2,
  3
];
var Magnet = class {
  constructor(options) {
    this._options = options;
  }
  align(price, index, pane) {
    let res = price;
    if (this._options.mode === 0) {
      return res;
    }
    const defaultPriceScale = pane.defaultPriceScale();
    const firstValue = defaultPriceScale.firstValue();
    if (firstValue === null) {
      return res;
    }
    const y = defaultPriceScale.priceToCoordinate(price, firstValue);
    const serieses = pane.dataSources().filter(((ds) => ds instanceof Series));
    const candidates = serieses.reduce((acc, series) => {
      if (pane.isOverlay(series) || !series.visible()) {
        return acc;
      }
      const ps = series.priceScale();
      const bars = series.bars();
      if (ps.isEmpty() || !bars.contains(index)) {
        return acc;
      }
      const bar = bars.valueAt(index);
      if (bar === null) {
        return acc;
      }
      const firstPrice = ensure(series.firstValue());
      const plotRowKeys = this._options.mode === 3 ? magnetOHLCPlotRowKeys : magnetPlotRowKeys;
      return acc.concat(plotRowKeys.map((key) => ps.priceToCoordinate(bar.value[key], firstPrice.value)));
    }, []);
    if (candidates.length === 0) {
      return res;
    }
    candidates.sort((y1, y2) => Math.abs(y1 - y) - Math.abs(y2 - y));
    const nearest = candidates[0];
    res = defaultPriceScale.coordinateToPrice(nearest, firstValue);
    return res;
  }
};

// ../lib/prod/src/helpers/mathex.js
function clamp(value, minVal, maxVal) {
  return Math.min(Math.max(value, minVal), maxVal);
}
function isBaseDecimal(value) {
  if (value < 0) {
    return false;
  }
  if (value > 1e18) {
    return true;
  }
  for (let current = value; current > 1; current /= 10) {
    if (current % 10 !== 0) {
      return false;
    }
  }
  return true;
}
function greaterOrEqual(x1, x2, epsilon) {
  return x2 - x1 <= epsilon;
}
function equal(x1, x2, epsilon) {
  return Math.abs(x1 - x2) < epsilon;
}
function min(arr) {
  if (arr.length < 1) {
    throw Error("array is empty");
  }
  let minVal = arr[0];
  for (let i = 1; i < arr.length; ++i) {
    if (arr[i] < minVal) {
      minVal = arr[i];
    }
  }
  return minVal;
}
function ceiledEven(x) {
  const ceiled = Math.ceil(x);
  return ceiled % 2 !== 0 ? ceiled - 1 : ceiled;
}
function ceiledOdd(x) {
  const ceiled = Math.ceil(x);
  return ceiled % 2 === 0 ? ceiled - 1 : ceiled;
}

// ../lib/prod/src/renderers/grid-renderer.js
var GridRenderer = class extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    this._data = null;
  }
  setData(data) {
    this._data = data;
  }
  _drawImpl({ context: ctx, bitmapSize, horizontalPixelRatio, verticalPixelRatio }) {
    if (this._data === null) {
      return;
    }
    const lineWidth = Math.max(1, Math.floor(horizontalPixelRatio));
    ctx.lineWidth = lineWidth;
    strokeInPixel(ctx, () => {
      const data = ensureNotNull(this._data);
      if (data.vertLinesVisible) {
        ctx.strokeStyle = data.vertLinesColor;
        setLineStyle(ctx, data.vertLineStyle);
        ctx.beginPath();
        for (const timeMark of data.timeMarks) {
          const x = Math.round(timeMark.coord * horizontalPixelRatio);
          ctx.moveTo(x, -lineWidth);
          ctx.lineTo(x, bitmapSize.height + lineWidth);
        }
        ctx.stroke();
      }
      if (data.horzLinesVisible) {
        ctx.strokeStyle = data.horzLinesColor;
        setLineStyle(ctx, data.horzLineStyle);
        ctx.beginPath();
        for (const priceMark of data.priceMarks) {
          const y = Math.round(priceMark.coord * verticalPixelRatio);
          ctx.moveTo(-lineWidth, y);
          ctx.lineTo(bitmapSize.width + lineWidth, y);
        }
        ctx.stroke();
      }
    });
  }
};

// ../lib/prod/src/views/pane/grid-pane-view.js
var GridPaneView = class {
  constructor(pane) {
    this._renderer = new GridRenderer();
    this._invalidated = true;
    this._pane = pane;
  }
  update() {
    this._invalidated = true;
  }
  renderer() {
    if (this._invalidated) {
      const gridOptions = this._pane.model().options().grid;
      const data = {
        horzLinesVisible: gridOptions.horzLines.visible,
        vertLinesVisible: gridOptions.vertLines.visible,
        horzLinesColor: gridOptions.horzLines.color,
        vertLinesColor: gridOptions.vertLines.color,
        horzLineStyle: gridOptions.horzLines.style,
        vertLineStyle: gridOptions.vertLines.style,
        priceMarks: this._pane.defaultPriceScale().marks(),
        // need this conversiom because TimeMark is a part of external interface
        // and fields inside TimeMark are not minified
        timeMarks: (this._pane.model().timeScale().marks() || []).map((tm) => {
          return { coord: tm.coord };
        })
      };
      this._renderer.setData(data);
      this._invalidated = false;
    }
    return this._renderer;
  }
};

// ../lib/prod/src/model/grid.js
var Grid = class {
  constructor(pane) {
    this._paneView = new GridPaneView(pane);
  }
  paneView() {
    return this._paneView;
  }
};

// ../lib/prod/src/model/price-scale-conversions.js
var defLogFormula = {
  logicalOffset: 4,
  coordOffset: 1e-4
};
function fromPercent(value, baseValue) {
  if (baseValue < 0) {
    value = -value;
  }
  return value / 100 * baseValue + baseValue;
}
function toPercent(value, baseValue) {
  const result = 100 * (value - baseValue) / baseValue;
  return baseValue < 0 ? -result : result;
}
function toPercentRange(priceRange, baseValue) {
  const minPercent = toPercent(priceRange.minValue(), baseValue);
  const maxPercent = toPercent(priceRange.maxValue(), baseValue);
  return new PriceRangeImpl(minPercent, maxPercent);
}
function fromIndexedTo100(value, baseValue) {
  value -= 100;
  if (baseValue < 0) {
    value = -value;
  }
  return value / 100 * baseValue + baseValue;
}
function toIndexedTo100(value, baseValue) {
  const result = 100 * (value - baseValue) / baseValue + 100;
  return baseValue < 0 ? -result : result;
}
function toIndexedTo100Range(priceRange, baseValue) {
  const minPercent = toIndexedTo100(priceRange.minValue(), baseValue);
  const maxPercent = toIndexedTo100(priceRange.maxValue(), baseValue);
  return new PriceRangeImpl(minPercent, maxPercent);
}
function toLog(price, logFormula) {
  const m = Math.abs(price);
  if (m < 1e-15) {
    return 0;
  }
  const res = Math.log10(m + logFormula.coordOffset) + logFormula.logicalOffset;
  return price < 0 ? -res : res;
}
function fromLog(logical, logFormula) {
  const m = Math.abs(logical);
  if (m < 1e-15) {
    return 0;
  }
  const res = Math.pow(10, m - logFormula.logicalOffset) - logFormula.coordOffset;
  return logical < 0 ? -res : res;
}
function convertPriceRangeToLog(priceRange, logFormula) {
  if (priceRange === null) {
    return null;
  }
  const min2 = toLog(priceRange.minValue(), logFormula);
  const max = toLog(priceRange.maxValue(), logFormula);
  return new PriceRangeImpl(min2, max);
}
function canConvertPriceRangeFromLog(priceRange, logFormula) {
  if (priceRange === null) {
    return false;
  }
  const min2 = fromLog(priceRange.minValue(), logFormula);
  const max = fromLog(priceRange.maxValue(), logFormula);
  return isFinite(min2) && isFinite(max);
}
function convertPriceRangeFromLog(priceRange, logFormula) {
  if (priceRange === null) {
    return null;
  }
  const min2 = fromLog(priceRange.minValue(), logFormula);
  const max = fromLog(priceRange.maxValue(), logFormula);
  return new PriceRangeImpl(min2, max);
}
function logFormulaForPriceRange(range) {
  if (range === null) {
    return defLogFormula;
  }
  const diff = Math.abs(range.maxValue() - range.minValue());
  if (diff >= 1 || diff < 1e-15) {
    return defLogFormula;
  }
  const digits = Math.ceil(Math.abs(Math.log10(diff)));
  const logicalOffset = defLogFormula.logicalOffset + digits;
  const coordOffset = 1 / Math.pow(10, logicalOffset);
  return {
    logicalOffset,
    coordOffset
  };
}
function logFormulasAreSame(f1, f2) {
  return f1.logicalOffset === f2.logicalOffset && f1.coordOffset === f2.coordOffset;
}

// ../lib/prod/src/model/price-tick-span-calculator.js
var Constants3;
(function(Constants14) {
  Constants14[Constants14["TickSpanEpsilon"] = 1e-14] = "TickSpanEpsilon";
})(Constants3 || (Constants3 = {}));
var PriceTickSpanCalculator = class {
  constructor(base, integralDividers) {
    this._base = base;
    this._integralDividers = integralDividers;
    if (isBaseDecimal(this._base)) {
      this._fractionalDividers = [2, 2.5, 2];
    } else {
      this._fractionalDividers = [];
      for (let baseRest = this._base; baseRest !== 1; ) {
        if (baseRest % 2 === 0) {
          this._fractionalDividers.push(2);
          baseRest /= 2;
        } else if (baseRest % 5 === 0) {
          this._fractionalDividers.push(2, 2.5);
          baseRest /= 5;
        } else {
          throw new Error("unexpected base");
        }
        if (this._fractionalDividers.length > 100) {
          throw new Error("something wrong with base");
        }
      }
    }
  }
  tickSpan(high, low, maxTickSpan) {
    const minMovement = this._base === 0 ? 0 : 1 / this._base;
    let resultTickSpan = Math.pow(10, Math.max(0, Math.ceil(Math.log10(high - low))));
    let index = 0;
    let c = this._integralDividers[0];
    while (true) {
      const resultTickSpanLargerMinMovement = greaterOrEqual(
        resultTickSpan,
        minMovement,
        1e-14
        /* Constants.TickSpanEpsilon */
      ) && resultTickSpan > minMovement + 1e-14;
      const resultTickSpanLargerMaxTickSpan = greaterOrEqual(
        resultTickSpan,
        maxTickSpan * c,
        1e-14
        /* Constants.TickSpanEpsilon */
      );
      const resultTickSpanLarger1 = greaterOrEqual(
        resultTickSpan,
        1,
        1e-14
        /* Constants.TickSpanEpsilon */
      );
      const haveToContinue = resultTickSpanLargerMinMovement && resultTickSpanLargerMaxTickSpan && resultTickSpanLarger1;
      if (!haveToContinue) {
        break;
      }
      resultTickSpan /= c;
      c = this._integralDividers[++index % this._integralDividers.length];
    }
    if (resultTickSpan <= minMovement + 1e-14) {
      resultTickSpan = minMovement;
    }
    resultTickSpan = Math.max(1, resultTickSpan);
    if (this._fractionalDividers.length > 0 && equal(
      resultTickSpan,
      1,
      1e-14
      /* Constants.TickSpanEpsilon */
    )) {
      index = 0;
      c = this._fractionalDividers[0];
      while (greaterOrEqual(
        resultTickSpan,
        maxTickSpan * c,
        1e-14
        /* Constants.TickSpanEpsilon */
      ) && resultTickSpan > minMovement + 1e-14) {
        resultTickSpan /= c;
        c = this._fractionalDividers[++index % this._fractionalDividers.length];
      }
    }
    return resultTickSpan;
  }
};

// ../lib/prod/src/model/price-tick-mark-builder.js
var TICK_DENSITY = 2.5;
var PriceTickMarkBuilder = class {
  constructor(priceScale, base, coordinateToLogicalFunc, logicalToCoordinateFunc) {
    this._marks = [];
    this._priceScale = priceScale;
    this._base = base;
    this._coordinateToLogicalFunc = coordinateToLogicalFunc;
    this._logicalToCoordinateFunc = logicalToCoordinateFunc;
  }
  tickSpan(high, low) {
    if (high < low) {
      throw new Error("high < low");
    }
    const scaleHeight = this._priceScale.height();
    const markHeight = this._tickMarkHeight();
    const maxTickSpan = (high - low) * markHeight / scaleHeight;
    const spanCalculator1 = new PriceTickSpanCalculator(this._base, [2, 2.5, 2]);
    const spanCalculator2 = new PriceTickSpanCalculator(this._base, [2, 2, 2.5]);
    const spanCalculator3 = new PriceTickSpanCalculator(this._base, [2.5, 2, 2]);
    const spans = [];
    spans.push(spanCalculator1.tickSpan(high, low, maxTickSpan), spanCalculator2.tickSpan(high, low, maxTickSpan), spanCalculator3.tickSpan(high, low, maxTickSpan));
    return min(spans);
  }
  rebuildTickMarks() {
    const priceScale = this._priceScale;
    const firstValue = priceScale.firstValue();
    if (firstValue === null) {
      this._marks = [];
      return;
    }
    const scaleHeight = priceScale.height();
    const bottom = this._coordinateToLogicalFunc(scaleHeight - 1, firstValue);
    const top = this._coordinateToLogicalFunc(0, firstValue);
    const extraTopBottomMargin = this._priceScale.options().entireTextOnly ? this._fontHeight() / 2 : 0;
    const minCoord = extraTopBottomMargin;
    const maxCoord = scaleHeight - 1 - extraTopBottomMargin;
    const high = Math.max(bottom, top);
    const low = Math.min(bottom, top);
    if (high === low) {
      this._marks = [];
      return;
    }
    const span = this.tickSpan(high, low);
    this._updateMarks(firstValue, span, high, low, minCoord, maxCoord);
    if (priceScale.hasVisibleEdgeMarks() && this._shouldApplyEdgeMarks(span, low, high)) {
      const padding = this._priceScale.getEdgeMarksPadding();
      this._applyEdgeMarks(firstValue, span, minCoord, maxCoord, padding, padding * 2);
    }
    const logicals = this._marks.map((mark) => mark.logical);
    const labels = this._priceScale.formatLogicalTickmarks(logicals);
    for (let i = 0; i < this._marks.length; i++) {
      this._marks[i].label = labels[i];
    }
  }
  marks() {
    return this._marks;
  }
  _fontHeight() {
    return this._priceScale.fontSize();
  }
  _tickMarkHeight() {
    return Math.ceil(this._fontHeight() * TICK_DENSITY);
  }
  _updateMarks(firstValue, span, high, low, minCoord, maxCoord) {
    const marks = this._marks;
    const priceScale = this._priceScale;
    let mod = high % span;
    mod += mod < 0 ? span : 0;
    const sign = high >= low ? 1 : -1;
    let prevCoord = null;
    let targetIndex = 0;
    for (let logical = high - mod; logical > low; logical -= span) {
      const coord = this._logicalToCoordinateFunc(logical, firstValue, true);
      if (prevCoord !== null && Math.abs(coord - prevCoord) < this._tickMarkHeight()) {
        continue;
      }
      if (coord < minCoord || coord > maxCoord) {
        continue;
      }
      if (targetIndex < marks.length) {
        marks[targetIndex].coord = coord;
        marks[targetIndex].label = priceScale.formatLogical(logical);
        marks[targetIndex].logical = logical;
      } else {
        marks.push({
          coord,
          label: priceScale.formatLogical(logical),
          logical
        });
      }
      targetIndex++;
      prevCoord = coord;
      if (priceScale.isLog()) {
        span = this.tickSpan(logical * sign, low);
      }
    }
    marks.length = targetIndex;
  }
  _applyEdgeMarks(firstValue, span, minCoord, maxCoord, minPadding, maxPadding) {
    const marks = this._marks;
    const topMark = this._computeBoundaryPriceMark(firstValue, minCoord, minPadding, maxPadding);
    const bottomMark = this._computeBoundaryPriceMark(firstValue, maxCoord, -maxPadding, -minPadding);
    const spanPx = this._logicalToCoordinateFunc(0, firstValue, true) - this._logicalToCoordinateFunc(span, firstValue, true);
    if (marks.length > 0 && marks[0].coord - topMark.coord < spanPx / 2) {
      marks.shift();
    }
    if (marks.length > 0 && bottomMark.coord - marks[marks.length - 1].coord < spanPx / 2) {
      marks.pop();
    }
    marks.unshift(topMark);
    marks.push(bottomMark);
  }
  _computeBoundaryPriceMark(firstValue, coord, minPadding, maxPadding) {
    const avgPadding = (minPadding + maxPadding) / 2;
    const value1 = this._coordinateToLogicalFunc(coord + minPadding, firstValue);
    const value2 = this._coordinateToLogicalFunc(coord + maxPadding, firstValue);
    const minValue = Math.min(value1, value2);
    const maxValue = Math.max(value1, value2);
    const valueSpan = Math.max(0.1, this.tickSpan(maxValue, minValue));
    const value = this._coordinateToLogicalFunc(coord + avgPadding, firstValue);
    const roundedValue = value - value % valueSpan;
    const roundedCoord = this._logicalToCoordinateFunc(roundedValue, firstValue, true);
    return { label: this._priceScale.formatLogical(roundedValue), coord: roundedCoord, logical: roundedValue };
  }
  _shouldApplyEdgeMarks(span, low, high) {
    let range = ensure(this._priceScale.priceRange());
    if (this._priceScale.isLog()) {
      range = convertPriceRangeFromLog(range, this._priceScale.getLogFormula());
    }
    return range.minValue() - low < span && high - range.maxValue() < span;
  }
};

// ../lib/prod/src/model/sort-sources.js
function sortSources(sources) {
  return sources.slice().sort((s1, s2) => {
    return ensureNotNull(s1.zorder()) - ensureNotNull(s2.zorder());
  });
}

// ../lib/prod/src/model/price-scale.js
var PriceScaleMode;
(function(PriceScaleMode2) {
  PriceScaleMode2[PriceScaleMode2["Normal"] = 0] = "Normal";
  PriceScaleMode2[PriceScaleMode2["Logarithmic"] = 1] = "Logarithmic";
  PriceScaleMode2[PriceScaleMode2["Percentage"] = 2] = "Percentage";
  PriceScaleMode2[PriceScaleMode2["IndexedTo100"] = 3] = "IndexedTo100";
})(PriceScaleMode || (PriceScaleMode = {}));
var percentageFormatter = new PercentageFormatter();
var defaultPriceFormatter = new PriceFormatter(100, 1);
var PriceScale = class {
  constructor(id, options, layoutOptions, localizationOptions, colorParser) {
    this._height = 0;
    this._internalHeightCache = null;
    this._priceRange = null;
    this._priceRangeSnapshot = null;
    this._invalidatedForRange = { isValid: false, visibleBars: null };
    this._isCustomPriceRange = false;
    this._marginAbove = 0;
    this._marginBelow = 0;
    this._onMarksChanged = new Delegate();
    this._modeChanged = new Delegate();
    this._dataSources = [];
    this._formatterSource = null;
    this._cachedOrderedSources = null;
    this._marksCache = null;
    this._scaleStartPoint = null;
    this._scrollStartPoint = null;
    this._formatter = defaultPriceFormatter;
    this._logFormula = logFormulaForPriceRange(null);
    this._id = id;
    this._options = options;
    this._layoutOptions = layoutOptions;
    this._localizationOptions = localizationOptions;
    this._colorParser = colorParser;
    this._markBuilder = new PriceTickMarkBuilder(this, 100, this._coordinateToLogical.bind(this), this._logicalToCoordinate.bind(this));
  }
  id() {
    return this._id;
  }
  options() {
    return this._options;
  }
  applyOptions(options) {
    merge(this._options, options);
    this.updateFormatter();
    if (options.mode !== void 0) {
      this.setMode({ mode: options.mode });
    }
    if (options.scaleMargins !== void 0) {
      const top = ensureDefined(options.scaleMargins.top);
      const bottom = ensureDefined(options.scaleMargins.bottom);
      if (top < 0 || top > 1) {
        throw new Error(`Invalid top margin - expect value between 0 and 1, given=${top}`);
      }
      if (bottom < 0 || bottom > 1) {
        throw new Error(`Invalid bottom margin - expect value between 0 and 1, given=${bottom}`);
      }
      if (top + bottom > 1) {
        throw new Error(`Invalid margins - sum of margins must be less than 1, given=${top + bottom}`);
      }
      this._invalidateInternalHeightCache();
      this._marksCache = null;
    }
  }
  isAutoScale() {
    return this._options.autoScale;
  }
  isCustomPriceRange() {
    return this._isCustomPriceRange;
  }
  isLog() {
    return this._options.mode === 1;
  }
  isPercentage() {
    return this._options.mode === 2;
  }
  isIndexedTo100() {
    return this._options.mode === 3;
  }
  getLogFormula() {
    return this._logFormula;
  }
  mode() {
    return {
      autoScale: this._options.autoScale,
      isInverted: this._options.invertScale,
      mode: this._options.mode
    };
  }
  // eslint-disable-next-line complexity
  setMode(newMode) {
    const oldMode = this.mode();
    let priceRange = null;
    if (newMode.autoScale !== void 0) {
      this._options.autoScale = newMode.autoScale;
    }
    if (newMode.mode !== void 0) {
      this._options.mode = newMode.mode;
      if (newMode.mode === 2 || newMode.mode === 3) {
        this._options.autoScale = true;
      }
      this._invalidatedForRange.isValid = false;
    }
    if (oldMode.mode === 1 && newMode.mode !== oldMode.mode) {
      if (canConvertPriceRangeFromLog(this._priceRange, this._logFormula)) {
        priceRange = convertPriceRangeFromLog(this._priceRange, this._logFormula);
        if (priceRange !== null) {
          this.setPriceRange(priceRange);
        }
      } else {
        this._options.autoScale = true;
      }
    }
    if (newMode.mode === 1 && newMode.mode !== oldMode.mode) {
      priceRange = convertPriceRangeToLog(this._priceRange, this._logFormula);
      if (priceRange !== null) {
        this.setPriceRange(priceRange);
      }
    }
    const modeChanged = oldMode.mode !== this._options.mode;
    if (modeChanged && (oldMode.mode === 2 || this.isPercentage())) {
      this.updateFormatter();
    }
    if (modeChanged && (oldMode.mode === 3 || this.isIndexedTo100())) {
      this.updateFormatter();
    }
    if (newMode.isInverted !== void 0 && oldMode.isInverted !== newMode.isInverted) {
      this._options.invertScale = newMode.isInverted;
      this._onIsInvertedChanged();
    }
    this._modeChanged.fire(oldMode, this.mode());
  }
  modeChanged() {
    return this._modeChanged;
  }
  fontSize() {
    return this._layoutOptions.fontSize;
  }
  height() {
    return this._height;
  }
  setHeight(value) {
    if (this._height === value) {
      return;
    }
    this._height = value;
    this._invalidateInternalHeightCache();
    this._marksCache = null;
  }
  internalHeight() {
    if (this._internalHeightCache) {
      return this._internalHeightCache;
    }
    const res = this.height() - this._topMarginPx() - this._bottomMarginPx();
    this._internalHeightCache = res;
    return res;
  }
  priceRange() {
    this._makeSureItIsValid();
    return this._priceRange;
  }
  setPriceRange(newPriceRange, isForceSetValue) {
    const oldPriceRange = this._priceRange;
    if (!isForceSetValue && !(oldPriceRange === null && newPriceRange !== null) && (oldPriceRange === null || oldPriceRange.equals(newPriceRange))) {
      return;
    }
    this._marksCache = null;
    this._priceRange = newPriceRange;
  }
  setCustomPriceRange(newPriceRange) {
    this.setPriceRange(newPriceRange);
    this._toggleCustomPriceRange(newPriceRange !== null);
  }
  isEmpty() {
    this._makeSureItIsValid();
    return this._height === 0 || !this._priceRange || this._priceRange.isEmpty();
  }
  invertedCoordinate(coordinate) {
    return this.isInverted() ? coordinate : this.height() - 1 - coordinate;
  }
  priceToCoordinate(price, baseValue) {
    if (this.isPercentage()) {
      price = toPercent(price, baseValue);
    } else if (this.isIndexedTo100()) {
      price = toIndexedTo100(price, baseValue);
    }
    return this._logicalToCoordinate(price, baseValue);
  }
  pointsArrayToCoordinates(points, baseValue, visibleRange) {
    this._makeSureItIsValid();
    const bh = this._bottomMarginPx();
    const range = ensureNotNull(this.priceRange());
    const min2 = range.minValue();
    const max = range.maxValue();
    const ih = this.internalHeight() - 1;
    const isInverted = this.isInverted();
    const hmm = ih / (max - min2);
    const fromIndex = visibleRange === void 0 ? 0 : visibleRange.from;
    const toIndex = visibleRange === void 0 ? points.length : visibleRange.to;
    const transformFn = this._getCoordinateTransformer();
    for (let i = fromIndex; i < toIndex; i++) {
      const point = points[i];
      const price = point.price;
      if (isNaN(price)) {
        continue;
      }
      let logical = price;
      if (transformFn !== null) {
        logical = transformFn(point.price, baseValue);
      }
      const invCoordinate = bh + hmm * (logical - min2);
      const coordinate = isInverted ? invCoordinate : this._height - 1 - invCoordinate;
      point.y = coordinate;
    }
  }
  barPricesToCoordinates(pricesList, baseValue, visibleRange) {
    this._makeSureItIsValid();
    const bh = this._bottomMarginPx();
    const range = ensureNotNull(this.priceRange());
    const min2 = range.minValue();
    const max = range.maxValue();
    const ih = this.internalHeight() - 1;
    const isInverted = this.isInverted();
    const hmm = ih / (max - min2);
    const fromIndex = visibleRange === void 0 ? 0 : visibleRange.from;
    const toIndex = visibleRange === void 0 ? pricesList.length : visibleRange.to;
    const transformFn = this._getCoordinateTransformer();
    for (let i = fromIndex; i < toIndex; i++) {
      const bar = pricesList[i];
      let openLogical = bar.open;
      let highLogical = bar.high;
      let lowLogical = bar.low;
      let closeLogical = bar.close;
      if (transformFn !== null) {
        openLogical = transformFn(bar.open, baseValue);
        highLogical = transformFn(bar.high, baseValue);
        lowLogical = transformFn(bar.low, baseValue);
        closeLogical = transformFn(bar.close, baseValue);
      }
      let invCoordinate = bh + hmm * (openLogical - min2);
      let coordinate = isInverted ? invCoordinate : this._height - 1 - invCoordinate;
      bar.openY = coordinate;
      invCoordinate = bh + hmm * (highLogical - min2);
      coordinate = isInverted ? invCoordinate : this._height - 1 - invCoordinate;
      bar.highY = coordinate;
      invCoordinate = bh + hmm * (lowLogical - min2);
      coordinate = isInverted ? invCoordinate : this._height - 1 - invCoordinate;
      bar.lowY = coordinate;
      invCoordinate = bh + hmm * (closeLogical - min2);
      coordinate = isInverted ? invCoordinate : this._height - 1 - invCoordinate;
      bar.closeY = coordinate;
    }
  }
  coordinateToPrice(coordinate, baseValue) {
    const logical = this._coordinateToLogical(coordinate, baseValue);
    return this.logicalToPrice(logical, baseValue);
  }
  logicalToPrice(logical, baseValue) {
    let value = logical;
    if (this.isPercentage()) {
      value = fromPercent(value, baseValue);
    } else if (this.isIndexedTo100()) {
      value = fromIndexedTo100(value, baseValue);
    }
    return value;
  }
  dataSources() {
    return this._dataSources;
  }
  orderedSources() {
    if (!this._cachedOrderedSources) {
      this._cachedOrderedSources = sortSources(this._dataSources);
    }
    return this._cachedOrderedSources;
  }
  addDataSource(source) {
    if (this._dataSources.indexOf(source) !== -1) {
      return;
    }
    this._dataSources.push(source);
    this.updateFormatter();
    this.invalidateSourcesCache();
  }
  removeDataSource(source) {
    const index = this._dataSources.indexOf(source);
    if (index === -1) {
      throw new Error("source is not attached to scale");
    }
    this._dataSources.splice(index, 1);
    if (this._dataSources.length === 0) {
      this.setMode({
        autoScale: true
      });
      this.setPriceRange(null);
    }
    this.updateFormatter();
    this.invalidateSourcesCache();
  }
  firstValue() {
    let result = null;
    for (const source of this._dataSources) {
      const firstValue = source.firstValue();
      if (firstValue === null) {
        continue;
      }
      if (result === null || firstValue.timePoint < result.timePoint) {
        result = firstValue;
      }
    }
    return result === null ? null : result.value;
  }
  isInverted() {
    return this._options.invertScale;
  }
  marks() {
    const firstValueIsNull = this.firstValue() === null;
    if (this._marksCache !== null && (firstValueIsNull || this._marksCache.firstValueIsNull === firstValueIsNull)) {
      return this._marksCache.marks;
    }
    this._markBuilder.rebuildTickMarks();
    const marks = this._markBuilder.marks();
    this._marksCache = { marks, firstValueIsNull };
    this._onMarksChanged.fire();
    return marks;
  }
  onMarksChanged() {
    return this._onMarksChanged;
  }
  startScale(x) {
    if (this.isPercentage() || this.isIndexedTo100()) {
      return;
    }
    if (this._scaleStartPoint !== null || this._priceRangeSnapshot !== null) {
      return;
    }
    if (this.isEmpty()) {
      return;
    }
    this._scaleStartPoint = this._height - x;
    this._priceRangeSnapshot = ensureNotNull(this.priceRange()).clone();
  }
  scaleTo(x) {
    if (this.isPercentage() || this.isIndexedTo100()) {
      return;
    }
    if (this._scaleStartPoint === null) {
      return;
    }
    this.setMode({
      autoScale: false
    });
    x = this._height - x;
    if (x < 0) {
      x = 0;
    }
    let scaleCoeff = (this._scaleStartPoint + (this._height - 1) * 0.2) / (x + (this._height - 1) * 0.2);
    const newPriceRange = ensureNotNull(this._priceRangeSnapshot).clone();
    scaleCoeff = Math.max(scaleCoeff, 0.1);
    newPriceRange.scaleAroundCenter(scaleCoeff);
    this.setPriceRange(newPriceRange);
  }
  endScale() {
    if (this.isPercentage() || this.isIndexedTo100()) {
      return;
    }
    this._scaleStartPoint = null;
    this._priceRangeSnapshot = null;
  }
  startScroll(x) {
    if (this.isAutoScale()) {
      return;
    }
    if (this._scrollStartPoint !== null || this._priceRangeSnapshot !== null) {
      return;
    }
    if (this.isEmpty()) {
      return;
    }
    this._scrollStartPoint = x;
    this._priceRangeSnapshot = ensureNotNull(this.priceRange()).clone();
  }
  scrollTo(x) {
    if (this.isAutoScale()) {
      return;
    }
    if (this._scrollStartPoint === null) {
      return;
    }
    const priceUnitsPerPixel = ensureNotNull(this.priceRange()).length() / (this.internalHeight() - 1);
    let pixelDelta = x - this._scrollStartPoint;
    if (this.isInverted()) {
      pixelDelta *= -1;
    }
    const priceDelta = pixelDelta * priceUnitsPerPixel;
    const newPriceRange = ensureNotNull(this._priceRangeSnapshot).clone();
    newPriceRange.shift(priceDelta);
    this.setPriceRange(newPriceRange, true);
    this._marksCache = null;
  }
  endScroll() {
    if (this.isAutoScale()) {
      return;
    }
    if (this._scrollStartPoint === null) {
      return;
    }
    this._scrollStartPoint = null;
    this._priceRangeSnapshot = null;
  }
  formatter() {
    if (!this._formatter) {
      this.updateFormatter();
    }
    return this._formatter;
  }
  formatPrice(price, firstValue) {
    switch (this._options.mode) {
      case 2:
        return this._formatPercentage(toPercent(price, firstValue));
      case 3:
        return this.formatter().format(toIndexedTo100(price, firstValue));
      default:
        return this._formatPrice(price);
    }
  }
  formatLogical(logical) {
    switch (this._options.mode) {
      case 2:
        return this._formatPercentage(logical);
      case 3:
        return this.formatter().format(logical);
      default:
        return this._formatPrice(logical);
    }
  }
  formatLogicalTickmarks(logicals) {
    switch (this._options.mode) {
      case 2:
        return this._formatPercentageTickmarks(logicals);
      case 3:
        return this.formatter().formatTickmarks(logicals);
      default:
        return this._formatTickmarks(logicals);
    }
  }
  formatPriceAbsolute(price) {
    return this._formatPrice(price, ensureNotNull(this._formatterSource).formatter());
  }
  formatPricePercentage(price, baseValue) {
    price = toPercent(price, baseValue);
    return this._formatPercentage(price, percentageFormatter);
  }
  sourcesForAutoScale() {
    return this._dataSources;
  }
  recalculatePriceRange(visibleBars) {
    this._invalidatedForRange = {
      visibleBars,
      isValid: false
    };
  }
  updateAllViews() {
    this._dataSources.forEach((s) => s.updateAllViews());
  }
  hasVisibleEdgeMarks() {
    return this._options.ensureEdgeTickMarksVisible && this.isAutoScale();
  }
  getEdgeMarksPadding() {
    return this.fontSize() / 2;
  }
  updateFormatter() {
    this._marksCache = null;
    let zOrder = Infinity;
    this._formatterSource = null;
    for (const source of this._dataSources) {
      if (source.zorder() < zOrder) {
        zOrder = source.zorder();
        this._formatterSource = source;
      }
    }
    let base = 100;
    if (this._formatterSource !== null) {
      base = Math.round(this._formatterSource.base());
    }
    this._formatter = defaultPriceFormatter;
    if (this.isPercentage()) {
      this._formatter = percentageFormatter;
      base = 100;
    } else if (this.isIndexedTo100()) {
      this._formatter = new PriceFormatter(100, 1);
      base = 100;
    } else {
      if (this._formatterSource !== null) {
        this._formatter = this._formatterSource.formatter();
      }
    }
    this._markBuilder = new PriceTickMarkBuilder(this, base, this._coordinateToLogical.bind(this), this._logicalToCoordinate.bind(this));
    this._markBuilder.rebuildTickMarks();
  }
  invalidateSourcesCache() {
    this._cachedOrderedSources = null;
  }
  minMove() {
    return this._formatterSource === null || this.isPercentage() || this.isIndexedTo100() ? 1 : 1 / this._formatterSource.base();
  }
  colorParser() {
    return this._colorParser;
  }
  _toggleCustomPriceRange(v) {
    this._isCustomPriceRange = v;
  }
  _topMarginPx() {
    return this.isInverted() ? this._options.scaleMargins.bottom * this.height() + this._marginBelow : this._options.scaleMargins.top * this.height() + this._marginAbove;
  }
  _bottomMarginPx() {
    return this.isInverted() ? this._options.scaleMargins.top * this.height() + this._marginAbove : this._options.scaleMargins.bottom * this.height() + this._marginBelow;
  }
  _makeSureItIsValid() {
    if (!this._invalidatedForRange.isValid) {
      this._invalidatedForRange.isValid = true;
      this._recalculatePriceRangeImpl();
    }
  }
  _invalidateInternalHeightCache() {
    this._internalHeightCache = null;
  }
  _logicalToCoordinate(logical, baseValue) {
    this._makeSureItIsValid();
    if (this.isEmpty()) {
      return 0;
    }
    logical = this.isLog() && logical ? toLog(logical, this._logFormula) : logical;
    const range = ensureNotNull(this.priceRange());
    const invCoordinate = this._bottomMarginPx() + (this.internalHeight() - 1) * (logical - range.minValue()) / range.length();
    const coordinate = this.invertedCoordinate(invCoordinate);
    return coordinate;
  }
  _coordinateToLogical(coordinate, baseValue) {
    this._makeSureItIsValid();
    if (this.isEmpty()) {
      return 0;
    }
    const invCoordinate = this.invertedCoordinate(coordinate);
    const range = ensureNotNull(this.priceRange());
    const logical = range.minValue() + range.length() * ((invCoordinate - this._bottomMarginPx()) / (this.internalHeight() - 1));
    return this.isLog() ? fromLog(logical, this._logFormula) : logical;
  }
  _onIsInvertedChanged() {
    this._marksCache = null;
    this._markBuilder.rebuildTickMarks();
  }
  // eslint-disable-next-line complexity
  _recalculatePriceRangeImpl() {
    if (this.isCustomPriceRange() && !this.isAutoScale()) {
      return;
    }
    const visibleBars = this._invalidatedForRange.visibleBars;
    if (visibleBars === null) {
      return;
    }
    let priceRange = null;
    const sources = this.sourcesForAutoScale();
    let marginAbove = 0;
    let marginBelow = 0;
    for (const source of sources) {
      if (!source.visible()) {
        continue;
      }
      const firstValue = source.firstValue();
      if (firstValue === null) {
        continue;
      }
      const autoScaleInfo = source.autoscaleInfo(visibleBars.left(), visibleBars.right());
      let sourceRange = autoScaleInfo && autoScaleInfo.priceRange();
      if (sourceRange !== null) {
        switch (this._options.mode) {
          case 1:
            sourceRange = convertPriceRangeToLog(sourceRange, this._logFormula);
            break;
          case 2:
            sourceRange = toPercentRange(sourceRange, firstValue.value);
            break;
          case 3:
            sourceRange = toIndexedTo100Range(sourceRange, firstValue.value);
            break;
        }
        if (priceRange === null) {
          priceRange = sourceRange;
        } else {
          priceRange = priceRange.merge(ensureNotNull(sourceRange));
        }
        if (autoScaleInfo !== null) {
          const margins = autoScaleInfo.margins();
          if (margins !== null) {
            marginAbove = Math.max(marginAbove, margins.above);
            marginBelow = Math.max(marginBelow, margins.below);
          }
        }
      }
    }
    if (this.hasVisibleEdgeMarks()) {
      marginAbove = Math.max(marginAbove, this.getEdgeMarksPadding());
      marginBelow = Math.max(marginBelow, this.getEdgeMarksPadding());
    }
    if (marginAbove !== this._marginAbove || marginBelow !== this._marginBelow) {
      this._marginAbove = marginAbove;
      this._marginBelow = marginBelow;
      this._marksCache = null;
      this._invalidateInternalHeightCache();
    }
    if (priceRange !== null) {
      if (priceRange.minValue() === priceRange.maxValue()) {
        const extendValue = 5 * this.minMove();
        if (this.isLog()) {
          priceRange = convertPriceRangeFromLog(priceRange, this._logFormula);
        }
        priceRange = new PriceRangeImpl(priceRange.minValue() - extendValue, priceRange.maxValue() + extendValue);
        if (this.isLog()) {
          priceRange = convertPriceRangeToLog(priceRange, this._logFormula);
        }
      }
      if (this.isLog()) {
        const rawRange = convertPriceRangeFromLog(priceRange, this._logFormula);
        const newLogFormula = logFormulaForPriceRange(rawRange);
        if (!logFormulasAreSame(newLogFormula, this._logFormula)) {
          const rawSnapshot = this._priceRangeSnapshot !== null ? convertPriceRangeFromLog(this._priceRangeSnapshot, this._logFormula) : null;
          this._logFormula = newLogFormula;
          priceRange = convertPriceRangeToLog(rawRange, newLogFormula);
          if (rawSnapshot !== null) {
            this._priceRangeSnapshot = convertPriceRangeToLog(rawSnapshot, newLogFormula);
          }
        }
      }
      this.setPriceRange(priceRange);
    } else {
      if (this._priceRange === null) {
        this.setPriceRange(new PriceRangeImpl(-0.5, 0.5));
        this._logFormula = logFormulaForPriceRange(null);
      }
    }
  }
  _getCoordinateTransformer() {
    if (this.isPercentage()) {
      return toPercent;
    } else if (this.isIndexedTo100()) {
      return toIndexedTo100;
    } else if (this.isLog()) {
      return (price) => toLog(price, this._logFormula);
    }
    return null;
  }
  _formatValue(value, formatter, fallbackFormatter) {
    if (formatter === void 0) {
      if (fallbackFormatter === void 0) {
        fallbackFormatter = this.formatter();
      }
      return fallbackFormatter.format(value);
    }
    return formatter(value);
  }
  _formatValues(values, formatter, fallbackFormatter) {
    if (formatter === void 0) {
      if (fallbackFormatter === void 0) {
        fallbackFormatter = this.formatter();
      }
      return fallbackFormatter.formatTickmarks(values);
    }
    return formatter(values);
  }
  _formatPrice(price, fallbackFormatter) {
    return this._formatValue(price, this._localizationOptions.priceFormatter, fallbackFormatter);
  }
  _formatTickmarks(prices, fallbackFormatter) {
    const priceFormatter = this._localizationOptions.priceFormatter;
    return this._formatValues(prices, this._localizationOptions.tickmarksPriceFormatter ?? (priceFormatter ? (values) => values.map(priceFormatter) : void 0), fallbackFormatter);
  }
  _formatPercentage(percentage, fallbackFormatter) {
    return this._formatValue(percentage, this._localizationOptions.percentageFormatter, fallbackFormatter);
  }
  _formatPercentageTickmarks(percentages, fallbackFormatter) {
    const tickmarksPercentageFormatter = this._localizationOptions.percentageFormatter;
    return this._formatValues(percentages, this._localizationOptions.tickmarksPercentageFormatter ?? (tickmarksPercentageFormatter ? (values) => values.map(tickmarksPercentageFormatter) : void 0), fallbackFormatter);
  }
};

// ../lib/prod/src/model/pane.js
function isSeries(source) {
  return source instanceof Series;
}
var DEFAULT_STRETCH_FACTOR = 1;
var MIN_PANE_HEIGHT = 30;
var Pane = class {
  constructor(timeScale, model) {
    this._dataSources = [];
    this._overlaySourcesByScaleId = /* @__PURE__ */ new Map();
    this._height = 0;
    this._width = 0;
    this._stretchFactor = DEFAULT_STRETCH_FACTOR;
    this._cachedOrderedSources = null;
    this._preserveEmptyPane = false;
    this._destroyed = new Delegate();
    this._primitives = [];
    this._timeScale = timeScale;
    this._model = model;
    this._grid = new Grid(this);
    const options = model.options();
    this._leftPriceScale = this._createPriceScale("left", options.leftPriceScale);
    this._rightPriceScale = this._createPriceScale("right", options.rightPriceScale);
    this._leftPriceScale.modeChanged().subscribe(this._onPriceScaleModeChanged.bind(this, this._leftPriceScale), this);
    this._rightPriceScale.modeChanged().subscribe(this._onPriceScaleModeChanged.bind(this, this._rightPriceScale), this);
    this.applyScaleOptions(options);
  }
  applyScaleOptions(options) {
    if (options.leftPriceScale) {
      this._leftPriceScale.applyOptions(options.leftPriceScale);
    }
    if (options.rightPriceScale) {
      this._rightPriceScale.applyOptions(options.rightPriceScale);
    }
    if (options.localization) {
      this._leftPriceScale.updateFormatter();
      this._rightPriceScale.updateFormatter();
    }
    if (options.overlayPriceScales) {
      const sourceArrays = Array.from(this._overlaySourcesByScaleId.values());
      for (const arr of sourceArrays) {
        const priceScale = ensureNotNull(arr[0].priceScale());
        priceScale.applyOptions(options.overlayPriceScales);
        if (options.localization) {
          priceScale.updateFormatter();
        }
      }
    }
  }
  priceScaleById(id) {
    switch (id) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      case "left": {
        return this._leftPriceScale;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      case "right": {
        return this._rightPriceScale;
      }
    }
    if (this._overlaySourcesByScaleId.has(id)) {
      return ensureDefined(this._overlaySourcesByScaleId.get(id))[0].priceScale();
    }
    return null;
  }
  destroy() {
    this.model().priceScalesOptionsChanged().unsubscribeAll(this);
    this._leftPriceScale.modeChanged().unsubscribeAll(this);
    this._rightPriceScale.modeChanged().unsubscribeAll(this);
    this._dataSources.forEach((source) => {
      if (source.destroy) {
        source.destroy();
      }
    });
    this._primitives = this._primitives.filter((primitive) => {
      const p = primitive.primitive();
      if (p.detached) {
        p.detached();
      }
      return false;
    });
    this._destroyed.fire();
  }
  stretchFactor() {
    return this._stretchFactor;
  }
  setStretchFactor(factor) {
    this._stretchFactor = factor;
  }
  model() {
    return this._model;
  }
  width() {
    return this._width;
  }
  height() {
    return this._height;
  }
  setWidth(width) {
    this._width = width;
    this.updateAllSources();
  }
  setHeight(height) {
    this._height = height;
    this._leftPriceScale.setHeight(height);
    this._rightPriceScale.setHeight(height);
    this._dataSources.forEach((ds) => {
      if (this.isOverlay(ds)) {
        const priceScale = ds.priceScale();
        if (priceScale !== null) {
          priceScale.setHeight(height);
        }
      }
    });
    this.updateAllSources();
  }
  setPreserveEmptyPane(preserve) {
    this._preserveEmptyPane = preserve;
  }
  preserveEmptyPane() {
    return this._preserveEmptyPane;
  }
  series() {
    return this._dataSources.filter(isSeries);
  }
  dataSources() {
    return this._dataSources;
  }
  isOverlay(source) {
    const priceScale = source.priceScale();
    if (priceScale === null) {
      return true;
    }
    return this._leftPriceScale !== priceScale && this._rightPriceScale !== priceScale;
  }
  addDataSource(source, targetScaleId, keepSourcesOrder) {
    this._insertDataSource(source, targetScaleId, keepSourcesOrder ? source.zorder() : this._dataSources.length);
  }
  removeDataSource(source, keepSourceOrder) {
    const index = this._dataSources.indexOf(source);
    assert(index !== -1, "removeDataSource: invalid data source");
    this._dataSources.splice(index, 1);
    if (!keepSourceOrder) {
      this._dataSources.forEach((ds, i) => ds.setZorder(i));
    }
    const priceScaleId = ensureNotNull(source.priceScale()).id();
    if (this._overlaySourcesByScaleId.has(priceScaleId)) {
      const overlaySources = ensureDefined(this._overlaySourcesByScaleId.get(priceScaleId));
      const overlayIndex = overlaySources.indexOf(source);
      if (overlayIndex !== -1) {
        overlaySources.splice(overlayIndex, 1);
        if (overlaySources.length === 0) {
          this._overlaySourcesByScaleId.delete(priceScaleId);
        }
      }
    }
    const priceScale = source.priceScale();
    if (priceScale && priceScale.dataSources().indexOf(source) >= 0) {
      priceScale.removeDataSource(source);
      this.recalculatePriceScale(priceScale);
    }
    this._cachedOrderedSources = null;
  }
  priceScalePosition(priceScale) {
    if (priceScale === this._leftPriceScale) {
      return "left";
    }
    if (priceScale === this._rightPriceScale) {
      return "right";
    }
    return "overlay";
  }
  leftPriceScale() {
    return this._leftPriceScale;
  }
  rightPriceScale() {
    return this._rightPriceScale;
  }
  startScalePrice(priceScale, x) {
    priceScale.startScale(x);
  }
  scalePriceTo(priceScale, x) {
    priceScale.scaleTo(x);
    this.updateAllSources();
  }
  endScalePrice(priceScale) {
    priceScale.endScale();
  }
  startScrollPrice(priceScale, x) {
    priceScale.startScroll(x);
  }
  scrollPriceTo(priceScale, x) {
    priceScale.scrollTo(x);
    this.updateAllSources();
  }
  endScrollPrice(priceScale) {
    priceScale.endScroll();
  }
  updateAllSources() {
    this._dataSources.forEach((source) => {
      source.updateAllViews();
    });
  }
  defaultPriceScale() {
    let priceScale = null;
    if (this._model.options().rightPriceScale.visible && this._rightPriceScale.dataSources().length !== 0) {
      priceScale = this._rightPriceScale;
    } else if (this._model.options().leftPriceScale.visible && this._leftPriceScale.dataSources().length !== 0) {
      priceScale = this._leftPriceScale;
    } else if (this._dataSources.length !== 0) {
      priceScale = this._dataSources[0].priceScale();
    }
    if (priceScale === null) {
      priceScale = this._rightPriceScale;
    }
    return priceScale;
  }
  defaultVisiblePriceScale() {
    let priceScale = null;
    if (this._model.options().rightPriceScale.visible) {
      priceScale = this._rightPriceScale;
    } else if (this._model.options().leftPriceScale.visible) {
      priceScale = this._leftPriceScale;
    }
    return priceScale;
  }
  recalculatePriceScale(priceScale) {
    if (priceScale === null || !priceScale.isAutoScale()) {
      return;
    }
    this._recalculatePriceScaleImpl(priceScale);
  }
  resetPriceScale(priceScale) {
    const visibleBars = this._timeScale.visibleStrictRange();
    priceScale.setMode({ autoScale: true });
    if (visibleBars !== null) {
      priceScale.recalculatePriceRange(visibleBars);
    }
    this.updateAllSources();
  }
  momentaryAutoScale() {
    this._recalculatePriceScaleImpl(this._leftPriceScale);
    this._recalculatePriceScaleImpl(this._rightPriceScale);
  }
  recalculate() {
    this.recalculatePriceScale(this._leftPriceScale);
    this.recalculatePriceScale(this._rightPriceScale);
    this._dataSources.forEach((ds) => {
      if (this.isOverlay(ds)) {
        this.recalculatePriceScale(ds.priceScale());
      }
    });
    this.updateAllSources();
    this._model.lightUpdate();
  }
  orderedSources() {
    if (this._cachedOrderedSources === null) {
      this._cachedOrderedSources = sortSources(this._dataSources);
    }
    return this._cachedOrderedSources;
  }
  setSeriesOrder(series, order) {
    order = clamp(order, 0, this._dataSources.length - 1);
    const index = this._dataSources.indexOf(series);
    assert(index !== -1, "setSeriesOrder: invalid data source");
    this._dataSources.splice(index, 1);
    this._dataSources.splice(order, 0, series);
    this._dataSources.forEach((ps, i) => ps.setZorder(i));
    this._cachedOrderedSources = null;
    for (const ps of [this._leftPriceScale, this._rightPriceScale]) {
      ps.invalidateSourcesCache();
      ps.updateFormatter();
    }
    this._model.lightUpdate();
  }
  orderedSeries() {
    return this.orderedSources().filter(isSeries);
  }
  onDestroyed() {
    return this._destroyed;
  }
  grid() {
    return this._grid;
  }
  attachPrimitive(primitive) {
    this._primitives.push(new PanePrimitiveWrapper(primitive));
  }
  detachPrimitive(source) {
    this._primitives = this._primitives.filter((wrapper) => wrapper.primitive() !== source);
    if (source.detached) {
      source.detached();
    }
    this._model.lightUpdate();
  }
  primitives() {
    return this._primitives;
  }
  primitiveHitTest(x, y) {
    return this._primitives.map((primitive) => primitive.hitTest(x, y)).filter((result) => result !== null);
  }
  _recalculatePriceScaleImpl(priceScale) {
    const sourceForAutoScale = priceScale.sourcesForAutoScale();
    if (sourceForAutoScale && sourceForAutoScale.length > 0 && !this._timeScale.isEmpty()) {
      const visibleBars = this._timeScale.visibleStrictRange();
      if (visibleBars !== null) {
        priceScale.recalculatePriceRange(visibleBars);
      }
    }
    priceScale.updateAllViews();
  }
  _insertDataSource(source, priceScaleId, order) {
    let priceScale = this.priceScaleById(priceScaleId);
    if (priceScale === null) {
      priceScale = this._createPriceScale(priceScaleId, this._model.options().overlayPriceScales);
    }
    this._dataSources.splice(order, 0, source);
    if (!isDefaultPriceScale(priceScaleId)) {
      const overlaySources = this._overlaySourcesByScaleId.get(priceScaleId) || [];
      overlaySources.push(source);
      this._overlaySourcesByScaleId.set(priceScaleId, overlaySources);
    }
    source.setZorder(order);
    priceScale.addDataSource(source);
    source.setPriceScale(priceScale);
    this.recalculatePriceScale(priceScale);
    this._cachedOrderedSources = null;
  }
  _onPriceScaleModeChanged(priceScale, oldMode, newMode) {
    if (oldMode.mode === newMode.mode) {
      return;
    }
    this._recalculatePriceScaleImpl(priceScale);
  }
  _createPriceScale(id, options) {
    const actualOptions = { visible: true, autoScale: true, ...clone(options) };
    const priceScale = new PriceScale(id, actualOptions, this._model.options()["layout"], this._model.options().localization, this._model.colorParser());
    priceScale.setHeight(this.height());
    return priceScale;
  }
};

// ../lib/prod/src/model/pane-hit-test.js
function comparePrimitiveZOrder(item, reference) {
  return !reference || item === "top" && reference !== "top" || item === "normal" && reference === "bottom";
}
function findBestPrimitiveHitTest(sources, x, y) {
  let bestPrimitiveHit;
  let bestHitSource;
  for (const source of sources) {
    const primitiveHitResults = source.primitiveHitTest?.(x, y) ?? [];
    for (const hitResult of primitiveHitResults) {
      if (comparePrimitiveZOrder(hitResult.zOrder, bestPrimitiveHit?.zOrder)) {
        bestPrimitiveHit = hitResult;
        bestHitSource = source;
      }
    }
  }
  if (!bestPrimitiveHit || !bestHitSource) {
    return null;
  }
  return {
    hit: bestPrimitiveHit,
    source: bestHitSource
  };
}
function convertPrimitiveHitResult(primitiveHit) {
  return {
    source: primitiveHit.source,
    object: {
      externalId: primitiveHit.hit.externalId
    },
    cursorStyle: primitiveHit.hit.cursorStyle
  };
}
function hitTestPaneView(paneViews, x, y, pane) {
  for (const paneView of paneViews) {
    const renderer = paneView.renderer(pane);
    if (renderer !== null && renderer.hitTest) {
      const result = renderer.hitTest(x, y);
      if (result !== null) {
        return {
          view: paneView,
          object: result
        };
      }
    }
  }
  return null;
}
function isDataSource(source) {
  return source.paneViews !== void 0;
}
function hitTestPane(pane, x, y) {
  const sources = [pane, ...pane.orderedSources()];
  const bestPrimitiveHit = findBestPrimitiveHitTest(sources, x, y);
  if (bestPrimitiveHit?.hit.zOrder === "top") {
    return convertPrimitiveHitResult(bestPrimitiveHit);
  }
  for (const source of sources) {
    if (bestPrimitiveHit && bestPrimitiveHit.source === source && bestPrimitiveHit.hit.zOrder !== "bottom" && !bestPrimitiveHit.hit.isBackground) {
      return convertPrimitiveHitResult(bestPrimitiveHit);
    }
    if (isDataSource(source)) {
      const sourceResult = hitTestPaneView(source.paneViews(pane), x, y, pane);
      if (sourceResult !== null) {
        return {
          source,
          view: sourceResult.view,
          object: sourceResult.object
        };
      }
    }
    if (bestPrimitiveHit && bestPrimitiveHit.source === source && bestPrimitiveHit.hit.zOrder !== "bottom" && bestPrimitiveHit.hit.isBackground) {
      return convertPrimitiveHitResult(bestPrimitiveHit);
    }
  }
  if (bestPrimitiveHit?.hit) {
    return convertPrimitiveHitResult(bestPrimitiveHit);
  }
  return null;
}

// ../lib/prod/src/model/formatted-labels-cache.js
var FormattedLabelsCache = class {
  constructor(format, horzScaleBehavior, size3 = 50) {
    this._actualSize = 0;
    this._usageTick = 1;
    this._oldestTick = 1;
    this._cache = /* @__PURE__ */ new Map();
    this._tick2Labels = /* @__PURE__ */ new Map();
    this._format = format;
    this._horzScaleBehavior = horzScaleBehavior;
    this._maxSize = size3;
  }
  format(tickMark) {
    const time = tickMark.time;
    const cacheKey = this._horzScaleBehavior.cacheKey(time);
    const tick = this._cache.get(cacheKey);
    if (tick !== void 0) {
      return tick.string;
    }
    if (this._actualSize === this._maxSize) {
      const oldestValue = this._tick2Labels.get(this._oldestTick);
      this._tick2Labels.delete(this._oldestTick);
      this._cache.delete(ensureDefined(oldestValue));
      this._oldestTick++;
      this._actualSize--;
    }
    const str = this._format(tickMark);
    this._cache.set(cacheKey, { string: str, tick: this._usageTick });
    this._tick2Labels.set(this._usageTick, cacheKey);
    this._actualSize++;
    this._usageTick++;
    return str;
  }
};

// ../lib/prod/src/model/range-impl.js
var RangeImpl = class {
  constructor(left, right) {
    assert(left <= right, "right should be >= left");
    this._left = left;
    this._right = right;
  }
  left() {
    return this._left;
  }
  right() {
    return this._right;
  }
  count() {
    return this._right - this._left + 1;
  }
  contains(index) {
    return this._left <= index && index <= this._right;
  }
  equals(other) {
    return this._left === other.left() && this._right === other.right();
  }
};
function areRangesEqual(first, second) {
  if (first === null || second === null) {
    return first === second;
  }
  return first.equals(second);
}

// ../lib/prod/src/model/tick-marks.js
var TickMarks = class {
  constructor() {
    this._marksByWeight = /* @__PURE__ */ new Map();
    this._cache = null;
    this._uniformDistribution = false;
  }
  setUniformDistribution(val) {
    this._uniformDistribution = val;
    this._cache = null;
  }
  setTimeScalePoints(newPoints, firstChangedPointIndex) {
    this._removeMarksSinceIndex(firstChangedPointIndex);
    this._cache = null;
    for (let index = firstChangedPointIndex; index < newPoints.length; ++index) {
      const point = newPoints[index];
      let marksForWeight = this._marksByWeight.get(point.timeWeight);
      if (marksForWeight === void 0) {
        marksForWeight = [];
        this._marksByWeight.set(point.timeWeight, marksForWeight);
      }
      marksForWeight.push({
        index,
        time: point.time,
        weight: point.timeWeight,
        originalTime: point.originalTime
      });
    }
  }
  build(spacing, maxWidth, checkIndicesForData, indicesWithDataMap, indicesWithDataId) {
    const maxIndexesPerMark = Math.ceil(maxWidth / spacing);
    if (this._cache === null || this._cache.maxIndexesPerMark !== maxIndexesPerMark || indicesWithDataId !== this._cache.indicesWithDataId || checkIndicesForData !== this._cache.checkIndicesForData) {
      this._cache = {
        indicesWithDataId,
        checkIndicesForData,
        marks: this._buildMarksImpl(maxIndexesPerMark, checkIndicesForData, indicesWithDataMap),
        maxIndexesPerMark
      };
    }
    return this._cache.marks;
  }
  _removeMarksSinceIndex(sinceIndex) {
    if (sinceIndex === 0) {
      this._marksByWeight.clear();
      return;
    }
    const weightsToClear = [];
    this._marksByWeight.forEach((marks, timeWeight) => {
      if (sinceIndex <= marks[0].index) {
        weightsToClear.push(timeWeight);
      } else {
        marks.splice(lowerBound(marks, sinceIndex, (tm) => tm.index < sinceIndex), Infinity);
      }
    });
    for (const weight of weightsToClear) {
      this._marksByWeight.delete(weight);
    }
  }
  _buildMarksImpl(maxIndexesPerMark, checkIndicesForData, indicesWithDataMap) {
    let marks = [];
    const canBeIncluded = (mark) => !checkIndicesForData || indicesWithDataMap.has(mark.index);
    for (const weight of Array.from(this._marksByWeight.keys()).sort((a, b) => b - a)) {
      if (!this._marksByWeight.get(weight)) {
        continue;
      }
      const prevMarks = marks;
      marks = [];
      const prevMarksLength = prevMarks.length;
      let prevMarksPointer = 0;
      const currentWeight = ensureDefined(this._marksByWeight.get(weight));
      const currentWeightLength = currentWeight.length;
      let rightIndex = Infinity;
      let leftIndex = -Infinity;
      for (let i = 0; i < currentWeightLength; i++) {
        const mark = currentWeight[i];
        const currentIndex = mark.index;
        while (prevMarksPointer < prevMarksLength) {
          const lastMark = prevMarks[prevMarksPointer];
          const lastIndex = lastMark.index;
          if (lastIndex < currentIndex && canBeIncluded(lastMark)) {
            prevMarksPointer++;
            marks.push(lastMark);
            leftIndex = lastIndex;
            rightIndex = Infinity;
          } else {
            rightIndex = lastIndex;
            break;
          }
        }
        if (rightIndex - currentIndex >= maxIndexesPerMark && currentIndex - leftIndex >= maxIndexesPerMark && canBeIncluded(mark)) {
          marks.push(mark);
          leftIndex = currentIndex;
        } else {
          if (this._uniformDistribution) {
            return prevMarks;
          }
        }
      }
      for (; prevMarksPointer < prevMarksLength; prevMarksPointer++) {
        if (canBeIncluded(prevMarks[prevMarksPointer])) {
          marks.push(prevMarks[prevMarksPointer]);
        }
      }
    }
    return marks;
  }
};

// ../lib/prod/src/model/time-scale-visible-range.js
var TimeScaleVisibleRange = class _TimeScaleVisibleRange {
  constructor(logicalRange) {
    this._logicalRange = logicalRange;
  }
  strictRange() {
    if (this._logicalRange === null) {
      return null;
    }
    return new RangeImpl(Math.floor(this._logicalRange.left()), Math.ceil(this._logicalRange.right()));
  }
  logicalRange() {
    return this._logicalRange;
  }
  static invalid() {
    return new _TimeScaleVisibleRange(null);
  }
};

// ../lib/prod/src/model/time-scale.js
var defaultTickMarkMaxCharacterLength = 8;
var Constants4;
(function(Constants14) {
  Constants14[Constants14["DefaultAnimationDuration"] = 400] = "DefaultAnimationDuration";
  Constants14[Constants14["MinVisibleBarsCount"] = 2] = "MinVisibleBarsCount";
})(Constants4 || (Constants4 = {}));
function markWithGreaterWeight(a, b) {
  return a.weight > b.weight ? a : b;
}
var TimeScale = class {
  constructor(model, options, localizationOptions, horzScaleBehavior) {
    this._width = 0;
    this._baseIndexOrNull = null;
    this._points = [];
    this._scrollStartPoint = null;
    this._scaleStartPoint = null;
    this._tickMarks = new TickMarks();
    this._formattedByWeight = /* @__PURE__ */ new Map();
    this._visibleRange = TimeScaleVisibleRange.invalid();
    this._visibleRangeInvalidated = true;
    this._visibleBarsChanged = new Delegate();
    this._logicalRangeChanged = new Delegate();
    this._optionsApplied = new Delegate();
    this._commonTransitionStartState = null;
    this._timeMarksCache = null;
    this._indicesWithData = /* @__PURE__ */ new Map();
    this._indicesWithDataUpdateId = -1;
    this._labels = [];
    this._conflationFactor = 1;
    this._options = options;
    this._localizationOptions = localizationOptions;
    this._rightOffset = options.rightOffset;
    this._barSpacing = options.barSpacing;
    this._model = model;
    this._checkRightOffsetPixels(options);
    this._horzScaleBehavior = horzScaleBehavior;
    this._updateDateTimeFormatter();
    this._tickMarks.setUniformDistribution(options.uniformDistribution);
    this._updateConflationFactor();
    this.recalculateIndicesWithData();
  }
  options() {
    return this._options;
  }
  applyLocalizationOptions(localizationOptions) {
    merge(this._localizationOptions, localizationOptions);
    this._invalidateTickMarks();
    this._updateDateTimeFormatter();
  }
  applyOptions(options, localizationOptions) {
    merge(this._options, options);
    if (this._options.fixLeftEdge) {
      this._doFixLeftEdge();
    }
    if (this._options.fixRightEdge) {
      this._doFixRightEdge();
    }
    if (options.barSpacing !== void 0) {
      this._model.setBarSpacing(options.barSpacing);
    }
    if (options.rightOffset !== void 0) {
      this._model.setRightOffset(options.rightOffset);
    }
    this._checkRightOffsetPixels(options);
    if (options.minBarSpacing !== void 0 || options.maxBarSpacing !== void 0) {
      this._model.setBarSpacing(options.barSpacing ?? this._barSpacing);
    }
    if (options.ignoreWhitespaceIndices !== void 0 && options.ignoreWhitespaceIndices !== this._options.ignoreWhitespaceIndices) {
      this.recalculateIndicesWithData();
    }
    this._invalidateTickMarks();
    this._updateDateTimeFormatter();
    if (options.enableConflation !== void 0 || options.conflationThresholdFactor !== void 0) {
      this._updateConflationFactor();
    }
    this._optionsApplied.fire();
  }
  indexToTime(index) {
    return this._points[index]?.time ?? null;
  }
  indexToTimeScalePoint(index) {
    return this._points[index] ?? null;
  }
  timeToIndex(time, findNearest) {
    if (this._points.length < 1) {
      return null;
    }
    if (this._horzScaleBehavior.key(time) > this._horzScaleBehavior.key(this._points[this._points.length - 1].time)) {
      return findNearest ? this._points.length - 1 : null;
    }
    const index = lowerBound(this._points, this._horzScaleBehavior.key(time), (a, b) => this._horzScaleBehavior.key(a.time) < b);
    if (this._horzScaleBehavior.key(time) < this._horzScaleBehavior.key(this._points[index].time)) {
      return findNearest ? index : null;
    }
    return index;
  }
  isEmpty() {
    return this._width === 0 || this._points.length === 0 || this._baseIndexOrNull === null;
  }
  hasPoints() {
    return this._points.length > 0;
  }
  // strict range: integer indices of the bars in the visible range rounded in more wide direction
  visibleStrictRange() {
    this._updateVisibleRange();
    return this._visibleRange.strictRange();
  }
  visibleLogicalRange() {
    this._updateVisibleRange();
    return this._visibleRange.logicalRange();
  }
  visibleTimeRange() {
    const visibleBars = this.visibleStrictRange();
    if (visibleBars === null) {
      return null;
    }
    const range = {
      from: visibleBars.left(),
      to: visibleBars.right()
    };
    return this.timeRangeForLogicalRange(range);
  }
  timeRangeForLogicalRange(range) {
    const from = Math.round(range.from);
    const to = Math.round(range.to);
    const firstIndex = ensureNotNull(this._firstIndex());
    const lastIndex = ensureNotNull(this._lastIndex());
    return {
      from: ensureNotNull(this.indexToTimeScalePoint(Math.max(firstIndex, from))),
      to: ensureNotNull(this.indexToTimeScalePoint(Math.min(lastIndex, to)))
    };
  }
  logicalRangeForTimeRange(range) {
    return {
      from: ensureNotNull(this.timeToIndex(range.from, true)),
      to: ensureNotNull(this.timeToIndex(range.to, true))
    };
  }
  width() {
    return this._width;
  }
  setWidth(newWidth) {
    if (!isFinite(newWidth) || newWidth <= 0) {
      return;
    }
    if (this._width === newWidth) {
      return;
    }
    const previousVisibleRange = this.visibleLogicalRange();
    const oldWidth = this._width;
    this._width = newWidth;
    this._visibleRangeInvalidated = true;
    if (this._options.lockVisibleTimeRangeOnResize && oldWidth !== 0) {
      const newBarSpacing = this._barSpacing * newWidth / oldWidth;
      this._barSpacing = newBarSpacing;
    }
    if (this._options.fixLeftEdge) {
      if (previousVisibleRange !== null && previousVisibleRange.left() <= 0) {
        const delta = oldWidth - newWidth;
        this._rightOffset -= Math.round(delta / this._barSpacing) + 1;
        this._visibleRangeInvalidated = true;
      }
    }
    this._correctBarSpacing();
    this._correctOffset();
  }
  indexToCoordinate(index) {
    if (this.isEmpty() || !isInteger(index)) {
      return 0;
    }
    const baseIndex = this.baseIndex();
    const deltaFromRight = baseIndex + this._rightOffset - index;
    const coordinate = this._width - (deltaFromRight + 0.5) * this._barSpacing - 1;
    return coordinate;
  }
  indexesToCoordinates(points, visibleRange) {
    const baseIndex = this.baseIndex();
    const indexFrom = visibleRange === void 0 ? 0 : visibleRange.from;
    const indexTo = visibleRange === void 0 ? points.length : visibleRange.to;
    for (let i = indexFrom; i < indexTo; i++) {
      const index = points[i].time;
      const deltaFromRight = baseIndex + this._rightOffset - index;
      const coordinate = this._width - (deltaFromRight + 0.5) * this._barSpacing - 1;
      points[i].x = coordinate;
    }
  }
  coordinateToIndex(x, considerIgnoreWhitespace) {
    const index = Math.ceil(this._coordinateToFloatIndex(x));
    if (!considerIgnoreWhitespace || !this._options.ignoreWhitespaceIndices || this._shouldConsiderIndex(index)) {
      return index;
    }
    return this._findNearestIndexWithData(index);
  }
  setRightOffset(offset) {
    this._visibleRangeInvalidated = true;
    this._rightOffset = offset;
    this._correctOffset();
    this._model.recalculateAllPanes();
    this._model.lightUpdate();
  }
  barSpacing() {
    return this._barSpacing;
  }
  setBarSpacing(newBarSpacing) {
    const oldBarSpacing = this._barSpacing;
    this._setBarSpacing(newBarSpacing);
    if (this._options.rightOffsetPixels !== void 0 && oldBarSpacing !== 0) {
      const newRightOffset = this._rightOffset * oldBarSpacing / this._barSpacing;
      this._rightOffset = newRightOffset;
    }
    this._correctOffset();
    this._model.recalculateAllPanes();
    this._model.lightUpdate();
  }
  rightOffset() {
    return this._rightOffset;
  }
  // eslint-disable-next-line complexity
  marks() {
    if (this.isEmpty()) {
      return null;
    }
    if (this._timeMarksCache !== null) {
      return this._timeMarksCache;
    }
    const spacing = this._barSpacing;
    const fontSize = this._model.options()["layout"].fontSize;
    const pixelsPer8Characters = (fontSize + 4) * 5;
    const pixelsPerCharacter = pixelsPer8Characters / defaultTickMarkMaxCharacterLength;
    const maxLabelWidth = pixelsPerCharacter * (this._options.tickMarkMaxCharacterLength || defaultTickMarkMaxCharacterLength);
    const indexPerLabel = Math.round(maxLabelWidth / spacing);
    const visibleBars = ensureNotNull(this.visibleStrictRange());
    const firstBar = Math.max(visibleBars.left(), visibleBars.left() - indexPerLabel);
    const lastBar = Math.max(visibleBars.right(), visibleBars.right() - indexPerLabel);
    const items = this._tickMarks.build(spacing, maxLabelWidth, this._options.ignoreWhitespaceIndices, this._indicesWithData, this._indicesWithDataUpdateId);
    const earliestIndexOfSecondLabel = this._firstIndex() + indexPerLabel;
    const indexOfSecondLastLabel = this._lastIndex() - indexPerLabel;
    const isAllScalingAndScrollingDisabled = this._isAllScalingAndScrollingDisabled();
    const isLeftEdgeFixed = this._options.fixLeftEdge || isAllScalingAndScrollingDisabled;
    const isRightEdgeFixed = this._options.fixRightEdge || isAllScalingAndScrollingDisabled;
    let targetIndex = 0;
    for (const tm of items) {
      if (!(firstBar <= tm.index && tm.index <= lastBar)) {
        continue;
      }
      let label;
      if (targetIndex < this._labels.length) {
        label = this._labels[targetIndex];
        label.coord = this.indexToCoordinate(tm.index);
        label.label = this._formatLabel(tm);
        label.weight = tm.weight;
      } else {
        label = {
          needAlignCoordinate: false,
          coord: this.indexToCoordinate(tm.index),
          label: this._formatLabel(tm),
          weight: tm.weight
        };
        this._labels.push(label);
      }
      if (this._barSpacing > maxLabelWidth / 2 && !isAllScalingAndScrollingDisabled) {
        label.needAlignCoordinate = false;
      } else {
        label.needAlignCoordinate = isLeftEdgeFixed && tm.index <= earliestIndexOfSecondLabel || isRightEdgeFixed && tm.index >= indexOfSecondLastLabel;
      }
      targetIndex++;
    }
    this._labels.length = targetIndex;
    this._timeMarksCache = this._labels;
    return this._labels;
  }
  restoreDefault() {
    this._visibleRangeInvalidated = true;
    this.setBarSpacing(this._options.barSpacing);
    let newOffset;
    if (this._options.rightOffsetPixels !== void 0) {
      newOffset = this._options.rightOffsetPixels / this.barSpacing();
    } else {
      newOffset = this._options.rightOffset;
    }
    this.setRightOffset(newOffset);
  }
  setBaseIndex(baseIndex) {
    this._visibleRangeInvalidated = true;
    this._baseIndexOrNull = baseIndex;
    this._correctOffset();
    this._doFixLeftEdge();
  }
  /**
   * Zoom in/out the scale around a `zoomPoint` on `scale` value.
   *
   * @param zoomPoint - X coordinate of the point to apply the zoom.
   * If `rightBarStaysOnScroll` option is disabled, then will be used to restore right offset.
   * @param scale - Zoom value (in 1/10 parts of current bar spacing).
   * Negative value means zoom out, positive - zoom in.
   */
  zoom(zoomPoint, scale) {
    const floatIndexAtZoomPoint = this._coordinateToFloatIndex(zoomPoint);
    const barSpacing = this.barSpacing();
    const newBarSpacing = barSpacing + scale * (barSpacing / 10);
    this.setBarSpacing(newBarSpacing);
    if (!this._options.rightBarStaysOnScroll) {
      this.setRightOffset(this.rightOffset() + (floatIndexAtZoomPoint - this._coordinateToFloatIndex(zoomPoint)));
    }
  }
  startScale(x) {
    if (this._scrollStartPoint) {
      this.endScroll();
    }
    if (this._scaleStartPoint !== null || this._commonTransitionStartState !== null) {
      return;
    }
    if (this.isEmpty()) {
      return;
    }
    this._scaleStartPoint = x;
    this._saveCommonTransitionsStartState();
  }
  scaleTo(x) {
    if (this._commonTransitionStartState === null) {
      return;
    }
    const startLengthFromRight = clamp(this._width - x, 0, this._width);
    const currentLengthFromRight = clamp(this._width - ensureNotNull(this._scaleStartPoint), 0, this._width);
    if (startLengthFromRight === 0 || currentLengthFromRight === 0) {
      return;
    }
    this.setBarSpacing(this._commonTransitionStartState.barSpacing * startLengthFromRight / currentLengthFromRight);
  }
  endScale() {
    if (this._scaleStartPoint === null) {
      return;
    }
    this._scaleStartPoint = null;
    this._clearCommonTransitionsStartState();
  }
  startScroll(x) {
    if (this._scrollStartPoint !== null || this._commonTransitionStartState !== null) {
      return;
    }
    if (this.isEmpty()) {
      return;
    }
    this._scrollStartPoint = x;
    this._saveCommonTransitionsStartState();
  }
  scrollTo(x) {
    if (this._scrollStartPoint === null) {
      return;
    }
    const shiftInLogical = (this._scrollStartPoint - x) / this.barSpacing();
    this._rightOffset = ensureNotNull(this._commonTransitionStartState).rightOffset + shiftInLogical;
    this._visibleRangeInvalidated = true;
    this._correctOffset();
  }
  endScroll() {
    if (this._scrollStartPoint === null) {
      return;
    }
    this._scrollStartPoint = null;
    this._clearCommonTransitionsStartState();
  }
  scrollToRealTime() {
    this.scrollToOffsetAnimated(this._options.rightOffset);
  }
  scrollToOffsetAnimated(offset, animationDuration = 400) {
    if (!isFinite(offset)) {
      throw new RangeError("offset is required and must be finite number");
    }
    if (!isFinite(animationDuration) || animationDuration <= 0) {
      throw new RangeError("animationDuration (optional) must be finite positive number");
    }
    const source = this._rightOffset;
    const animationStart = performance.now();
    this._model.setTimeScaleAnimation({
      finished: (time) => (time - animationStart) / animationDuration >= 1,
      getPosition: (time) => {
        const animationProgress = (time - animationStart) / animationDuration;
        const finishAnimation = animationProgress >= 1;
        return finishAnimation ? offset : source + (offset - source) * animationProgress;
      }
    });
  }
  update(newPoints, firstChangedPointIndex) {
    this._visibleRangeInvalidated = true;
    this._points = newPoints;
    this._tickMarks.setTimeScalePoints(newPoints, firstChangedPointIndex);
    this._correctOffset();
  }
  visibleBarsChanged() {
    return this._visibleBarsChanged;
  }
  logicalRangeChanged() {
    return this._logicalRangeChanged;
  }
  optionsApplied() {
    return this._optionsApplied;
  }
  baseIndex() {
    return this._baseIndexOrNull || 0;
  }
  setVisibleRange(range, applyDefaultOffset) {
    const length = range.count();
    const pixelOffset = applyDefaultOffset && this._options.rightOffsetPixels || 0;
    this._setBarSpacing((this._width - pixelOffset) / length);
    this._rightOffset = range.right() - this.baseIndex();
    if (applyDefaultOffset) {
      this._rightOffset = pixelOffset ? pixelOffset / this.barSpacing() : this._options.rightOffset;
    }
    this._correctOffset();
    this._visibleRangeInvalidated = true;
    this._model.recalculateAllPanes();
    this._model.lightUpdate();
  }
  fitContent() {
    const first = this._firstIndex();
    const last = this._lastIndex();
    if (first === null || last === null) {
      return;
    }
    this.setVisibleRange(new RangeImpl(first, last), true);
  }
  setLogicalRange(range) {
    const barRange = new RangeImpl(range.from, range.to);
    this.setVisibleRange(barRange);
  }
  formatDateTime(timeScalePoint) {
    if (this._localizationOptions.timeFormatter !== void 0) {
      return this._localizationOptions.timeFormatter(timeScalePoint.originalTime);
    }
    return this._horzScaleBehavior.formatHorzItem(timeScalePoint.time);
  }
  recalculateIndicesWithData() {
    if (!this._options.ignoreWhitespaceIndices) {
      return;
    }
    this._indicesWithData.clear();
    const series = this._model.serieses();
    for (const s of series) {
      for (const index of s.fulfilledIndices()) {
        this._indicesWithData.set(index, true);
      }
    }
    this._indicesWithDataUpdateId++;
  }
  /**
   * Returns the current data conflation factor.
   * Factor \> 1 means data points should be conflated for performance.
   */
  conflationFactor() {
    return this._conflationFactor;
  }
  /**
   * Provides an array of possible conflations factors based on the current
   * minBarSpacing setting for the chart.
   * @returns Arrays of conflation factors (number of bars to merge)
   */
  possibleConflationFactors() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const conflationThreshold = 1 / devicePixelRatio;
    const minBarSpacing = this._options.minBarSpacing;
    if (minBarSpacing >= conflationThreshold) {
      return [1];
    }
    const factors = [1];
    let currentLevel = 2;
    const maxLevel = 512;
    while (currentLevel <= maxLevel) {
      const levelThreshold = conflationThreshold / currentLevel;
      if (minBarSpacing < levelThreshold) {
        factors.push(currentLevel);
      }
      currentLevel *= 2;
    }
    return factors;
  }
  _isAllScalingAndScrollingDisabled() {
    const handleScroll = this._model.options()["handleScroll"];
    const handleScale = this._model.options()["handleScale"];
    return !handleScroll.horzTouchDrag && !handleScroll.mouseWheel && !handleScroll.pressedMouseMove && !handleScroll.vertTouchDrag && !handleScale.axisDoubleClickReset.time && !handleScale.axisPressedMouseMove.time && !handleScale.mouseWheel && !handleScale.pinch;
  }
  _firstIndex() {
    return this._points.length === 0 ? null : 0;
  }
  _lastIndex() {
    return this._points.length === 0 ? null : this._points.length - 1;
  }
  _rightOffsetForCoordinate(x) {
    return (this._width - 1 - x) / this._barSpacing;
  }
  _coordinateToFloatIndex(x) {
    const deltaFromRight = this._rightOffsetForCoordinate(x);
    const baseIndex = this.baseIndex();
    const index = baseIndex + this._rightOffset - deltaFromRight;
    return Math.round(index * 1e6) / 1e6;
  }
  _setBarSpacing(newBarSpacing) {
    const oldBarSpacing = this._barSpacing;
    this._barSpacing = newBarSpacing;
    this._correctBarSpacing();
    if (oldBarSpacing !== this._barSpacing) {
      this._visibleRangeInvalidated = true;
      this._resetTimeMarksCache();
      this._updateConflationFactor();
    }
  }
  _updateVisibleRange() {
    if (!this._visibleRangeInvalidated) {
      return;
    }
    this._visibleRangeInvalidated = false;
    if (this.isEmpty()) {
      this._setVisibleRange(TimeScaleVisibleRange.invalid());
      return;
    }
    const baseIndex = this.baseIndex();
    const newBarsLength = this._width / this._barSpacing;
    const rightBorder = this._rightOffset + baseIndex;
    const leftBorder = rightBorder - newBarsLength + 1;
    const logicalRange = new RangeImpl(leftBorder, rightBorder);
    this._setVisibleRange(new TimeScaleVisibleRange(logicalRange));
  }
  _correctBarSpacing() {
    const barSpacing = clamp(this._barSpacing, this._minBarSpacing(), this._maxBarSpacing());
    if (this._barSpacing !== barSpacing) {
      this._barSpacing = barSpacing;
      this._visibleRangeInvalidated = true;
    }
  }
  _maxBarSpacing() {
    if (this._options.maxBarSpacing > 0) {
      return this._options.maxBarSpacing;
    } else {
      return this._width * 0.5;
    }
  }
  _minBarSpacing() {
    if (this._options.fixLeftEdge && this._options.fixRightEdge && this._points.length !== 0) {
      return this._width / this._points.length;
    }
    return this._options.minBarSpacing;
  }
  /**
   * Updates the conflation factor based on current bar spacing using DPR-aware power-of-2 calculation with optional smoothing factor.
   * The smoothing factor allows intentional over-conflation for smoother appearance in small charts and sparklines.
   */
  _updateConflationFactor() {
    if (!this._options.enableConflation) {
      this._conflationFactor = 1;
      return;
    }
    const devicePixelRatio = window.devicePixelRatio || 1;
    const smoothingFactor = this._options.conflationThresholdFactor ?? 1;
    const adjustedThreshold = 1 / devicePixelRatio * smoothingFactor;
    if (this._barSpacing >= adjustedThreshold) {
      this._conflationFactor = 1;
      return;
    }
    const ratio = adjustedThreshold / this._barSpacing;
    const conflationLevel = Math.pow(2, Math.floor(Math.log2(ratio)));
    this._conflationFactor = Math.min(conflationLevel, 512);
  }
  _correctOffset() {
    const minRightOffset = this._minRightOffset();
    if (minRightOffset !== null && this._rightOffset < minRightOffset) {
      this._rightOffset = minRightOffset;
      this._visibleRangeInvalidated = true;
    }
    const maxRightOffset = this._maxRightOffset();
    if (this._rightOffset > maxRightOffset) {
      this._rightOffset = maxRightOffset;
      this._visibleRangeInvalidated = true;
    }
  }
  _minRightOffset() {
    const firstIndex = this._firstIndex();
    const baseIndex = this._baseIndexOrNull;
    if (firstIndex === null || baseIndex === null) {
      return null;
    }
    const barsEstimation = this._options.fixLeftEdge ? this._width / this._barSpacing : Math.min(2, this._points.length);
    return firstIndex - baseIndex - 1 + barsEstimation;
  }
  _maxRightOffset() {
    return this._options.fixRightEdge ? 0 : this._width / this._barSpacing - Math.min(2, this._points.length);
  }
  _saveCommonTransitionsStartState() {
    this._commonTransitionStartState = {
      barSpacing: this.barSpacing(),
      rightOffset: this.rightOffset()
    };
  }
  _clearCommonTransitionsStartState() {
    this._commonTransitionStartState = null;
  }
  _formatLabel(tickMark) {
    let formatter = this._formattedByWeight.get(tickMark.weight);
    if (formatter === void 0) {
      formatter = new FormattedLabelsCache((mark) => {
        return this._formatLabelImpl(mark);
      }, this._horzScaleBehavior);
      this._formattedByWeight.set(tickMark.weight, formatter);
    }
    return formatter.format(tickMark);
  }
  _formatLabelImpl(tickMark) {
    return this._horzScaleBehavior.formatTickmark(tickMark, this._localizationOptions);
  }
  _setVisibleRange(newVisibleRange) {
    const oldVisibleRange = this._visibleRange;
    this._visibleRange = newVisibleRange;
    if (!areRangesEqual(oldVisibleRange.strictRange(), this._visibleRange.strictRange())) {
      this._visibleBarsChanged.fire();
    }
    if (!areRangesEqual(oldVisibleRange.logicalRange(), this._visibleRange.logicalRange())) {
      this._logicalRangeChanged.fire();
    }
    this._resetTimeMarksCache();
  }
  _resetTimeMarksCache() {
    this._timeMarksCache = null;
  }
  _invalidateTickMarks() {
    this._resetTimeMarksCache();
    this._formattedByWeight.clear();
  }
  _updateDateTimeFormatter() {
    this._horzScaleBehavior.updateFormatter(this._localizationOptions);
  }
  _doFixLeftEdge() {
    if (!this._options.fixLeftEdge) {
      return;
    }
    const firstIndex = this._firstIndex();
    if (firstIndex === null) {
      return;
    }
    const visibleRange = this.visibleStrictRange();
    if (visibleRange === null) {
      return;
    }
    const delta = visibleRange.left() - firstIndex;
    if (delta < 0) {
      const leftEdgeOffset = this._rightOffset - delta - 1;
      this.setRightOffset(leftEdgeOffset);
    }
    this._correctBarSpacing();
  }
  _doFixRightEdge() {
    this._correctOffset();
    this._correctBarSpacing();
  }
  _shouldConsiderIndex(index) {
    if (!this._options.ignoreWhitespaceIndices) {
      return true;
    }
    return this._indicesWithData.get(index) || false;
  }
  _findNearestIndexWithData(x) {
    const gen = testNearestIntegers(x);
    const maxIndex = this._lastIndex();
    while (maxIndex) {
      const index = gen.next().value;
      if (this._indicesWithData.get(index)) {
        return index;
      }
      if (index < 0 || index > maxIndex) {
        break;
      }
    }
    return x;
  }
  _checkRightOffsetPixels(options) {
    if (options.rightOffsetPixels !== void 0) {
      const newOffset = options.rightOffsetPixels / (options.barSpacing || this._barSpacing);
      this._model.setRightOffset(newOffset);
    }
  }
};
function* testNearestIntegers(num) {
  const rounded = Math.round(num);
  const isRoundedDown = rounded < num;
  let offset = 1;
  while (true) {
    if (isRoundedDown) {
      yield rounded + offset;
      yield rounded - offset;
    } else {
      yield rounded - offset;
      yield rounded + offset;
    }
    offset++;
  }
}

// ../lib/prod/src/model/chart-model.js
var BackgroundColorSide;
(function(BackgroundColorSide2) {
  BackgroundColorSide2[BackgroundColorSide2["Top"] = 0] = "Top";
  BackgroundColorSide2[BackgroundColorSide2["Bottom"] = 1] = "Bottom";
})(BackgroundColorSide || (BackgroundColorSide = {}));
var TrackingModeExitMode;
(function(TrackingModeExitMode2) {
  TrackingModeExitMode2[TrackingModeExitMode2["OnTouchEnd"] = 0] = "OnTouchEnd";
  TrackingModeExitMode2[TrackingModeExitMode2["OnNextTap"] = 1] = "OnNextTap";
})(TrackingModeExitMode || (TrackingModeExitMode = {}));
function isPanePrimitive(source) {
  return source instanceof Pane;
}
var ChartModel = class {
  constructor(invalidateHandler, options, horzScaleBehavior) {
    this._panes = [];
    this._serieses = [];
    this._width = 0;
    this._hoveredSource = null;
    this._priceScalesOptionsChanged = new Delegate();
    this._crosshairMoved = new Delegate();
    this._gradientColorsCache = null;
    this._invalidateHandler = invalidateHandler;
    this._options = options;
    this._horzScaleBehavior = horzScaleBehavior;
    this._colorParser = new ColorParser(this._options.layout.colorParsers);
    this._rendererOptionsProvider = new PriceAxisRendererOptionsProvider(this);
    this._timeScale = new TimeScale(this, options.timeScale, this._options.localization, horzScaleBehavior);
    this._crosshair = new Crosshair(this, options.crosshair);
    this._magnet = new Magnet(options.crosshair);
    if (options.addDefaultPane) {
      this._getOrCreatePane(0);
      this._panes[0].setStretchFactor(DEFAULT_STRETCH_FACTOR * 2);
    }
    this._backgroundTopColor = this._getBackgroundColor(
      0
      /* BackgroundColorSide.Top */
    );
    this._backgroundBottomColor = this._getBackgroundColor(
      1
      /* BackgroundColorSide.Bottom */
    );
  }
  fullUpdate() {
    this._invalidate(InvalidateMask.full());
  }
  lightUpdate() {
    this._invalidate(InvalidateMask.light());
  }
  cursorUpdate() {
    this._invalidate(new InvalidateMask(
      1
      /* InvalidationLevel.Cursor */
    ));
  }
  updateSource(source) {
    const inv = this._invalidationMaskForSource(source);
    this._invalidate(inv);
  }
  hoveredSource() {
    return this._hoveredSource;
  }
  setHoveredSource(source) {
    if (this._hoveredSource?.source === source?.source && this._hoveredSource?.object?.externalId === source?.object?.externalId) {
      return;
    }
    const prevSource = this._hoveredSource;
    this._hoveredSource = source;
    if (prevSource !== null) {
      this.updateSource(prevSource.source);
    }
    if (source !== null && source.source !== prevSource?.source) {
      this.updateSource(source.source);
    }
  }
  options() {
    return this._options;
  }
  applyOptions(options) {
    merge(this._options, options);
    this._panes.forEach((p) => p.applyScaleOptions(options));
    if (options.timeScale !== void 0) {
      this._timeScale.applyOptions(options.timeScale);
    }
    if (options.localization !== void 0) {
      this._timeScale.applyLocalizationOptions(options.localization);
    }
    if (options.leftPriceScale || options.rightPriceScale) {
      this._priceScalesOptionsChanged.fire();
    }
    this._backgroundTopColor = this._getBackgroundColor(
      0
      /* BackgroundColorSide.Top */
    );
    this._backgroundBottomColor = this._getBackgroundColor(
      1
      /* BackgroundColorSide.Bottom */
    );
    this.fullUpdate();
  }
  applyPriceScaleOptions(priceScaleId, options, paneIndex = 0) {
    const pane = this._panes[paneIndex];
    if (pane === void 0) {
      if (true) {
        throw new Error(`Trying to apply price scale options with incorrect pane index: ${paneIndex}`);
      }
      return;
    }
    if (priceScaleId === "left") {
      merge(this._options, {
        leftPriceScale: options
      });
      pane.applyScaleOptions({
        leftPriceScale: options
      });
      this._priceScalesOptionsChanged.fire();
      this.fullUpdate();
      return;
    } else if (priceScaleId === "right") {
      merge(this._options, {
        rightPriceScale: options
      });
      pane.applyScaleOptions({
        rightPriceScale: options
      });
      this._priceScalesOptionsChanged.fire();
      this.fullUpdate();
      return;
    }
    const res = this.findPriceScale(priceScaleId, paneIndex);
    if (res === null) {
      if (true) {
        throw new Error(`Trying to apply price scale options with incorrect ID: ${priceScaleId}`);
      }
      return;
    }
    res.priceScale.applyOptions(options);
    this._priceScalesOptionsChanged.fire();
  }
  findPriceScale(priceScaleId, paneIndex) {
    const pane = this._panes[paneIndex];
    if (pane === void 0) {
      return null;
    }
    const priceScale = pane.priceScaleById(priceScaleId);
    if (priceScale !== null) {
      return {
        pane,
        priceScale
      };
    }
    return null;
  }
  timeScale() {
    return this._timeScale;
  }
  panes() {
    return this._panes;
  }
  crosshairSource() {
    return this._crosshair;
  }
  crosshairMoved() {
    return this._crosshairMoved;
  }
  setPaneHeight(pane, height) {
    pane.setHeight(height);
    this.recalculateAllPanes();
  }
  setWidth(width) {
    this._width = width;
    this._timeScale.setWidth(this._width);
    this._panes.forEach((pane) => pane.setWidth(width));
    this.recalculateAllPanes();
  }
  removePane(index) {
    if (this._panes.length === 1) {
      return;
    }
    assert(index >= 0 && index < this._panes.length, "Invalid pane index");
    this._panes.splice(index, 1);
    this.fullUpdate();
  }
  changePanesHeight(paneIndex, height) {
    if (this._panes.length < 2) {
      return;
    }
    assert(paneIndex >= 0 && paneIndex < this._panes.length, "Invalid pane index");
    const targetPane = this._panes[paneIndex];
    const totalStretch = this._panes.reduce((prevValue, pane) => prevValue + pane.stretchFactor(), 0);
    const totalHeight = this._panes.reduce((prevValue, pane) => prevValue + pane.height(), 0);
    const maxPaneHeight = totalHeight - MIN_PANE_HEIGHT * (this._panes.length - 1);
    height = Math.min(maxPaneHeight, Math.max(MIN_PANE_HEIGHT, height));
    const pixelStretchFactor = totalStretch / totalHeight;
    const oldHeight = targetPane.height();
    targetPane.setStretchFactor(height * pixelStretchFactor);
    let otherPanesChange = height - oldHeight;
    let panesCount = this._panes.length - 1;
    for (const pane of this._panes) {
      if (pane !== targetPane) {
        const newPaneHeight = Math.min(maxPaneHeight, Math.max(30, pane.height() - otherPanesChange / panesCount));
        otherPanesChange -= pane.height() - newPaneHeight;
        panesCount -= 1;
        const newStretchFactor = newPaneHeight * pixelStretchFactor;
        pane.setStretchFactor(newStretchFactor);
      }
    }
    this.fullUpdate();
  }
  swapPanes(first, second) {
    assert(first >= 0 && first < this._panes.length && second >= 0 && second < this._panes.length, "Invalid pane index");
    const firstPane = this._panes[first];
    const secondPane = this._panes[second];
    this._panes[first] = secondPane;
    this._panes[second] = firstPane;
    this.fullUpdate();
  }
  movePane(from, to) {
    assert(from >= 0 && from < this._panes.length && to >= 0 && to < this._panes.length, "Invalid pane index");
    if (from === to) {
      return;
    }
    const [paneToMove] = this._panes.splice(from, 1);
    this._panes.splice(to, 0, paneToMove);
    this.fullUpdate();
  }
  startScalePrice(pane, priceScale, x) {
    pane.startScalePrice(priceScale, x);
  }
  scalePriceTo(pane, priceScale, x) {
    pane.scalePriceTo(priceScale, x);
    this.updateCrosshair();
    this._invalidate(this._paneInvalidationMask(
      pane,
      2
      /* InvalidationLevel.Light */
    ));
  }
  endScalePrice(pane, priceScale) {
    pane.endScalePrice(priceScale);
    this._invalidate(this._paneInvalidationMask(
      pane,
      2
      /* InvalidationLevel.Light */
    ));
  }
  startScrollPrice(pane, priceScale, x) {
    if (priceScale.isAutoScale()) {
      return;
    }
    pane.startScrollPrice(priceScale, x);
  }
  scrollPriceTo(pane, priceScale, x) {
    if (priceScale.isAutoScale()) {
      return;
    }
    pane.scrollPriceTo(priceScale, x);
    this.updateCrosshair();
    this._invalidate(this._paneInvalidationMask(
      pane,
      2
      /* InvalidationLevel.Light */
    ));
  }
  endScrollPrice(pane, priceScale) {
    if (priceScale.isAutoScale()) {
      return;
    }
    pane.endScrollPrice(priceScale);
    this._invalidate(this._paneInvalidationMask(
      pane,
      2
      /* InvalidationLevel.Light */
    ));
  }
  resetPriceScale(pane, priceScale) {
    pane.resetPriceScale(priceScale);
    this._invalidate(this._paneInvalidationMask(
      pane,
      2
      /* InvalidationLevel.Light */
    ));
  }
  startScaleTime(position) {
    this._timeScale.startScale(position);
  }
  /**
   * Zoom in/out the chart (depends on scale value).
   *
   * @param pointX - X coordinate of the point to apply the zoom (the point which should stay on its place)
   * @param scale - Zoom value. Negative value means zoom out, positive - zoom in.
   */
  zoomTime(pointX, scale) {
    const timeScale = this.timeScale();
    if (timeScale.isEmpty() || scale === 0) {
      return;
    }
    const timeScaleWidth = timeScale.width();
    pointX = Math.max(1, Math.min(pointX, timeScaleWidth));
    timeScale.zoom(pointX, scale);
    this.recalculateAllPanes();
  }
  scrollChart(x) {
    this.startScrollTime(0);
    this.scrollTimeTo(x);
    this.endScrollTime();
  }
  scaleTimeTo(x) {
    this._timeScale.scaleTo(x);
    this.recalculateAllPanes();
  }
  endScaleTime() {
    this._timeScale.endScale();
    this.lightUpdate();
  }
  startScrollTime(x) {
    this._timeScale.startScroll(x);
  }
  scrollTimeTo(x) {
    this._timeScale.scrollTo(x);
    this.recalculateAllPanes();
  }
  endScrollTime() {
    this._timeScale.endScroll();
    this.lightUpdate();
  }
  serieses() {
    return this._serieses;
  }
  setAndSaveCurrentPosition(x, y, event, pane, skipEvent) {
    this._crosshair.saveOriginCoord(x, y);
    let price = NaN;
    let index = this._timeScale.coordinateToIndex(x, true);
    const visibleBars = this._timeScale.visibleStrictRange();
    if (visibleBars !== null) {
      index = Math.min(Math.max(visibleBars.left(), index), visibleBars.right());
    }
    const priceScale = pane.defaultPriceScale();
    const firstValue = priceScale.firstValue();
    if (firstValue !== null) {
      price = priceScale.coordinateToPrice(y, firstValue);
    }
    price = this._magnet.align(price, index, pane);
    this._crosshair.setPosition(index, price, pane);
    this.cursorUpdate();
    if (!skipEvent) {
      const hitTest = hitTestPane(pane, x, y);
      this.setHoveredSource(hitTest && { source: hitTest.source, object: hitTest.object, cursorStyle: hitTest.cursorStyle || null });
      this._crosshairMoved.fire(this._crosshair.appliedIndex(), { x, y }, event);
    }
  }
  // A position provided external (not from an internal event listener)
  setAndSaveSyntheticPosition(price, horizontalPosition, pane) {
    const priceScale = pane.defaultPriceScale();
    const firstValue = priceScale.firstValue();
    const y = priceScale.priceToCoordinate(price, ensureNotNull(firstValue));
    const index = this._timeScale.timeToIndex(horizontalPosition, true);
    const x = this._timeScale.indexToCoordinate(ensureNotNull(index));
    this.setAndSaveCurrentPosition(x, y, null, pane, true);
  }
  clearCurrentPosition(skipEvent) {
    const crosshair = this.crosshairSource();
    crosshair.clearPosition();
    this.cursorUpdate();
    if (!skipEvent) {
      this._crosshairMoved.fire(null, null, null);
    }
  }
  updateCrosshair() {
    const pane = this._crosshair.pane();
    if (pane !== null) {
      const x = this._crosshair.originCoordX();
      const y = this._crosshair.originCoordY();
      this.setAndSaveCurrentPosition(x, y, null, pane);
    }
    this._crosshair.updateAllViews();
  }
  updateTimeScale(newBaseIndex, newPoints, firstChangedPointIndex) {
    const oldFirstTime = this._timeScale.indexToTime(0);
    if (newPoints !== void 0 && firstChangedPointIndex !== void 0) {
      this._timeScale.update(newPoints, firstChangedPointIndex);
    }
    const newFirstTime = this._timeScale.indexToTime(0);
    const currentBaseIndex = this._timeScale.baseIndex();
    const visibleBars = this._timeScale.visibleStrictRange();
    if (visibleBars !== null && oldFirstTime !== null && newFirstTime !== null) {
      const isLastSeriesBarVisible = visibleBars.contains(currentBaseIndex);
      const isLeftBarShiftToLeft = this._horzScaleBehavior.key(oldFirstTime) > this._horzScaleBehavior.key(newFirstTime);
      const isSeriesPointsAdded = newBaseIndex !== null && newBaseIndex > currentBaseIndex;
      const isSeriesPointsAddedToRight = isSeriesPointsAdded && !isLeftBarShiftToLeft;
      const allowShiftWhenReplacingWhitespace = this._timeScale.options().allowShiftVisibleRangeOnWhitespaceReplacement;
      const replacedExistingWhitespace = firstChangedPointIndex === void 0;
      const needShiftVisibleRangeOnNewBar = isLastSeriesBarVisible && (!replacedExistingWhitespace || allowShiftWhenReplacingWhitespace) && this._timeScale.options().shiftVisibleRangeOnNewBar;
      if (isSeriesPointsAddedToRight && !needShiftVisibleRangeOnNewBar) {
        const compensationShift = newBaseIndex - currentBaseIndex;
        this._timeScale.setRightOffset(this._timeScale.rightOffset() - compensationShift);
      }
    }
    this._timeScale.setBaseIndex(newBaseIndex);
  }
  recalculatePane(pane) {
    if (pane !== null) {
      pane.recalculate();
    }
  }
  paneForSource(source) {
    if (isPanePrimitive(source)) {
      return source;
    }
    const pane = this._panes.find((p) => p.orderedSources().includes(source));
    return pane === void 0 ? null : pane;
  }
  recalculateAllPanes() {
    this._panes.forEach((p) => p.recalculate());
    this.updateCrosshair();
  }
  destroy() {
    this._panes.forEach((p) => p.destroy());
    this._panes.length = 0;
    this._options.localization.priceFormatter = void 0;
    this._options.localization.percentageFormatter = void 0;
    this._options.localization.timeFormatter = void 0;
  }
  rendererOptionsProvider() {
    return this._rendererOptionsProvider;
  }
  priceAxisRendererOptions() {
    return this._rendererOptionsProvider.options();
  }
  priceScalesOptionsChanged() {
    return this._priceScalesOptionsChanged;
  }
  addSeriesToPane(series, paneIndex) {
    const pane = this._getOrCreatePane(paneIndex);
    this._addSeriesToPane(series, pane);
    this._serieses.push(series);
    if (this._serieses.length === 1) {
      this.fullUpdate();
    } else {
      this.lightUpdate();
    }
  }
  removeSeries(series) {
    const pane = this.paneForSource(series);
    const seriesIndex = this._serieses.indexOf(series);
    assert(seriesIndex !== -1, "Series not found");
    const paneImpl = ensureNotNull(pane);
    this._serieses.splice(seriesIndex, 1);
    paneImpl.removeDataSource(series);
    if (series.destroy) {
      series.destroy();
    }
    this._timeScale.recalculateIndicesWithData();
    this._cleanupIfPaneIsEmpty(paneImpl);
  }
  moveSeriesToScale(series, targetScaleId) {
    const pane = ensureNotNull(this.paneForSource(series));
    pane.removeDataSource(series, true);
    pane.addDataSource(series, targetScaleId, true);
  }
  fitContent() {
    const mask = InvalidateMask.light();
    mask.setFitContent();
    this._invalidate(mask);
  }
  setTargetLogicalRange(range) {
    const mask = InvalidateMask.light();
    mask.applyRange(range);
    this._invalidate(mask);
  }
  resetTimeScale() {
    const mask = InvalidateMask.light();
    mask.resetTimeScale();
    this._invalidate(mask);
  }
  setBarSpacing(spacing) {
    const mask = InvalidateMask.light();
    mask.setBarSpacing(spacing);
    this._invalidate(mask);
  }
  setRightOffset(offset) {
    const mask = InvalidateMask.light();
    mask.setRightOffset(offset);
    this._invalidate(mask);
  }
  setTimeScaleAnimation(animation) {
    const mask = InvalidateMask.light();
    mask.setTimeScaleAnimation(animation);
    this._invalidate(mask);
  }
  stopTimeScaleAnimation() {
    const mask = InvalidateMask.light();
    mask.stopTimeScaleAnimation();
    this._invalidate(mask);
  }
  defaultVisiblePriceScaleId() {
    return this._options.rightPriceScale.visible ? "right" : "left";
  }
  moveSeriesToPane(series, newPaneIndex) {
    assert(newPaneIndex >= 0, "Index should be greater or equal to 0");
    const fromPaneIndex = this._seriesPaneIndex(series);
    if (newPaneIndex === fromPaneIndex) {
      return;
    }
    const previousPane = ensureNotNull(this.paneForSource(series));
    previousPane.removeDataSource(series);
    const newPane = this._getOrCreatePane(newPaneIndex);
    this._addSeriesToPane(series, newPane);
    if (previousPane.dataSources().length === 0) {
      this._cleanupIfPaneIsEmpty(previousPane);
    }
    this.fullUpdate();
  }
  backgroundBottomColor() {
    return this._backgroundBottomColor;
  }
  backgroundTopColor() {
    return this._backgroundTopColor;
  }
  backgroundColorAtYPercentFromTop(percent) {
    const bottomColor = this._backgroundBottomColor;
    const topColor = this._backgroundTopColor;
    if (bottomColor === topColor) {
      return bottomColor;
    }
    percent = Math.max(0, Math.min(100, Math.round(percent * 100)));
    if (this._gradientColorsCache === null || this._gradientColorsCache.topColor !== topColor || this._gradientColorsCache.bottomColor !== bottomColor) {
      this._gradientColorsCache = {
        topColor,
        bottomColor,
        colors: /* @__PURE__ */ new Map()
      };
    } else {
      const cachedValue = this._gradientColorsCache.colors.get(percent);
      if (cachedValue !== void 0) {
        return cachedValue;
      }
    }
    const result = this._colorParser.gradientColorAtPercent(topColor, bottomColor, percent / 100);
    this._gradientColorsCache.colors.set(percent, result);
    return result;
  }
  getPaneIndex(pane) {
    return this._panes.indexOf(pane);
  }
  colorParser() {
    return this._colorParser;
  }
  addPane() {
    return this._addPane();
  }
  _addPane(index) {
    const pane = new Pane(this._timeScale, this);
    this._panes.push(pane);
    const idx = index ?? this._panes.length - 1;
    const mask = InvalidateMask.full();
    mask.invalidatePane(idx, {
      level: 0,
      autoScale: true
    });
    this._invalidate(mask);
    return pane;
  }
  _getOrCreatePane(index) {
    assert(index >= 0, "Index should be greater or equal to 0");
    index = Math.min(this._panes.length, index);
    if (index < this._panes.length) {
      return this._panes[index];
    }
    return this._addPane(index);
  }
  _seriesPaneIndex(series) {
    return this._panes.findIndex((pane) => pane.series().includes(series));
  }
  _paneInvalidationMask(pane, level) {
    const inv = new InvalidateMask(level);
    if (pane !== null) {
      const index = this._panes.indexOf(pane);
      inv.invalidatePane(index, {
        level
      });
    }
    return inv;
  }
  _invalidationMaskForSource(source, invalidateType) {
    if (invalidateType === void 0) {
      invalidateType = 2;
    }
    return this._paneInvalidationMask(this.paneForSource(source), invalidateType);
  }
  _invalidate(mask) {
    if (this._invalidateHandler) {
      this._invalidateHandler(mask);
    }
    this._panes.forEach((pane) => pane.grid().paneView().update());
  }
  _addSeriesToPane(series, pane) {
    const priceScaleId = series.options().priceScaleId;
    const targetScaleId = priceScaleId !== void 0 ? priceScaleId : this.defaultVisiblePriceScaleId();
    pane.addDataSource(series, targetScaleId);
    if (!isDefaultPriceScale(targetScaleId)) {
      series.applyOptions(series.options());
    }
  }
  _getBackgroundColor(side) {
    const layoutOptions = this._options["layout"];
    if (layoutOptions.background.type === "gradient") {
      return side === 0 ? layoutOptions.background.topColor : layoutOptions.background.bottomColor;
    }
    return layoutOptions.background.color;
  }
  _cleanupIfPaneIsEmpty(pane) {
    if (!pane.preserveEmptyPane() && (pane.dataSources().length === 0 && this._panes.length > 1)) {
      this._panes.splice(this.getPaneIndex(pane), 1);
    }
  }
};

// ../lib/prod/src/model/series-options.js
function fillUpDownCandlesticksColors(options) {
  if (options.borderColor !== void 0) {
    options.borderUpColor = options.borderColor;
    options.borderDownColor = options.borderColor;
  }
  if (options.wickColor !== void 0) {
    options.wickUpColor = options.wickColor;
    options.wickDownColor = options.wickColor;
  }
}
var LastPriceAnimationMode;
(function(LastPriceAnimationMode2) {
  LastPriceAnimationMode2[LastPriceAnimationMode2["Disabled"] = 0] = "Disabled";
  LastPriceAnimationMode2[LastPriceAnimationMode2["Continuous"] = 1] = "Continuous";
  LastPriceAnimationMode2[LastPriceAnimationMode2["OnDataUpdate"] = 2] = "OnDataUpdate";
})(LastPriceAnimationMode || (LastPriceAnimationMode = {}));
function precisionByMinMove(minMove) {
  if (minMove >= 1) {
    return 0;
  }
  let i = 0;
  for (; i < 8; i++) {
    const intPart = Math.round(minMove);
    const fractPart = Math.abs(intPart - minMove);
    if (fractPart < 1e-8) {
      return i;
    }
    minMove = minMove * 10;
  }
  return i;
}
var PriceAxisLastValueMode;
(function(PriceAxisLastValueMode2) {
  PriceAxisLastValueMode2[PriceAxisLastValueMode2["LastPriceAndPercentageValue"] = 0] = "LastPriceAndPercentageValue";
  PriceAxisLastValueMode2[PriceAxisLastValueMode2["LastValueAccordingToScale"] = 1] = "LastValueAccordingToScale";
})(PriceAxisLastValueMode || (PriceAxisLastValueMode = {}));
var PriceLineSource;
(function(PriceLineSource2) {
  PriceLineSource2[PriceLineSource2["LastBar"] = 0] = "LastBar";
  PriceLineSource2[PriceLineSource2["LastVisible"] = 1] = "LastVisible";
})(PriceLineSource || (PriceLineSource = {}));

// ../lib/prod/src/model/layout-options.js
var ColorType;
(function(ColorType2) {
  ColorType2["Solid"] = "solid";
  ColorType2["VerticalGradient"] = "gradient";
})(ColorType || (ColorType = {}));

// ../lib/prod/src/model/horz-scale-behavior-time/types.js
function isBusinessDay(time) {
  return !isNumber(time) && !isString(time);
}
function isUTCTimestamp(time) {
  return isNumber(time);
}
var TickMarkType;
(function(TickMarkType2) {
  TickMarkType2[TickMarkType2["Year"] = 0] = "Year";
  TickMarkType2[TickMarkType2["Month"] = 1] = "Month";
  TickMarkType2[TickMarkType2["DayOfMonth"] = 2] = "DayOfMonth";
  TickMarkType2[TickMarkType2["Time"] = 3] = "Time";
  TickMarkType2[TickMarkType2["TimeWithSeconds"] = 4] = "TimeWithSeconds";
})(TickMarkType || (TickMarkType = {}));
var TickMarkWeight;
(function(TickMarkWeight2) {
  TickMarkWeight2[TickMarkWeight2["LessThanSecond"] = 0] = "LessThanSecond";
  TickMarkWeight2[TickMarkWeight2["Second"] = 10] = "Second";
  TickMarkWeight2[TickMarkWeight2["Minute1"] = 20] = "Minute1";
  TickMarkWeight2[TickMarkWeight2["Minute5"] = 21] = "Minute5";
  TickMarkWeight2[TickMarkWeight2["Minute30"] = 22] = "Minute30";
  TickMarkWeight2[TickMarkWeight2["Hour1"] = 30] = "Hour1";
  TickMarkWeight2[TickMarkWeight2["Hour3"] = 31] = "Hour3";
  TickMarkWeight2[TickMarkWeight2["Hour6"] = 32] = "Hour6";
  TickMarkWeight2[TickMarkWeight2["Hour12"] = 33] = "Hour12";
  TickMarkWeight2[TickMarkWeight2["Day"] = 50] = "Day";
  TickMarkWeight2[TickMarkWeight2["Month"] = 60] = "Month";
  TickMarkWeight2[TickMarkWeight2["Year"] = 70] = "Year";
})(TickMarkWeight || (TickMarkWeight = {}));

// ../lib/prod/src/formatters/format-date.js
var getMonth = (date) => date.getUTCMonth() + 1;
var getDay = (date) => date.getUTCDate();
var getYear = (date) => date.getUTCFullYear();
var dd = (date) => numberToStringWithLeadingZero(getDay(date), 2);
var MMMM = (date, locale) => new Date(date.getUTCFullYear(), date.getUTCMonth(), 1).toLocaleString(locale, { month: "long" });
var MMM = (date, locale) => new Date(date.getUTCFullYear(), date.getUTCMonth(), 1).toLocaleString(locale, { month: "short" });
var MM = (date) => numberToStringWithLeadingZero(getMonth(date), 2);
var yy = (date) => numberToStringWithLeadingZero(getYear(date) % 100, 2);
var yyyy = (date) => numberToStringWithLeadingZero(getYear(date), 4);
function formatDate(date, format, locale) {
  return format.replace(/yyyy/g, yyyy(date)).replace(/yy/g, yy(date)).replace(/MMMM/g, MMMM(date, locale)).replace(/MMM/g, MMM(date, locale)).replace(/MM/g, MM(date)).replace(/dd/g, dd(date));
}

// ../lib/prod/src/formatters/date-formatter.js
var DateFormatter = class {
  constructor(dateFormat = "yyyy-MM-dd", locale = "default") {
    this._dateFormat = dateFormat;
    this._locale = locale;
  }
  format(date) {
    return formatDate(date, this._dateFormat, this._locale);
  }
};

// ../lib/prod/src/formatters/time-formatter.js
var TimeFormatter = class {
  constructor(format) {
    this._formatStr = format || "%h:%m:%s";
  }
  format(date) {
    return this._formatStr.replace("%h", numberToStringWithLeadingZero(date.getUTCHours(), 2)).replace("%m", numberToStringWithLeadingZero(date.getUTCMinutes(), 2)).replace("%s", numberToStringWithLeadingZero(date.getUTCSeconds(), 2));
  }
};

// ../lib/prod/src/formatters/date-time-formatter.js
var defaultParams = {
  dateFormat: "yyyy-MM-dd",
  timeFormat: "%h:%m:%s",
  dateTimeSeparator: " ",
  locale: "default"
};
var DateTimeFormatter = class {
  constructor(params = {}) {
    const formatterParams = { ...defaultParams, ...params };
    this._dateFormatter = new DateFormatter(formatterParams.dateFormat, formatterParams.locale);
    this._timeFormatter = new TimeFormatter(formatterParams.timeFormat);
    this._separator = formatterParams.dateTimeSeparator;
  }
  format(dateTime) {
    return `${this._dateFormatter.format(dateTime)}${this._separator}${this._timeFormatter.format(dateTime)}`;
  }
};

// ../lib/prod/src/model/horz-scale-behavior-time/default-tick-mark-formatter.js
function defaultTickMarkFormatter(timePoint, tickMarkType, locale) {
  const formatOptions = {};
  switch (tickMarkType) {
    case 0:
      formatOptions.year = "numeric";
      break;
    case 1:
      formatOptions.month = "short";
      break;
    case 2:
      formatOptions.day = "numeric";
      break;
    case 3:
      formatOptions.hour12 = false;
      formatOptions.hour = "2-digit";
      formatOptions.minute = "2-digit";
      break;
    case 4:
      formatOptions.hour12 = false;
      formatOptions.hour = "2-digit";
      formatOptions.minute = "2-digit";
      formatOptions.second = "2-digit";
      break;
    default:
      ensureNever(tickMarkType);
  }
  const date = timePoint.businessDay === void 0 ? new Date(timePoint.timestamp * 1e3) : new Date(Date.UTC(timePoint.businessDay.year, timePoint.businessDay.month - 1, timePoint.businessDay.day));
  const localDateFromUtc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
  return localDateFromUtc.toLocaleString(locale, formatOptions);
}

// ../lib/prod/src/model/horz-scale-behavior-time/time-scale-point-weight-generator.js
function hours(count) {
  return count * 60 * 60 * 1e3;
}
function minutes(count) {
  return count * 60 * 1e3;
}
function seconds(count) {
  return count * 1e3;
}
var intradayWeightDivisors = [
  {
    divisor: seconds(1),
    weight: 10
    /* TickMarkWeight.Second */
  },
  {
    divisor: minutes(1),
    weight: 20
    /* TickMarkWeight.Minute1 */
  },
  {
    divisor: minutes(5),
    weight: 21
    /* TickMarkWeight.Minute5 */
  },
  {
    divisor: minutes(30),
    weight: 22
    /* TickMarkWeight.Minute30 */
  },
  {
    divisor: hours(1),
    weight: 30
    /* TickMarkWeight.Hour1 */
  },
  {
    divisor: hours(3),
    weight: 31
    /* TickMarkWeight.Hour3 */
  },
  {
    divisor: hours(6),
    weight: 32
    /* TickMarkWeight.Hour6 */
  },
  {
    divisor: hours(12),
    weight: 33
    /* TickMarkWeight.Hour12 */
  }
];
function weightByTime(currentDate, prevDate) {
  if (currentDate.getUTCFullYear() !== prevDate.getUTCFullYear()) {
    return 70;
  } else if (currentDate.getUTCMonth() !== prevDate.getUTCMonth()) {
    return 60;
  } else if (currentDate.getUTCDate() !== prevDate.getUTCDate()) {
    return 50;
  }
  for (let i = intradayWeightDivisors.length - 1; i >= 0; --i) {
    if (Math.floor(prevDate.getTime() / intradayWeightDivisors[i].divisor) !== Math.floor(currentDate.getTime() / intradayWeightDivisors[i].divisor)) {
      return intradayWeightDivisors[i].weight;
    }
  }
  return 0;
}
function cast(t) {
  return t;
}
function fillWeightsForPoints(sortedTimePoints, startIndex = 0) {
  if (sortedTimePoints.length === 0) {
    return;
  }
  let prevTime = startIndex === 0 ? null : cast(sortedTimePoints[startIndex - 1].time).timestamp;
  let prevDate = prevTime !== null ? new Date(prevTime * 1e3) : null;
  let totalTimeDiff = 0;
  for (let index = startIndex; index < sortedTimePoints.length; ++index) {
    const currentPoint = sortedTimePoints[index];
    const currentDate = new Date(cast(currentPoint.time).timestamp * 1e3);
    if (prevDate !== null) {
      currentPoint.timeWeight = weightByTime(currentDate, prevDate);
    }
    totalTimeDiff += cast(currentPoint.time).timestamp - (prevTime || cast(currentPoint.time).timestamp);
    prevTime = cast(currentPoint.time).timestamp;
    prevDate = currentDate;
  }
  if (startIndex === 0 && sortedTimePoints.length > 1) {
    const averageTimeDiff = Math.ceil(totalTimeDiff / (sortedTimePoints.length - 1));
    const approxPrevDate = new Date((cast(sortedTimePoints[0].time).timestamp - averageTimeDiff) * 1e3);
    sortedTimePoints[0].timeWeight = weightByTime(new Date(cast(sortedTimePoints[0].time).timestamp * 1e3), approxPrevDate);
  }
}

// ../lib/prod/src/model/horz-scale-behavior-time/time-utils.js
function businessDayConverter(time) {
  let businessDay = time;
  if (isString(time)) {
    businessDay = stringToBusinessDay(time);
  }
  if (!isBusinessDay(businessDay)) {
    throw new Error("time must be of type BusinessDay");
  }
  const date = new Date(Date.UTC(businessDay.year, businessDay.month - 1, businessDay.day, 0, 0, 0, 0));
  return {
    timestamp: Math.round(date.getTime() / 1e3),
    businessDay
  };
}
function timestampConverter(time) {
  if (!isUTCTimestamp(time)) {
    throw new Error("time must be of type isUTCTimestamp");
  }
  return {
    timestamp: time
  };
}
function selectTimeConverter(data) {
  if (data.length === 0) {
    return null;
  }
  if (isBusinessDay(data[0].time) || isString(data[0].time)) {
    return businessDayConverter;
  }
  return timestampConverter;
}
var validDateRegex = /^\d\d\d\d-\d\d-\d\d$/;
function convertTime(time) {
  if (isUTCTimestamp(time)) {
    return timestampConverter(time);
  }
  if (!isBusinessDay(time)) {
    return businessDayConverter(stringToBusinessDay(time));
  }
  return businessDayConverter(time);
}
function stringToBusinessDay(value) {
  if (true) {
    if (!validDateRegex.test(value)) {
      throw new Error(`Invalid date string=${value}, expected format=yyyy-mm-dd`);
    }
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    throw new Error(`Invalid date string=${value}, expected format=yyyy-mm-dd`);
  }
  return {
    day: d.getUTCDate(),
    month: d.getUTCMonth() + 1,
    year: d.getUTCFullYear()
  };
}
function convertStringToBusinessDay(value) {
  if (isString(value.time)) {
    value.time = stringToBusinessDay(value.time);
  }
}
function convertStringsToBusinessDays(data) {
  return data.forEach(convertStringToBusinessDay);
}

// ../lib/prod/src/model/horz-scale-behavior-time/horz-scale-behavior-time.js
function weightToTickMarkType(weight, timeVisible, secondsVisible) {
  switch (weight) {
    case 0:
    case 10:
      return timeVisible ? secondsVisible ? 4 : 3 : 2;
    case 20:
    case 21:
    case 22:
    case 30:
    case 31:
    case 32:
    case 33:
      return timeVisible ? 3 : 2;
    case 50:
      return 2;
    case 60:
      return 1;
    case 70:
      return 0;
  }
}
var HorzScaleBehaviorTime = class {
  options() {
    return this._options;
  }
  setOptions(options) {
    this._options = options;
    this.updateFormatter(options.localization);
  }
  preprocessData(data) {
    if (Array.isArray(data)) {
      convertStringsToBusinessDays(data);
    } else {
      convertStringToBusinessDay(data);
    }
  }
  createConverterToInternalObj(data) {
    return ensureNotNull(selectTimeConverter(data));
  }
  key(item) {
    if (typeof item === "object" && "timestamp" in item) {
      return item.timestamp;
    } else {
      return this.key(this.convertHorzItemToInternal(item));
    }
  }
  cacheKey(item) {
    const time = item;
    return time.businessDay === void 0 ? new Date(time.timestamp * 1e3).getTime() : new Date(Date.UTC(time.businessDay.year, time.businessDay.month - 1, time.businessDay.day)).getTime();
  }
  convertHorzItemToInternal(item) {
    return convertTime(item);
  }
  updateFormatter(options) {
    if (!this._options) {
      return;
    }
    const dateFormat = options.dateFormat;
    if (this._options.timeScale.timeVisible) {
      this._dateTimeFormatter = new DateTimeFormatter({
        dateFormat,
        timeFormat: this._options.timeScale.secondsVisible ? "%h:%m:%s" : "%h:%m",
        dateTimeSeparator: "   ",
        locale: options.locale
      });
    } else {
      this._dateTimeFormatter = new DateFormatter(dateFormat, options.locale);
    }
  }
  formatHorzItem(item) {
    const tp = item;
    return this._dateTimeFormatter.format(new Date(tp.timestamp * 1e3));
  }
  formatTickmark(tickMark, localizationOptions) {
    const tickMarkType = weightToTickMarkType(tickMark.weight, this._options.timeScale.timeVisible, this._options.timeScale.secondsVisible);
    const options = this._options.timeScale;
    if (options.tickMarkFormatter !== void 0) {
      const tickMarkString = options.tickMarkFormatter(tickMark.originalTime, tickMarkType, localizationOptions.locale);
      if (tickMarkString !== null) {
        return tickMarkString;
      }
    }
    return defaultTickMarkFormatter(tickMark.time, tickMarkType, localizationOptions.locale);
  }
  maxTickMarkWeight(tickMarks) {
    let maxWeight = tickMarks.reduce(markWithGreaterWeight, tickMarks[0]).weight;
    if (maxWeight > 30 && maxWeight < 50) {
      maxWeight = 30;
    }
    return maxWeight;
  }
  fillWeightsForPoints(sortedTimePoints, startIndex) {
    fillWeightsForPoints(sortedTimePoints, startIndex);
  }
  static applyDefaults(options) {
    return merge({ localization: { dateFormat: "dd MMM 'yy" } }, options ?? {});
  }
};

// ../node_modules/fancy-canvas/size.mjs
function size(_a) {
  var width = _a.width, height = _a.height;
  if (width < 0) {
    throw new Error("Negative width is not allowed for Size");
  }
  if (height < 0) {
    throw new Error("Negative height is not allowed for Size");
  }
  return {
    width,
    height
  };
}
function equalSizes(first, second) {
  return first.width === second.width && first.height === second.height;
}

// ../node_modules/fancy-canvas/device-pixel-ratio.mjs
var Observable = (
  /** @class */
  (function() {
    function Observable2(win) {
      var _this = this;
      this._resolutionListener = function() {
        return _this._onResolutionChanged();
      };
      this._resolutionMediaQueryList = null;
      this._observers = [];
      this._window = win;
      this._installResolutionListener();
    }
    Observable2.prototype.dispose = function() {
      this._uninstallResolutionListener();
      this._window = null;
    };
    Object.defineProperty(Observable2.prototype, "value", {
      get: function() {
        return this._window.devicePixelRatio;
      },
      enumerable: false,
      configurable: true
    });
    Observable2.prototype.subscribe = function(next) {
      var _this = this;
      var observer = { next };
      this._observers.push(observer);
      return {
        unsubscribe: function() {
          _this._observers = _this._observers.filter(function(o) {
            return o !== observer;
          });
        }
      };
    };
    Observable2.prototype._installResolutionListener = function() {
      if (this._resolutionMediaQueryList !== null) {
        throw new Error("Resolution listener is already installed");
      }
      var dppx = this._window.devicePixelRatio;
      this._resolutionMediaQueryList = this._window.matchMedia("all and (resolution: ".concat(dppx, "dppx)"));
      this._resolutionMediaQueryList.addListener(this._resolutionListener);
    };
    Observable2.prototype._uninstallResolutionListener = function() {
      if (this._resolutionMediaQueryList !== null) {
        this._resolutionMediaQueryList.removeListener(this._resolutionListener);
        this._resolutionMediaQueryList = null;
      }
    };
    Observable2.prototype._reinstallResolutionListener = function() {
      this._uninstallResolutionListener();
      this._installResolutionListener();
    };
    Observable2.prototype._onResolutionChanged = function() {
      var _this = this;
      this._observers.forEach(function(observer) {
        return observer.next(_this._window.devicePixelRatio);
      });
      this._reinstallResolutionListener();
    };
    return Observable2;
  })()
);
function createObservable(win) {
  return new Observable(win);
}

// ../node_modules/fancy-canvas/canvas-element-bitmap-size.mjs
var DevicePixelContentBoxBinding = (
  /** @class */
  (function() {
    function DevicePixelContentBoxBinding2(canvasElement, transformBitmapSize, options) {
      var _a;
      this._canvasElement = null;
      this._bitmapSizeChangedListeners = [];
      this._suggestedBitmapSize = null;
      this._suggestedBitmapSizeChangedListeners = [];
      this._devicePixelRatioObservable = null;
      this._canvasElementResizeObserver = null;
      this._canvasElement = canvasElement;
      this._canvasElementClientSize = size({
        width: this._canvasElement.clientWidth,
        height: this._canvasElement.clientHeight
      });
      this._transformBitmapSize = transformBitmapSize !== null && transformBitmapSize !== void 0 ? transformBitmapSize : (function(size3) {
        return size3;
      });
      this._allowResizeObserver = (_a = options === null || options === void 0 ? void 0 : options.allowResizeObserver) !== null && _a !== void 0 ? _a : true;
      this._chooseAndInitObserver();
    }
    DevicePixelContentBoxBinding2.prototype.dispose = function() {
      var _a, _b;
      if (this._canvasElement === null) {
        throw new Error("Object is disposed");
      }
      (_a = this._canvasElementResizeObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
      this._canvasElementResizeObserver = null;
      (_b = this._devicePixelRatioObservable) === null || _b === void 0 ? void 0 : _b.dispose();
      this._devicePixelRatioObservable = null;
      this._suggestedBitmapSizeChangedListeners.length = 0;
      this._bitmapSizeChangedListeners.length = 0;
      this._canvasElement = null;
    };
    Object.defineProperty(DevicePixelContentBoxBinding2.prototype, "canvasElement", {
      get: function() {
        if (this._canvasElement === null) {
          throw new Error("Object is disposed");
        }
        return this._canvasElement;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(DevicePixelContentBoxBinding2.prototype, "canvasElementClientSize", {
      get: function() {
        return this._canvasElementClientSize;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(DevicePixelContentBoxBinding2.prototype, "bitmapSize", {
      get: function() {
        return size({
          width: this.canvasElement.width,
          height: this.canvasElement.height
        });
      },
      enumerable: false,
      configurable: true
    });
    DevicePixelContentBoxBinding2.prototype.resizeCanvasElement = function(clientSize) {
      this._canvasElementClientSize = size(clientSize);
      this.canvasElement.style.width = "".concat(this._canvasElementClientSize.width, "px");
      this.canvasElement.style.height = "".concat(this._canvasElementClientSize.height, "px");
      this._invalidateBitmapSize();
    };
    DevicePixelContentBoxBinding2.prototype.subscribeBitmapSizeChanged = function(listener) {
      this._bitmapSizeChangedListeners.push(listener);
    };
    DevicePixelContentBoxBinding2.prototype.unsubscribeBitmapSizeChanged = function(listener) {
      this._bitmapSizeChangedListeners = this._bitmapSizeChangedListeners.filter(function(l) {
        return l !== listener;
      });
    };
    Object.defineProperty(DevicePixelContentBoxBinding2.prototype, "suggestedBitmapSize", {
      get: function() {
        return this._suggestedBitmapSize;
      },
      enumerable: false,
      configurable: true
    });
    DevicePixelContentBoxBinding2.prototype.subscribeSuggestedBitmapSizeChanged = function(listener) {
      this._suggestedBitmapSizeChangedListeners.push(listener);
    };
    DevicePixelContentBoxBinding2.prototype.unsubscribeSuggestedBitmapSizeChanged = function(listener) {
      this._suggestedBitmapSizeChangedListeners = this._suggestedBitmapSizeChangedListeners.filter(function(l) {
        return l !== listener;
      });
    };
    DevicePixelContentBoxBinding2.prototype.applySuggestedBitmapSize = function() {
      if (this._suggestedBitmapSize === null) {
        return;
      }
      var oldSuggestedSize = this._suggestedBitmapSize;
      this._suggestedBitmapSize = null;
      this._resizeBitmap(oldSuggestedSize);
      this._emitSuggestedBitmapSizeChanged(oldSuggestedSize, this._suggestedBitmapSize);
    };
    DevicePixelContentBoxBinding2.prototype._resizeBitmap = function(newSize) {
      var oldSize = this.bitmapSize;
      if (equalSizes(oldSize, newSize)) {
        return;
      }
      this.canvasElement.width = newSize.width;
      this.canvasElement.height = newSize.height;
      this._emitBitmapSizeChanged(oldSize, newSize);
    };
    DevicePixelContentBoxBinding2.prototype._emitBitmapSizeChanged = function(oldSize, newSize) {
      var _this = this;
      this._bitmapSizeChangedListeners.forEach(function(listener) {
        return listener.call(_this, oldSize, newSize);
      });
    };
    DevicePixelContentBoxBinding2.prototype._suggestNewBitmapSize = function(newSize) {
      var oldSuggestedSize = this._suggestedBitmapSize;
      var finalNewSize = size(this._transformBitmapSize(newSize, this._canvasElementClientSize));
      var newSuggestedSize = equalSizes(this.bitmapSize, finalNewSize) ? null : finalNewSize;
      if (oldSuggestedSize === null && newSuggestedSize === null) {
        return;
      }
      if (oldSuggestedSize !== null && newSuggestedSize !== null && equalSizes(oldSuggestedSize, newSuggestedSize)) {
        return;
      }
      this._suggestedBitmapSize = newSuggestedSize;
      this._emitSuggestedBitmapSizeChanged(oldSuggestedSize, newSuggestedSize);
    };
    DevicePixelContentBoxBinding2.prototype._emitSuggestedBitmapSizeChanged = function(oldSize, newSize) {
      var _this = this;
      this._suggestedBitmapSizeChangedListeners.forEach(function(listener) {
        return listener.call(_this, oldSize, newSize);
      });
    };
    DevicePixelContentBoxBinding2.prototype._chooseAndInitObserver = function() {
      var _this = this;
      if (!this._allowResizeObserver) {
        this._initDevicePixelRatioObservable();
        return;
      }
      isDevicePixelContentBoxSupported().then(function(isSupported) {
        return isSupported ? _this._initResizeObserver() : _this._initDevicePixelRatioObservable();
      });
    };
    DevicePixelContentBoxBinding2.prototype._initDevicePixelRatioObservable = function() {
      var _this = this;
      if (this._canvasElement === null) {
        return;
      }
      var win = canvasElementWindow(this._canvasElement);
      if (win === null) {
        throw new Error("No window is associated with the canvas");
      }
      this._devicePixelRatioObservable = createObservable(win);
      this._devicePixelRatioObservable.subscribe(function() {
        return _this._invalidateBitmapSize();
      });
      this._invalidateBitmapSize();
    };
    DevicePixelContentBoxBinding2.prototype._invalidateBitmapSize = function() {
      var _a, _b;
      if (this._canvasElement === null) {
        return;
      }
      var win = canvasElementWindow(this._canvasElement);
      if (win === null) {
        return;
      }
      var ratio = (_b = (_a = this._devicePixelRatioObservable) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : win.devicePixelRatio;
      var canvasRects = this._canvasElement.getClientRects();
      var newSize = (
        // eslint-disable-next-line no-negated-condition
        canvasRects[0] !== void 0 ? predictedBitmapSize(canvasRects[0], ratio) : size({
          width: this._canvasElementClientSize.width * ratio,
          height: this._canvasElementClientSize.height * ratio
        })
      );
      this._suggestNewBitmapSize(newSize);
    };
    DevicePixelContentBoxBinding2.prototype._initResizeObserver = function() {
      var _this = this;
      if (this._canvasElement === null) {
        return;
      }
      this._canvasElementResizeObserver = new ResizeObserver(function(entries) {
        var entry = entries.find(function(entry2) {
          return entry2.target === _this._canvasElement;
        });
        if (!entry || !entry.devicePixelContentBoxSize || !entry.devicePixelContentBoxSize[0]) {
          return;
        }
        var entrySize = entry.devicePixelContentBoxSize[0];
        var newSize = size({
          width: entrySize.inlineSize,
          height: entrySize.blockSize
        });
        _this._suggestNewBitmapSize(newSize);
      });
      this._canvasElementResizeObserver.observe(this._canvasElement, { box: "device-pixel-content-box" });
    };
    return DevicePixelContentBoxBinding2;
  })()
);
function bindTo(canvasElement, target) {
  if (target.type === "device-pixel-content-box") {
    return new DevicePixelContentBoxBinding(canvasElement, target.transform, target.options);
  }
  throw new Error("Unsupported binding target");
}
function canvasElementWindow(canvasElement) {
  return canvasElement.ownerDocument.defaultView;
}
function isDevicePixelContentBoxSupported() {
  return new Promise(function(resolve) {
    var ro = new ResizeObserver(function(entries) {
      resolve(entries.every(function(entry) {
        return "devicePixelContentBoxSize" in entry;
      }));
      ro.disconnect();
    });
    ro.observe(document.body, { box: "device-pixel-content-box" });
  }).catch(function() {
    return false;
  });
}
function predictedBitmapSize(canvasRect, ratio) {
  return size({
    width: Math.round(canvasRect.left * ratio + canvasRect.width * ratio) - Math.round(canvasRect.left * ratio),
    height: Math.round(canvasRect.top * ratio + canvasRect.height * ratio) - Math.round(canvasRect.top * ratio)
  });
}

// ../node_modules/fancy-canvas/canvas-rendering-target.mjs
var CanvasRenderingTarget2D = (
  /** @class */
  (function() {
    function CanvasRenderingTarget2D2(context, mediaSize, bitmapSize) {
      if (mediaSize.width === 0 || mediaSize.height === 0) {
        throw new TypeError("Rendering target could only be created on a media with positive width and height");
      }
      this._mediaSize = mediaSize;
      if (bitmapSize.width === 0 || bitmapSize.height === 0) {
        throw new TypeError("Rendering target could only be created using a bitmap with positive integer width and height");
      }
      this._bitmapSize = bitmapSize;
      this._context = context;
    }
    CanvasRenderingTarget2D2.prototype.useMediaCoordinateSpace = function(f) {
      try {
        this._context.save();
        this._context.setTransform(1, 0, 0, 1, 0, 0);
        this._context.scale(this._horizontalPixelRatio, this._verticalPixelRatio);
        return f({
          context: this._context,
          mediaSize: this._mediaSize
        });
      } finally {
        this._context.restore();
      }
    };
    CanvasRenderingTarget2D2.prototype.useBitmapCoordinateSpace = function(f) {
      try {
        this._context.save();
        this._context.setTransform(1, 0, 0, 1, 0, 0);
        return f({
          context: this._context,
          mediaSize: this._mediaSize,
          bitmapSize: this._bitmapSize,
          horizontalPixelRatio: this._horizontalPixelRatio,
          verticalPixelRatio: this._verticalPixelRatio
        });
      } finally {
        this._context.restore();
      }
    };
    Object.defineProperty(CanvasRenderingTarget2D2.prototype, "_horizontalPixelRatio", {
      get: function() {
        return this._bitmapSize.width / this._mediaSize.width;
      },
      enumerable: false,
      configurable: true
    });
    Object.defineProperty(CanvasRenderingTarget2D2.prototype, "_verticalPixelRatio", {
      get: function() {
        return this._bitmapSize.height / this._mediaSize.height;
      },
      enumerable: false,
      configurable: true
    });
    return CanvasRenderingTarget2D2;
  })()
);
function tryCreateCanvasRenderingTarget2D(binding, contextOptions) {
  var mediaSize = binding.canvasElementClientSize;
  if (mediaSize.width === 0 || mediaSize.height === 0) {
    return null;
  }
  var bitmapSize = binding.bitmapSize;
  if (bitmapSize.width === 0 || bitmapSize.height === 0) {
    return null;
  }
  var context = binding.canvasElement.getContext("2d", contextOptions);
  if (context === null) {
    return null;
  }
  return new CanvasRenderingTarget2D(context, mediaSize, bitmapSize);
}

// ../lib/prod/src/helpers/is-running-on-client-side.js
var isRunningOnClientSide = typeof window !== "undefined";

// ../lib/prod/src/helpers/browsers.js
function isFF() {
  if (!isRunningOnClientSide) {
    return false;
  }
  return window.navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
}
function isIOS() {
  if (!isRunningOnClientSide) {
    return false;
  }
  return /iPhone|iPad|iPod/.test(window.navigator.platform);
}
function isChrome() {
  if (!isRunningOnClientSide) {
    return false;
  }
  return window.chrome !== void 0;
}
function isWindows() {
  if (!isRunningOnClientSide) {
    return false;
  }
  if (navigator?.userAgentData?.platform) {
    return navigator.userAgentData.platform === "Windows";
  }
  return navigator.userAgent.toLowerCase().indexOf("win") >= 0;
}
function isChromiumBased() {
  if (!isRunningOnClientSide) {
    return false;
  }
  if (!navigator.userAgentData) {
    return false;
  }
  return navigator.userAgentData.brands.some((brand) => {
    return brand.brand.includes("Chromium");
  });
}

// ../lib/prod/src/helpers/logger.js
function warn(msg) {
  if (true) {
    console.warn(msg);
  }
}

// ../lib/prod/src/gui/internal-layout-sizes-hints.js
function suggestChartSize(originalSize) {
  const integerWidth = Math.floor(originalSize.width);
  const integerHeight = Math.floor(originalSize.height);
  const width = integerWidth - integerWidth % 2;
  const height = integerHeight - integerHeight % 2;
  return size({ width, height });
}
function suggestTimeScaleHeight(originalHeight) {
  return originalHeight + originalHeight % 2;
}
function suggestPriceScaleWidth(originalWidth) {
  return originalWidth + originalWidth % 2;
}

// ../lib/prod/src/helpers/events.js
function preventScrollByWheelClick(el) {
  if (!isChrome()) {
    return;
  }
  el.addEventListener("mousedown", (e) => {
    if (e.button === 1) {
      e.preventDefault();
      return false;
    }
    return void 0;
  });
}

// ../lib/prod/src/gui/mouse-event-handler.js
var Delay;
(function(Delay2) {
  Delay2[Delay2["ResetClick"] = 500] = "ResetClick";
  Delay2[Delay2["LongTap"] = 240] = "LongTap";
  Delay2[Delay2["PreventFiresTouchEvents"] = 500] = "PreventFiresTouchEvents";
})(Delay || (Delay = {}));
var Constants5;
(function(Constants14) {
  Constants14[Constants14["CancelClickManhattanDistance"] = 5] = "CancelClickManhattanDistance";
  Constants14[Constants14["CancelTapManhattanDistance"] = 5] = "CancelTapManhattanDistance";
  Constants14[Constants14["DoubleClickManhattanDistance"] = 5] = "DoubleClickManhattanDistance";
  Constants14[Constants14["DoubleTapManhattanDistance"] = 30] = "DoubleTapManhattanDistance";
})(Constants5 || (Constants5 = {}));
var MouseEventHandler = class {
  constructor(target, handler, options) {
    this._clickCount = 0;
    this._clickTimeoutId = null;
    this._clickPosition = { x: Number.NEGATIVE_INFINITY, y: Number.POSITIVE_INFINITY };
    this._tapCount = 0;
    this._tapTimeoutId = null;
    this._tapPosition = { x: Number.NEGATIVE_INFINITY, y: Number.POSITIVE_INFINITY };
    this._longTapTimeoutId = null;
    this._longTapActive = false;
    this._mouseMoveStartPosition = null;
    this._touchMoveStartPosition = null;
    this._touchMoveExceededManhattanDistance = false;
    this._cancelClick = false;
    this._cancelTap = false;
    this._unsubscribeOutsideMouseEvents = null;
    this._unsubscribeOutsideTouchEvents = null;
    this._unsubscribeMobileSafariEvents = null;
    this._unsubscribeMousemove = null;
    this._unsubscribeRootMouseEvents = null;
    this._unsubscribeRootTouchEvents = null;
    this._startPinchMiddlePoint = null;
    this._startPinchDistance = 0;
    this._pinchPrevented = false;
    this._preventTouchDragProcess = false;
    this._mousePressed = false;
    this._lastTouchEventTimeStamp = 0;
    this._activeTouchId = null;
    this._acceptMouseLeave = !isIOS();
    this._onFirefoxOutsideMouseUp = (mouseUpEvent) => {
      this._mouseUpHandler(mouseUpEvent);
    };
    this._onMobileSafariDoubleClick = (dblClickEvent) => {
      if (this._firesTouchEvents(dblClickEvent)) {
        const compatEvent = this._makeCompatEvent(dblClickEvent);
        ++this._tapCount;
        if (this._tapTimeoutId && this._tapCount > 1) {
          const { manhattanDistance } = this._touchMouseMoveWithDownInfo(getPosition(dblClickEvent), this._tapPosition);
          if (manhattanDistance < 30 && !this._cancelTap) {
            this._processTouchEvent(compatEvent, this._handler.doubleTapEvent);
          }
          this._resetTapTimeout();
        }
      } else {
        const compatEvent = this._makeCompatEvent(dblClickEvent);
        ++this._clickCount;
        if (this._clickTimeoutId && this._clickCount > 1) {
          const { manhattanDistance } = this._touchMouseMoveWithDownInfo(getPosition(dblClickEvent), this._clickPosition);
          if (manhattanDistance < 5 && !this._cancelClick) {
            this._processMouseEvent(compatEvent, this._handler.mouseDoubleClickEvent);
          }
          this._resetClickTimeout();
        }
      }
    };
    this._target = target;
    this._handler = handler;
    this._options = options;
    this._init();
  }
  destroy() {
    if (this._unsubscribeOutsideMouseEvents !== null) {
      this._unsubscribeOutsideMouseEvents();
      this._unsubscribeOutsideMouseEvents = null;
    }
    if (this._unsubscribeOutsideTouchEvents !== null) {
      this._unsubscribeOutsideTouchEvents();
      this._unsubscribeOutsideTouchEvents = null;
    }
    if (this._unsubscribeMousemove !== null) {
      this._unsubscribeMousemove();
      this._unsubscribeMousemove = null;
    }
    if (this._unsubscribeRootMouseEvents !== null) {
      this._unsubscribeRootMouseEvents();
      this._unsubscribeRootMouseEvents = null;
    }
    if (this._unsubscribeRootTouchEvents !== null) {
      this._unsubscribeRootTouchEvents();
      this._unsubscribeRootTouchEvents = null;
    }
    if (this._unsubscribeMobileSafariEvents !== null) {
      this._unsubscribeMobileSafariEvents();
      this._unsubscribeMobileSafariEvents = null;
    }
    this._clearLongTapTimeout();
    this._resetClickTimeout();
  }
  _mouseEnterHandler(enterEvent) {
    if (this._unsubscribeMousemove) {
      this._unsubscribeMousemove();
    }
    const boundMouseMoveHandler = this._mouseMoveHandler.bind(this);
    this._unsubscribeMousemove = () => {
      this._target.removeEventListener("mousemove", boundMouseMoveHandler);
    };
    this._target.addEventListener("mousemove", boundMouseMoveHandler);
    if (this._firesTouchEvents(enterEvent)) {
      return;
    }
    const compatEvent = this._makeCompatEvent(enterEvent);
    this._processMouseEvent(compatEvent, this._handler.mouseEnterEvent);
    this._acceptMouseLeave = true;
  }
  _resetClickTimeout() {
    if (this._clickTimeoutId !== null) {
      clearTimeout(this._clickTimeoutId);
    }
    this._clickCount = 0;
    this._clickTimeoutId = null;
    this._clickPosition = { x: Number.NEGATIVE_INFINITY, y: Number.POSITIVE_INFINITY };
  }
  _resetTapTimeout() {
    if (this._tapTimeoutId !== null) {
      clearTimeout(this._tapTimeoutId);
    }
    this._tapCount = 0;
    this._tapTimeoutId = null;
    this._tapPosition = { x: Number.NEGATIVE_INFINITY, y: Number.POSITIVE_INFINITY };
  }
  _mouseMoveHandler(moveEvent) {
    if (this._mousePressed || this._touchMoveStartPosition !== null) {
      return;
    }
    if (this._firesTouchEvents(moveEvent)) {
      return;
    }
    const compatEvent = this._makeCompatEvent(moveEvent);
    this._processMouseEvent(compatEvent, this._handler.mouseMoveEvent);
    this._acceptMouseLeave = true;
  }
  _touchMoveHandler(moveEvent) {
    const touch = touchWithId(moveEvent.changedTouches, ensureNotNull(this._activeTouchId));
    if (touch === null) {
      return;
    }
    this._lastTouchEventTimeStamp = eventTimeStamp(moveEvent);
    if (this._startPinchMiddlePoint !== null) {
      return;
    }
    if (this._preventTouchDragProcess) {
      return;
    }
    this._pinchPrevented = true;
    const moveInfo = this._touchMouseMoveWithDownInfo(getPosition(touch), ensureNotNull(this._touchMoveStartPosition));
    const { xOffset, yOffset, manhattanDistance } = moveInfo;
    if (!this._touchMoveExceededManhattanDistance && manhattanDistance < 5) {
      return;
    }
    if (!this._touchMoveExceededManhattanDistance) {
      const correctedXOffset = xOffset * 0.5;
      const isVertDrag = yOffset >= correctedXOffset && !this._options.treatVertTouchDragAsPageScroll();
      const isHorzDrag = correctedXOffset > yOffset && !this._options.treatHorzTouchDragAsPageScroll();
      if (!isVertDrag && !isHorzDrag) {
        this._preventTouchDragProcess = true;
      }
      this._touchMoveExceededManhattanDistance = true;
      this._cancelTap = true;
      this._clearLongTapTimeout();
      this._resetTapTimeout();
    }
    if (!this._preventTouchDragProcess) {
      const compatEvent = this._makeCompatEvent(moveEvent, touch);
      this._processTouchEvent(compatEvent, this._handler.touchMoveEvent);
      preventDefault(moveEvent);
    }
  }
  _mouseMoveWithDownHandler(moveEvent) {
    if (moveEvent.button !== 0) {
      return;
    }
    const moveInfo = this._touchMouseMoveWithDownInfo(getPosition(moveEvent), ensureNotNull(this._mouseMoveStartPosition));
    const { manhattanDistance } = moveInfo;
    if (manhattanDistance >= 5) {
      this._cancelClick = true;
      this._resetClickTimeout();
    }
    if (this._cancelClick) {
      const compatEvent = this._makeCompatEvent(moveEvent);
      this._processMouseEvent(compatEvent, this._handler.pressedMouseMoveEvent);
    }
  }
  _touchMouseMoveWithDownInfo(currentPosition, startPosition) {
    const xOffset = Math.abs(startPosition.x - currentPosition.x);
    const yOffset = Math.abs(startPosition.y - currentPosition.y);
    const manhattanDistance = xOffset + yOffset;
    return {
      xOffset,
      yOffset,
      manhattanDistance
    };
  }
  // eslint-disable-next-line complexity
  _touchEndHandler(touchEndEvent) {
    let touch = touchWithId(touchEndEvent.changedTouches, ensureNotNull(this._activeTouchId));
    if (touch === null && touchEndEvent.touches.length === 0) {
      touch = touchEndEvent.changedTouches[0];
    }
    if (touch === null) {
      return;
    }
    this._activeTouchId = null;
    this._lastTouchEventTimeStamp = eventTimeStamp(touchEndEvent);
    this._clearLongTapTimeout();
    this._touchMoveStartPosition = null;
    if (this._unsubscribeRootTouchEvents) {
      this._unsubscribeRootTouchEvents();
      this._unsubscribeRootTouchEvents = null;
    }
    const compatEvent = this._makeCompatEvent(touchEndEvent, touch);
    this._processTouchEvent(compatEvent, this._handler.touchEndEvent);
    ++this._tapCount;
    if (this._tapTimeoutId && this._tapCount > 1) {
      const { manhattanDistance } = this._touchMouseMoveWithDownInfo(getPosition(touch), this._tapPosition);
      if (manhattanDistance < 30 && !this._cancelTap) {
        this._processTouchEvent(compatEvent, this._handler.doubleTapEvent);
      }
      this._resetTapTimeout();
    } else {
      if (!this._cancelTap) {
        this._processTouchEvent(compatEvent, this._handler.tapEvent);
        if (this._handler.tapEvent) {
          preventDefault(touchEndEvent);
        }
      }
    }
    if (this._tapCount === 0) {
      preventDefault(touchEndEvent);
    }
    if (touchEndEvent.touches.length === 0) {
      if (this._longTapActive) {
        this._longTapActive = false;
        preventDefault(touchEndEvent);
      }
    }
  }
  _mouseUpHandler(mouseUpEvent) {
    if (mouseUpEvent.button !== 0) {
      return;
    }
    const compatEvent = this._makeCompatEvent(mouseUpEvent);
    this._mouseMoveStartPosition = null;
    this._mousePressed = false;
    if (this._unsubscribeRootMouseEvents) {
      this._unsubscribeRootMouseEvents();
      this._unsubscribeRootMouseEvents = null;
    }
    if (isFF()) {
      const rootElement = this._target.ownerDocument.documentElement;
      rootElement.removeEventListener("mouseleave", this._onFirefoxOutsideMouseUp);
    }
    if (this._firesTouchEvents(mouseUpEvent)) {
      return;
    }
    this._processMouseEvent(compatEvent, this._handler.mouseUpEvent);
    ++this._clickCount;
    if (this._clickTimeoutId && this._clickCount > 1) {
      const { manhattanDistance } = this._touchMouseMoveWithDownInfo(getPosition(mouseUpEvent), this._clickPosition);
      if (manhattanDistance < 5 && !this._cancelClick) {
        this._processMouseEvent(compatEvent, this._handler.mouseDoubleClickEvent);
      }
      this._resetClickTimeout();
    } else {
      if (!this._cancelClick) {
        this._processMouseEvent(compatEvent, this._handler.mouseClickEvent);
      }
    }
  }
  _clearLongTapTimeout() {
    if (this._longTapTimeoutId === null) {
      return;
    }
    clearTimeout(this._longTapTimeoutId);
    this._longTapTimeoutId = null;
  }
  _touchStartHandler(downEvent) {
    if (this._activeTouchId !== null) {
      return;
    }
    const touch = downEvent.changedTouches[0];
    this._activeTouchId = touch.identifier;
    this._lastTouchEventTimeStamp = eventTimeStamp(downEvent);
    const rootElement = this._target.ownerDocument.documentElement;
    this._cancelTap = false;
    this._touchMoveExceededManhattanDistance = false;
    this._preventTouchDragProcess = false;
    this._touchMoveStartPosition = getPosition(touch);
    if (this._unsubscribeRootTouchEvents) {
      this._unsubscribeRootTouchEvents();
      this._unsubscribeRootTouchEvents = null;
    }
    {
      const boundTouchMoveWithDownHandler = this._touchMoveHandler.bind(this);
      const boundTouchEndHandler = this._touchEndHandler.bind(this);
      this._unsubscribeRootTouchEvents = () => {
        rootElement.removeEventListener("touchmove", boundTouchMoveWithDownHandler);
        rootElement.removeEventListener("touchend", boundTouchEndHandler);
      };
      rootElement.addEventListener("touchmove", boundTouchMoveWithDownHandler, { passive: false });
      rootElement.addEventListener("touchend", boundTouchEndHandler, { passive: false });
      this._clearLongTapTimeout();
      this._longTapTimeoutId = setTimeout(
        this._longTapHandler.bind(this, downEvent),
        240
        /* Delay.LongTap */
      );
    }
    const compatEvent = this._makeCompatEvent(downEvent, touch);
    this._processTouchEvent(compatEvent, this._handler.touchStartEvent);
    if (!this._tapTimeoutId) {
      this._tapCount = 0;
      this._tapTimeoutId = setTimeout(
        this._resetTapTimeout.bind(this),
        500
        /* Delay.ResetClick */
      );
      this._tapPosition = getPosition(touch);
    }
  }
  _mouseDownHandler(downEvent) {
    if (downEvent.button !== 0) {
      return;
    }
    const rootElement = this._target.ownerDocument.documentElement;
    if (isFF()) {
      rootElement.addEventListener("mouseleave", this._onFirefoxOutsideMouseUp);
    }
    this._cancelClick = false;
    this._mouseMoveStartPosition = getPosition(downEvent);
    if (this._unsubscribeRootMouseEvents) {
      this._unsubscribeRootMouseEvents();
      this._unsubscribeRootMouseEvents = null;
    }
    {
      const boundMouseMoveWithDownHandler = this._mouseMoveWithDownHandler.bind(this);
      const boundMouseUpHandler = this._mouseUpHandler.bind(this);
      this._unsubscribeRootMouseEvents = () => {
        rootElement.removeEventListener("mousemove", boundMouseMoveWithDownHandler);
        rootElement.removeEventListener("mouseup", boundMouseUpHandler);
      };
      rootElement.addEventListener("mousemove", boundMouseMoveWithDownHandler);
      rootElement.addEventListener("mouseup", boundMouseUpHandler);
    }
    this._mousePressed = true;
    if (this._firesTouchEvents(downEvent)) {
      return;
    }
    const compatEvent = this._makeCompatEvent(downEvent);
    this._processMouseEvent(compatEvent, this._handler.mouseDownEvent);
    if (!this._clickTimeoutId) {
      this._clickCount = 0;
      this._clickTimeoutId = setTimeout(
        this._resetClickTimeout.bind(this),
        500
        /* Delay.ResetClick */
      );
      this._clickPosition = getPosition(downEvent);
    }
  }
  _init() {
    this._target.addEventListener("mouseenter", this._mouseEnterHandler.bind(this));
    this._target.addEventListener("touchcancel", this._clearLongTapTimeout.bind(this));
    {
      const doc = this._target.ownerDocument;
      const outsideHandler = (event) => {
        if (!this._handler.mouseDownOutsideEvent) {
          return;
        }
        if (event.composed && this._target.contains(event.composedPath()[0])) {
          return;
        }
        if (event.target && this._target.contains(event.target)) {
          return;
        }
        this._handler.mouseDownOutsideEvent();
      };
      this._unsubscribeOutsideTouchEvents = () => {
        doc.removeEventListener("touchstart", outsideHandler);
      };
      this._unsubscribeOutsideMouseEvents = () => {
        doc.removeEventListener("mousedown", outsideHandler);
      };
      doc.addEventListener("mousedown", outsideHandler);
      doc.addEventListener("touchstart", outsideHandler, { passive: true });
    }
    if (isIOS()) {
      this._unsubscribeMobileSafariEvents = () => {
        this._target.removeEventListener("dblclick", this._onMobileSafariDoubleClick);
      };
      this._target.addEventListener("dblclick", this._onMobileSafariDoubleClick);
    }
    this._target.addEventListener("mouseleave", this._mouseLeaveHandler.bind(this));
    this._target.addEventListener("touchstart", this._touchStartHandler.bind(this), { passive: true });
    preventScrollByWheelClick(this._target);
    this._target.addEventListener("mousedown", this._mouseDownHandler.bind(this));
    this._initPinch();
    this._target.addEventListener("touchmove", () => {
    }, { passive: false });
  }
  _initPinch() {
    if (this._handler.pinchStartEvent === void 0 && this._handler.pinchEvent === void 0 && this._handler.pinchEndEvent === void 0) {
      return;
    }
    this._target.addEventListener("touchstart", (event) => this._checkPinchState(event.touches), { passive: true });
    this._target.addEventListener("touchmove", (event) => {
      if (event.touches.length !== 2 || this._startPinchMiddlePoint === null) {
        return;
      }
      if (this._handler.pinchEvent !== void 0) {
        const currentDistance = getDistance(event.touches[0], event.touches[1]);
        const scale = currentDistance / this._startPinchDistance;
        this._handler.pinchEvent(this._startPinchMiddlePoint, scale);
        preventDefault(event);
      }
    }, { passive: false });
    this._target.addEventListener("touchend", (event) => {
      this._checkPinchState(event.touches);
    });
  }
  _checkPinchState(touches) {
    if (touches.length === 1) {
      this._pinchPrevented = false;
    }
    if (touches.length !== 2 || this._pinchPrevented || this._longTapActive) {
      this._stopPinch();
    } else {
      this._startPinch(touches);
    }
  }
  _startPinch(touches) {
    const box = getBoundingClientRect(this._target);
    this._startPinchMiddlePoint = {
      x: (touches[0].clientX - box.left + (touches[1].clientX - box.left)) / 2,
      y: (touches[0].clientY - box.top + (touches[1].clientY - box.top)) / 2
    };
    this._startPinchDistance = getDistance(touches[0], touches[1]);
    if (this._handler.pinchStartEvent !== void 0) {
      this._handler.pinchStartEvent();
    }
    this._clearLongTapTimeout();
  }
  _stopPinch() {
    if (this._startPinchMiddlePoint === null) {
      return;
    }
    this._startPinchMiddlePoint = null;
    if (this._handler.pinchEndEvent !== void 0) {
      this._handler.pinchEndEvent();
    }
  }
  _mouseLeaveHandler(event) {
    if (this._unsubscribeMousemove) {
      this._unsubscribeMousemove();
    }
    if (this._firesTouchEvents(event)) {
      return;
    }
    if (!this._acceptMouseLeave) {
      return;
    }
    const compatEvent = this._makeCompatEvent(event);
    this._processMouseEvent(compatEvent, this._handler.mouseLeaveEvent);
    this._acceptMouseLeave = !isIOS();
  }
  _longTapHandler(event) {
    const touch = touchWithId(event.touches, ensureNotNull(this._activeTouchId));
    if (touch === null) {
      return;
    }
    const compatEvent = this._makeCompatEvent(event, touch);
    this._processTouchEvent(compatEvent, this._handler.longTapEvent);
    this._cancelTap = true;
    this._longTapActive = true;
  }
  _firesTouchEvents(e) {
    if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents !== void 0) {
      return e.sourceCapabilities.firesTouchEvents;
    }
    return eventTimeStamp(e) < this._lastTouchEventTimeStamp + 500;
  }
  _processTouchEvent(event, callback) {
    if (callback) {
      callback.call(this._handler, event);
    }
  }
  _processMouseEvent(event, callback) {
    if (!callback) {
      return;
    }
    callback.call(this._handler, event);
  }
  _makeCompatEvent(event, touch) {
    const eventLike = touch || event;
    const box = this._target.getBoundingClientRect() || { left: 0, top: 0 };
    return {
      clientX: eventLike.clientX,
      clientY: eventLike.clientY,
      pageX: eventLike.pageX,
      pageY: eventLike.pageY,
      screenX: eventLike.screenX,
      screenY: eventLike.screenY,
      localX: eventLike.clientX - box.left,
      localY: eventLike.clientY - box.top,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
      shiftKey: event.shiftKey,
      metaKey: event.metaKey,
      isTouch: !event.type.startsWith("mouse") && event.type !== "contextmenu" && event.type !== "click",
      srcType: event.type,
      target: eventLike.target,
      view: event.view,
      preventDefault: () => {
        if (event.type !== "touchstart") {
          preventDefault(event);
        }
      }
    };
  }
};
function getBoundingClientRect(element) {
  return element.getBoundingClientRect() || { left: 0, top: 0 };
}
function getDistance(p1, p2) {
  const xDiff = p1.clientX - p2.clientX;
  const yDiff = p1.clientY - p2.clientY;
  return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}
function preventDefault(event) {
  if (event.cancelable) {
    event.preventDefault();
  }
}
function getPosition(eventLike) {
  return {
    x: eventLike.pageX,
    y: eventLike.pageY
  };
}
function eventTimeStamp(e) {
  return e.timeStamp || performance.now();
}
function touchWithId(touches, id) {
  for (let i = 0; i < touches.length; ++i) {
    if (touches[i].identifier === id) {
      return touches[i];
    }
  }
  return null;
}

// ../lib/prod/src/gui/pane-separator.js
var SeparatorConstants;
(function(SeparatorConstants2) {
  SeparatorConstants2[SeparatorConstants2["SeparatorHeight"] = 1] = "SeparatorHeight";
  SeparatorConstants2[SeparatorConstants2["MinPaneHeight"] = 30] = "MinPaneHeight";
})(SeparatorConstants || (SeparatorConstants = {}));
var PaneSeparator = class {
  constructor(chartWidget, topPaneIndex, bottomPaneIndex) {
    this._handle = null;
    this._mouseEventHandler = null;
    this._resizeEnabled = true;
    this._resizeInfo = null;
    this._chartWidget = chartWidget;
    this._topPane = chartWidget.paneWidgets()[topPaneIndex];
    this._bottomPane = chartWidget.paneWidgets()[bottomPaneIndex];
    this._rowElement = document.createElement("tr");
    this._rowElement.style.height = "1px";
    this._cell = document.createElement("td");
    this._cell.style.position = "relative";
    this._cell.style.padding = "0";
    this._cell.style.margin = "0";
    this._cell.setAttribute("colspan", "3");
    this._updateBorderColor();
    this._rowElement.appendChild(this._cell);
    this._resizeEnabled = this._chartWidget.options()["layout"].panes.enableResize;
    if (!this._resizeEnabled) {
      this._handle = null;
      this._mouseEventHandler = null;
    } else {
      this._addResizableHandle();
    }
  }
  destroy() {
    if (this._mouseEventHandler !== null) {
      this._mouseEventHandler.destroy();
    }
  }
  getElement() {
    return this._rowElement;
  }
  getSize() {
    return size({
      width: this._topPane.getSize().width,
      height: 1
    });
  }
  getBitmapSize() {
    return size({
      width: this._topPane.getBitmapSize().width,
      height: 1 * window.devicePixelRatio
    });
  }
  drawBitmap(ctx, x, y) {
    const bitmapSize = this.getBitmapSize();
    ctx.fillStyle = this._chartWidget.options()["layout"].panes.separatorColor;
    ctx.fillRect(x, y, bitmapSize.width, bitmapSize.height);
  }
  update() {
    this._updateBorderColor();
    if (this._chartWidget.options()["layout"].panes.enableResize !== this._resizeEnabled) {
      this._resizeEnabled = this._chartWidget.options()["layout"].panes.enableResize;
      if (this._resizeEnabled) {
        this._addResizableHandle();
      } else {
        if (this._handle !== null) {
          this._cell.removeChild(this._handle.backgroundElement);
          this._cell.removeChild(this._handle.element);
          this._handle = null;
        }
        if (this._mouseEventHandler !== null) {
          this._mouseEventHandler.destroy();
          this._mouseEventHandler = null;
        }
      }
    }
  }
  _addResizableHandle() {
    const backgroundElement = document.createElement("div");
    const bgStyle = backgroundElement.style;
    bgStyle.position = "fixed";
    bgStyle.display = "none";
    bgStyle.zIndex = "49";
    bgStyle.top = "0";
    bgStyle.left = "0";
    bgStyle.width = "100%";
    bgStyle.height = "100%";
    bgStyle.cursor = "row-resize";
    this._cell.appendChild(backgroundElement);
    const element = document.createElement("div");
    const style = element.style;
    style.position = "absolute";
    style.zIndex = "50";
    style.top = "-4px";
    style.height = "9px";
    style.width = "100%";
    style.backgroundColor = "";
    style.cursor = "row-resize";
    this._cell.appendChild(element);
    const handlers = {
      mouseEnterEvent: this._mouseOverEvent.bind(this),
      mouseLeaveEvent: this._mouseLeaveEvent.bind(this),
      mouseDownEvent: this._mouseDownEvent.bind(this),
      touchStartEvent: this._mouseDownEvent.bind(this),
      pressedMouseMoveEvent: this._pressedMouseMoveEvent.bind(this),
      touchMoveEvent: this._pressedMouseMoveEvent.bind(this),
      mouseUpEvent: this._mouseUpEvent.bind(this),
      touchEndEvent: this._mouseUpEvent.bind(this)
    };
    this._mouseEventHandler = new MouseEventHandler(element, handlers, {
      treatVertTouchDragAsPageScroll: () => false,
      treatHorzTouchDragAsPageScroll: () => true
    });
    this._handle = { element, backgroundElement };
  }
  _updateBorderColor() {
    this._cell.style.background = this._chartWidget.options()["layout"].panes.separatorColor;
  }
  _mouseOverEvent(event) {
    if (this._handle !== null) {
      this._handle.element.style.backgroundColor = this._chartWidget.options()["layout"].panes.separatorHoverColor;
    }
  }
  _mouseLeaveEvent(event) {
    if (this._handle !== null && this._resizeInfo === null) {
      this._handle.element.style.backgroundColor = "";
    }
  }
  _mouseDownEvent(event) {
    if (this._handle === null) {
      return;
    }
    const totalStretch = this._topPane.state().stretchFactor() + this._bottomPane.state().stretchFactor();
    const totalHeight = this._topPane.getSize().height + this._bottomPane.getSize().height;
    const pixelStretchFactor = totalStretch / totalHeight;
    const minPaneStretch = 30 * pixelStretchFactor;
    if (totalStretch <= minPaneStretch * 2) {
      return;
    }
    this._resizeInfo = {
      startY: event.pageY,
      prevStretchTopPane: this._topPane.state().stretchFactor(),
      maxPaneStretch: totalStretch - minPaneStretch,
      totalStretch,
      pixelStretchFactor,
      minPaneStretch
    };
    this._handle.backgroundElement.style.display = "block";
  }
  _pressedMouseMoveEvent(event) {
    const resizeInfo = this._resizeInfo;
    if (resizeInfo === null) {
      return;
    }
    const deltaY = event.pageY - resizeInfo.startY;
    const deltaStretchFactor = deltaY * resizeInfo.pixelStretchFactor;
    const upperPaneNewStretch = clamp(resizeInfo.prevStretchTopPane + deltaStretchFactor, resizeInfo.minPaneStretch, resizeInfo.maxPaneStretch);
    this._topPane.state().setStretchFactor(upperPaneNewStretch);
    this._bottomPane.state().setStretchFactor(resizeInfo.totalStretch - upperPaneNewStretch);
    this._chartWidget.model().fullUpdate();
  }
  _mouseUpEvent(event) {
    if (this._resizeInfo === null || this._handle === null) {
      return;
    }
    this._resizeInfo = null;
    this._handle.backgroundElement.style.display = "none";
  }
};

// ../lib/prod/src/model/kinetic-animation.js
var Constants6;
(function(Constants14) {
  Constants14[Constants14["MaxStartDelay"] = 50] = "MaxStartDelay";
  Constants14[Constants14["EpsilonDistance"] = 1] = "EpsilonDistance";
})(Constants6 || (Constants6 = {}));
function distanceBetweenPoints(pos1, pos2) {
  return pos1.position - pos2.position;
}
function speedPxPerMSec(pos1, pos2, maxSpeed) {
  const speed = (pos1.position - pos2.position) / (pos1.time - pos2.time);
  return Math.sign(speed) * Math.min(Math.abs(speed), maxSpeed);
}
function durationMSec(speed, dumpingCoeff) {
  const lnDumpingCoeff = Math.log(dumpingCoeff);
  return Math.log(1 * lnDumpingCoeff / -speed) / lnDumpingCoeff;
}
var KineticAnimation = class {
  constructor(minSpeed, maxSpeed, dumpingCoeff, minMove) {
    this._position1 = null;
    this._position2 = null;
    this._position3 = null;
    this._position4 = null;
    this._animationStartPosition = null;
    this._durationMsecs = 0;
    this._speedPxPerMsec = 0;
    this._minSpeed = minSpeed;
    this._maxSpeed = maxSpeed;
    this._dumpingCoeff = dumpingCoeff;
    this._minMove = minMove;
  }
  addPosition(position, time) {
    if (this._position1 !== null) {
      if (this._position1.time === time) {
        this._position1.position = position;
        return;
      }
      if (Math.abs(this._position1.position - position) < this._minMove) {
        return;
      }
    }
    this._position4 = this._position3;
    this._position3 = this._position2;
    this._position2 = this._position1;
    this._position1 = { time, position };
  }
  start(position, time) {
    if (this._position1 === null || this._position2 === null) {
      return;
    }
    if (time - this._position1.time > 50) {
      return;
    }
    let totalDistance = 0;
    const speed1 = speedPxPerMSec(this._position1, this._position2, this._maxSpeed);
    const distance1 = distanceBetweenPoints(this._position1, this._position2);
    const speedItems = [speed1];
    const distanceItems = [distance1];
    totalDistance += distance1;
    if (this._position3 !== null) {
      const speed2 = speedPxPerMSec(this._position2, this._position3, this._maxSpeed);
      if (Math.sign(speed2) === Math.sign(speed1)) {
        const distance2 = distanceBetweenPoints(this._position2, this._position3);
        speedItems.push(speed2);
        distanceItems.push(distance2);
        totalDistance += distance2;
        if (this._position4 !== null) {
          const speed3 = speedPxPerMSec(this._position3, this._position4, this._maxSpeed);
          if (Math.sign(speed3) === Math.sign(speed1)) {
            const distance3 = distanceBetweenPoints(this._position3, this._position4);
            speedItems.push(speed3);
            distanceItems.push(distance3);
            totalDistance += distance3;
          }
        }
      }
    }
    let resultSpeed = 0;
    for (let i = 0; i < speedItems.length; ++i) {
      resultSpeed += distanceItems[i] / totalDistance * speedItems[i];
    }
    if (Math.abs(resultSpeed) < this._minSpeed) {
      return;
    }
    this._animationStartPosition = { position, time };
    this._speedPxPerMsec = resultSpeed;
    this._durationMsecs = durationMSec(Math.abs(resultSpeed), this._dumpingCoeff);
  }
  getPosition(time) {
    const startPosition = ensureNotNull(this._animationStartPosition);
    const durationMsecs = time - startPosition.time;
    return startPosition.position + this._speedPxPerMsec * (Math.pow(this._dumpingCoeff, durationMsecs) - 1) / Math.log(this._dumpingCoeff);
  }
  finished(time) {
    return this._animationStartPosition === null || this._progressDuration(time) === this._durationMsecs;
  }
  _progressDuration(time) {
    const startPosition = ensureNotNull(this._animationStartPosition);
    const progress = time - startPosition.time;
    return Math.min(progress, this._durationMsecs);
  }
};

// ../lib/prod/src/gui/attribution-logo-widget.js
var svg = `<svg xmlns="http://www.w3.org/2000/svg" width="35" height="19" fill="none"><g fill-rule="evenodd" clip-path="url(#a)" clip-rule="evenodd"><path fill="var(--stroke)" d="M2 0H0v10h6v9h21.4l.5-1.3 6-15 1-2.7H23.7l-.5 1.3-.2.6a5 5 0 0 0-7-.9V0H2Zm20 17h4l5.2-13 .8-2h-7l-1 2.5-.2.5-1.5 3.8-.3.7V17Zm-.8-10a3 3 0 0 0 .7-2.7A3 3 0 1 0 16.8 7h4.4ZM14 7V2H2v6h6v9h4V7h2Z"/><path fill="var(--fill)" d="M14 2H2v6h6v9h6V2Zm12 15h-7l6-15h7l-6 15Zm-7-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></g><defs><clipPath id="a"><path fill="var(--stroke)" d="M0 0h35v19H0z"/></clipPath></defs></svg>`;
var css = `a#tv-attr-logo{--fill:#131722;--stroke:#fff;position:absolute;left:10px;bottom:10px;height:19px;width:35px;margin:0;padding:0;border:0;z-index:3;}a#tv-attr-logo[data-dark]{--fill:#D1D4DC;--stroke:#131722;}`;
var AttributionLogoWidget = class {
  constructor(container, chart) {
    this._element = void 0;
    this._cssElement = void 0;
    this._theme = void 0;
    this._visible = false;
    this._container = container;
    this._chart = chart;
    this._render();
  }
  update() {
    this._render();
  }
  removeElement() {
    if (this._element) {
      this._container.removeChild(this._element);
    }
    if (this._cssElement) {
      this._container.removeChild(this._cssElement);
    }
    this._element = void 0;
    this._cssElement = void 0;
  }
  _shouldUpdate() {
    return this._visible !== this._shouldBeVisible() || this._theme !== this._themeToUse();
  }
  _themeToUse() {
    return this._chart.model().colorParser().colorStringToGrayscale(this._chart.options()["layout"].textColor) > 160 ? "dark" : "light";
  }
  _shouldBeVisible() {
    return this._chart.options()["layout"].attributionLogo;
  }
  _getUTMSource() {
    const url = new URL(location.href);
    if (!url.hostname) {
      return "";
    }
    return "&utm_source=" + url.hostname + url.pathname;
  }
  _render() {
    if (!this._shouldUpdate()) {
      return;
    }
    this.removeElement();
    this._visible = this._shouldBeVisible();
    if (this._visible) {
      this._theme = this._themeToUse();
      this._cssElement = document.createElement("style");
      this._cssElement.innerText = css;
      this._element = document.createElement("a");
      this._element.href = `https://www.tradingview.com/?utm_medium=lwc-link&utm_campaign=lwc-chart${this._getUTMSource()}`;
      this._element.title = "Charting by TradingView";
      this._element.id = "tv-attr-logo";
      this._element.target = "_blank";
      this._element.innerHTML = svg;
      this._element.toggleAttribute("data-dark", this._theme === "dark");
      this._container.appendChild(this._cssElement);
      this._container.appendChild(this._element);
    }
  }
};

// ../lib/prod/src/gui/canvas-utils.js
function createBoundCanvas(parentElement, size3) {
  const doc = ensureNotNull(parentElement.ownerDocument);
  const canvas = doc.createElement("canvas");
  parentElement.appendChild(canvas);
  const binding = bindTo(canvas, {
    type: "device-pixel-content-box",
    options: {
      allowResizeObserver: true
    },
    transform: (bitmapSize, canvasElementClientSize) => ({
      width: Math.max(bitmapSize.width, canvasElementClientSize.width),
      height: Math.max(bitmapSize.height, canvasElementClientSize.height)
    })
  });
  binding.resizeCanvasElement(size3);
  return binding;
}
function releaseCanvas(canvas) {
  canvas.width = 1;
  canvas.height = 1;
  canvas.getContext("2d")?.clearRect(0, 0, 1, 1);
}

// ../lib/prod/src/gui/draw-functions.js
function drawBackground(renderer, target, isHovered, hitTestData) {
  if (renderer.drawBackground) {
    renderer.drawBackground(target, isHovered, hitTestData);
  }
}
function drawForeground(renderer, target, isHovered, hitTestData) {
  renderer.draw(target, isHovered, hitTestData);
}
function drawSourceViews(paneViewsGetter, drawRendererFn, source, pane) {
  const views = paneViewsGetter(source, pane);
  for (const view of views) {
    const renderer = view.renderer(pane);
    if (renderer !== null) {
      drawRendererFn(renderer);
    }
  }
}

// ../lib/prod/src/gui/price-axis-widget.js
var CursorType;
(function(CursorType3) {
  CursorType3[CursorType3["Default"] = 0] = "Default";
  CursorType3[CursorType3["NsResize"] = 1] = "NsResize";
})(CursorType || (CursorType = {}));
var Constants7;
(function(Constants14) {
  Constants14[Constants14["DefaultOptimalWidth"] = 34] = "DefaultOptimalWidth";
})(Constants7 || (Constants7 = {}));
(function(Constants14) {
  Constants14[Constants14["LabelOffset"] = 5] = "LabelOffset";
})(Constants7 || (Constants7 = {}));
function hasPriceScale(source) {
  return source.priceScale !== void 0;
}
function buildPriceAxisViewsGetter(zOrder, priceScaleId) {
  return (source) => {
    if (!hasPriceScale(source)) {
      return [];
    }
    const psId = source.priceScale()?.id() ?? "";
    if (psId !== priceScaleId) {
      return [];
    }
    return source.pricePaneViews?.(zOrder) ?? [];
  };
}
function recalculateOverlapping(views, direction, scaleHeight, rendererOptions) {
  if (!views.length) {
    return;
  }
  let currentGroupStart = 0;
  const initLabelHeight = views[0].height(rendererOptions, true);
  let spaceBeforeCurrentGroup = direction === 1 ? scaleHeight / 2 - (views[0].getFixedCoordinate() - initLabelHeight / 2) : views[0].getFixedCoordinate() - initLabelHeight / 2 - scaleHeight / 2;
  spaceBeforeCurrentGroup = Math.max(0, spaceBeforeCurrentGroup);
  for (let i = 1; i < views.length; i++) {
    const view = views[i];
    const prev = views[i - 1];
    const height = prev.height(rendererOptions, false);
    const coordinate = view.getFixedCoordinate();
    const prevFixedCoordinate = prev.getFixedCoordinate();
    const overlap = direction === 1 ? coordinate > prevFixedCoordinate - height : coordinate < prevFixedCoordinate + height;
    if (overlap) {
      const fixedCoordinate = prevFixedCoordinate - height * direction;
      view.setFixedCoordinate(fixedCoordinate);
      const edgePoint = fixedCoordinate - direction * height / 2;
      const outOfViewport = direction === 1 ? edgePoint < 0 : edgePoint > scaleHeight;
      if (outOfViewport && spaceBeforeCurrentGroup > 0) {
        const desiredGroupShift = direction === 1 ? -1 - edgePoint : edgePoint - scaleHeight;
        const possibleShift = Math.min(desiredGroupShift, spaceBeforeCurrentGroup);
        for (let k = currentGroupStart; k < views.length; k++) {
          views[k].setFixedCoordinate(views[k].getFixedCoordinate() + direction * possibleShift);
        }
        spaceBeforeCurrentGroup -= possibleShift;
      }
    } else {
      currentGroupStart = i;
      spaceBeforeCurrentGroup = direction === 1 ? prevFixedCoordinate - height - coordinate : coordinate - (prevFixedCoordinate + height);
    }
  }
}
function priceScaleCrosshairLabelVisible(crosshair) {
  return crosshair.mode !== 2 && crosshair.horzLine.visible && crosshair.horzLine.labelVisible;
}
var PriceAxisWidget = class {
  constructor(pane, options, rendererOptionsProvider, side) {
    this._priceScale = null;
    this._size = null;
    this._mousedown = false;
    this._widthCache = new TextWidthCache(200);
    this._font = null;
    this._prevOptimalWidth = 0;
    this._isSettingSize = false;
    this._canvasSuggestedBitmapSizeChangedHandler = () => {
      if (this._isSettingSize) {
        return;
      }
      this._pane.chart().model().lightUpdate();
    };
    this._topCanvasSuggestedBitmapSizeChangedHandler = () => {
      if (this._isSettingSize) {
        return;
      }
      this._pane.chart().model().lightUpdate();
    };
    this._pane = pane;
    this._options = options;
    this._layoutOptions = options["layout"];
    this._rendererOptionsProvider = rendererOptionsProvider;
    this._isLeft = side === "left";
    this._sourcePaneViews = buildPriceAxisViewsGetter("normal", side);
    this._sourceTopPaneViews = buildPriceAxisViewsGetter("top", side);
    this._sourceBottomPaneViews = buildPriceAxisViewsGetter("bottom", side);
    this._cell = document.createElement("div");
    this._cell.style.height = "100%";
    this._cell.style.overflow = "hidden";
    this._cell.style.width = "25px";
    this._cell.style.left = "0";
    this._cell.style.position = "relative";
    this._canvasBinding = createBoundCanvas(this._cell, size({ width: 16, height: 16 }));
    this._canvasBinding.subscribeSuggestedBitmapSizeChanged(this._canvasSuggestedBitmapSizeChangedHandler);
    const canvas = this._canvasBinding.canvasElement;
    canvas.style.position = "absolute";
    canvas.style.zIndex = "1";
    canvas.style.left = "0";
    canvas.style.top = "0";
    this._topCanvasBinding = createBoundCanvas(this._cell, size({ width: 16, height: 16 }));
    this._topCanvasBinding.subscribeSuggestedBitmapSizeChanged(this._topCanvasSuggestedBitmapSizeChangedHandler);
    const topCanvas = this._topCanvasBinding.canvasElement;
    topCanvas.style.position = "absolute";
    topCanvas.style.zIndex = "2";
    topCanvas.style.left = "0";
    topCanvas.style.top = "0";
    const handler = {
      mouseDownEvent: this._mouseDownEvent.bind(this),
      touchStartEvent: this._mouseDownEvent.bind(this),
      pressedMouseMoveEvent: this._pressedMouseMoveEvent.bind(this),
      touchMoveEvent: this._pressedMouseMoveEvent.bind(this),
      mouseDownOutsideEvent: this._mouseDownOutsideEvent.bind(this),
      mouseUpEvent: this._mouseUpEvent.bind(this),
      touchEndEvent: this._mouseUpEvent.bind(this),
      mouseDoubleClickEvent: this._mouseDoubleClickEvent.bind(this),
      doubleTapEvent: this._mouseDoubleClickEvent.bind(this),
      mouseEnterEvent: this._mouseEnterEvent.bind(this),
      mouseLeaveEvent: this._mouseLeaveEvent.bind(this)
    };
    this._mouseEventHandler = new MouseEventHandler(this._topCanvasBinding.canvasElement, handler, {
      treatVertTouchDragAsPageScroll: () => !this._options["handleScroll"].vertTouchDrag,
      treatHorzTouchDragAsPageScroll: () => true
    });
  }
  destroy() {
    this._mouseEventHandler.destroy();
    this._topCanvasBinding.unsubscribeSuggestedBitmapSizeChanged(this._topCanvasSuggestedBitmapSizeChangedHandler);
    releaseCanvas(this._topCanvasBinding.canvasElement);
    this._topCanvasBinding.dispose();
    this._canvasBinding.unsubscribeSuggestedBitmapSizeChanged(this._canvasSuggestedBitmapSizeChangedHandler);
    releaseCanvas(this._canvasBinding.canvasElement);
    this._canvasBinding.dispose();
    if (this._priceScale !== null) {
      this._priceScale.onMarksChanged().unsubscribeAll(this);
    }
    this._priceScale = null;
  }
  getElement() {
    return this._cell;
  }
  fontSize() {
    return this._layoutOptions.fontSize;
  }
  rendererOptions() {
    const options = this._rendererOptionsProvider.options();
    const isFontChanged = this._font !== options.font;
    if (isFontChanged) {
      this._widthCache.reset();
      this._font = options.font;
    }
    return options;
  }
  optimalWidth() {
    if (this._priceScale === null) {
      return 0;
    }
    let tickMarkMaxWidth = 0;
    const rendererOptions = this.rendererOptions();
    const ctx = ensureNotNull(this._canvasBinding.canvasElement.getContext("2d", {
      colorSpace: this._pane.chart().options().layout.colorSpace
    }));
    ctx.save();
    const tickMarks = this._priceScale.marks();
    ctx.font = this._baseFont();
    if (tickMarks.length > 0) {
      tickMarkMaxWidth = Math.max(this._widthCache.measureText(ctx, tickMarks[0].label), this._widthCache.measureText(ctx, tickMarks[tickMarks.length - 1].label));
    }
    const views = this._backLabels();
    for (let j = views.length; j--; ) {
      const width = this._widthCache.measureText(ctx, views[j].text());
      if (width > tickMarkMaxWidth) {
        tickMarkMaxWidth = width;
      }
    }
    const firstValue = this._priceScale.firstValue();
    if (firstValue !== null && this._size !== null && priceScaleCrosshairLabelVisible(this._options.crosshair)) {
      const topValue = this._priceScale.coordinateToPrice(1, firstValue);
      const bottomValue = this._priceScale.coordinateToPrice(this._size.height - 2, firstValue);
      tickMarkMaxWidth = Math.max(tickMarkMaxWidth, this._widthCache.measureText(ctx, this._priceScale.formatPrice(Math.floor(Math.min(topValue, bottomValue)) + 0.11111111111111, firstValue)), this._widthCache.measureText(ctx, this._priceScale.formatPrice(Math.ceil(Math.max(topValue, bottomValue)) - 0.11111111111111, firstValue)));
    }
    ctx.restore();
    const resultTickMarksMaxWidth = tickMarkMaxWidth || 34;
    const res = Math.ceil(rendererOptions.borderSize + rendererOptions.tickLength + rendererOptions.paddingInner + rendererOptions.paddingOuter + 5 + resultTickMarksMaxWidth);
    return suggestPriceScaleWidth(res);
  }
  setSize(newSize) {
    if (this._size === null || !equalSizes(this._size, newSize)) {
      this._size = newSize;
      this._isSettingSize = true;
      this._canvasBinding.resizeCanvasElement(newSize);
      this._topCanvasBinding.resizeCanvasElement(newSize);
      this._isSettingSize = false;
      this._cell.style.width = `${newSize.width}px`;
      this._cell.style.height = `${newSize.height}px`;
    }
  }
  getWidth() {
    return ensureNotNull(this._size).width;
  }
  setPriceScale(priceScale) {
    if (this._priceScale === priceScale) {
      return;
    }
    if (this._priceScale !== null) {
      this._priceScale.onMarksChanged().unsubscribeAll(this);
    }
    this._priceScale = priceScale;
    priceScale.onMarksChanged().subscribe(this._onMarksChanged.bind(this), this);
  }
  priceScale() {
    return this._priceScale;
  }
  reset() {
    const pane = this._pane.state();
    const model = this._pane.chart().model();
    model.resetPriceScale(pane, ensureNotNull(this.priceScale()));
  }
  paint(type) {
    if (this._size === null) {
      return;
    }
    const canvasOptions = {
      colorSpace: this._pane.chart().options().layout.colorSpace
    };
    if (type !== 1) {
      this._alignLabels();
      this._canvasBinding.applySuggestedBitmapSize();
      const target = tryCreateCanvasRenderingTarget2D(this._canvasBinding, canvasOptions);
      if (target !== null) {
        target.useBitmapCoordinateSpace((scope) => {
          this._drawBackground(scope);
          this._drawBorder(scope);
        });
        this._pane.drawAdditionalSources(target, this._sourceBottomPaneViews);
        this._drawTickMarks(target);
        this._pane.drawAdditionalSources(target, this._sourcePaneViews);
        this._drawBackLabels(target);
      }
    }
    this._topCanvasBinding.applySuggestedBitmapSize();
    const topTarget = tryCreateCanvasRenderingTarget2D(this._topCanvasBinding, canvasOptions);
    if (topTarget !== null) {
      topTarget.useBitmapCoordinateSpace(({ context: ctx, bitmapSize }) => {
        ctx.clearRect(0, 0, bitmapSize.width, bitmapSize.height);
      });
      this._drawCrosshairLabel(topTarget);
      this._pane.drawAdditionalSources(topTarget, this._sourceTopPaneViews);
    }
  }
  getBitmapSize() {
    return this._canvasBinding.bitmapSize;
  }
  drawBitmap(ctx, x, y, addTopLayer) {
    const bitmapSize = this.getBitmapSize();
    if (bitmapSize.width > 0 && bitmapSize.height > 0) {
      ctx.drawImage(this._canvasBinding.canvasElement, x, y);
      if (addTopLayer) {
        const topLayer = this._topCanvasBinding.canvasElement;
        ctx.drawImage(topLayer, x, y);
      }
    }
  }
  update() {
    this._priceScale?.marks();
  }
  _mouseDownEvent(e) {
    if (this._priceScale === null || this._priceScale.isEmpty() || !this._options["handleScale"].axisPressedMouseMove.price) {
      return;
    }
    const model = this._pane.chart().model();
    const pane = this._pane.state();
    this._mousedown = true;
    model.startScalePrice(pane, this._priceScale, e.localY);
  }
  _pressedMouseMoveEvent(e) {
    if (this._priceScale === null || !this._options["handleScale"].axisPressedMouseMove.price) {
      return;
    }
    const model = this._pane.chart().model();
    const pane = this._pane.state();
    const priceScale = this._priceScale;
    model.scalePriceTo(pane, priceScale, e.localY);
  }
  _mouseDownOutsideEvent() {
    if (this._priceScale === null || !this._options["handleScale"].axisPressedMouseMove.price) {
      return;
    }
    const model = this._pane.chart().model();
    const pane = this._pane.state();
    const priceScale = this._priceScale;
    if (this._mousedown) {
      this._mousedown = false;
      model.endScalePrice(pane, priceScale);
    }
  }
  _mouseUpEvent(e) {
    if (this._priceScale === null || !this._options["handleScale"].axisPressedMouseMove.price) {
      return;
    }
    const model = this._pane.chart().model();
    const pane = this._pane.state();
    this._mousedown = false;
    model.endScalePrice(pane, this._priceScale);
  }
  _mouseDoubleClickEvent(e) {
    if (this._options["handleScale"].axisDoubleClickReset.price) {
      this.reset();
    }
  }
  _mouseEnterEvent(e) {
    if (this._priceScale === null) {
      return;
    }
    const model = this._pane.chart().model();
    if (model.options()["handleScale"].axisPressedMouseMove.price && !this._priceScale.isPercentage() && !this._priceScale.isIndexedTo100()) {
      this._setCursor(
        1
        /* CursorType.NsResize */
      );
    }
  }
  _mouseLeaveEvent(e) {
    this._setCursor(
      0
      /* CursorType.Default */
    );
  }
  _backLabels() {
    const res = [];
    const priceScale = this._priceScale === null ? void 0 : this._priceScale;
    const addViewsForSources = (sources) => {
      for (let i = 0; i < sources.length; ++i) {
        const source = sources[i];
        const views = source.priceAxisViews(this._pane.state(), priceScale);
        for (let j = 0; j < views.length; j++) {
          res.push(views[j]);
        }
      }
    };
    addViewsForSources(this._pane.state().orderedSources());
    return res;
  }
  _drawBackground({ context: ctx, bitmapSize }) {
    const { width, height } = bitmapSize;
    const model = this._pane.state().model();
    const topColor = model.backgroundTopColor();
    const bottomColor = model.backgroundBottomColor();
    if (topColor === bottomColor) {
      clearRect(ctx, 0, 0, width, height, topColor);
    } else {
      clearRectWithGradient(ctx, 0, 0, width, height, topColor, bottomColor);
    }
  }
  _drawBorder({ context: ctx, bitmapSize, horizontalPixelRatio }) {
    if (this._size === null || this._priceScale === null || !this._priceScale.options().borderVisible) {
      return;
    }
    ctx.fillStyle = this._priceScale.options().borderColor;
    const borderSize = Math.max(1, Math.floor(this.rendererOptions().borderSize * horizontalPixelRatio));
    let left;
    if (this._isLeft) {
      left = bitmapSize.width - borderSize;
    } else {
      left = 0;
    }
    ctx.fillRect(left, 0, borderSize, bitmapSize.height);
  }
  _drawTickMarks(target) {
    if (this._size === null || this._priceScale === null) {
      return;
    }
    const tickMarks = this._priceScale.marks();
    const priceScaleOptions = this._priceScale.options();
    const rendererOptions = this.rendererOptions();
    const tickMarkLeftX = this._isLeft ? this._size.width - rendererOptions.tickLength : 0;
    if (priceScaleOptions.borderVisible && priceScaleOptions.ticksVisible) {
      target.useBitmapCoordinateSpace(({ context: ctx, horizontalPixelRatio, verticalPixelRatio }) => {
        ctx.fillStyle = priceScaleOptions.borderColor;
        const tickHeight = Math.max(1, Math.floor(verticalPixelRatio));
        const tickOffset = Math.floor(verticalPixelRatio * 0.5);
        const tickLength = Math.round(rendererOptions.tickLength * horizontalPixelRatio);
        ctx.beginPath();
        for (const tickMark of tickMarks) {
          ctx.rect(Math.floor(tickMarkLeftX * horizontalPixelRatio), Math.round(tickMark.coord * verticalPixelRatio) - tickOffset, tickLength, tickHeight);
        }
        ctx.fill();
      });
    }
    target.useMediaCoordinateSpace(({ context: ctx }) => {
      ctx.font = this._baseFont();
      ctx.fillStyle = priceScaleOptions.textColor ?? this._layoutOptions.textColor;
      ctx.textAlign = this._isLeft ? "right" : "left";
      ctx.textBaseline = "middle";
      const textLeftX = this._isLeft ? Math.round(tickMarkLeftX - rendererOptions.paddingInner) : Math.round(tickMarkLeftX + rendererOptions.tickLength + rendererOptions.paddingInner);
      const yMidCorrections = tickMarks.map((mark) => this._widthCache.yMidCorrection(ctx, mark.label));
      for (let i = tickMarks.length; i--; ) {
        const tickMark = tickMarks[i];
        ctx.fillText(tickMark.label, textLeftX, tickMark.coord + yMidCorrections[i]);
      }
    });
  }
  _alignLabels() {
    if (this._size === null || this._priceScale === null) {
      return;
    }
    let center = this._size.height / 2;
    const views = [];
    const orderedSources = this._priceScale.orderedSources().slice();
    const pane = this._pane;
    const paneState = pane.state();
    const rendererOptions = this.rendererOptions();
    const isDefault = this._priceScale === paneState.defaultVisiblePriceScale();
    if (isDefault) {
      this._pane.state().orderedSources().forEach((source) => {
        if (paneState.isOverlay(source)) {
          orderedSources.push(source);
        }
      });
    }
    const centerSource = this._priceScale.dataSources()[0];
    const priceScale = this._priceScale;
    const updateForSources = (sources) => {
      sources.forEach((source) => {
        const sourceViews = source.priceAxisViews(paneState, priceScale);
        sourceViews.forEach((view) => {
          view.setFixedCoordinate(null);
          if (view.isVisible()) {
            views.push(view);
          }
        });
        if (centerSource === source && sourceViews.length > 0) {
          center = sourceViews[0].coordinate();
        }
      });
    };
    updateForSources(orderedSources);
    views.forEach((view) => view.setFixedCoordinate(view.coordinate()));
    const options = this._priceScale.options();
    if (!options.alignLabels) {
      return;
    }
    this._fixLabelOverlap(views, rendererOptions, center);
  }
  _fixLabelOverlap(views, rendererOptions, center) {
    if (this._size === null) {
      return;
    }
    const top = views.filter((view) => view.coordinate() <= center);
    const bottom = views.filter((view) => view.coordinate() > center);
    top.sort((l, r) => r.coordinate() - l.coordinate());
    if (top.length && bottom.length) {
      bottom.push(top[0]);
    }
    bottom.sort((l, r) => l.coordinate() - r.coordinate());
    for (const view of views) {
      const halfHeight = Math.floor(view.height(rendererOptions) / 2);
      const coordinate = view.coordinate();
      if (coordinate > -halfHeight && coordinate < halfHeight) {
        view.setFixedCoordinate(halfHeight);
      }
      if (coordinate > this._size.height - halfHeight && coordinate < this._size.height + halfHeight) {
        view.setFixedCoordinate(this._size.height - halfHeight);
      }
    }
    recalculateOverlapping(top, 1, this._size.height, rendererOptions);
    recalculateOverlapping(bottom, -1, this._size.height, rendererOptions);
  }
  _drawBackLabels(target) {
    if (this._size === null) {
      return;
    }
    const views = this._backLabels();
    const rendererOptions = this.rendererOptions();
    const align = this._isLeft ? "right" : "left";
    views.forEach((view) => {
      if (view.isAxisLabelVisible()) {
        const renderer = view.renderer(ensureNotNull(this._priceScale));
        renderer.draw(target, rendererOptions, this._widthCache, align);
      }
    });
  }
  _drawCrosshairLabel(target) {
    if (this._size === null || this._priceScale === null) {
      return;
    }
    const model = this._pane.chart().model();
    const views = [];
    const pane = this._pane.state();
    const v = model.crosshairSource().priceAxisViews(pane, this._priceScale);
    if (v.length) {
      views.push(v);
    }
    const ro = this.rendererOptions();
    const align = this._isLeft ? "right" : "left";
    views.forEach((arr) => {
      arr.forEach((view) => {
        view.renderer(ensureNotNull(this._priceScale)).draw(target, ro, this._widthCache, align);
      });
    });
  }
  _setCursor(type) {
    this._cell.style.cursor = type === 1 ? "ns-resize" : "default";
  }
  _onMarksChanged() {
    const width = this.optimalWidth();
    if (this._prevOptimalWidth < width) {
      this._pane.chart().model().fullUpdate();
    }
    this._prevOptimalWidth = width;
  }
  _baseFont() {
    return makeFont(this._layoutOptions.fontSize, this._layoutOptions.fontFamily);
  }
};

// ../lib/prod/src/gui/pane-widget.js
var KineticScrollConstants;
(function(KineticScrollConstants2) {
  KineticScrollConstants2[KineticScrollConstants2["MinScrollSpeed"] = 0.2] = "MinScrollSpeed";
  KineticScrollConstants2[KineticScrollConstants2["MaxScrollSpeed"] = 7] = "MaxScrollSpeed";
  KineticScrollConstants2[KineticScrollConstants2["DumpingCoeff"] = 0.997] = "DumpingCoeff";
  KineticScrollConstants2[KineticScrollConstants2["ScrollMinMove"] = 15] = "ScrollMinMove";
})(KineticScrollConstants || (KineticScrollConstants = {}));
function sourceBottomPaneViews(source, pane) {
  return source.bottomPaneViews?.(pane) ?? [];
}
function sourcePaneViews(source, pane) {
  return source.paneViews?.(pane) ?? [];
}
function sourceLabelPaneViews(source, pane) {
  return source.labelPaneViews?.(pane) ?? [];
}
function sourceTopPaneViews(source, pane) {
  return source.topPaneViews?.(pane) ?? [];
}
var PaneWidget = class _PaneWidget {
  constructor(chart, state) {
    this._size = size({ width: 0, height: 0 });
    this._leftPriceAxisWidget = null;
    this._rightPriceAxisWidget = null;
    this._attributionLogoWidget = null;
    this._startScrollingPos = null;
    this._isScrolling = false;
    this._clicked = new Delegate();
    this._dblClicked = new Delegate();
    this._prevPinchScale = 0;
    this._longTap = false;
    this._startTrackPoint = null;
    this._exitTrackingModeOnNextTry = false;
    this._initCrosshairPosition = null;
    this._scrollXAnimation = null;
    this._isSettingSize = false;
    this._canvasSuggestedBitmapSizeChangedHandler = () => {
      if (this._isSettingSize || this._state === null) {
        return;
      }
      this._model().lightUpdate();
    };
    this._topCanvasSuggestedBitmapSizeChangedHandler = () => {
      if (this._isSettingSize || this._state === null) {
        return;
      }
      this._model().lightUpdate();
    };
    this._chart = chart;
    this._state = state;
    this._state.onDestroyed().subscribe(this._onStateDestroyed.bind(this), this, true);
    this._paneCell = document.createElement("td");
    this._paneCell.style.padding = "0";
    this._paneCell.style.position = "relative";
    const paneWrapper = document.createElement("div");
    paneWrapper.style.width = "100%";
    paneWrapper.style.height = "100%";
    paneWrapper.style.position = "relative";
    paneWrapper.style.overflow = "hidden";
    this._leftAxisCell = document.createElement("td");
    this._leftAxisCell.style.padding = "0";
    this._rightAxisCell = document.createElement("td");
    this._rightAxisCell.style.padding = "0";
    this._paneCell.appendChild(paneWrapper);
    this._canvasBinding = createBoundCanvas(paneWrapper, size({ width: 16, height: 16 }));
    this._canvasBinding.subscribeSuggestedBitmapSizeChanged(this._canvasSuggestedBitmapSizeChangedHandler);
    const canvas = this._canvasBinding.canvasElement;
    canvas.style.position = "absolute";
    canvas.style.zIndex = "1";
    canvas.style.left = "0";
    canvas.style.top = "0";
    this._topCanvasBinding = createBoundCanvas(paneWrapper, size({ width: 16, height: 16 }));
    this._topCanvasBinding.subscribeSuggestedBitmapSizeChanged(this._topCanvasSuggestedBitmapSizeChangedHandler);
    const topCanvas = this._topCanvasBinding.canvasElement;
    topCanvas.style.position = "absolute";
    topCanvas.style.zIndex = "2";
    topCanvas.style.left = "0";
    topCanvas.style.top = "0";
    this._rowElement = document.createElement("tr");
    this._rowElement.appendChild(this._leftAxisCell);
    this._rowElement.appendChild(this._paneCell);
    this._rowElement.appendChild(this._rightAxisCell);
    this.updatePriceAxisWidgetsStates();
    this._mouseEventHandler = new MouseEventHandler(this._topCanvasBinding.canvasElement, this, {
      treatVertTouchDragAsPageScroll: () => this._startTrackPoint === null && !this._chart.options()["handleScroll"].vertTouchDrag,
      treatHorzTouchDragAsPageScroll: () => this._startTrackPoint === null && !this._chart.options()["handleScroll"].horzTouchDrag
    });
  }
  destroy() {
    if (this._leftPriceAxisWidget !== null) {
      this._leftPriceAxisWidget.destroy();
    }
    if (this._rightPriceAxisWidget !== null) {
      this._rightPriceAxisWidget.destroy();
    }
    this._attributionLogoWidget = null;
    this._topCanvasBinding.unsubscribeSuggestedBitmapSizeChanged(this._topCanvasSuggestedBitmapSizeChangedHandler);
    releaseCanvas(this._topCanvasBinding.canvasElement);
    this._topCanvasBinding.dispose();
    this._canvasBinding.unsubscribeSuggestedBitmapSizeChanged(this._canvasSuggestedBitmapSizeChangedHandler);
    releaseCanvas(this._canvasBinding.canvasElement);
    this._canvasBinding.dispose();
    if (this._state !== null) {
      this._state.onDestroyed().unsubscribeAll(this);
      this._state.destroy();
    }
    this._mouseEventHandler.destroy();
  }
  state() {
    return ensureNotNull(this._state);
  }
  setState(pane) {
    if (this._state !== null) {
      this._state.onDestroyed().unsubscribeAll(this);
    }
    this._state = pane;
    if (this._state !== null) {
      this._state.onDestroyed().subscribe(_PaneWidget.prototype._onStateDestroyed.bind(this), this, true);
    }
    this.updatePriceAxisWidgetsStates();
    if (this._chart.paneWidgets().indexOf(this) === this._chart.paneWidgets().length - 1) {
      this._attributionLogoWidget = this._attributionLogoWidget ?? new AttributionLogoWidget(this._paneCell, this._chart);
      this._attributionLogoWidget.update();
    } else {
      this._attributionLogoWidget?.removeElement();
      this._attributionLogoWidget = null;
    }
  }
  chart() {
    return this._chart;
  }
  getElement() {
    return this._rowElement;
  }
  updatePriceAxisWidgetsStates() {
    if (this._state === null) {
      return;
    }
    this._recreatePriceAxisWidgets();
    if (this._model().serieses().length === 0) {
      return;
    }
    if (this._leftPriceAxisWidget !== null) {
      const leftPriceScale = this._state.leftPriceScale();
      this._leftPriceAxisWidget.setPriceScale(ensureNotNull(leftPriceScale));
    }
    if (this._rightPriceAxisWidget !== null) {
      const rightPriceScale = this._state.rightPriceScale();
      this._rightPriceAxisWidget.setPriceScale(ensureNotNull(rightPriceScale));
    }
  }
  updatePriceAxisWidgets() {
    if (this._leftPriceAxisWidget !== null) {
      this._leftPriceAxisWidget.update();
    }
    if (this._rightPriceAxisWidget !== null) {
      this._rightPriceAxisWidget.update();
    }
  }
  stretchFactor() {
    return this._state !== null ? this._state.stretchFactor() : 0;
  }
  setStretchFactor(stretchFactor) {
    if (this._state) {
      this._state.setStretchFactor(stretchFactor);
    }
  }
  mouseEnterEvent(event) {
    if (!this._state) {
      return;
    }
    this._onMouseEvent();
    const x = event.localX;
    const y = event.localY;
    this._setCrosshairPosition(x, y, event);
  }
  mouseDownEvent(event) {
    this._onMouseEvent();
    this._mouseTouchDownEvent();
    this._setCrosshairPosition(event.localX, event.localY, event);
  }
  mouseMoveEvent(event) {
    if (!this._state) {
      return;
    }
    this._onMouseEvent();
    const x = event.localX;
    const y = event.localY;
    this._setCrosshairPosition(x, y, event);
  }
  mouseClickEvent(event) {
    if (this._state === null) {
      return;
    }
    this._onMouseEvent();
    this._fireClickedDelegate(event);
  }
  mouseDoubleClickEvent(event) {
    if (this._state === null) {
      return;
    }
    this._fireMouseClickDelegate(this._dblClicked, event);
  }
  doubleTapEvent(event) {
    this.mouseDoubleClickEvent(event);
  }
  pressedMouseMoveEvent(event) {
    this._onMouseEvent();
    this._pressedMouseTouchMoveEvent(event);
    this._setCrosshairPosition(event.localX, event.localY, event);
  }
  mouseUpEvent(event) {
    if (this._state === null) {
      return;
    }
    this._onMouseEvent();
    this._longTap = false;
    this._endScroll(event);
  }
  tapEvent(event) {
    if (this._state === null) {
      return;
    }
    this._fireClickedDelegate(event);
  }
  longTapEvent(event) {
    this._longTap = true;
    if (this._startTrackPoint === null) {
      const point = { x: event.localX, y: event.localY };
      this._startTrackingMode(point, point, event);
    }
  }
  mouseLeaveEvent(event) {
    if (this._state === null) {
      return;
    }
    this._onMouseEvent();
    this._state.model().setHoveredSource(null);
    this._clearCrosshairPosition();
  }
  clicked() {
    return this._clicked;
  }
  dblClicked() {
    return this._dblClicked;
  }
  pinchStartEvent() {
    this._prevPinchScale = 1;
    this._model().stopTimeScaleAnimation();
  }
  pinchEvent(middlePoint, scale) {
    if (!this._chart.options()["handleScale"].pinch) {
      return;
    }
    const zoomScale = (scale - this._prevPinchScale) * 5;
    this._prevPinchScale = scale;
    this._model().zoomTime(middlePoint.x, zoomScale);
  }
  touchStartEvent(event) {
    this._longTap = false;
    this._exitTrackingModeOnNextTry = this._startTrackPoint !== null;
    this._mouseTouchDownEvent();
    const crosshair = this._model().crosshairSource();
    if (this._startTrackPoint !== null && crosshair.visible()) {
      this._initCrosshairPosition = { x: crosshair.appliedX(), y: crosshair.appliedY() };
      this._startTrackPoint = { x: event.localX, y: event.localY };
    }
  }
  touchMoveEvent(event) {
    if (this._state === null) {
      return;
    }
    const x = event.localX;
    const y = event.localY;
    if (this._startTrackPoint !== null) {
      this._exitTrackingModeOnNextTry = false;
      const origPoint = ensureNotNull(this._initCrosshairPosition);
      const newX = origPoint.x + (x - this._startTrackPoint.x);
      const newY = origPoint.y + (y - this._startTrackPoint.y);
      this._setCrosshairPosition(newX, newY, event);
      return;
    }
    this._pressedMouseTouchMoveEvent(event);
  }
  touchEndEvent(event) {
    if (this.chart().options().trackingMode.exitMode === 0) {
      this._exitTrackingModeOnNextTry = true;
    }
    this._tryExitTrackingMode();
    this._endScroll(event);
  }
  hitTest(x, y) {
    const state = this._state;
    if (state === null) {
      return null;
    }
    return hitTestPane(state, x, y);
  }
  setPriceAxisSize(width, position) {
    const priceAxisWidget = position === "left" ? this._leftPriceAxisWidget : this._rightPriceAxisWidget;
    ensureNotNull(priceAxisWidget).setSize(size({ width, height: this._size.height }));
  }
  getSize() {
    return this._size;
  }
  setSize(newSize) {
    if (equalSizes(this._size, newSize)) {
      return;
    }
    this._size = newSize;
    this._isSettingSize = true;
    this._canvasBinding.resizeCanvasElement(newSize);
    this._topCanvasBinding.resizeCanvasElement(newSize);
    this._isSettingSize = false;
    this._paneCell.style.width = newSize.width + "px";
    this._paneCell.style.height = newSize.height + "px";
  }
  recalculatePriceScales() {
    const pane = ensureNotNull(this._state);
    pane.recalculatePriceScale(pane.leftPriceScale());
    pane.recalculatePriceScale(pane.rightPriceScale());
    for (const source of pane.dataSources()) {
      if (pane.isOverlay(source)) {
        const priceScale = source.priceScale();
        if (priceScale !== null) {
          pane.recalculatePriceScale(priceScale);
        }
        source.updateAllViews();
      }
    }
    for (const primitive of pane.primitives()) {
      primitive.updateAllViews();
    }
  }
  getBitmapSize() {
    return this._canvasBinding.bitmapSize;
  }
  drawBitmap(ctx, x, y, addTopLayer) {
    const bitmapSize = this.getBitmapSize();
    if (bitmapSize.width > 0 && bitmapSize.height > 0) {
      ctx.drawImage(this._canvasBinding.canvasElement, x, y);
      if (addTopLayer) {
        const topLayer = this._topCanvasBinding.canvasElement;
        if (ctx !== null) {
          ctx.drawImage(topLayer, x, y);
        }
      }
    }
  }
  paint(type) {
    if (type === 0) {
      return;
    }
    if (this._state === null) {
      return;
    }
    if (type > 1) {
      this.recalculatePriceScales();
    }
    if (this._leftPriceAxisWidget !== null) {
      this._leftPriceAxisWidget.paint(type);
    }
    if (this._rightPriceAxisWidget !== null) {
      this._rightPriceAxisWidget.paint(type);
    }
    const canvasOptions = {
      colorSpace: this._chart.options().layout.colorSpace
    };
    if (type !== 1) {
      this._canvasBinding.applySuggestedBitmapSize();
      const target = tryCreateCanvasRenderingTarget2D(this._canvasBinding, canvasOptions);
      if (target !== null) {
        target.useBitmapCoordinateSpace((scope) => {
          this._drawBackground(scope);
        });
        if (this._state) {
          this._drawSources(target, sourceBottomPaneViews);
          this._drawGrid(target);
          this._drawSources(target, sourcePaneViews);
          this._drawSources(target, sourceLabelPaneViews);
        }
      }
    }
    this._topCanvasBinding.applySuggestedBitmapSize();
    const topTarget = tryCreateCanvasRenderingTarget2D(this._topCanvasBinding, canvasOptions);
    if (topTarget !== null) {
      topTarget.useBitmapCoordinateSpace(({ context: ctx, bitmapSize }) => {
        ctx.clearRect(0, 0, bitmapSize.width, bitmapSize.height);
      });
      this._drawCrosshair(topTarget);
      this._drawSources(topTarget, sourceTopPaneViews);
      this._drawSources(topTarget, sourceLabelPaneViews);
    }
  }
  leftPriceAxisWidget() {
    return this._leftPriceAxisWidget;
  }
  rightPriceAxisWidget() {
    return this._rightPriceAxisWidget;
  }
  drawAdditionalSources(target, paneViewsGetter) {
    this._drawSources(target, paneViewsGetter);
  }
  _onStateDestroyed() {
    if (this._state !== null) {
      this._state.onDestroyed().unsubscribeAll(this);
    }
    this._state = null;
  }
  _fireClickedDelegate(event) {
    this._fireMouseClickDelegate(this._clicked, event);
  }
  _fireMouseClickDelegate(delegate, event) {
    const x = event.localX;
    const y = event.localY;
    if (delegate.hasListeners()) {
      delegate.fire(this._model().timeScale().coordinateToIndex(x), { x, y }, event);
    }
  }
  _drawBackground({ context: ctx, bitmapSize }) {
    const { width, height } = bitmapSize;
    const model = this._model();
    const topColor = model.backgroundTopColor();
    const bottomColor = model.backgroundBottomColor();
    if (topColor === bottomColor) {
      clearRect(ctx, 0, 0, width, height, bottomColor);
    } else {
      clearRectWithGradient(ctx, 0, 0, width, height, topColor, bottomColor);
    }
  }
  _drawGrid(target) {
    const state = ensureNotNull(this._state);
    const paneView = state.grid().paneView();
    const renderer = paneView.renderer(state);
    if (renderer !== null) {
      renderer.draw(target, false);
    }
  }
  _drawCrosshair(target) {
    this._drawSourceImpl(target, sourcePaneViews, drawForeground, this._model().crosshairSource());
  }
  _drawSources(target, paneViewsGetter) {
    const state = ensureNotNull(this._state);
    const sources = state.orderedSources();
    const panePrimitives = state.primitives();
    for (const panePrimitive of panePrimitives) {
      this._drawSourceImpl(target, paneViewsGetter, drawBackground, panePrimitive);
    }
    for (const source of sources) {
      this._drawSourceImpl(target, paneViewsGetter, drawBackground, source);
    }
    for (const panePrimitive of panePrimitives) {
      this._drawSourceImpl(target, paneViewsGetter, drawForeground, panePrimitive);
    }
    for (const source of sources) {
      this._drawSourceImpl(target, paneViewsGetter, drawForeground, source);
    }
  }
  _drawSourceImpl(target, paneViewsGetter, drawFn, source) {
    const state = ensureNotNull(this._state);
    const hoveredSource = state.model().hoveredSource();
    const isHovered = hoveredSource !== null && hoveredSource.source === source;
    const objecId = hoveredSource !== null && isHovered && hoveredSource.object !== void 0 ? hoveredSource.object.hitTestData : void 0;
    const drawRendererFn = (renderer) => drawFn(renderer, target, isHovered, objecId);
    drawSourceViews(paneViewsGetter, drawRendererFn, source, state);
  }
  _recreatePriceAxisWidgets() {
    if (this._state === null) {
      return;
    }
    const chart = this._chart;
    const leftAxisVisible = this._state.leftPriceScale().options().visible;
    const rightAxisVisible = this._state.rightPriceScale().options().visible;
    if (!leftAxisVisible && this._leftPriceAxisWidget !== null) {
      this._leftAxisCell.removeChild(this._leftPriceAxisWidget.getElement());
      this._leftPriceAxisWidget.destroy();
      this._leftPriceAxisWidget = null;
    }
    if (!rightAxisVisible && this._rightPriceAxisWidget !== null) {
      this._rightAxisCell.removeChild(this._rightPriceAxisWidget.getElement());
      this._rightPriceAxisWidget.destroy();
      this._rightPriceAxisWidget = null;
    }
    const rendererOptionsProvider = chart.model().rendererOptionsProvider();
    if (leftAxisVisible && this._leftPriceAxisWidget === null) {
      this._leftPriceAxisWidget = new PriceAxisWidget(this, chart.options(), rendererOptionsProvider, "left");
      this._leftAxisCell.appendChild(this._leftPriceAxisWidget.getElement());
    }
    if (rightAxisVisible && this._rightPriceAxisWidget === null) {
      this._rightPriceAxisWidget = new PriceAxisWidget(this, chart.options(), rendererOptionsProvider, "right");
      this._rightAxisCell.appendChild(this._rightPriceAxisWidget.getElement());
    }
  }
  _preventScroll(event) {
    return event.isTouch && this._longTap || this._startTrackPoint !== null;
  }
  _correctXCoord(x) {
    return Math.max(0, Math.min(x, this._size.width - 1));
  }
  _correctYCoord(y) {
    return Math.max(0, Math.min(y, this._size.height - 1));
  }
  _setCrosshairPosition(x, y, event) {
    this._model().setAndSaveCurrentPosition(this._correctXCoord(x), this._correctYCoord(y), event, ensureNotNull(this._state));
  }
  _clearCrosshairPosition() {
    this._model().clearCurrentPosition();
  }
  _tryExitTrackingMode() {
    if (this._exitTrackingModeOnNextTry) {
      this._startTrackPoint = null;
      this._clearCrosshairPosition();
    }
  }
  _startTrackingMode(startTrackPoint, crossHairPosition, event) {
    this._startTrackPoint = startTrackPoint;
    this._exitTrackingModeOnNextTry = false;
    this._setCrosshairPosition(crossHairPosition.x, crossHairPosition.y, event);
    const crosshair = this._model().crosshairSource();
    this._initCrosshairPosition = { x: crosshair.appliedX(), y: crosshair.appliedY() };
  }
  _model() {
    return this._chart.model();
  }
  _endScroll(event) {
    if (!this._isScrolling) {
      return;
    }
    const model = this._model();
    const state = this.state();
    model.endScrollPrice(state, state.defaultPriceScale());
    this._startScrollingPos = null;
    this._isScrolling = false;
    model.endScrollTime();
    if (this._scrollXAnimation !== null) {
      const startAnimationTime = performance.now();
      const timeScale = model.timeScale();
      this._scrollXAnimation.start(timeScale.rightOffset(), startAnimationTime);
      if (!this._scrollXAnimation.finished(startAnimationTime)) {
        model.setTimeScaleAnimation(this._scrollXAnimation);
      }
    }
  }
  _onMouseEvent() {
    this._startTrackPoint = null;
  }
  _mouseTouchDownEvent() {
    if (!this._state) {
      return;
    }
    this._model().stopTimeScaleAnimation();
    if (document.activeElement !== document.body && document.activeElement !== document.documentElement) {
      ensureNotNull(document.activeElement).blur();
    } else {
      const selection = document.getSelection();
      if (selection !== null) {
        selection.removeAllRanges();
      }
    }
    const priceScale = this._state.defaultPriceScale();
    if (priceScale.isEmpty() || this._model().timeScale().isEmpty()) {
      return;
    }
  }
  // eslint-disable-next-line complexity
  _pressedMouseTouchMoveEvent(event) {
    if (this._state === null) {
      return;
    }
    const model = this._model();
    const timeScale = model.timeScale();
    if (timeScale.isEmpty()) {
      return;
    }
    const chartOptions = this._chart.options();
    const scrollOptions = chartOptions["handleScroll"];
    const kineticScrollOptions = chartOptions.kineticScroll;
    if ((!scrollOptions.pressedMouseMove || event.isTouch) && (!scrollOptions.horzTouchDrag && !scrollOptions.vertTouchDrag || !event.isTouch)) {
      return;
    }
    const priceScale = this._state.defaultPriceScale();
    const now = performance.now();
    if (this._startScrollingPos === null && !this._preventScroll(event)) {
      this._startScrollingPos = {
        x: event.clientX,
        y: event.clientY,
        timestamp: now,
        localX: event.localX,
        localY: event.localY
      };
    }
    if (this._startScrollingPos !== null && !this._isScrolling && (this._startScrollingPos.x !== event.clientX || this._startScrollingPos.y !== event.clientY)) {
      if (event.isTouch && kineticScrollOptions.touch || !event.isTouch && kineticScrollOptions.mouse) {
        const barSpacing = timeScale.barSpacing();
        this._scrollXAnimation = new KineticAnimation(0.2 / barSpacing, 7 / barSpacing, 0.997, 15 / barSpacing);
        this._scrollXAnimation.addPosition(timeScale.rightOffset(), this._startScrollingPos.timestamp);
      } else {
        this._scrollXAnimation = null;
      }
      if (!priceScale.isEmpty()) {
        model.startScrollPrice(this._state, priceScale, event.localY);
      }
      model.startScrollTime(event.localX);
      this._isScrolling = true;
    }
    if (this._isScrolling) {
      if (!priceScale.isEmpty()) {
        model.scrollPriceTo(this._state, priceScale, event.localY);
      }
      model.scrollTimeTo(event.localX);
      if (this._scrollXAnimation !== null) {
        this._scrollXAnimation.addPosition(timeScale.rightOffset(), now);
      }
    }
  }
};

// ../lib/prod/src/gui/price-axis-stub.js
var PriceAxisStub = class {
  constructor(side, options, params, borderVisible, bottomColor) {
    this._invalidated = true;
    this._size = size({ width: 0, height: 0 });
    this._canvasSuggestedBitmapSizeChangedHandler = () => this.paint(
      3
      /* InvalidationLevel.Full */
    );
    this._isLeft = side === "left";
    this._rendererOptionsProvider = params.rendererOptionsProvider;
    this._options = options;
    this._borderVisible = borderVisible;
    this._bottomColor = bottomColor;
    this._cell = document.createElement("div");
    this._cell.style.width = "25px";
    this._cell.style.height = "100%";
    this._cell.style.overflow = "hidden";
    this._canvasBinding = createBoundCanvas(this._cell, size({ width: 16, height: 16 }));
    this._canvasBinding.subscribeSuggestedBitmapSizeChanged(this._canvasSuggestedBitmapSizeChangedHandler);
  }
  destroy() {
    this._canvasBinding.unsubscribeSuggestedBitmapSizeChanged(this._canvasSuggestedBitmapSizeChangedHandler);
    releaseCanvas(this._canvasBinding.canvasElement);
    this._canvasBinding.dispose();
  }
  getElement() {
    return this._cell;
  }
  getSize() {
    return this._size;
  }
  setSize(newSize) {
    if (!equalSizes(this._size, newSize)) {
      this._size = newSize;
      this._canvasBinding.resizeCanvasElement(newSize);
      this._cell.style.width = `${newSize.width}px`;
      this._cell.style.height = `${newSize.height}px`;
      this._invalidated = true;
    }
  }
  paint(type) {
    if (type < 3 && !this._invalidated) {
      return;
    }
    if (this._size.width === 0 || this._size.height === 0) {
      return;
    }
    this._invalidated = false;
    this._canvasBinding.applySuggestedBitmapSize();
    const target = tryCreateCanvasRenderingTarget2D(this._canvasBinding, {
      colorSpace: this._options.layout.colorSpace
    });
    if (target !== null) {
      target.useBitmapCoordinateSpace((scope) => {
        this._drawBackground(scope);
        this._drawBorder(scope);
      });
    }
  }
  getBitmapSize() {
    return this._canvasBinding.bitmapSize;
  }
  drawBitmap(ctx, x, y) {
    const bitmapSize = this.getBitmapSize();
    if (bitmapSize.width > 0 && bitmapSize.height > 0) {
      ctx.drawImage(this._canvasBinding.canvasElement, x, y);
    }
  }
  _drawBorder({ context: ctx, bitmapSize, horizontalPixelRatio, verticalPixelRatio }) {
    if (!this._borderVisible()) {
      return;
    }
    ctx.fillStyle = this._options.timeScale.borderColor;
    const horzBorderSize = Math.floor(this._rendererOptionsProvider.options().borderSize * horizontalPixelRatio);
    const vertBorderSize = Math.floor(this._rendererOptionsProvider.options().borderSize * verticalPixelRatio);
    const left = this._isLeft ? bitmapSize.width - horzBorderSize : 0;
    ctx.fillRect(left, 0, horzBorderSize, vertBorderSize);
  }
  _drawBackground({ context: ctx, bitmapSize }) {
    clearRect(ctx, 0, 0, bitmapSize.width, bitmapSize.height, this._bottomColor());
  }
};

// ../lib/prod/src/gui/time-axis-widget.js
var Constants8;
(function(Constants14) {
  Constants14[Constants14["BorderSize"] = 1] = "BorderSize";
  Constants14[Constants14["TickLength"] = 5] = "TickLength";
})(Constants8 || (Constants8 = {}));
var CursorType2;
(function(CursorType3) {
  CursorType3[CursorType3["Default"] = 0] = "Default";
  CursorType3[CursorType3["EwResize"] = 1] = "EwResize";
})(CursorType2 || (CursorType2 = {}));
function buildTimeAxisViewsGetter(zOrder) {
  return (source) => source.timePaneViews?.(zOrder) ?? [];
}
var sourcePaneViews2 = buildTimeAxisViewsGetter("normal");
var sourceTopPaneViews2 = buildTimeAxisViewsGetter("top");
var sourceBottomPaneViews2 = buildTimeAxisViewsGetter("bottom");
var TimeAxisWidget = class {
  constructor(chartWidget, horzScaleBehavior) {
    this._leftStub = null;
    this._rightStub = null;
    this._rendererOptions = null;
    this._mouseDown = false;
    this._size = size({ width: 0, height: 0 });
    this._sizeChanged = new Delegate();
    this._widthCache = new TextWidthCache(5);
    this._isSettingSize = false;
    this._canvasSuggestedBitmapSizeChangedHandler = () => {
      if (!this._isSettingSize) {
        this._chart.model().lightUpdate();
      }
    };
    this._topCanvasSuggestedBitmapSizeChangedHandler = () => {
      if (!this._isSettingSize) {
        this._chart.model().lightUpdate();
      }
    };
    this._chart = chartWidget;
    this._horzScaleBehavior = horzScaleBehavior;
    this._options = chartWidget.options()["layout"];
    this._element = document.createElement("tr");
    this._leftStubCell = document.createElement("td");
    this._leftStubCell.style.padding = "0";
    this._rightStubCell = document.createElement("td");
    this._rightStubCell.style.padding = "0";
    this._cell = document.createElement("td");
    this._cell.style.height = "25px";
    this._cell.style.padding = "0";
    this._dv = document.createElement("div");
    this._dv.style.width = "100%";
    this._dv.style.height = "100%";
    this._dv.style.position = "relative";
    this._dv.style.overflow = "hidden";
    this._cell.appendChild(this._dv);
    this._canvasBinding = createBoundCanvas(this._dv, size({ width: 16, height: 16 }));
    this._canvasBinding.subscribeSuggestedBitmapSizeChanged(this._canvasSuggestedBitmapSizeChangedHandler);
    const canvas = this._canvasBinding.canvasElement;
    canvas.style.position = "absolute";
    canvas.style.zIndex = "1";
    canvas.style.left = "0";
    canvas.style.top = "0";
    this._topCanvasBinding = createBoundCanvas(this._dv, size({ width: 16, height: 16 }));
    this._topCanvasBinding.subscribeSuggestedBitmapSizeChanged(this._topCanvasSuggestedBitmapSizeChangedHandler);
    const topCanvas = this._topCanvasBinding.canvasElement;
    topCanvas.style.position = "absolute";
    topCanvas.style.zIndex = "2";
    topCanvas.style.left = "0";
    topCanvas.style.top = "0";
    this._element.appendChild(this._leftStubCell);
    this._element.appendChild(this._cell);
    this._element.appendChild(this._rightStubCell);
    this._recreateStubs();
    this._chart.model().priceScalesOptionsChanged().subscribe(this._recreateStubs.bind(this), this);
    this._mouseEventHandler = new MouseEventHandler(this._topCanvasBinding.canvasElement, this, {
      treatVertTouchDragAsPageScroll: () => true,
      treatHorzTouchDragAsPageScroll: () => !this._chart.options()["handleScroll"].horzTouchDrag
    });
  }
  destroy() {
    this._mouseEventHandler.destroy();
    if (this._leftStub !== null) {
      this._leftStub.destroy();
    }
    if (this._rightStub !== null) {
      this._rightStub.destroy();
    }
    this._topCanvasBinding.unsubscribeSuggestedBitmapSizeChanged(this._topCanvasSuggestedBitmapSizeChangedHandler);
    releaseCanvas(this._topCanvasBinding.canvasElement);
    this._topCanvasBinding.dispose();
    this._canvasBinding.unsubscribeSuggestedBitmapSizeChanged(this._canvasSuggestedBitmapSizeChangedHandler);
    releaseCanvas(this._canvasBinding.canvasElement);
    this._canvasBinding.dispose();
  }
  getElement() {
    return this._element;
  }
  leftStub() {
    return this._leftStub;
  }
  rightStub() {
    return this._rightStub;
  }
  mouseDownEvent(event) {
    if (this._mouseDown) {
      return;
    }
    this._mouseDown = true;
    const model = this._chart.model();
    if (model.timeScale().isEmpty() || !this._chart.options()["handleScale"].axisPressedMouseMove.time) {
      return;
    }
    model.startScaleTime(event.localX);
  }
  touchStartEvent(event) {
    this.mouseDownEvent(event);
  }
  mouseDownOutsideEvent() {
    const model = this._chart.model();
    if (!model.timeScale().isEmpty() && this._mouseDown) {
      this._mouseDown = false;
      if (this._chart.options()["handleScale"].axisPressedMouseMove.time) {
        model.endScaleTime();
      }
    }
  }
  pressedMouseMoveEvent(event) {
    const model = this._chart.model();
    if (model.timeScale().isEmpty() || !this._chart.options()["handleScale"].axisPressedMouseMove.time) {
      return;
    }
    model.scaleTimeTo(event.localX);
  }
  touchMoveEvent(event) {
    this.pressedMouseMoveEvent(event);
  }
  mouseUpEvent() {
    this._mouseDown = false;
    const model = this._chart.model();
    if (model.timeScale().isEmpty() && !this._chart.options()["handleScale"].axisPressedMouseMove.time) {
      return;
    }
    model.endScaleTime();
  }
  touchEndEvent() {
    this.mouseUpEvent();
  }
  mouseDoubleClickEvent() {
    if (this._chart.options()["handleScale"].axisDoubleClickReset.time) {
      this._chart.model().resetTimeScale();
    }
  }
  doubleTapEvent() {
    this.mouseDoubleClickEvent();
  }
  mouseEnterEvent() {
    if (this._chart.model().options()["handleScale"].axisPressedMouseMove.time) {
      this._setCursor(
        1
        /* CursorType.EwResize */
      );
    }
  }
  mouseLeaveEvent() {
    this._setCursor(
      0
      /* CursorType.Default */
    );
  }
  getSize() {
    return this._size;
  }
  sizeChanged() {
    return this._sizeChanged;
  }
  setSizes(timeAxisSize, leftStubWidth, rightStubWidth) {
    if (!equalSizes(this._size, timeAxisSize)) {
      this._size = timeAxisSize;
      this._isSettingSize = true;
      this._canvasBinding.resizeCanvasElement(timeAxisSize);
      this._topCanvasBinding.resizeCanvasElement(timeAxisSize);
      this._isSettingSize = false;
      this._cell.style.width = `${timeAxisSize.width}px`;
      this._cell.style.height = `${timeAxisSize.height}px`;
      this._sizeChanged.fire(timeAxisSize);
    }
    if (this._leftStub !== null) {
      this._leftStub.setSize(size({ width: leftStubWidth, height: timeAxisSize.height }));
    }
    if (this._rightStub !== null) {
      this._rightStub.setSize(size({ width: rightStubWidth, height: timeAxisSize.height }));
    }
  }
  optimalHeight() {
    const rendererOptions = this._getRendererOptions();
    return Math.ceil(
      // rendererOptions.offsetSize +
      rendererOptions.borderSize + rendererOptions.tickLength + rendererOptions.fontSize + rendererOptions.paddingTop + rendererOptions.paddingBottom + rendererOptions.labelBottomOffset
    );
  }
  update() {
    this._chart.model().timeScale().marks();
  }
  getBitmapSize() {
    return this._canvasBinding.bitmapSize;
  }
  drawBitmap(ctx, x, y, addTopLayer) {
    const bitmapSize = this.getBitmapSize();
    if (bitmapSize.width > 0 && bitmapSize.height > 0) {
      ctx.drawImage(this._canvasBinding.canvasElement, x, y);
      if (addTopLayer) {
        const topLayer = this._topCanvasBinding.canvasElement;
        ctx.drawImage(topLayer, x, y);
      }
    }
  }
  paint(type) {
    if (type === 0) {
      return;
    }
    const canvasOptions = {
      colorSpace: this._options.colorSpace
    };
    if (type !== 1) {
      this._canvasBinding.applySuggestedBitmapSize();
      const target = tryCreateCanvasRenderingTarget2D(this._canvasBinding, canvasOptions);
      if (target !== null) {
        target.useBitmapCoordinateSpace((scope) => {
          this._drawBackground(scope);
          this._drawBorder(scope);
          this._drawAdditionalSources(target, sourceBottomPaneViews2);
        });
        this._drawTickMarks(target);
        this._drawAdditionalSources(target, sourcePaneViews2);
      }
      if (this._leftStub !== null) {
        this._leftStub.paint(type);
      }
      if (this._rightStub !== null) {
        this._rightStub.paint(type);
      }
    }
    this._topCanvasBinding.applySuggestedBitmapSize();
    const topTarget = tryCreateCanvasRenderingTarget2D(this._topCanvasBinding, canvasOptions);
    if (topTarget !== null) {
      topTarget.useBitmapCoordinateSpace(({ context: ctx, bitmapSize }) => {
        ctx.clearRect(0, 0, bitmapSize.width, bitmapSize.height);
      });
      this._drawLabels([...this._chart.model().serieses(), this._chart.model().crosshairSource()], topTarget);
      this._drawAdditionalSources(topTarget, sourceTopPaneViews2);
    }
  }
  _drawAdditionalSources(target, axisViewsGetter) {
    const sources = this._chart.model().serieses();
    for (const source of sources) {
      drawSourceViews(axisViewsGetter, (renderer) => drawBackground(renderer, target, false, void 0), source, void 0);
    }
    for (const source of sources) {
      drawSourceViews(axisViewsGetter, (renderer) => drawForeground(renderer, target, false, void 0), source, void 0);
    }
  }
  _drawBackground({ context: ctx, bitmapSize }) {
    clearRect(ctx, 0, 0, bitmapSize.width, bitmapSize.height, this._chart.model().backgroundBottomColor());
  }
  _drawBorder({ context: ctx, bitmapSize, verticalPixelRatio }) {
    if (this._chart.options().timeScale.borderVisible) {
      ctx.fillStyle = this._lineColor();
      const borderSize = Math.max(1, Math.floor(this._getRendererOptions().borderSize * verticalPixelRatio));
      ctx.fillRect(0, 0, bitmapSize.width, borderSize);
    }
  }
  _drawTickMarks(target) {
    const timeScale = this._chart.model().timeScale();
    const tickMarks = timeScale.marks();
    if (!tickMarks || tickMarks.length === 0) {
      return;
    }
    const maxWeight = this._horzScaleBehavior.maxTickMarkWeight(tickMarks);
    const rendererOptions = this._getRendererOptions();
    const options = timeScale.options();
    if (options.borderVisible && options.ticksVisible) {
      target.useBitmapCoordinateSpace(({ context: ctx, horizontalPixelRatio, verticalPixelRatio }) => {
        ctx.strokeStyle = this._lineColor();
        ctx.fillStyle = this._lineColor();
        const tickWidth = Math.max(1, Math.floor(horizontalPixelRatio));
        const tickOffset = Math.floor(horizontalPixelRatio * 0.5);
        ctx.beginPath();
        const tickLen = Math.round(rendererOptions.tickLength * verticalPixelRatio);
        for (let index = tickMarks.length; index--; ) {
          const x = Math.round(tickMarks[index].coord * horizontalPixelRatio);
          ctx.rect(x - tickOffset, 0, tickWidth, tickLen);
        }
        ctx.fill();
      });
    }
    target.useMediaCoordinateSpace(({ context: ctx }) => {
      const yText = rendererOptions.borderSize + rendererOptions.tickLength + rendererOptions.paddingTop + rendererOptions.fontSize / 2;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = this._textColor();
      ctx.font = this._baseFont();
      for (const tickMark of tickMarks) {
        if (tickMark.weight < maxWeight) {
          const coordinate = tickMark.needAlignCoordinate ? this._alignTickMarkLabelCoordinate(ctx, tickMark.coord, tickMark.label) : tickMark.coord;
          ctx.fillText(tickMark.label, coordinate, yText);
        }
      }
      if (this._chart.options().timeScale.allowBoldLabels) {
        ctx.font = this._baseBoldFont();
      }
      for (const tickMark of tickMarks) {
        if (tickMark.weight >= maxWeight) {
          const coordinate = tickMark.needAlignCoordinate ? this._alignTickMarkLabelCoordinate(ctx, tickMark.coord, tickMark.label) : tickMark.coord;
          ctx.fillText(tickMark.label, coordinate, yText);
        }
      }
    });
  }
  _alignTickMarkLabelCoordinate(ctx, coordinate, labelText) {
    const labelWidth = this._widthCache.measureText(ctx, labelText);
    const labelWidthHalf = labelWidth / 2;
    const leftTextCoordinate = Math.floor(coordinate - labelWidthHalf) + 0.5;
    if (leftTextCoordinate < 0) {
      coordinate = coordinate + Math.abs(0 - leftTextCoordinate);
    } else if (leftTextCoordinate + labelWidth > this._size.width) {
      coordinate = coordinate - Math.abs(this._size.width - (leftTextCoordinate + labelWidth));
    }
    return coordinate;
  }
  _drawLabels(sources, target) {
    const rendererOptions = this._getRendererOptions();
    for (const source of sources) {
      for (const view of source.timeAxisViews()) {
        view.renderer().draw(target, rendererOptions);
      }
    }
  }
  _lineColor() {
    return this._chart.options().timeScale.borderColor;
  }
  _textColor() {
    return this._options.textColor;
  }
  _fontSize() {
    return this._options.fontSize;
  }
  _baseFont() {
    return makeFont(this._fontSize(), this._options.fontFamily);
  }
  _baseBoldFont() {
    return makeFont(this._fontSize(), this._options.fontFamily, "bold");
  }
  _getRendererOptions() {
    if (this._rendererOptions === null) {
      this._rendererOptions = {
        borderSize: 1,
        baselineOffset: NaN,
        paddingTop: NaN,
        paddingBottom: NaN,
        paddingHorizontal: NaN,
        tickLength: 5,
        fontSize: NaN,
        font: "",
        widthCache: new TextWidthCache(),
        labelBottomOffset: 0
      };
    }
    const rendererOptions = this._rendererOptions;
    const newFont = this._baseFont();
    if (rendererOptions.font !== newFont) {
      const fontSize = this._fontSize();
      rendererOptions.fontSize = fontSize;
      rendererOptions.font = newFont;
      rendererOptions.paddingTop = 3 * fontSize / 12;
      rendererOptions.paddingBottom = 3 * fontSize / 12;
      rendererOptions.paddingHorizontal = 9 * fontSize / 12;
      rendererOptions.baselineOffset = 0;
      rendererOptions.labelBottomOffset = 4 * fontSize / 12;
      rendererOptions.widthCache.reset();
    }
    return this._rendererOptions;
  }
  _setCursor(type) {
    this._cell.style.cursor = type === 1 ? "ew-resize" : "default";
  }
  _recreateStubs() {
    const model = this._chart.model();
    const options = model.options();
    if (!options.leftPriceScale.visible && this._leftStub !== null) {
      this._leftStubCell.removeChild(this._leftStub.getElement());
      this._leftStub.destroy();
      this._leftStub = null;
    }
    if (!options.rightPriceScale.visible && this._rightStub !== null) {
      this._rightStubCell.removeChild(this._rightStub.getElement());
      this._rightStub.destroy();
      this._rightStub = null;
    }
    const rendererOptionsProvider = this._chart.model().rendererOptionsProvider();
    const params = {
      rendererOptionsProvider
    };
    const borderVisibleGetter = () => {
      return options.leftPriceScale.borderVisible && model.timeScale().options().borderVisible;
    };
    const bottomColorGetter = () => model.backgroundBottomColor();
    if (options.leftPriceScale.visible && this._leftStub === null) {
      this._leftStub = new PriceAxisStub("left", options, params, borderVisibleGetter, bottomColorGetter);
      this._leftStubCell.appendChild(this._leftStub.getElement());
    }
    if (options.rightPriceScale.visible && this._rightStub === null) {
      this._rightStub = new PriceAxisStub("right", options, params, borderVisibleGetter, bottomColorGetter);
      this._rightStubCell.appendChild(this._rightStub.getElement());
    }
  }
};

// ../lib/prod/src/gui/chart-widget.js
var windowsChrome = isChromiumBased() && isWindows();
var ChartWidget = class {
  constructor(container, options, horzScaleBehavior) {
    this._paneWidgets = [];
    this._paneSeparators = [];
    this._drawRafId = 0;
    this._height = 0;
    this._width = 0;
    this._leftPriceAxisWidth = 0;
    this._rightPriceAxisWidth = 0;
    this._invalidateMask = null;
    this._drawPlanned = false;
    this._clicked = new Delegate();
    this._dblClicked = new Delegate();
    this._crosshairMoved = new Delegate();
    this._observer = null;
    this._cursorStyleOverride = null;
    this._container = container;
    this._options = options;
    this._horzScaleBehavior = horzScaleBehavior;
    this._element = document.createElement("div");
    this._element.classList.add("tv-lightweight-charts");
    this._element.style.overflow = "hidden";
    this._element.style.direction = "ltr";
    this._element.style.width = "100%";
    this._element.style.height = "100%";
    disableSelection(this._element);
    this._tableElement = document.createElement("table");
    this._tableElement.setAttribute("cellspacing", "0");
    this._element.appendChild(this._tableElement);
    this._onWheelBound = this._onMousewheel.bind(this);
    if (shouldSubscribeMouseWheel(this._options)) {
      this._setMouseWheelEventListener(true);
    }
    this._model = new ChartModel(this._invalidateHandler.bind(this), this._options, horzScaleBehavior);
    this.model().crosshairMoved().subscribe(this._onPaneWidgetCrosshairMoved.bind(this), this);
    this._timeAxisWidget = new TimeAxisWidget(this, this._horzScaleBehavior);
    this._tableElement.appendChild(this._timeAxisWidget.getElement());
    const usedObserver = options.autoSize && this._installObserver();
    let width = this._options.width;
    let height = this._options.height;
    if (usedObserver || width === 0 || height === 0) {
      const containerRect = container.getBoundingClientRect();
      width = width || containerRect.width;
      height = height || containerRect.height;
    }
    this.resize(width, height);
    this._syncGuiWithModel();
    container.appendChild(this._element);
    this._updateTimeAxisVisibility();
    this._model.timeScale().optionsApplied().subscribe(this._model.fullUpdate.bind(this._model), this);
    this._model.priceScalesOptionsChanged().subscribe(this._model.fullUpdate.bind(this._model), this);
  }
  model() {
    return this._model;
  }
  options() {
    return this._options;
  }
  paneWidgets() {
    return this._paneWidgets;
  }
  timeAxisWidget() {
    return this._timeAxisWidget;
  }
  destroy() {
    this._setMouseWheelEventListener(false);
    if (this._drawRafId !== 0) {
      window.cancelAnimationFrame(this._drawRafId);
    }
    this._model.crosshairMoved().unsubscribeAll(this);
    this._model.timeScale().optionsApplied().unsubscribeAll(this);
    this._model.priceScalesOptionsChanged().unsubscribeAll(this);
    this._model.destroy();
    for (const paneWidget of this._paneWidgets) {
      this._tableElement.removeChild(paneWidget.getElement());
      paneWidget.clicked().unsubscribeAll(this);
      paneWidget.dblClicked().unsubscribeAll(this);
      paneWidget.destroy();
    }
    this._paneWidgets = [];
    for (const paneSeparator of this._paneSeparators) {
      this._destroySeparator(paneSeparator);
    }
    this._paneSeparators = [];
    ensureNotNull(this._timeAxisWidget).destroy();
    if (this._element.parentElement !== null) {
      this._element.parentElement.removeChild(this._element);
    }
    this._crosshairMoved.destroy();
    this._clicked.destroy();
    this._dblClicked.destroy();
    this._uninstallObserver();
  }
  resize(width, height, forceRepaint = false) {
    if (this._height === height && this._width === width) {
      return;
    }
    const sizeHint = suggestChartSize(size({ width, height }));
    this._height = sizeHint.height;
    this._width = sizeHint.width;
    const heightStr = this._height + "px";
    const widthStr = this._width + "px";
    ensureNotNull(this._element).style.height = heightStr;
    ensureNotNull(this._element).style.width = widthStr;
    this._tableElement.style.height = heightStr;
    this._tableElement.style.width = widthStr;
    if (forceRepaint) {
      this._drawImpl(InvalidateMask.full(), performance.now());
    } else {
      this._model.fullUpdate();
    }
  }
  paint(invalidateMask) {
    if (invalidateMask === void 0) {
      invalidateMask = InvalidateMask.full();
    }
    for (let i = 0; i < this._paneWidgets.length; i++) {
      this._paneWidgets[i].paint(invalidateMask.invalidateForPane(i).level);
    }
    if (this._options.timeScale.visible) {
      this._timeAxisWidget.paint(invalidateMask.fullInvalidation());
    }
  }
  applyOptions(options) {
    const currentlyHasMouseWheelListener = shouldSubscribeMouseWheel(this._options);
    this._model.applyOptions(options);
    const shouldHaveMouseWheelListener = shouldSubscribeMouseWheel(this._options);
    if (shouldHaveMouseWheelListener !== currentlyHasMouseWheelListener) {
      this._setMouseWheelEventListener(shouldHaveMouseWheelListener);
    }
    if (options["layout"]?.panes) {
      this._applyPanesOptions();
    }
    this._updateTimeAxisVisibility();
    this._applyAutoSizeOptions(options);
  }
  clicked() {
    return this._clicked;
  }
  dblClicked() {
    return this._dblClicked;
  }
  crosshairMoved() {
    return this._crosshairMoved;
  }
  takeScreenshot(addTopLayer = false) {
    if (this._invalidateMask !== null) {
      this._drawImpl(this._invalidateMask, performance.now());
      this._invalidateMask = null;
    }
    const screeshotBitmapSize = this._traverseLayout(null);
    const screenshotCanvas = document.createElement("canvas");
    screenshotCanvas.width = screeshotBitmapSize.width;
    screenshotCanvas.height = screeshotBitmapSize.height;
    const ctx = ensureNotNull(screenshotCanvas.getContext("2d"));
    this._traverseLayout(ctx, addTopLayer);
    return screenshotCanvas;
  }
  getPriceAxisWidth(position) {
    if (position === "left" && !this._isLeftAxisVisible()) {
      return 0;
    }
    if (position === "right" && !this._isRightAxisVisible()) {
      return 0;
    }
    if (this._paneWidgets.length === 0) {
      return 0;
    }
    const priceAxisWidget = position === "left" ? this._paneWidgets[0].leftPriceAxisWidget() : this._paneWidgets[0].rightPriceAxisWidget();
    return ensureNotNull(priceAxisWidget).getWidth();
  }
  autoSizeActive() {
    return this._options.autoSize && this._observer !== null;
  }
  element() {
    return this._element;
  }
  setCursorStyle(style) {
    this._cursorStyleOverride = style;
    if (this._cursorStyleOverride) {
      this.element().style.setProperty("cursor", style);
    } else {
      this.element().style.removeProperty("cursor");
    }
  }
  getCursorOverrideStyle() {
    return this._cursorStyleOverride;
  }
  paneSize(paneIndex) {
    return ensureDefined(this._paneWidgets[paneIndex]).getSize();
  }
  _applyPanesOptions() {
    this._paneSeparators.forEach((separator) => {
      separator.update();
    });
  }
  // eslint-disable-next-line complexity
  _applyAutoSizeOptions(options) {
    if (options.autoSize === void 0 && this._observer && (options.width !== void 0 || options.height !== void 0)) {
      warn(`You should turn autoSize off explicitly before specifying sizes; try adding options.autoSize: false to new options`);
      return;
    }
    if (options.autoSize && !this._observer) {
      this._installObserver();
    }
    if (options.autoSize === false && this._observer !== null) {
      this._uninstallObserver();
    }
    if (!options.autoSize && (options.width !== void 0 || options.height !== void 0)) {
      this.resize(options.width || this._width, options.height || this._height);
    }
  }
  /**
   * Traverses the widget's layout (pane and axis child widgets),
   * draws the screenshot (if rendering context is passed) and returns the screenshot bitmap size
   *
   * @param ctx - if passed, used to draw the screenshot of widget
   * @param addTopLayer - if true, the top layer with crosshair and primitives will be drawn
   * @returns screenshot bitmap size
   */
  _traverseLayout(ctx, addTopLayer) {
    let totalWidth = 0;
    let totalHeight = 0;
    const firstPane = this._paneWidgets[0];
    const drawPriceAxises = (position, targetX) => {
      let targetY = 0;
      for (let paneIndex = 0; paneIndex < this._paneWidgets.length; paneIndex++) {
        const paneWidget = this._paneWidgets[paneIndex];
        const priceAxisWidget = ensureNotNull(position === "left" ? paneWidget.leftPriceAxisWidget() : paneWidget.rightPriceAxisWidget());
        const bitmapSize = priceAxisWidget.getBitmapSize();
        if (ctx !== null) {
          priceAxisWidget.drawBitmap(ctx, targetX, targetY, addTopLayer);
        }
        targetY += bitmapSize.height;
        if (paneIndex < this._paneWidgets.length - 1) {
          const separator = this._paneSeparators[paneIndex];
          const separatorBitmapSize = separator.getBitmapSize();
          if (ctx !== null) {
            separator.drawBitmap(ctx, targetX, targetY);
          }
          targetY += separatorBitmapSize.height;
        }
      }
    };
    if (this._isLeftAxisVisible()) {
      drawPriceAxises("left", 0);
      const leftAxisBitmapWidth = ensureNotNull(firstPane.leftPriceAxisWidget()).getBitmapSize().width;
      totalWidth += leftAxisBitmapWidth;
    }
    for (let paneIndex = 0; paneIndex < this._paneWidgets.length; paneIndex++) {
      const paneWidget = this._paneWidgets[paneIndex];
      const bitmapSize = paneWidget.getBitmapSize();
      if (ctx !== null) {
        paneWidget.drawBitmap(ctx, totalWidth, totalHeight, addTopLayer);
      }
      totalHeight += bitmapSize.height;
      if (paneIndex < this._paneWidgets.length - 1) {
        const separator = this._paneSeparators[paneIndex];
        const separatorBitmapSize = separator.getBitmapSize();
        if (ctx !== null) {
          separator.drawBitmap(ctx, totalWidth, totalHeight);
        }
        totalHeight += separatorBitmapSize.height;
      }
    }
    const firstPaneBitmapWidth = firstPane.getBitmapSize().width;
    totalWidth += firstPaneBitmapWidth;
    if (this._isRightAxisVisible()) {
      drawPriceAxises("right", totalWidth);
      const rightAxisBitmapWidth = ensureNotNull(firstPane.rightPriceAxisWidget()).getBitmapSize().width;
      totalWidth += rightAxisBitmapWidth;
    }
    const drawStub = (position, targetX, targetY) => {
      const stub = ensureNotNull(position === "left" ? this._timeAxisWidget.leftStub() : this._timeAxisWidget.rightStub());
      stub.drawBitmap(ensureNotNull(ctx), targetX, targetY);
    };
    if (this._options.timeScale.visible) {
      const timeAxisBitmapSize = this._timeAxisWidget.getBitmapSize();
      if (ctx !== null) {
        let targetX = 0;
        if (this._isLeftAxisVisible()) {
          drawStub("left", targetX, totalHeight);
          targetX = ensureNotNull(firstPane.leftPriceAxisWidget()).getBitmapSize().width;
        }
        this._timeAxisWidget.drawBitmap(ctx, targetX, totalHeight, addTopLayer);
        targetX += timeAxisBitmapSize.width;
        if (this._isRightAxisVisible()) {
          drawStub("right", targetX, totalHeight);
        }
      }
      totalHeight += timeAxisBitmapSize.height;
    }
    return size({
      width: totalWidth,
      height: totalHeight
    });
  }
  // eslint-disable-next-line complexity
  _adjustSizeImpl() {
    let totalStretch = 0;
    let leftPriceAxisWidth = 0;
    let rightPriceAxisWidth = 0;
    for (const paneWidget of this._paneWidgets) {
      if (this._isLeftAxisVisible()) {
        leftPriceAxisWidth = Math.max(leftPriceAxisWidth, ensureNotNull(paneWidget.leftPriceAxisWidget()).optimalWidth(), this._options.leftPriceScale.minimumWidth);
      }
      if (this._isRightAxisVisible()) {
        rightPriceAxisWidth = Math.max(rightPriceAxisWidth, ensureNotNull(paneWidget.rightPriceAxisWidget()).optimalWidth(), this._options.rightPriceScale.minimumWidth);
      }
      totalStretch += paneWidget.stretchFactor();
    }
    leftPriceAxisWidth = suggestPriceScaleWidth(leftPriceAxisWidth);
    rightPriceAxisWidth = suggestPriceScaleWidth(rightPriceAxisWidth);
    const width = this._width;
    const height = this._height;
    const paneWidth = Math.max(width - leftPriceAxisWidth - rightPriceAxisWidth, 0);
    const separatorCount = this._paneSeparators.length;
    const separatorHeight = 1;
    const separatorsHeight = separatorHeight * separatorCount;
    const timeAxisVisible = this._options.timeScale.visible;
    let timeAxisHeight = timeAxisVisible ? Math.max(this._timeAxisWidget.optimalHeight(), this._options.timeScale.minimumHeight) : 0;
    timeAxisHeight = suggestTimeScaleHeight(timeAxisHeight);
    const otherWidgetHeight = separatorsHeight + timeAxisHeight;
    const totalPaneHeight = height < otherWidgetHeight ? 0 : height - otherWidgetHeight;
    const stretchPixels = totalPaneHeight / totalStretch;
    let accumulatedHeight = 0;
    const pixelRatio = window.devicePixelRatio || 1;
    for (let paneIndex = 0; paneIndex < this._paneWidgets.length; ++paneIndex) {
      const paneWidget = this._paneWidgets[paneIndex];
      paneWidget.setState(this._model.panes()[paneIndex]);
      let paneHeight = 0;
      let calculatePaneHeight = 0;
      if (paneIndex === this._paneWidgets.length - 1) {
        calculatePaneHeight = Math.ceil((totalPaneHeight - accumulatedHeight) * pixelRatio) / pixelRatio;
      } else {
        calculatePaneHeight = Math.round(paneWidget.stretchFactor() * stretchPixels * pixelRatio) / pixelRatio;
      }
      paneHeight = Math.max(calculatePaneHeight, 2);
      accumulatedHeight += paneHeight;
      paneWidget.setSize(size({ width: paneWidth, height: paneHeight }));
      if (this._isLeftAxisVisible()) {
        paneWidget.setPriceAxisSize(leftPriceAxisWidth, "left");
      }
      if (this._isRightAxisVisible()) {
        paneWidget.setPriceAxisSize(rightPriceAxisWidth, "right");
      }
      if (paneWidget.state()) {
        this._model.setPaneHeight(paneWidget.state(), paneHeight);
      }
    }
    this._timeAxisWidget.setSizes(size({ width: timeAxisVisible ? paneWidth : 0, height: timeAxisHeight }), timeAxisVisible ? leftPriceAxisWidth : 0, timeAxisVisible ? rightPriceAxisWidth : 0);
    this._model.setWidth(paneWidth);
    if (this._leftPriceAxisWidth !== leftPriceAxisWidth) {
      this._leftPriceAxisWidth = leftPriceAxisWidth;
    }
    if (this._rightPriceAxisWidth !== rightPriceAxisWidth) {
      this._rightPriceAxisWidth = rightPriceAxisWidth;
    }
  }
  _setMouseWheelEventListener(add2) {
    if (add2) {
      this._element.addEventListener("wheel", this._onWheelBound, { passive: false });
      return;
    }
    this._element.removeEventListener("wheel", this._onWheelBound);
  }
  _determineWheelSpeedAdjustment(event) {
    switch (event.deltaMode) {
      case event.DOM_DELTA_PAGE:
        return 120;
      case event.DOM_DELTA_LINE:
        return 32;
    }
    if (!windowsChrome) {
      return 1;
    }
    return 1 / window.devicePixelRatio;
  }
  _onMousewheel(event) {
    if ((event.deltaX === 0 || !this._options["handleScroll"].mouseWheel) && (event.deltaY === 0 || !this._options["handleScale"].mouseWheel)) {
      return;
    }
    const scrollSpeedAdjustment = this._determineWheelSpeedAdjustment(event);
    const deltaX = scrollSpeedAdjustment * event.deltaX / 100;
    const deltaY = -(scrollSpeedAdjustment * event.deltaY / 100);
    if (event.cancelable) {
      event.preventDefault();
    }
    if (deltaY !== 0 && this._options["handleScale"].mouseWheel) {
      const zoomScale = Math.sign(deltaY) * Math.min(1, Math.abs(deltaY));
      const scrollPosition = event.clientX - this._element.getBoundingClientRect().left;
      this.model().zoomTime(scrollPosition, zoomScale);
    }
    if (deltaX !== 0 && this._options["handleScroll"].mouseWheel) {
      this.model().scrollChart(deltaX * -80);
    }
  }
  _drawImpl(invalidateMask, time) {
    const invalidationType = invalidateMask.fullInvalidation();
    if (invalidationType === 3) {
      this._updateGui();
    }
    if (invalidationType === 3 || invalidationType === 2) {
      this._applyMomentaryAutoScale(invalidateMask);
      this._applyTimeScaleInvalidations(invalidateMask, time);
      this._timeAxisWidget.update();
      this._paneWidgets.forEach((pane) => {
        pane.updatePriceAxisWidgets();
      });
      if (this._invalidateMask?.fullInvalidation() === 3) {
        this._invalidateMask.merge(invalidateMask);
        this._updateGui();
        this._applyMomentaryAutoScale(this._invalidateMask);
        this._applyTimeScaleInvalidations(this._invalidateMask, time);
        invalidateMask = this._invalidateMask;
        this._invalidateMask = null;
      }
    }
    this.paint(invalidateMask);
  }
  _applyTimeScaleInvalidations(invalidateMask, time) {
    for (const tsInvalidation of invalidateMask.timeScaleInvalidations()) {
      this._applyTimeScaleInvalidation(tsInvalidation, time);
    }
  }
  _applyMomentaryAutoScale(invalidateMask) {
    const panes = this._model.panes();
    for (let i = 0; i < panes.length; i++) {
      if (invalidateMask.invalidateForPane(i).autoScale) {
        panes[i].momentaryAutoScale();
      }
    }
  }
  _applyTimeScaleInvalidation(invalidation, time) {
    const timeScale = this._model.timeScale();
    switch (invalidation.type) {
      case 0:
        timeScale.fitContent();
        break;
      case 1:
        timeScale.setLogicalRange(invalidation.value);
        break;
      case 2:
        timeScale.setBarSpacing(invalidation.value);
        break;
      case 3:
        timeScale.setRightOffset(invalidation.value);
        break;
      case 4:
        timeScale.restoreDefault();
        break;
      case 5:
        if (!invalidation.value.finished(time)) {
          timeScale.setRightOffset(invalidation.value.getPosition(time));
        }
        break;
    }
  }
  _invalidateHandler(invalidateMask) {
    if (this._invalidateMask !== null) {
      this._invalidateMask.merge(invalidateMask);
    } else {
      this._invalidateMask = invalidateMask;
    }
    if (!this._drawPlanned) {
      this._drawPlanned = true;
      this._drawRafId = window.requestAnimationFrame((time) => {
        this._drawPlanned = false;
        this._drawRafId = 0;
        if (this._invalidateMask !== null) {
          const mask = this._invalidateMask;
          this._invalidateMask = null;
          this._drawImpl(mask, time);
          for (const tsInvalidation of mask.timeScaleInvalidations()) {
            if (tsInvalidation.type === 5 && !tsInvalidation.value.finished(time)) {
              this.model().setTimeScaleAnimation(tsInvalidation.value);
              break;
            }
          }
        }
      });
    }
  }
  _updateGui() {
    this._syncGuiWithModel();
  }
  _destroySeparator(separator) {
    this._tableElement.removeChild(separator.getElement());
    separator.destroy();
  }
  _syncGuiWithModel() {
    const panes = this._model.panes();
    const targetPaneWidgetsCount = panes.length;
    const actualPaneWidgetsCount = this._paneWidgets.length;
    for (let i = targetPaneWidgetsCount; i < actualPaneWidgetsCount; i++) {
      const paneWidget = ensureDefined(this._paneWidgets.pop());
      this._tableElement.removeChild(paneWidget.getElement());
      paneWidget.clicked().unsubscribeAll(this);
      paneWidget.dblClicked().unsubscribeAll(this);
      paneWidget.destroy();
      const paneSeparator = this._paneSeparators.pop();
      if (paneSeparator !== void 0) {
        this._destroySeparator(paneSeparator);
      }
    }
    for (let i = actualPaneWidgetsCount; i < targetPaneWidgetsCount; i++) {
      const paneWidget = new PaneWidget(this, panes[i]);
      paneWidget.clicked().subscribe(this._onPaneWidgetClicked.bind(this, paneWidget), this);
      paneWidget.dblClicked().subscribe(this._onPaneWidgetDblClicked.bind(this, paneWidget), this);
      this._paneWidgets.push(paneWidget);
      if (i > 0) {
        const paneSeparator = new PaneSeparator(this, i - 1, i);
        this._paneSeparators.push(paneSeparator);
        this._tableElement.insertBefore(paneSeparator.getElement(), this._timeAxisWidget.getElement());
      }
      this._tableElement.insertBefore(paneWidget.getElement(), this._timeAxisWidget.getElement());
    }
    for (let i = 0; i < targetPaneWidgetsCount; i++) {
      const state = panes[i];
      const paneWidget = this._paneWidgets[i];
      if (paneWidget.state() !== state) {
        paneWidget.setState(state);
      } else {
        paneWidget.updatePriceAxisWidgetsStates();
      }
    }
    this._updateTimeAxisVisibility();
    this._adjustSizeImpl();
  }
  _getMouseEventParamsImpl(index, point, event, pane) {
    const seriesData = /* @__PURE__ */ new Map();
    if (index !== null) {
      const serieses = this._model.serieses();
      serieses.forEach((s) => {
        const data = s.bars().search(index);
        if (data !== null) {
          seriesData.set(s, data);
        }
      });
    }
    let clientTime;
    if (index !== null) {
      const timePoint = this._model.timeScale().indexToTimeScalePoint(index)?.originalTime;
      if (timePoint !== void 0) {
        clientTime = timePoint;
      }
    }
    const hoveredSource = this.model().hoveredSource();
    const hoveredSeries = hoveredSource !== null && hoveredSource.source instanceof Series ? hoveredSource.source : void 0;
    const hoveredObject = hoveredSource !== null && hoveredSource.object !== void 0 ? hoveredSource.object.externalId : void 0;
    const paneIndex = this._getPaneIndex(pane);
    return {
      originalTime: clientTime,
      index: index ?? void 0,
      point: point ?? void 0,
      paneIndex: paneIndex !== -1 ? paneIndex : void 0,
      hoveredSeries,
      seriesData,
      hoveredObject,
      touchMouseEventData: event ?? void 0
    };
  }
  _getPaneIndex(pane) {
    let paneIndex = -1;
    if (pane) {
      paneIndex = this._paneWidgets.indexOf(pane);
    } else {
      const crosshairPane = this.model().crosshairSource().pane();
      if (crosshairPane !== null) {
        paneIndex = this.model().panes().indexOf(crosshairPane);
      }
    }
    return paneIndex;
  }
  _onPaneWidgetClicked(pane, time, point, event) {
    this._clicked.fire(() => this._getMouseEventParamsImpl(time, point, event, pane));
  }
  _onPaneWidgetDblClicked(pane, time, point, event) {
    this._dblClicked.fire(() => this._getMouseEventParamsImpl(time, point, event, pane));
  }
  _onPaneWidgetCrosshairMoved(time, point, event) {
    this.setCursorStyle(this.model().hoveredSource()?.cursorStyle ?? null);
    this._crosshairMoved.fire(() => this._getMouseEventParamsImpl(time, point, event));
  }
  _updateTimeAxisVisibility() {
    const display = this._options.timeScale.visible ? "" : "none";
    this._timeAxisWidget.getElement().style.display = display;
  }
  _isLeftAxisVisible() {
    return this._paneWidgets[0].state().leftPriceScale().options().visible;
  }
  _isRightAxisVisible() {
    return this._paneWidgets[0].state().rightPriceScale().options().visible;
  }
  _installObserver() {
    if (!("ResizeObserver" in window)) {
      warn('Options contains "autoSize" flag, but the browser does not support ResizeObserver feature. Please provide polyfill.');
      return false;
    } else {
      this._observer = new ResizeObserver((entries) => {
        const containerEntry = entries[entries.length - 1];
        if (!containerEntry) {
          return;
        }
        this.resize(containerEntry.contentRect.width, containerEntry.contentRect.height);
      });
      this._observer.observe(this._container, { box: "border-box" });
      return true;
    }
  }
  _uninstallObserver() {
    if (this._observer !== null) {
      this._observer.disconnect();
    }
    this._observer = null;
  }
};
function disableSelection(element) {
  element.style.userSelect = "none";
  element.style.webkitUserSelect = "none";
  element.style.msUserSelect = "none";
  element.style.MozUserSelect = "none";
  element.style.webkitTapHighlightColor = "transparent";
}
function shouldSubscribeMouseWheel(options) {
  return Boolean(options["handleScroll"].mouseWheel || options["handleScale"].mouseWheel);
}

// ../lib/prod/src/model/data-consumer.js
function isWhitespaceData(data) {
  return data.open === void 0 && data.value === void 0;
}
function isFulfilledData(data) {
  return isFulfilledBarData(data) || isFulfilledLineData(data);
}
function isFulfilledBarData(data) {
  return data.open !== void 0;
}
function isFulfilledLineData(data) {
  return data.value !== void 0;
}

// ../lib/prod/src/model/get-series-plot-row-creator.js
function getColoredLineBasedSeriesPlotRow(time, index, item, originalTime) {
  const val = item.value;
  const res = { index, time, value: [val, val, val, val], originalTime };
  if (item.color !== void 0) {
    res.color = item.color;
  }
  return res;
}
function getAreaSeriesPlotRow(time, index, item, originalTime) {
  const val = item.value;
  const res = { index, time, value: [val, val, val, val], originalTime };
  if (item.lineColor !== void 0) {
    res.lineColor = item.lineColor;
  }
  if (item.topColor !== void 0) {
    res.topColor = item.topColor;
  }
  if (item.bottomColor !== void 0) {
    res.bottomColor = item.bottomColor;
  }
  return res;
}
function getBaselineSeriesPlotRow(time, index, item, originalTime) {
  const val = item.value;
  const res = { index, time, value: [val, val, val, val], originalTime };
  if (item.topLineColor !== void 0) {
    res.topLineColor = item.topLineColor;
  }
  if (item.bottomLineColor !== void 0) {
    res.bottomLineColor = item.bottomLineColor;
  }
  if (item.topFillColor1 !== void 0) {
    res.topFillColor1 = item.topFillColor1;
  }
  if (item.topFillColor2 !== void 0) {
    res.topFillColor2 = item.topFillColor2;
  }
  if (item.bottomFillColor1 !== void 0) {
    res.bottomFillColor1 = item.bottomFillColor1;
  }
  if (item.bottomFillColor2 !== void 0) {
    res.bottomFillColor2 = item.bottomFillColor2;
  }
  return res;
}
function getBarSeriesPlotRow(time, index, item, originalTime) {
  const res = { index, time, value: [item.open, item.high, item.low, item.close], originalTime };
  if (item.color !== void 0) {
    res.color = item.color;
  }
  return res;
}
function getCandlestickSeriesPlotRow(time, index, item, originalTime) {
  const res = { index, time, value: [item.open, item.high, item.low, item.close], originalTime };
  if (item.color !== void 0) {
    res.color = item.color;
  }
  if (item.borderColor !== void 0) {
    res.borderColor = item.borderColor;
  }
  if (item.wickColor !== void 0) {
    res.wickColor = item.wickColor;
  }
  return res;
}
function getCustomSeriesPlotRow(time, index, item, originalTime, dataToPlotRow) {
  const values = ensureDefined(dataToPlotRow)(item);
  const max = Math.max(...values);
  const min2 = Math.min(...values);
  const last = values[values.length - 1];
  const value = [last, max, min2, last];
  const { time: excludedTime, color, ...data } = item;
  return { index, time, value, originalTime, data, color };
}
function isSeriesPlotRow(row) {
  return row.value !== void 0;
}
function wrapCustomValues(plotRow, bar) {
  if (bar.customValues !== void 0) {
    plotRow.customValues = bar.customValues;
  }
  return plotRow;
}
function isWhitespaceDataWithCustomCheck(bar, customIsWhitespace) {
  if (customIsWhitespace) {
    return customIsWhitespace(bar);
  }
  return isWhitespaceData(bar);
}
function wrapWhitespaceData(createPlotRowFn) {
  return (time, index, bar, originalTime, dataToPlotRow, customIsWhitespace) => {
    if (isWhitespaceDataWithCustomCheck(bar, customIsWhitespace)) {
      return wrapCustomValues({ time, index, originalTime }, bar);
    }
    return wrapCustomValues(createPlotRowFn(time, index, bar, originalTime, dataToPlotRow), bar);
  };
}
function getSeriesPlotRowCreator(seriesType) {
  const seriesPlotRowFnMap = {
    Candlestick: wrapWhitespaceData(getCandlestickSeriesPlotRow),
    Bar: wrapWhitespaceData(getBarSeriesPlotRow),
    Area: wrapWhitespaceData(getAreaSeriesPlotRow),
    Baseline: wrapWhitespaceData(getBaselineSeriesPlotRow),
    Histogram: wrapWhitespaceData(getColoredLineBasedSeriesPlotRow),
    Line: wrapWhitespaceData(getColoredLineBasedSeriesPlotRow),
    Custom: wrapWhitespaceData(getCustomSeriesPlotRow)
  };
  return seriesPlotRowFnMap[seriesType];
}

// ../lib/prod/src/model/data-layer.js
function createEmptyTimePointData(timePoint) {
  return { index: 0, mapping: /* @__PURE__ */ new Map(), timePoint };
}
function seriesRowsFirstAndLastTime(seriesRows, bh) {
  if (seriesRows === void 0 || seriesRows.length === 0) {
    return void 0;
  }
  return {
    firstTime: bh.key(seriesRows[0].time),
    lastTime: bh.key(seriesRows[seriesRows.length - 1].time)
  };
}
function seriesUpdateInfo(seriesRows, prevSeriesRows, bh) {
  const firstAndLastTime = seriesRowsFirstAndLastTime(seriesRows, bh);
  const prevFirstAndLastTime = seriesRowsFirstAndLastTime(prevSeriesRows, bh);
  if (firstAndLastTime !== void 0 && prevFirstAndLastTime !== void 0) {
    return {
      historicalUpdate: false,
      lastBarUpdatedOrNewBarsAddedToTheRight: firstAndLastTime.lastTime >= prevFirstAndLastTime.lastTime && firstAndLastTime.firstTime >= prevFirstAndLastTime.firstTime
    };
  }
  return void 0;
}
function timeScalePointTime(mergedPointData) {
  let result;
  mergedPointData.forEach((v) => {
    if (result === void 0) {
      result = v.originalTime;
    }
  });
  return ensureDefined(result);
}
function saveOriginalTime(data) {
  if (data.originalTime === void 0) {
    data.originalTime = data.time;
  }
}
var DataLayer = class {
  constructor(horzScaleBehavior) {
    this._pointDataByTimePoint = /* @__PURE__ */ new Map();
    this._seriesRowsBySeries = /* @__PURE__ */ new Map();
    this._seriesLastTimePoint = /* @__PURE__ */ new Map();
    this._sortedTimePoints = [];
    this._horzScaleBehavior = horzScaleBehavior;
  }
  destroy() {
    this._pointDataByTimePoint.clear();
    this._seriesRowsBySeries.clear();
    this._seriesLastTimePoint.clear();
    this._sortedTimePoints = [];
  }
  setSeriesData(series, data) {
    let needCleanupPoints = this._pointDataByTimePoint.size !== 0;
    let isTimeScaleAffected = false;
    const prevSeriesRows = this._seriesRowsBySeries.get(series);
    if (prevSeriesRows !== void 0) {
      if (this._seriesRowsBySeries.size === 1) {
        needCleanupPoints = false;
        isTimeScaleAffected = true;
        this._pointDataByTimePoint.clear();
      } else {
        for (const point of this._sortedTimePoints) {
          if (point.pointData.mapping.delete(series)) {
            isTimeScaleAffected = true;
          }
        }
      }
    }
    let seriesRows = [];
    if (data.length !== 0) {
      const originalTimes = data.map((d) => d.time);
      const timeConverter = this._horzScaleBehavior.createConverterToInternalObj(data);
      const createPlotRow = getSeriesPlotRowCreator(series.seriesType());
      const dataToPlotRow = series.customSeriesPlotValuesBuilder();
      const customWhitespaceChecker = series.customSeriesWhitespaceCheck();
      seriesRows = data.map((item, index) => {
        const time = timeConverter(item.time);
        const horzItemKey = this._horzScaleBehavior.key(time);
        let timePointData = this._pointDataByTimePoint.get(horzItemKey);
        if (timePointData === void 0) {
          timePointData = createEmptyTimePointData(time);
          this._pointDataByTimePoint.set(horzItemKey, timePointData);
          isTimeScaleAffected = true;
        }
        const row = createPlotRow(time, timePointData.index, item, originalTimes[index], dataToPlotRow, customWhitespaceChecker);
        timePointData.mapping.set(series, row);
        return row;
      });
    }
    if (needCleanupPoints) {
      this._cleanupPointsData();
    }
    this._setRowsToSeries(series, seriesRows);
    let firstChangedPointIndex = -1;
    if (isTimeScaleAffected) {
      const newTimeScalePoints = [];
      this._pointDataByTimePoint.forEach((pointData) => {
        newTimeScalePoints.push({
          timeWeight: 0,
          time: pointData.timePoint,
          pointData,
          originalTime: timeScalePointTime(pointData.mapping)
        });
      });
      newTimeScalePoints.sort((t1, t2) => this._horzScaleBehavior.key(t1.time) - this._horzScaleBehavior.key(t2.time));
      firstChangedPointIndex = this._replaceTimeScalePoints(newTimeScalePoints);
    }
    return this._getUpdateResponse(series, firstChangedPointIndex, seriesUpdateInfo(this._seriesRowsBySeries.get(series), prevSeriesRows, this._horzScaleBehavior));
  }
  removeSeries(series) {
    return this.setSeriesData(series, []);
  }
  // eslint-disable-next-line complexity
  updateSeriesData(series, data, historicalUpdate) {
    if (historicalUpdate && series.isConflationEnabled()) {
      throw new Error("Historical updates are not supported when conflation is enabled. Conflation requires data to be processed in order.");
    }
    const extendedData = data;
    saveOriginalTime(extendedData);
    this._horzScaleBehavior.preprocessData(data);
    const timeConverter = this._horzScaleBehavior.createConverterToInternalObj([data]);
    const time = timeConverter(data.time);
    const lastSeriesTime = this._seriesLastTimePoint.get(series);
    if (!historicalUpdate && lastSeriesTime !== void 0 && this._horzScaleBehavior.key(time) < this._horzScaleBehavior.key(lastSeriesTime)) {
      throw new Error(`Cannot update oldest data, last time=${lastSeriesTime}, new time=${time}`);
    }
    let pointDataAtTime = this._pointDataByTimePoint.get(this._horzScaleBehavior.key(time));
    if (historicalUpdate && pointDataAtTime === void 0) {
      throw new Error("Cannot update non-existing data point when historicalUpdate is true");
    }
    const affectsTimeScale = pointDataAtTime === void 0;
    if (pointDataAtTime === void 0) {
      pointDataAtTime = createEmptyTimePointData(time);
      this._pointDataByTimePoint.set(this._horzScaleBehavior.key(time), pointDataAtTime);
    }
    const createPlotRow = getSeriesPlotRowCreator(series.seriesType());
    const dataToPlotRow = series.customSeriesPlotValuesBuilder();
    const customWhitespaceChecker = series.customSeriesWhitespaceCheck();
    const plotRow = createPlotRow(time, pointDataAtTime.index, data, extendedData.originalTime, dataToPlotRow, customWhitespaceChecker);
    const isLastBarUpdate = !historicalUpdate && !affectsTimeScale && lastSeriesTime !== void 0 && this._horzScaleBehavior.key(time) === this._horzScaleBehavior.key(lastSeriesTime);
    pointDataAtTime.mapping.set(series, plotRow);
    if (historicalUpdate) {
      this._updateHistoricalSeriesRow(series, plotRow, pointDataAtTime.index);
    } else if (isLastBarUpdate && series.isConflationEnabled() && isSeriesPlotRow(plotRow)) {
      series.updateLastConflatedChunk(plotRow);
      this._updateLastSeriesRow(series, plotRow);
    } else {
      this._updateLastSeriesRow(series, plotRow);
    }
    const info = {
      lastBarUpdatedOrNewBarsAddedToTheRight: isSeriesPlotRow(plotRow),
      historicalUpdate
    };
    if (!affectsTimeScale) {
      return this._getUpdateResponse(series, -1, info);
    }
    const newPoint = {
      timeWeight: 0,
      time: pointDataAtTime.timePoint,
      pointData: pointDataAtTime,
      originalTime: timeScalePointTime(pointDataAtTime.mapping)
    };
    const insertIndex = lowerBound(this._sortedTimePoints, this._horzScaleBehavior.key(newPoint.time), (a, b) => this._horzScaleBehavior.key(a.time) < b);
    this._sortedTimePoints.splice(insertIndex, 0, newPoint);
    for (let index = insertIndex; index < this._sortedTimePoints.length; ++index) {
      assignIndexToPointData(this._sortedTimePoints[index].pointData, index);
    }
    this._horzScaleBehavior.fillWeightsForPoints(this._sortedTimePoints, insertIndex);
    return this._getUpdateResponse(series, insertIndex, info);
  }
  popSeriesData(series, count) {
    const seriesData = this._seriesRowsBySeries.get(series);
    if (seriesData === void 0 || count <= 0) {
      return [[], this._emptyUpdateResponse()];
    }
    count = Math.min(count, seriesData.length);
    const poppedData = seriesData.splice(-count).reverse();
    if (seriesData.length === 0) {
      this._seriesLastTimePoint.delete(series);
    } else {
      this._seriesLastTimePoint.set(series, seriesData[seriesData.length - 1].time);
    }
    for (const data of poppedData) {
      const pointData = this._pointDataByTimePoint.get(this._horzScaleBehavior.key(data.time));
      if (!pointData) {
        continue;
      }
      pointData.mapping.delete(series);
      if (pointData.mapping.size !== 0) {
        continue;
      }
      this._pointDataByTimePoint.delete(this._horzScaleBehavior.key(pointData.timePoint));
      this._sortedTimePoints.splice(pointData.index, 1);
      for (let index = pointData.index; index < this._sortedTimePoints.length; ++index) {
        assignIndexToPointData(this._sortedTimePoints[index].pointData, index);
      }
    }
    const info = {
      historicalUpdate: false,
      lastBarUpdatedOrNewBarsAddedToTheRight: false
    };
    return [poppedData, this._getUpdateResponse(series, this._sortedTimePoints.length - 1, info)];
  }
  _updateLastSeriesRow(series, plotRow) {
    let seriesData = this._seriesRowsBySeries.get(series);
    if (seriesData === void 0) {
      seriesData = [];
      this._seriesRowsBySeries.set(series, seriesData);
    }
    const lastSeriesRow = seriesData.length !== 0 ? seriesData[seriesData.length - 1] : null;
    if (lastSeriesRow === null || this._horzScaleBehavior.key(plotRow.time) > this._horzScaleBehavior.key(lastSeriesRow.time)) {
      if (isSeriesPlotRow(plotRow)) {
        seriesData.push(plotRow);
      }
    } else {
      if (isSeriesPlotRow(plotRow)) {
        seriesData[seriesData.length - 1] = plotRow;
      } else {
        seriesData.splice(-1, 1);
      }
    }
    this._seriesLastTimePoint.set(series, plotRow.time);
  }
  _updateHistoricalSeriesRow(series, plotRow, pointDataIndex) {
    const seriesData = this._seriesRowsBySeries.get(series);
    if (seriesData === void 0) {
      return;
    }
    const index = lowerBound(seriesData, pointDataIndex, (row, currentIndex) => row.index < currentIndex);
    if (isSeriesPlotRow(plotRow)) {
      seriesData[index] = plotRow;
    } else {
      seriesData.splice(index, 1);
    }
  }
  _setRowsToSeries(series, seriesRows) {
    if (seriesRows.length !== 0) {
      this._seriesRowsBySeries.set(series, seriesRows.filter(isSeriesPlotRow));
      this._seriesLastTimePoint.set(series, seriesRows[seriesRows.length - 1].time);
    } else {
      this._seriesRowsBySeries.delete(series);
      this._seriesLastTimePoint.delete(series);
    }
  }
  _cleanupPointsData() {
    for (const point of this._sortedTimePoints) {
      if (point.pointData.mapping.size === 0) {
        this._pointDataByTimePoint.delete(this._horzScaleBehavior.key(point.time));
      }
    }
  }
  /**
   * Sets new time scale and make indexes valid for all series
   *
   * @returns The index of the first changed point or `-1` if there is no change.
   */
  _replaceTimeScalePoints(newTimePoints) {
    let firstChangedPointIndex = -1;
    for (let index = 0; index < this._sortedTimePoints.length && index < newTimePoints.length; ++index) {
      const oldPoint = this._sortedTimePoints[index];
      const newPoint = newTimePoints[index];
      if (this._horzScaleBehavior.key(oldPoint.time) !== this._horzScaleBehavior.key(newPoint.time)) {
        firstChangedPointIndex = index;
        break;
      }
      newPoint.timeWeight = oldPoint.timeWeight;
      assignIndexToPointData(newPoint.pointData, index);
    }
    if (firstChangedPointIndex === -1 && this._sortedTimePoints.length !== newTimePoints.length) {
      firstChangedPointIndex = Math.min(this._sortedTimePoints.length, newTimePoints.length);
    }
    if (firstChangedPointIndex === -1) {
      return -1;
    }
    for (let index = firstChangedPointIndex; index < newTimePoints.length; ++index) {
      assignIndexToPointData(newTimePoints[index].pointData, index);
    }
    this._horzScaleBehavior.fillWeightsForPoints(newTimePoints, firstChangedPointIndex);
    this._sortedTimePoints = newTimePoints;
    return firstChangedPointIndex;
  }
  _getBaseIndex() {
    if (this._seriesRowsBySeries.size === 0) {
      return null;
    }
    let baseIndex = 0;
    this._seriesRowsBySeries.forEach((data) => {
      if (data.length !== 0) {
        baseIndex = Math.max(baseIndex, data[data.length - 1].index);
      }
    });
    return baseIndex;
  }
  _getUpdateResponse(updatedSeries, firstChangedPointIndex, info) {
    const dataUpdateResponse = this._emptyUpdateResponse();
    if (firstChangedPointIndex !== -1) {
      this._seriesRowsBySeries.forEach((data, s) => {
        dataUpdateResponse.series.set(s, {
          data,
          info: s === updatedSeries ? info : void 0
        });
      });
      if (!this._seriesRowsBySeries.has(updatedSeries)) {
        dataUpdateResponse.series.set(updatedSeries, { data: [], info });
      }
      dataUpdateResponse.timeScale.points = this._sortedTimePoints;
      dataUpdateResponse.timeScale.firstChangedPointIndex = firstChangedPointIndex;
    } else {
      const seriesData = this._seriesRowsBySeries.get(updatedSeries);
      dataUpdateResponse.series.set(updatedSeries, { data: seriesData || [], info });
    }
    return dataUpdateResponse;
  }
  _emptyUpdateResponse() {
    return {
      series: /* @__PURE__ */ new Map(),
      timeScale: {
        baseIndex: this._getBaseIndex()
      }
    };
  }
};
function assignIndexToPointData(pointData, index) {
  pointData.index = index;
  pointData.mapping.forEach((seriesRow) => {
    seriesRow.index = index;
  });
}

// ../lib/prod/src/model/time-data.js
function lowerBoundItemsCompare(item, time) {
  return item.time < time;
}
function upperBoundItemsCompare(item, time) {
  return time < item.time;
}
function visibleTimedValues(items, range, extendedRange) {
  const firstBar = range.left();
  const lastBar = range.right();
  const from = lowerBound(items, firstBar, lowerBoundItemsCompare);
  const to = upperBound(items, lastBar, upperBoundItemsCompare);
  if (!extendedRange) {
    return { from, to };
  }
  let extendedFrom = from;
  let extendedTo = to;
  if (from > 0 && from < items.length && items[from].time >= firstBar) {
    extendedFrom = from - 1;
  }
  if (to > 0 && to < items.length && items[to - 1].time <= lastBar) {
    extendedTo = to + 1;
  }
  return { from: extendedFrom, to: extendedTo };
}

// ../lib/prod/src/model/series/series-pane-view-base.js
var SeriesPaneViewBase = class {
  constructor(series, model, extendedVisibleRange) {
    this._invalidated = true;
    this._dataInvalidated = true;
    this._optionsInvalidated = true;
    this._items = [];
    this._itemsVisibleRange = null;
    this._lastConflationKey = -1;
    this._series = series;
    this._model = model;
    this._extendedVisibleRange = extendedVisibleRange;
  }
  update(updateType) {
    this._invalidated = true;
    if (updateType === "data") {
      this._dataInvalidated = true;
    }
    if (updateType === "options") {
      this._optionsInvalidated = true;
    }
  }
  renderer() {
    if (!this._series.visible()) {
      return null;
    }
    this._makeValid();
    return this._itemsVisibleRange === null ? null : this._renderer;
  }
  _updateOptions() {
    this._items = this._items.map((item) => ({
      ...item,
      ...this._series.barColorer().barStyle(item.time)
    }));
  }
  _clearVisibleRange() {
    this._itemsVisibleRange = null;
  }
  _makeValid() {
    const timeScale = this._model.timeScale();
    const conflationEnabled = timeScale.options().enableConflation;
    const currentConflationKey = conflationEnabled ? timeScale.conflationFactor() : 0;
    if (currentConflationKey !== this._lastConflationKey) {
      this._dataInvalidated = true;
      this._lastConflationKey = currentConflationKey;
    }
    if (this._dataInvalidated) {
      this._fillRawPoints();
      this._dataInvalidated = false;
    }
    if (this._optionsInvalidated) {
      this._updateOptions();
      this._optionsInvalidated = false;
    }
    if (this._invalidated) {
      this._makeValidImpl();
      this._invalidated = false;
    }
  }
  _makeValidImpl() {
    const priceScale = this._series.priceScale();
    const timeScale = this._model.timeScale();
    this._clearVisibleRange();
    if (timeScale.isEmpty() || priceScale.isEmpty()) {
      return;
    }
    const visibleBars = timeScale.visibleStrictRange();
    if (visibleBars === null) {
      return;
    }
    if (this._series.bars().size() === 0) {
      return;
    }
    const firstValue = this._series.firstValue();
    if (firstValue === null) {
      return;
    }
    this._itemsVisibleRange = visibleTimedValues(this._items, visibleBars, this._extendedVisibleRange);
    this._convertToCoordinates(priceScale, timeScale, firstValue.value);
    this._prepareRendererData();
  }
};

// ../lib/prod/src/model/series/custom-pane-view.js
var CustomSeriesPaneRendererWrapper = class {
  constructor(sourceRenderer, priceScale) {
    this._sourceRenderer = sourceRenderer;
    this._priceScale = priceScale;
  }
  draw(target, isHovered, hitTestData) {
    this._sourceRenderer.draw(target, this._priceScale, isHovered, hitTestData);
  }
};
var SeriesCustomPaneView = class extends SeriesPaneViewBase {
  constructor(series, model, paneView) {
    super(series, model, false);
    this._paneView = paneView;
    this._renderer = new CustomSeriesPaneRendererWrapper(this._paneView.renderer(), (price) => {
      const firstValue = series.firstValue();
      if (firstValue === null) {
        return null;
      }
      return series.priceScale().priceToCoordinate(price, firstValue.value);
    });
  }
  get conflationReducer() {
    return this._paneView.conflationReducer;
  }
  priceValueBuilder(plotRow) {
    return this._paneView.priceValueBuilder(plotRow);
  }
  isWhitespace(data) {
    return this._paneView.isWhitespace(data);
  }
  _fillRawPoints() {
    const colorer = this._series.barColorer();
    this._items = this._series.conflatedBars().rows().map((row) => {
      return {
        time: row.index,
        x: NaN,
        ...colorer.barStyle(row.index),
        originalData: row.data
      };
    });
  }
  _convertToCoordinates(priceScale, timeScale) {
    timeScale.indexesToCoordinates(this._items, undefinedIfNull(this._itemsVisibleRange));
  }
  _prepareRendererData() {
    this._paneView.update({
      bars: this._items.map(unwrapItemData),
      barSpacing: this._model.timeScale().barSpacing(),
      visibleRange: this._itemsVisibleRange,
      conflationFactor: this._model.timeScale().conflationFactor()
    }, this._series.options());
  }
};
function unwrapItemData(item) {
  return {
    x: item.x,
    time: item.time,
    originalData: item.originalData,
    barColor: item.barColor
  };
}

// ../lib/prod/src/model/series/custom-series.js
var customStyleDefaults2 = {
  color: "#2196f3"
};
var createPaneView = (series, model, customPaneView) => {
  const paneView = ensure(customPaneView);
  return new SeriesCustomPaneView(series, model, paneView);
};
var createCustomSeriesDefinition = (paneView) => {
  const definition = {
    type: "Custom",
    isBuiltIn: false,
    defaultOptions: { ...customStyleDefaults2, ...paneView.defaultOptions() },
    /**
     * @internal
     */
    createPaneView,
    customPaneView: paneView
  };
  return definition;
};

// ../lib/prod/src/model/series/series-def.js
var isSeriesDefinition = (value) => {
  return value.createPaneView !== void 0;
};

// ../lib/prod/src/api/get-series-data-creator.js
function singleValueData(plotRow) {
  const data = {
    value: plotRow.value[
      3
      /* PlotRowValueIndex.Close */
    ],
    time: plotRow.originalTime
  };
  if (plotRow.customValues !== void 0) {
    data.customValues = plotRow.customValues;
  }
  return data;
}
function lineData(plotRow) {
  const result = singleValueData(plotRow);
  if (plotRow.color !== void 0) {
    result.color = plotRow.color;
  }
  return result;
}
function areaData(plotRow) {
  const result = singleValueData(plotRow);
  if (plotRow.lineColor !== void 0) {
    result.lineColor = plotRow.lineColor;
  }
  if (plotRow.topColor !== void 0) {
    result.topColor = plotRow.topColor;
  }
  if (plotRow.bottomColor !== void 0) {
    result.bottomColor = plotRow.bottomColor;
  }
  return result;
}
function baselineData(plotRow) {
  const result = singleValueData(plotRow);
  if (plotRow.topLineColor !== void 0) {
    result.topLineColor = plotRow.topLineColor;
  }
  if (plotRow.bottomLineColor !== void 0) {
    result.bottomLineColor = plotRow.bottomLineColor;
  }
  if (plotRow.topFillColor1 !== void 0) {
    result.topFillColor1 = plotRow.topFillColor1;
  }
  if (plotRow.topFillColor2 !== void 0) {
    result.topFillColor2 = plotRow.topFillColor2;
  }
  if (plotRow.bottomFillColor1 !== void 0) {
    result.bottomFillColor1 = plotRow.bottomFillColor1;
  }
  if (plotRow.bottomFillColor2 !== void 0) {
    result.bottomFillColor2 = plotRow.bottomFillColor2;
  }
  return result;
}
function ohlcData(plotRow) {
  const data = {
    open: plotRow.value[
      0
      /* PlotRowValueIndex.Open */
    ],
    high: plotRow.value[
      1
      /* PlotRowValueIndex.High */
    ],
    low: plotRow.value[
      2
      /* PlotRowValueIndex.Low */
    ],
    close: plotRow.value[
      3
      /* PlotRowValueIndex.Close */
    ],
    time: plotRow.originalTime
  };
  if (plotRow.customValues !== void 0) {
    data.customValues = plotRow.customValues;
  }
  return data;
}
function barData(plotRow) {
  const result = ohlcData(plotRow);
  if (plotRow.color !== void 0) {
    result.color = plotRow.color;
  }
  return result;
}
function candlestickData(plotRow) {
  const result = ohlcData(plotRow);
  const { color, borderColor, wickColor } = plotRow;
  if (color !== void 0) {
    result.color = color;
  }
  if (borderColor !== void 0) {
    result.borderColor = borderColor;
  }
  if (wickColor !== void 0) {
    result.wickColor = wickColor;
  }
  return result;
}
function getSeriesDataCreator(seriesType) {
  const seriesPlotRowToDataMap = {
    Area: areaData,
    Line: lineData,
    Baseline: baselineData,
    Histogram: lineData,
    Bar: barData,
    Candlestick: candlestickData,
    Custom: customData
  };
  return seriesPlotRowToDataMap[seriesType];
}
function customData(plotRow) {
  const time = plotRow.originalTime;
  return {
    ...plotRow.data,
    time
  };
}

// ../lib/prod/src/api/options/crosshair-options-defaults.js
var crosshairOptionsDefaults = {
  vertLine: {
    color: "#9598A1",
    width: 1,
    style: 3,
    visible: true,
    labelVisible: true,
    labelBackgroundColor: "#131722"
  },
  horzLine: {
    color: "#9598A1",
    width: 1,
    style: 3,
    visible: true,
    labelVisible: true,
    labelBackgroundColor: "#131722"
  },
  mode: 1
};

// ../lib/prod/src/api/options/grid-options-defaults.js
var gridOptionsDefaults = {
  vertLines: {
    color: "#D6DCDE",
    style: 0,
    visible: true
  },
  horzLines: {
    color: "#D6DCDE",
    style: 0,
    visible: true
  }
};

// ../lib/prod/src/api/options/layout-options-defaults.js
var layoutOptionsDefaults = {
  background: {
    type: "solid",
    color: "#FFFFFF"
  },
  textColor: "#191919",
  fontSize: 12,
  fontFamily: defaultFontFamily,
  panes: {
    enableResize: true,
    separatorColor: "#E0E3EB",
    separatorHoverColor: "rgba(178, 181, 189, 0.2)"
  },
  attributionLogo: true,
  colorSpace: "srgb",
  colorParsers: []
};

// ../lib/prod/src/api/options/price-scale-options-defaults.js
var priceScaleOptionsDefaults = {
  autoScale: true,
  mode: 0,
  invertScale: false,
  alignLabels: true,
  borderVisible: true,
  borderColor: "#2B2B43",
  entireTextOnly: false,
  visible: false,
  ticksVisible: false,
  scaleMargins: {
    bottom: 0.1,
    top: 0.2
  },
  minimumWidth: 0,
  ensureEdgeTickMarksVisible: false
};

// ../lib/prod/src/api/options/time-scale-options-defaults.js
var timeScaleOptionsDefaults = {
  rightOffset: 0,
  barSpacing: 6,
  minBarSpacing: 0.5,
  maxBarSpacing: 0,
  fixLeftEdge: false,
  fixRightEdge: false,
  lockVisibleTimeRangeOnResize: false,
  rightBarStaysOnScroll: false,
  borderVisible: true,
  borderColor: "#2B2B43",
  visible: true,
  timeVisible: false,
  secondsVisible: true,
  shiftVisibleRangeOnNewBar: true,
  allowShiftVisibleRangeOnWhitespaceReplacement: false,
  ticksVisible: false,
  uniformDistribution: false,
  minimumHeight: 0,
  allowBoldLabels: true,
  ignoreWhitespaceIndices: false,
  enableConflation: false,
  conflationThresholdFactor: 1,
  precomputeConflationOnInit: false,
  precomputeConflationPriority: "background"
};

// ../lib/prod/src/api/options/chart-options-defaults.js
function chartOptionsDefaults() {
  return {
    addDefaultPane: true,
    width: 0,
    height: 0,
    autoSize: false,
    layout: layoutOptionsDefaults,
    crosshair: crosshairOptionsDefaults,
    grid: gridOptionsDefaults,
    overlayPriceScales: {
      ...priceScaleOptionsDefaults
    },
    leftPriceScale: {
      ...priceScaleOptionsDefaults,
      visible: false
    },
    rightPriceScale: {
      ...priceScaleOptionsDefaults,
      visible: true
    },
    timeScale: timeScaleOptionsDefaults,
    localization: {
      locale: isRunningOnClientSide ? navigator.language : "",
      dateFormat: "dd MMM 'yy"
    },
    handleScroll: {
      mouseWheel: true,
      pressedMouseMove: true,
      horzTouchDrag: true,
      vertTouchDrag: true
    },
    handleScale: {
      axisPressedMouseMove: {
        time: true,
        price: true
      },
      axisDoubleClickReset: {
        time: true,
        price: true
      },
      mouseWheel: true,
      pinch: true
    },
    kineticScroll: {
      mouse: false,
      touch: true
    },
    trackingMode: {
      exitMode: 1
    }
  };
}

// ../lib/prod/src/api/price-scale-api.js
var PriceScaleApi = class {
  constructor(chartWidget, priceScaleId, paneIndex) {
    this._chartWidget = chartWidget;
    this._priceScaleId = priceScaleId;
    this._paneIndex = paneIndex ?? 0;
  }
  applyOptions(options) {
    this._chartWidget.model().applyPriceScaleOptions(this._priceScaleId, options, this._paneIndex);
  }
  options() {
    return this._priceScale().options();
  }
  width() {
    if (!isDefaultPriceScale(this._priceScaleId)) {
      return 0;
    }
    return this._chartWidget.getPriceAxisWidth(this._priceScaleId);
  }
  setVisibleRange(range) {
    this.setAutoScale(false);
    this._priceScale().setCustomPriceRange(new PriceRangeImpl(range.from, range.to));
  }
  getVisibleRange() {
    let range = this._priceScale().priceRange();
    if (range === null) {
      return null;
    }
    let from;
    let to;
    if (this._priceScale().isLog()) {
      const minMove = this._priceScale().minMove();
      const minMovePrecision = precisionByMinMove(minMove);
      range = convertPriceRangeFromLog(range, this._priceScale().getLogFormula());
      from = Number((Math.round(range.minValue() / minMove) * minMove).toFixed(minMovePrecision));
      to = Number((Math.round(range.maxValue() / minMove) * minMove).toFixed(minMovePrecision));
    } else {
      from = range.minValue();
      to = range.maxValue();
    }
    return {
      from,
      to
    };
  }
  setAutoScale(on) {
    this.applyOptions({ autoScale: on });
  }
  _priceScale() {
    return ensureNotNull(this._chartWidget.model().findPriceScale(this._priceScaleId, this._paneIndex)).priceScale;
  }
};

// ../lib/prod/src/api/pane-api.js
var PaneApi = class {
  constructor(chartWidget, seriesApiGetter, pane, chartApi) {
    this._chartWidget = chartWidget;
    this._pane = pane;
    this._seriesApiGetter = seriesApiGetter;
    this._chartApi = chartApi;
  }
  getHeight() {
    return this._pane.height();
  }
  setHeight(height) {
    const chartModel = this._chartWidget.model();
    const paneIndex = chartModel.getPaneIndex(this._pane);
    chartModel.changePanesHeight(paneIndex, height);
  }
  getStretchFactor() {
    return this._pane.stretchFactor();
  }
  setStretchFactor(stretchFactor) {
    this._pane.setStretchFactor(stretchFactor);
    this._chartWidget.model().fullUpdate();
  }
  paneIndex() {
    return this._chartWidget.model().getPaneIndex(this._pane);
  }
  moveTo(paneIndex) {
    const currentIndex = this.paneIndex();
    if (currentIndex === paneIndex) {
      return;
    }
    assert(paneIndex >= 0 && paneIndex < this._chartWidget.paneWidgets().length, "Invalid pane index");
    this._chartWidget.model().movePane(currentIndex, paneIndex);
  }
  getSeries() {
    return this._pane.series().map((source) => this._seriesApiGetter(source)) ?? [];
  }
  getHTMLElement() {
    const widgets = this._chartWidget.paneWidgets();
    if (!widgets || widgets.length === 0 || !widgets[this.paneIndex()]) {
      return null;
    }
    return widgets[this.paneIndex()].getElement();
  }
  attachPrimitive(primitive) {
    this._pane.attachPrimitive(primitive);
    if (primitive.attached) {
      primitive.attached({
        chart: this._chartApi,
        requestUpdate: () => this._pane.model().fullUpdate()
      });
    }
  }
  detachPrimitive(primitive) {
    this._pane.detachPrimitive(primitive);
  }
  priceScale(priceScaleId) {
    const priceScale = this._pane.priceScaleById(priceScaleId);
    if (priceScale === null) {
      throw new Error(`Cannot find price scale with id: ${priceScaleId}`);
    }
    return new PriceScaleApi(this._chartWidget, priceScaleId, this.paneIndex());
  }
  setPreserveEmptyPane(preserve) {
    this._pane.setPreserveEmptyPane(preserve);
  }
  preserveEmptyPane() {
    return this._pane.preserveEmptyPane();
  }
  addCustomSeries(customPaneView, options = {}, paneIndex = 0) {
    return this._chartApi.addCustomSeries(customPaneView, options, paneIndex);
  }
  addSeries(definition, options = {}) {
    return this._chartApi.addSeries(definition, options, this.paneIndex());
  }
};

// ../lib/prod/src/model/data-validators.js
function checkPriceLineOptions(options) {
  if (false) {
    return;
  }
  assert(typeof options.price === "number", `the type of 'price' price line's property must be a number, got '${typeof options.price}'`);
}
function checkItemsAreOrdered(data, bh, allowDuplicates = false) {
  if (false) {
    return;
  }
  if (data.length === 0) {
    return;
  }
  let prevTime = bh.key(data[0].time);
  for (let i = 1; i < data.length; ++i) {
    const currentTime = bh.key(data[i].time);
    const checkResult = allowDuplicates ? prevTime <= currentTime : prevTime < currentTime;
    assert(checkResult, `data must be asc ordered by time, index=${i}, time=${currentTime}, prev time=${prevTime}`);
    prevTime = currentTime;
  }
}
function checkSeriesValuesType(type, data) {
  if (false) {
    return;
  }
  data.forEach(getChecker(type));
}
function getChecker(type) {
  switch (type) {
    case "Bar":
    case "Candlestick":
      return checkBarItem.bind(null, type);
    case "Area":
    case "Baseline":
    case "Line":
    case "Histogram":
      return checkLineItem.bind(null, type);
    case "Custom":
      return checkCustomItem.bind(null);
  }
}
function checkBarItem(type, barItem) {
  if (!isFulfilledData(barItem)) {
    return;
  }
  ["open", "high", "low", "close"].forEach((key) => {
    assert(typeof barItem[key] === "number", `${type} series item data value of ${key} must be a number, got=${typeof barItem[key]}, value=${barItem[key]}`);
    assert(isSafeValue(barItem[key]), `${type} series item data value of ${key} must be between ${MIN_SAFE_VALUE.toPrecision(16)} and ${MAX_SAFE_VALUE.toPrecision(16)}, got=${typeof barItem[key]}, value=${barItem[key]}`);
  });
}
function checkLineItem(type, lineItem) {
  if (!isFulfilledData(lineItem)) {
    return;
  }
  assert(typeof lineItem.value === "number", `${type} series item data value must be a number, got=${typeof lineItem.value}, value=${lineItem.value}`);
  assert(isSafeValue(lineItem.value), `${type} series item data value must be between ${MIN_SAFE_VALUE.toPrecision(16)} and ${MAX_SAFE_VALUE.toPrecision(16)}, got=${typeof lineItem.value}, value=${lineItem.value}`);
}
function checkCustomItem() {
  return;
}
var MIN_SAFE_VALUE = Number.MIN_SAFE_INTEGER / 100;
var MAX_SAFE_VALUE = Number.MAX_SAFE_INTEGER / 100;
function isSafeValue(value) {
  return value >= MIN_SAFE_VALUE && value <= MAX_SAFE_VALUE;
}

// ../lib/prod/src/api/options/price-line-options-defaults.js
var priceLineOptionsDefaults = {
  color: "#FF0000",
  price: 0,
  lineStyle: 2,
  lineWidth: 1,
  lineVisible: true,
  axisLabelVisible: true,
  title: "",
  axisLabelColor: "",
  axisLabelTextColor: ""
};

// ../lib/prod/src/api/price-line-api.js
var PriceLine = class {
  constructor(priceLine) {
    this._priceLine = priceLine;
  }
  applyOptions(options) {
    this._priceLine.applyOptions(options);
  }
  options() {
    return this._priceLine.options();
  }
  priceLine() {
    return this._priceLine;
  }
};

// ../lib/prod/src/api/series-api.js
var SeriesApi = class {
  constructor(series, dataUpdatesConsumer, priceScaleApiProvider, chartApi, horzScaleBehavior, paneApiGetter) {
    this._dataChangedDelegate = new Delegate();
    this._series = series;
    this._dataUpdatesConsumer = dataUpdatesConsumer;
    this._priceScaleApiProvider = priceScaleApiProvider;
    this._horzScaleBehavior = horzScaleBehavior;
    this._chartApi = chartApi;
    this._paneApiGetter = paneApiGetter;
  }
  destroy() {
    this._dataChangedDelegate.destroy();
  }
  priceFormatter() {
    return this._series.formatter();
  }
  priceToCoordinate(price) {
    const firstValue = this._series.firstValue();
    if (firstValue === null) {
      return null;
    }
    return this._series.priceScale().priceToCoordinate(price, firstValue.value);
  }
  coordinateToPrice(coordinate) {
    const firstValue = this._series.firstValue();
    if (firstValue === null) {
      return null;
    }
    return this._series.priceScale().coordinateToPrice(coordinate, firstValue.value);
  }
  barsInLogicalRange(range) {
    if (range === null) {
      return null;
    }
    const correctedRange = new TimeScaleVisibleRange(new RangeImpl(range.from, range.to)).strictRange();
    const bars = this._series.bars();
    if (bars.isEmpty()) {
      return null;
    }
    const dataFirstBarInRange = bars.search(
      correctedRange.left(),
      1
      /* MismatchDirection.NearestRight */
    );
    const dataLastBarInRange = bars.search(
      correctedRange.right(),
      -1
      /* MismatchDirection.NearestLeft */
    );
    const dataFirstIndex = ensureNotNull(bars.firstIndex());
    const dataLastIndex = ensureNotNull(bars.lastIndex());
    if (dataFirstBarInRange !== null && dataLastBarInRange !== null && dataFirstBarInRange.index > dataLastBarInRange.index) {
      return {
        barsBefore: range.from - dataFirstIndex,
        barsAfter: dataLastIndex - range.to
      };
    }
    const barsBefore = dataFirstBarInRange === null || dataFirstBarInRange.index === dataFirstIndex ? range.from - dataFirstIndex : dataFirstBarInRange.index - dataFirstIndex;
    const barsAfter = dataLastBarInRange === null || dataLastBarInRange.index === dataLastIndex ? dataLastIndex - range.to : dataLastIndex - dataLastBarInRange.index;
    const result = { barsBefore, barsAfter };
    if (dataFirstBarInRange !== null && dataLastBarInRange !== null) {
      result.from = dataFirstBarInRange.originalTime;
      result.to = dataLastBarInRange.originalTime;
    }
    return result;
  }
  setData(data) {
    checkItemsAreOrdered(data, this._horzScaleBehavior);
    checkSeriesValuesType(this._series.seriesType(), data);
    this._dataUpdatesConsumer.applyNewData(this._series, data);
    this._onDataChanged("full");
  }
  update(bar, historicalUpdate = false) {
    checkSeriesValuesType(this._series.seriesType(), [bar]);
    this._dataUpdatesConsumer.updateData(this._series, bar, historicalUpdate);
    this._onDataChanged("update");
  }
  pop(count = 1) {
    const poppedRows = this._dataUpdatesConsumer.popData(this._series, count);
    if (poppedRows.length !== 0) {
      this._onDataChanged("update");
    }
    const creator = getSeriesDataCreator(this.seriesType());
    return poppedRows.map((row) => creator(row));
  }
  dataByIndex(logicalIndex, mismatchDirection) {
    const data = this._series.bars().search(logicalIndex, mismatchDirection);
    if (data === null) {
      return null;
    }
    const creator = getSeriesDataCreator(this.seriesType());
    return creator(data);
  }
  data() {
    const seriesCreator = getSeriesDataCreator(this.seriesType());
    const rows = this._series.bars().rows();
    return rows.map((row) => seriesCreator(row));
  }
  subscribeDataChanged(handler) {
    this._dataChangedDelegate.subscribe(handler);
  }
  unsubscribeDataChanged(handler) {
    this._dataChangedDelegate.unsubscribe(handler);
  }
  applyOptions(options) {
    this._series.applyOptions(options);
  }
  options() {
    return clone(this._series.options());
  }
  priceScale() {
    return this._priceScaleApiProvider.priceScale(this._series.priceScale().id(), this.getPane().paneIndex());
  }
  createPriceLine(options) {
    checkPriceLineOptions(options);
    const strictOptions = merge(clone(priceLineOptionsDefaults), options);
    const priceLine = this._series.createPriceLine(strictOptions);
    return new PriceLine(priceLine);
  }
  removePriceLine(line) {
    this._series.removePriceLine(line.priceLine());
  }
  priceLines() {
    return this._series.priceLines().map((priceLine) => new PriceLine(priceLine));
  }
  seriesType() {
    return this._series.seriesType();
  }
  lastValueData(globalLast) {
    const result = this._series.lastValueData(globalLast);
    if (result.noData) {
      return {
        noData: true
      };
    }
    return {
      noData: false,
      price: result.price,
      color: result.color
    };
  }
  attachPrimitive(primitive) {
    this._series.attachPrimitive(primitive);
    if (primitive.attached) {
      primitive.attached({
        chart: this._chartApi,
        series: this,
        requestUpdate: () => this._series.model().fullUpdate(),
        horzScaleBehavior: this._horzScaleBehavior
      });
    }
  }
  detachPrimitive(primitive) {
    this._series.detachPrimitive(primitive);
    if (primitive.detached) {
      primitive.detached();
    }
    this._series.model().fullUpdate();
  }
  getPane() {
    const series = this._series;
    const pane = ensureNotNull(this._series.model().paneForSource(series));
    return this._paneApiGetter(pane);
  }
  moveToPane(paneIndex) {
    this._series.model().moveSeriesToPane(this._series, paneIndex);
  }
  seriesOrder() {
    const pane = this._series.model().paneForSource(this._series);
    if (pane === null) {
      return -1;
    }
    return pane.series().indexOf(this._series);
  }
  setSeriesOrder(order) {
    const pane = this._series.model().paneForSource(this._series);
    if (pane === null) {
      return;
    }
    pane.setSeriesOrder(this._series, order);
  }
  _onDataChanged(scope) {
    if (this._dataChangedDelegate.hasListeners()) {
      this._dataChangedDelegate.fire(scope);
    }
  }
};

// ../lib/prod/src/api/time-scale-api.js
var Constants9;
(function(Constants14) {
  Constants14[Constants14["AnimationDurationMs"] = 1e3] = "AnimationDurationMs";
})(Constants9 || (Constants9 = {}));
var TimeScaleApi = class {
  constructor(model, timeAxisWidget, horzScaleBehavior) {
    this._timeRangeChanged = new Delegate();
    this._logicalRangeChanged = new Delegate();
    this._sizeChanged = new Delegate();
    this._model = model;
    this._timeScale = model.timeScale();
    this._timeAxisWidget = timeAxisWidget;
    this._timeScale.visibleBarsChanged().subscribe(this._onVisibleBarsChanged.bind(this));
    this._timeScale.logicalRangeChanged().subscribe(this._onVisibleLogicalRangeChanged.bind(this));
    this._timeAxisWidget.sizeChanged().subscribe(this._onSizeChanged.bind(this));
    this._horzScaleBehavior = horzScaleBehavior;
  }
  destroy() {
    this._timeScale.visibleBarsChanged().unsubscribeAll(this);
    this._timeScale.logicalRangeChanged().unsubscribeAll(this);
    this._timeAxisWidget.sizeChanged().unsubscribeAll(this);
    this._timeRangeChanged.destroy();
    this._logicalRangeChanged.destroy();
    this._sizeChanged.destroy();
  }
  scrollPosition() {
    return this._timeScale.rightOffset();
  }
  scrollToPosition(position, animated) {
    if (!animated) {
      this._model.setRightOffset(position);
      return;
    }
    this._timeScale.scrollToOffsetAnimated(
      position,
      1e3
      /* Constants.AnimationDurationMs */
    );
  }
  scrollToRealTime() {
    this._timeScale.scrollToRealTime();
  }
  getVisibleRange() {
    const timeRange = this._timeScale.visibleTimeRange();
    if (timeRange === null) {
      return null;
    }
    return {
      from: timeRange.from.originalTime,
      to: timeRange.to.originalTime
    };
  }
  setVisibleRange(range) {
    const convertedRange = {
      from: this._horzScaleBehavior.convertHorzItemToInternal(range.from),
      to: this._horzScaleBehavior.convertHorzItemToInternal(range.to)
    };
    const logicalRange = this._timeScale.logicalRangeForTimeRange(convertedRange);
    this._model.setTargetLogicalRange(logicalRange);
  }
  getVisibleLogicalRange() {
    const logicalRange = this._timeScale.visibleLogicalRange();
    if (logicalRange === null) {
      return null;
    }
    return {
      from: logicalRange.left(),
      to: logicalRange.right()
    };
  }
  setVisibleLogicalRange(range) {
    assert(range.from <= range.to, "The from index cannot be after the to index.");
    this._model.setTargetLogicalRange(range);
  }
  resetTimeScale() {
    this._model.resetTimeScale();
  }
  fitContent() {
    this._model.fitContent();
  }
  logicalToCoordinate(logical) {
    const timeScale = this._model.timeScale();
    if (timeScale.isEmpty()) {
      return null;
    } else {
      return timeScale.indexToCoordinate(logical);
    }
  }
  coordinateToLogical(x) {
    if (this._timeScale.isEmpty()) {
      return null;
    } else {
      return this._timeScale.coordinateToIndex(x);
    }
  }
  timeToIndex(time, findNearest) {
    const timePoint = this._horzScaleBehavior.convertHorzItemToInternal(time);
    return this._timeScale.timeToIndex(timePoint, findNearest);
  }
  timeToCoordinate(time) {
    const timePointIndex = this.timeToIndex(time, false);
    if (timePointIndex === null) {
      return null;
    }
    return this._timeScale.indexToCoordinate(timePointIndex);
  }
  coordinateToTime(x) {
    const timeScale = this._model.timeScale();
    const timePointIndex = timeScale.coordinateToIndex(x);
    const timePoint = timeScale.indexToTimeScalePoint(timePointIndex);
    if (timePoint === null) {
      return null;
    }
    return timePoint.originalTime;
  }
  width() {
    return this._timeAxisWidget.getSize().width;
  }
  height() {
    return this._timeAxisWidget.getSize().height;
  }
  subscribeVisibleTimeRangeChange(handler) {
    this._timeRangeChanged.subscribe(handler);
  }
  unsubscribeVisibleTimeRangeChange(handler) {
    this._timeRangeChanged.unsubscribe(handler);
  }
  subscribeVisibleLogicalRangeChange(handler) {
    this._logicalRangeChanged.subscribe(handler);
  }
  unsubscribeVisibleLogicalRangeChange(handler) {
    this._logicalRangeChanged.unsubscribe(handler);
  }
  subscribeSizeChange(handler) {
    this._sizeChanged.subscribe(handler);
  }
  unsubscribeSizeChange(handler) {
    this._sizeChanged.unsubscribe(handler);
  }
  applyOptions(options) {
    this._timeScale.applyOptions(options);
  }
  options() {
    return {
      ...clone(this._timeScale.options()),
      barSpacing: this._timeScale.barSpacing()
    };
  }
  _onVisibleBarsChanged() {
    if (this._timeRangeChanged.hasListeners()) {
      this._timeRangeChanged.fire(this.getVisibleRange());
    }
  }
  _onVisibleLogicalRangeChanged() {
    if (this._logicalRangeChanged.hasListeners()) {
      this._logicalRangeChanged.fire(this.getVisibleLogicalRange());
    }
  }
  _onSizeChanged(size3) {
    this._sizeChanged.fire(size3.width, size3.height);
  }
};

// ../lib/prod/src/api/chart-api.js
function patchPriceFormat(priceFormat) {
  if (priceFormat === void 0 || priceFormat.type === "custom") {
    return;
  }
  const priceFormatBuiltIn = priceFormat;
  if (priceFormatBuiltIn.minMove !== void 0 && priceFormatBuiltIn.precision === void 0) {
    priceFormatBuiltIn.precision = precisionByMinMove(priceFormatBuiltIn.minMove);
  }
}
function migrateHandleScaleScrollOptions(options) {
  if (isBoolean(options["handleScale"])) {
    const handleScale = options["handleScale"];
    options["handleScale"] = {
      axisDoubleClickReset: {
        time: handleScale,
        price: handleScale
      },
      axisPressedMouseMove: {
        time: handleScale,
        price: handleScale
      },
      mouseWheel: handleScale,
      pinch: handleScale
    };
  } else if (options["handleScale"] !== void 0) {
    const { axisPressedMouseMove, axisDoubleClickReset } = options["handleScale"];
    if (isBoolean(axisPressedMouseMove)) {
      options["handleScale"].axisPressedMouseMove = {
        time: axisPressedMouseMove,
        price: axisPressedMouseMove
      };
    }
    if (isBoolean(axisDoubleClickReset)) {
      options["handleScale"].axisDoubleClickReset = {
        time: axisDoubleClickReset,
        price: axisDoubleClickReset
      };
    }
  }
  const handleScroll = options["handleScroll"];
  if (isBoolean(handleScroll)) {
    options["handleScroll"] = {
      horzTouchDrag: handleScroll,
      vertTouchDrag: handleScroll,
      mouseWheel: handleScroll,
      pressedMouseMove: handleScroll
    };
  }
}
function toInternalOptions(options) {
  migrateHandleScaleScrollOptions(options);
  return options;
}
var ChartApi = class {
  constructor(container, horzScaleBehavior, options) {
    this._seriesMap = /* @__PURE__ */ new Map();
    this._seriesMapReversed = /* @__PURE__ */ new Map();
    this._clickedDelegate = new Delegate();
    this._dblClickedDelegate = new Delegate();
    this._crosshairMovedDelegate = new Delegate();
    this._panes = /* @__PURE__ */ new WeakMap();
    this._dataLayer = new DataLayer(horzScaleBehavior);
    const internalOptions = options === void 0 ? clone(chartOptionsDefaults()) : merge(clone(chartOptionsDefaults()), toInternalOptions(options));
    this._horzScaleBehavior = horzScaleBehavior;
    this._chartWidget = new ChartWidget(container, internalOptions, horzScaleBehavior);
    this._chartWidget.clicked().subscribe((paramSupplier) => {
      if (this._clickedDelegate.hasListeners()) {
        this._clickedDelegate.fire(this._convertMouseParams(paramSupplier()));
      }
    }, this);
    this._chartWidget.dblClicked().subscribe((paramSupplier) => {
      if (this._dblClickedDelegate.hasListeners()) {
        this._dblClickedDelegate.fire(this._convertMouseParams(paramSupplier()));
      }
    }, this);
    this._chartWidget.crosshairMoved().subscribe((paramSupplier) => {
      if (this._crosshairMovedDelegate.hasListeners()) {
        this._crosshairMovedDelegate.fire(this._convertMouseParams(paramSupplier()));
      }
    }, this);
    const model = this._chartWidget.model();
    this._timeScaleApi = new TimeScaleApi(model, this._chartWidget.timeAxisWidget(), this._horzScaleBehavior);
  }
  remove() {
    this._chartWidget.clicked().unsubscribeAll(this);
    this._chartWidget.dblClicked().unsubscribeAll(this);
    this._chartWidget.crosshairMoved().unsubscribeAll(this);
    this._timeScaleApi.destroy();
    this._chartWidget.destroy();
    this._seriesMap.clear();
    this._seriesMapReversed.clear();
    this._clickedDelegate.destroy();
    this._dblClickedDelegate.destroy();
    this._crosshairMovedDelegate.destroy();
    this._dataLayer.destroy();
  }
  resize(width, height, forceRepaint) {
    if (this.autoSizeActive()) {
      warn(`Height and width values ignored because 'autoSize' option is enabled.`);
      return;
    }
    this._chartWidget.resize(width, height, forceRepaint);
  }
  addCustomSeries(customPaneView, options = {}, paneIndex = 0) {
    const paneView = ensure(customPaneView);
    const definition = createCustomSeriesDefinition(paneView);
    return this._addSeriesImpl(definition, options, paneIndex);
  }
  addSeries(definition, options = {}, paneIndex = 0) {
    return this._addSeriesImpl(definition, options, paneIndex);
  }
  removeSeries(seriesApi) {
    const series = ensureDefined(this._seriesMap.get(seriesApi));
    const update = this._dataLayer.removeSeries(series);
    const model = this._chartWidget.model();
    model.removeSeries(series);
    this._sendUpdateToChart(update);
    this._seriesMap.delete(seriesApi);
    this._seriesMapReversed.delete(series);
  }
  applyNewData(series, data) {
    this._sendUpdateToChart(this._dataLayer.setSeriesData(series, data));
  }
  updateData(series, data, historicalUpdate) {
    this._sendUpdateToChart(this._dataLayer.updateSeriesData(series, data, historicalUpdate));
  }
  popData(series, count) {
    const [poppedData, update] = this._dataLayer.popSeriesData(series, count);
    if (poppedData.length !== 0) {
      this._sendUpdateToChart(update);
    }
    return poppedData;
  }
  subscribeClick(handler) {
    this._clickedDelegate.subscribe(handler);
  }
  unsubscribeClick(handler) {
    this._clickedDelegate.unsubscribe(handler);
  }
  subscribeCrosshairMove(handler) {
    this._crosshairMovedDelegate.subscribe(handler);
  }
  unsubscribeCrosshairMove(handler) {
    this._crosshairMovedDelegate.unsubscribe(handler);
  }
  subscribeDblClick(handler) {
    this._dblClickedDelegate.subscribe(handler);
  }
  unsubscribeDblClick(handler) {
    this._dblClickedDelegate.unsubscribe(handler);
  }
  priceScale(priceScaleId, paneIndex = 0) {
    return new PriceScaleApi(this._chartWidget, priceScaleId, paneIndex);
  }
  timeScale() {
    return this._timeScaleApi;
  }
  applyOptions(options) {
    if (true) {
      const colorSpace = options.layout?.colorSpace;
      if (colorSpace !== void 0 && colorSpace !== this.options().layout.colorSpace) {
        throw new Error(`colorSpace option should not be changed once the chart has been created.`);
      }
      const colorParsers = options.layout?.colorParsers;
      if (colorParsers !== void 0 && colorParsers !== this.options().layout.colorParsers) {
        throw new Error(`colorParsers option should not be changed once the chart has been created.`);
      }
    }
    this._chartWidget.applyOptions(toInternalOptions(options));
  }
  options() {
    return this._chartWidget.options();
  }
  takeScreenshot(addTopLayer = false, includeCrosshair = false) {
    let crosshairMode;
    let screenshotCanvas;
    try {
      if (!includeCrosshair) {
        crosshairMode = this._chartWidget.model().options().crosshair.mode;
        this._chartWidget.applyOptions({
          crosshair: {
            mode: 2
          }
        });
      }
      screenshotCanvas = this._chartWidget.takeScreenshot(addTopLayer);
    } finally {
      if (!includeCrosshair && crosshairMode !== void 0) {
        this._chartWidget.model().applyOptions({
          crosshair: {
            mode: crosshairMode
          }
        });
      }
    }
    return screenshotCanvas;
  }
  addPane(preserveEmptyPane = false) {
    const pane = this._chartWidget.model().addPane();
    pane.setPreserveEmptyPane(preserveEmptyPane);
    return this._getPaneApi(pane);
  }
  removePane(index) {
    this._chartWidget.model().removePane(index);
  }
  swapPanes(first, second) {
    this._chartWidget.model().swapPanes(first, second);
  }
  autoSizeActive() {
    return this._chartWidget.autoSizeActive();
  }
  chartElement() {
    return this._chartWidget.element();
  }
  panes() {
    return this._chartWidget.model().panes().map((pane) => this._getPaneApi(pane));
  }
  paneSize(paneIndex = 0) {
    const size3 = this._chartWidget.paneSize(paneIndex);
    return {
      height: size3.height,
      width: size3.width
    };
  }
  setCrosshairPosition(price, horizontalPosition, seriesApi) {
    const series = this._seriesMap.get(seriesApi);
    if (series === void 0) {
      return;
    }
    const pane = this._chartWidget.model().paneForSource(series);
    if (pane === null) {
      return;
    }
    this._chartWidget.model().setAndSaveSyntheticPosition(price, horizontalPosition, pane);
  }
  clearCrosshairPosition() {
    this._chartWidget.model().clearCurrentPosition(true);
  }
  horzBehaviour() {
    return this._horzScaleBehavior;
  }
  _addSeriesImpl(definition, options = {}, paneIndex = 0) {
    assert(isSeriesDefinition(definition));
    patchPriceFormat(options.priceFormat);
    if (definition.type === "Candlestick") {
      fillUpDownCandlesticksColors(options);
    }
    const strictOptions = merge(clone(seriesOptionsDefaults), clone(definition.defaultOptions), options);
    const createPaneView8 = definition.createPaneView;
    const series = new Series(this._chartWidget.model(), definition.type, strictOptions, createPaneView8, definition.customPaneView);
    this._chartWidget.model().addSeriesToPane(series, paneIndex);
    const res = new SeriesApi(series, this, this, this, this._horzScaleBehavior, (pane) => this._getPaneApi(pane));
    this._seriesMap.set(res, series);
    this._seriesMapReversed.set(series, res);
    return res;
  }
  _sendUpdateToChart(update) {
    const model = this._chartWidget.model();
    model.updateTimeScale(update.timeScale.baseIndex, update.timeScale.points, update.timeScale.firstChangedPointIndex);
    update.series.forEach((value, series) => series.setData(value.data, value.info));
    model.timeScale().recalculateIndicesWithData();
    model.recalculateAllPanes();
  }
  _mapSeriesToApi(series) {
    return ensureDefined(this._seriesMapReversed.get(series));
  }
  _convertMouseParams(param) {
    const seriesData = /* @__PURE__ */ new Map();
    param.seriesData.forEach((plotRow, series) => {
      const seriesType = series.seriesType();
      const data = getSeriesDataCreator(seriesType)(plotRow);
      if (seriesType !== "Custom") {
        assert(isFulfilledData(data));
      } else {
        const customWhitespaceChecker = series.customSeriesWhitespaceCheck();
        assert(!customWhitespaceChecker || customWhitespaceChecker(data) === false);
      }
      seriesData.set(this._mapSeriesToApi(series), data);
    });
    const hoveredSeries = param.hoveredSeries === void 0 || !this._seriesMapReversed.has(param.hoveredSeries) ? void 0 : this._mapSeriesToApi(param.hoveredSeries);
    return {
      time: param.originalTime,
      logical: param.index,
      point: param.point,
      paneIndex: param.paneIndex,
      hoveredSeries,
      hoveredObjectId: param.hoveredObject,
      seriesData,
      sourceEvent: param.touchMouseEventData
    };
  }
  _getPaneApi(pane) {
    let result = this._panes.get(pane);
    if (!result) {
      result = new PaneApi(this._chartWidget, (series) => this._mapSeriesToApi(series), pane, this);
      this._panes.set(pane, result);
    }
    return result;
  }
};

// ../lib/prod/src/api/create-chart.js
function fetchHtmlElement(container) {
  if (isString(container)) {
    const element = document.getElementById(container);
    assert(element !== null, `Cannot find element in DOM with id=${container}`);
    return element;
  }
  return container;
}
function createChartEx(container, horzScaleBehavior, options) {
  const htmlElement = fetchHtmlElement(container);
  const res = new ChartApi(htmlElement, horzScaleBehavior, options);
  horzScaleBehavior.setOptions(res.options());
  return res;
}
function createChart(container, options) {
  return createChartEx(container, new HorzScaleBehaviorTime(), HorzScaleBehaviorTime.applyDefaults(options));
}
function defaultHorzScaleBehavior() {
  return HorzScaleBehaviorTime;
}

// ../lib/prod/src/model/series/line-pane-view-base.js
var LinePaneViewBase = class extends SeriesPaneViewBase {
  constructor(series, model) {
    super(series, model, true);
  }
  _convertToCoordinates(priceScale, timeScale, firstValue) {
    timeScale.indexesToCoordinates(this._items, undefinedIfNull(this._itemsVisibleRange));
    priceScale.pointsArrayToCoordinates(this._items, firstValue, undefinedIfNull(this._itemsVisibleRange));
  }
  _createRawItemBase(time, price) {
    return {
      time,
      price,
      x: NaN,
      y: NaN
    };
  }
  _fillRawPoints() {
    const colorer = this._series.barColorer();
    this._items = this._series.conflatedBars().rows().map((row) => {
      const isConflated = (row.originalDataCount ?? 1) > 1;
      let value;
      if (isConflated) {
        const high = row.value[
          1
          /* PlotRowValueIndex.High */
        ];
        const low = row.value[
          2
          /* PlotRowValueIndex.Low */
        ];
        const close = row.value[
          3
          /* PlotRowValueIndex.Close */
        ];
        const highMove = Math.abs(high - close);
        const lowMove = Math.abs(low - close);
        value = highMove > lowMove ? high : low;
      } else {
        value = row.value[
          3
          /* PlotRowValueIndex.Close */
        ];
      }
      return this._createRawItem(row.index, value, colorer);
    });
  }
};

// ../lib/prod/src/renderers/draw-series-point-markers.js
function drawSeriesPointMarkers(renderingScope, items, pointMarkersRadius, visibleRange, styleGetter) {
  if (visibleRange.to - visibleRange.from <= 0) {
    return;
  }
  const { horizontalPixelRatio, verticalPixelRatio, context } = renderingScope;
  let prevStyle = null;
  const tickWidth = Math.max(1, Math.floor(horizontalPixelRatio));
  const correction = tickWidth % 2 / 2;
  const radius3 = pointMarkersRadius * verticalPixelRatio + correction;
  for (let i = visibleRange.to - 1; i >= visibleRange.from; --i) {
    const point = items[i];
    if (point) {
      const style = styleGetter(renderingScope, point);
      if (style !== prevStyle) {
        context.beginPath();
        if (prevStyle !== null) {
          context.fill();
        }
        context.fillStyle = style;
        prevStyle = style;
      }
      const centerX = Math.round(point.x * horizontalPixelRatio) + correction;
      const centerY = point.y * verticalPixelRatio;
      context.moveTo(centerX, centerY);
      context.arc(centerX, centerY, radius3, 0, Math.PI * 2);
    }
  }
  context.fill();
}

// ../lib/prod/src/renderers/walk-line.js
function walkLine(renderingScope, items, lineType, visibleRange, barWidth, styleGetter, finishStyledArea3) {
  if (items.length === 0 || visibleRange.from >= items.length || visibleRange.to <= 0) {
    return;
  }
  const { context: ctx, horizontalPixelRatio, verticalPixelRatio } = renderingScope;
  const firstItem = items[visibleRange.from];
  let currentStyle = styleGetter(renderingScope, firstItem);
  let currentStyleFirstItem = firstItem;
  if (visibleRange.to - visibleRange.from < 2) {
    const halfBarWidth = barWidth / 2;
    ctx.beginPath();
    const item1 = { x: firstItem.x - halfBarWidth, y: firstItem.y };
    const item2 = { x: firstItem.x + halfBarWidth, y: firstItem.y };
    ctx.moveTo(item1.x * horizontalPixelRatio, item1.y * verticalPixelRatio);
    ctx.lineTo(item2.x * horizontalPixelRatio, item2.y * verticalPixelRatio);
    finishStyledArea3(renderingScope, currentStyle, item1, item2);
  } else {
    const changeStyle = (newStyle, currentItem2) => {
      finishStyledArea3(renderingScope, currentStyle, currentStyleFirstItem, currentItem2);
      ctx.beginPath();
      currentStyle = newStyle;
      currentStyleFirstItem = currentItem2;
    };
    let currentItem = currentStyleFirstItem;
    ctx.beginPath();
    ctx.moveTo(firstItem.x * horizontalPixelRatio, firstItem.y * verticalPixelRatio);
    for (let i = visibleRange.from + 1; i < visibleRange.to; ++i) {
      currentItem = items[i];
      const itemStyle = styleGetter(renderingScope, currentItem);
      switch (lineType) {
        case 0:
          ctx.lineTo(currentItem.x * horizontalPixelRatio, currentItem.y * verticalPixelRatio);
          break;
        case 1:
          ctx.lineTo(currentItem.x * horizontalPixelRatio, items[i - 1].y * verticalPixelRatio);
          if (itemStyle !== currentStyle) {
            changeStyle(itemStyle, currentItem);
            ctx.lineTo(currentItem.x * horizontalPixelRatio, items[i - 1].y * verticalPixelRatio);
          }
          ctx.lineTo(currentItem.x * horizontalPixelRatio, currentItem.y * verticalPixelRatio);
          break;
        case 2: {
          const [cp1, cp2] = getControlPoints(items, i - 1, i);
          ctx.bezierCurveTo(cp1.x * horizontalPixelRatio, cp1.y * verticalPixelRatio, cp2.x * horizontalPixelRatio, cp2.y * verticalPixelRatio, currentItem.x * horizontalPixelRatio, currentItem.y * verticalPixelRatio);
          break;
        }
      }
      if (lineType !== 1 && itemStyle !== currentStyle) {
        changeStyle(itemStyle, currentItem);
        ctx.moveTo(currentItem.x * horizontalPixelRatio, currentItem.y * verticalPixelRatio);
      }
    }
    if (currentStyleFirstItem !== currentItem || currentStyleFirstItem === currentItem && lineType === 1) {
      finishStyledArea3(renderingScope, currentStyle, currentStyleFirstItem, currentItem);
    }
  }
}
var curveTension = 6;
function subtract(p1, p2) {
  return { x: p1.x - p2.x, y: p1.y - p2.y };
}
function add(p1, p2) {
  return { x: p1.x + p2.x, y: p1.y + p2.y };
}
function divide(p1, n) {
  return { x: p1.x / n, y: p1.y / n };
}
function getControlPoints(points, fromPointIndex, toPointIndex) {
  const beforeFromPointIndex = Math.max(0, fromPointIndex - 1);
  const afterToPointIndex = Math.min(points.length - 1, toPointIndex + 1);
  const cp1 = add(points[fromPointIndex], divide(subtract(points[toPointIndex], points[beforeFromPointIndex]), curveTension));
  const cp2 = subtract(points[toPointIndex], divide(subtract(points[afterToPointIndex], points[fromPointIndex]), curveTension));
  return [cp1, cp2];
}

// ../lib/prod/src/renderers/line-renderer-base.js
function finishStyledArea(scope, style) {
  const ctx = scope.context;
  ctx.strokeStyle = style;
  ctx.stroke();
}
var PaneRendererLineBase = class extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    this._data = null;
  }
  setData(data) {
    this._data = data;
  }
  _drawImpl(renderingScope) {
    if (this._data === null) {
      return;
    }
    const { items, visibleRange, barWidth, lineType, lineWidth, lineStyle, pointMarkersRadius } = this._data;
    if (visibleRange === null) {
      return;
    }
    const ctx = renderingScope.context;
    ctx.lineCap = "butt";
    ctx.lineWidth = lineWidth * renderingScope.verticalPixelRatio;
    setLineStyle(ctx, lineStyle);
    ctx.lineJoin = "round";
    const styleGetter = this._strokeStyle.bind(this);
    if (lineType !== void 0) {
      walkLine(renderingScope, items, lineType, visibleRange, barWidth, styleGetter, finishStyledArea);
    }
    if (pointMarkersRadius) {
      drawSeriesPointMarkers(renderingScope, items, pointMarkersRadius, visibleRange, styleGetter);
    }
  }
};

// ../lib/prod/src/renderers/line-renderer.js
var PaneRendererLine = class extends PaneRendererLineBase {
  _strokeStyle(renderingScope, item) {
    return item.lineColor;
  }
};

// ../lib/prod/src/model/series/line-pane-view.js
var SeriesLinePaneView = class extends LinePaneViewBase {
  constructor() {
    super(...arguments);
    this._renderer = new PaneRendererLine();
  }
  _createRawItem(time, price, colorer) {
    return {
      ...this._createRawItemBase(time, price),
      ...colorer.barStyle(time)
    };
  }
  _prepareRendererData() {
    const options = this._series.options();
    const data = {
      items: this._items,
      lineStyle: options.lineStyle,
      lineType: options.lineVisible ? options.lineType : void 0,
      lineWidth: options.lineWidth,
      pointMarkersRadius: options.pointMarkersVisible ? options.pointMarkersRadius || options.lineWidth / 2 + 2 : void 0,
      visibleRange: this._itemsVisibleRange,
      barWidth: this._model.timeScale().barSpacing()
    };
    this._renderer.setData(data);
  }
};

// ../lib/prod/src/model/series/line-series.js
var lineStyleDefaults = {
  color: "#2196f3",
  lineStyle: 0,
  lineWidth: 3,
  lineType: 0,
  lineVisible: true,
  crosshairMarkerVisible: true,
  crosshairMarkerRadius: 4,
  crosshairMarkerBorderColor: "",
  crosshairMarkerBorderWidth: 2,
  crosshairMarkerBackgroundColor: "",
  lastPriceAnimation: 0,
  pointMarkersVisible: false
};
var createPaneView2 = (series, model) => new SeriesLinePaneView(series, model);
var createLineSeries = () => {
  const definition = {
    type: "Line",
    isBuiltIn: true,
    defaultOptions: lineStyleDefaults,
    /**
     * @internal
     */
    createPaneView: createPaneView2
  };
  return definition;
};
var lineSeries = createLineSeries();

// ../lib/prod/src/model/yield-curve-horz-scale-behavior/yield-curve-horz-scale-behavior.js
function createDebouncedMicroTaskHandler(callback) {
  let scheduled = false;
  return function(...args) {
    if (!scheduled) {
      scheduled = true;
      queueMicrotask(() => {
        callback(...args);
        scheduled = false;
      });
    }
  };
}
function markWithGreaterWeight2(a, b) {
  return a.weight > b.weight ? a : b;
}
function toInternalHorzScaleItem(item) {
  return item;
}
function fromInternalHorzScaleItem(item) {
  return item;
}
var YieldCurveHorzScaleBehavior = class {
  constructor() {
    this._pointsChangedDelegate = new Delegate();
    this._invalidateWhitespace = createDebouncedMicroTaskHandler(() => this._pointsChangedDelegate.fire(this._largestIndex));
    this._largestIndex = 0;
  }
  /** Data changes might require that the whitespace be generated again */
  whitespaceInvalidated() {
    return this._pointsChangedDelegate;
  }
  destroy() {
    this._pointsChangedDelegate.destroy();
  }
  options() {
    return this._options;
  }
  setOptions(options) {
    this._options = options;
  }
  preprocessData(data) {
  }
  updateFormatter(options) {
    if (!this._options) {
      return;
    }
    this._options.localization = options;
  }
  createConverterToInternalObj(data) {
    this._invalidateWhitespace();
    return (time) => {
      if (time > this._largestIndex) {
        this._largestIndex = time;
      }
      return toInternalHorzScaleItem(time);
    };
  }
  key(internalItem) {
    return internalItem;
  }
  cacheKey(internalItem) {
    return fromInternalHorzScaleItem(internalItem);
  }
  convertHorzItemToInternal(item) {
    return toInternalHorzScaleItem(item);
  }
  formatHorzItem(item) {
    return this._formatTime(item);
  }
  formatTickmark(item) {
    return this._formatTime(item.time);
  }
  maxTickMarkWeight(marks) {
    return marks.reduce(markWithGreaterWeight2, marks[0]).weight;
  }
  fillWeightsForPoints(sortedTimePoints, startIndex) {
    const timeWeight = (time) => {
      if (time % 120 === 0) {
        return 10;
      }
      if (time % 60 === 0) {
        return 9;
      }
      if (time % 36 === 0) {
        return 8;
      }
      if (time % 12 === 0) {
        return 7;
      }
      if (time % 6 === 0) {
        return 6;
      }
      if (time % 3 === 0) {
        return 5;
      }
      if (time % 1 === 0) {
        return 4;
      }
      return 0;
    };
    for (let index = startIndex; index < sortedTimePoints.length; ++index) {
      sortedTimePoints[index].timeWeight = timeWeight(fromInternalHorzScaleItem(sortedTimePoints[index].time));
    }
    this._largestIndex = fromInternalHorzScaleItem(sortedTimePoints[sortedTimePoints.length - 1].time);
    this._invalidateWhitespace();
  }
  _formatTime(months) {
    if (this._options.localization?.timeFormatter) {
      return this._options.localization.timeFormatter(months);
    }
    if (months < 12) {
      return `${months}M`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years}Y`;
    }
    return `${years}Y${remainingMonths}M`;
  }
};

// ../lib/prod/src/api/options/yield-curve-chart-options-defaults.js
var yieldChartOptionsDefaults = {
  baseResolution: 1,
  minimumTimeRange: 120,
  startTimeRange: 0
};

// ../lib/prod/src/api/yield-chart-api.js
function generateWhitespaceData({ start, end, resolution }) {
  return Array.from(
    { length: Math.floor((end - start) / resolution) + 1 },
    // eslint-disable-next-line quote-props
    (item, i) => ({ "time": start + i * resolution })
  );
}
function buildWhitespaceState(options, lastIndex) {
  return {
    start: Math.max(0, options.startTimeRange),
    end: Math.max(0, options.minimumTimeRange, lastIndex || 0),
    resolution: Math.max(1, options.baseResolution)
  };
}
var generateWhitespaceHash = ({ start, end, resolution }) => `${start}~${end}~${resolution}`;
var defaultOptions = {
  yieldCurve: yieldChartOptionsDefaults,
  // and add sensible default options for yield charts which
  // are different from the usual defaults.
  timeScale: {
    ignoreWhitespaceIndices: true
  },
  leftPriceScale: {
    visible: true
  },
  rightPriceScale: {
    visible: false
  },
  localization: {
    priceFormatter: (value) => {
      return value.toFixed(3) + "%";
    }
  }
};
var lineStyleDefaultOptionOverrides = {
  lastValueVisible: false,
  priceLineVisible: false
};
var YieldChartApi = class extends ChartApi {
  constructor(container, options) {
    const fullOptions = merge(defaultOptions, options || {});
    const horzBehaviour = new YieldCurveHorzScaleBehavior();
    super(container, horzBehaviour, fullOptions);
    horzBehaviour.setOptions(this.options());
    this._initWhitespaceSeries();
  }
  addSeries(definition, options = {}, paneIndex = 0) {
    if (definition.isBuiltIn && ["Area", "Line"].includes(definition.type) === false) {
      throw new Error("Yield curve only support Area and Line series");
    }
    const optionOverrides = {
      ...lineStyleDefaultOptionOverrides,
      ...options
    };
    return super.addSeries(definition, optionOverrides, paneIndex);
  }
  _initWhitespaceSeries() {
    const horzBehaviour = this.horzBehaviour();
    const whiteSpaceSeries = this.addSeries(lineSeries);
    let currentWhitespaceHash;
    function updateWhitespace(lastIndex) {
      const newWhitespaceState = buildWhitespaceState(horzBehaviour.options().yieldCurve, lastIndex);
      const newWhitespaceHash = generateWhitespaceHash(newWhitespaceState);
      if (newWhitespaceHash !== currentWhitespaceHash) {
        currentWhitespaceHash = newWhitespaceHash;
        whiteSpaceSeries.setData(generateWhitespaceData(newWhitespaceState));
      }
    }
    updateWhitespace(0);
    horzBehaviour.whitespaceInvalidated().subscribe(updateWhitespace);
  }
};

// ../lib/prod/src/api/create-yield-curve-chart.js
function createYieldCurveChart(container, options) {
  const htmlElement = fetchHtmlElement(container);
  const chartApi = new YieldChartApi(htmlElement, options);
  return chartApi;
}

// ../lib/prod/src/model/horz-scale-behavior-price/horz-scale-behaviour-price.js
function markWithGreaterWeight3(a, b) {
  return a.weight > b.weight ? a : b;
}
var HorzScaleBehaviorPrice = class {
  options() {
    return this._options;
  }
  setOptions(options) {
    this._options = options;
  }
  preprocessData(data) {
  }
  updateFormatter(options) {
    if (!this._options) {
      return;
    }
    this._options.localization = options;
  }
  createConverterToInternalObj(data) {
    return (price) => price;
  }
  key(internalItem) {
    return internalItem;
  }
  cacheKey(internalItem) {
    return internalItem;
  }
  convertHorzItemToInternal(item) {
    return item;
  }
  formatHorzItem(item) {
    return item.toFixed(this._precision());
  }
  formatTickmark(item, localizationOptions) {
    return item.time.toFixed(this._precision());
  }
  maxTickMarkWeight(marks) {
    return marks.reduce(markWithGreaterWeight3, marks[0]).weight;
  }
  fillWeightsForPoints(sortedTimePoints, startIndex) {
    const priceWeight = (price) => {
      if (price === Math.ceil(price / 100) * 100) {
        return 8;
      }
      if (price === Math.ceil(price / 50) * 50) {
        return 7;
      }
      if (price === Math.ceil(price / 25) * 25) {
        return 6;
      }
      if (price === Math.ceil(price / 10) * 10) {
        return 5;
      }
      if (price === Math.ceil(price / 5) * 5) {
        return 4;
      }
      if (price === Math.ceil(price)) {
        return 3;
      }
      if (price * 2 === Math.ceil(price * 2)) {
        return 1;
      }
      return 0;
    };
    for (let index = startIndex; index < sortedTimePoints.length; ++index) {
      sortedTimePoints[index].timeWeight = priceWeight(sortedTimePoints[index].time);
    }
  }
  _precision() {
    return this._options.localization.precision;
  }
};

// ../lib/prod/src/api/create-options-chart.js
function createOptionsChart(container, options) {
  return createChartEx(container, new HorzScaleBehaviorPrice(), options);
}

// ../lib/prod/src/renderers/area-renderer-base.js
function finishStyledArea2(baseLevelCoordinate, scope, style, areaFirstItem, newAreaFirstItem) {
  const { context, horizontalPixelRatio, verticalPixelRatio } = scope;
  context.lineTo(newAreaFirstItem.x * horizontalPixelRatio, baseLevelCoordinate * verticalPixelRatio);
  context.lineTo(areaFirstItem.x * horizontalPixelRatio, baseLevelCoordinate * verticalPixelRatio);
  context.closePath();
  context.fillStyle = style;
  context.fill();
}
var PaneRendererAreaBase = class extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    this._data = null;
  }
  setData(data) {
    this._data = data;
  }
  _drawImpl(renderingScope) {
    if (this._data === null) {
      return;
    }
    const { items, visibleRange, barWidth, lineWidth, lineStyle, lineType } = this._data;
    const baseLevelCoordinate = this._data.baseLevelCoordinate ?? (this._data.invertFilledArea ? 0 : renderingScope.mediaSize.height);
    if (visibleRange === null) {
      return;
    }
    const ctx = renderingScope.context;
    ctx.lineCap = "butt";
    ctx.lineJoin = "round";
    ctx.lineWidth = lineWidth;
    setLineStyle(ctx, lineStyle);
    ctx.lineWidth = 1;
    walkLine(renderingScope, items, lineType, visibleRange, barWidth, this._fillStyle.bind(this), finishStyledArea2.bind(null, baseLevelCoordinate));
  }
};

// ../lib/prod/src/renderers/gradient-style-cache.js
var GradientStyleCache = class {
  // eslint-disable-next-line complexity
  get(scope, params) {
    const cachedParams = this._params;
    const { topColor1, topColor2, bottomColor1, bottomColor2, baseLevelCoordinate, topCoordinate, bottomCoordinate } = params;
    if (this._cachedValue === void 0 || cachedParams === void 0 || cachedParams.topColor1 !== topColor1 || cachedParams.topColor2 !== topColor2 || cachedParams.bottomColor1 !== bottomColor1 || cachedParams.bottomColor2 !== bottomColor2 || cachedParams.baseLevelCoordinate !== baseLevelCoordinate || cachedParams.topCoordinate !== topCoordinate || cachedParams.bottomCoordinate !== bottomCoordinate) {
      const { verticalPixelRatio } = scope;
      const multiplier = baseLevelCoordinate || topCoordinate > 0 ? verticalPixelRatio : 1;
      const top = topCoordinate * multiplier;
      const bottom = bottomCoordinate === scope.bitmapSize.height ? bottomCoordinate : bottomCoordinate * multiplier;
      const baseline = (baseLevelCoordinate ?? 0) * multiplier;
      const gradient = scope.context.createLinearGradient(0, top, 0, bottom);
      gradient.addColorStop(0, topColor1);
      if (baseLevelCoordinate !== null && baseLevelCoordinate !== void 0) {
        const range = bottom - top;
        const baselineRatio = clamp((baseline - top) / range, 0, 1);
        gradient.addColorStop(baselineRatio, topColor2);
        gradient.addColorStop(baselineRatio, bottomColor1);
      }
      gradient.addColorStop(1, bottomColor2);
      this._cachedValue = gradient;
      this._params = params;
    }
    return this._cachedValue;
  }
};

// ../lib/prod/src/renderers/baseline-renderer-area.js
var PaneRendererBaselineArea = class extends PaneRendererAreaBase {
  constructor() {
    super(...arguments);
    this._fillCache = new GradientStyleCache();
  }
  _fillStyle(renderingScope, item) {
    const data = this._data;
    return this._fillCache.get(renderingScope, {
      topColor1: item.topFillColor1,
      topColor2: item.topFillColor2,
      bottomColor1: item.bottomFillColor1,
      bottomColor2: item.bottomFillColor2,
      baseLevelCoordinate: data.baseLevelCoordinate,
      topCoordinate: data.topCoordinate ?? 0,
      bottomCoordinate: data.bottomCoordinate ?? renderingScope.bitmapSize.height
    });
  }
};

// ../lib/prod/src/renderers/baseline-renderer-line.js
var PaneRendererBaselineLine = class extends PaneRendererLineBase {
  constructor() {
    super(...arguments);
    this._strokeCache = new GradientStyleCache();
  }
  _strokeStyle(renderingScope, item) {
    const data = this._data;
    return this._strokeCache.get(renderingScope, {
      topColor1: item.topLineColor,
      topColor2: item.topLineColor,
      bottomColor1: item.bottomLineColor,
      bottomColor2: item.bottomLineColor,
      baseLevelCoordinate: data.baseLevelCoordinate,
      topCoordinate: data.topCoordinate ?? 0,
      bottomCoordinate: data.bottomCoordinate ?? renderingScope.bitmapSize.height
    });
  }
};

// ../lib/prod/src/model/series/baseline-pane-view.js
var SeriesBaselinePaneView = class extends LinePaneViewBase {
  constructor(series, model) {
    super(series, model);
    this._renderer = new CompositeRenderer();
    this._baselineAreaRenderer = new PaneRendererBaselineArea();
    this._baselineLineRenderer = new PaneRendererBaselineLine();
    this._renderer.setRenderers([this._baselineAreaRenderer, this._baselineLineRenderer]);
  }
  _createRawItem(time, price, colorer) {
    return {
      ...this._createRawItemBase(time, price),
      ...colorer.barStyle(time)
    };
  }
  _prepareRendererData() {
    const firstValue = this._series.firstValue();
    if (firstValue === null) {
      return;
    }
    const options = this._series.options();
    const baseLevelCoordinate = this._series.priceScale().priceToCoordinate(options.baseValue.price, firstValue.value);
    const barWidth = this._model.timeScale().barSpacing();
    if (this._itemsVisibleRange === null || this._items.length === 0) {
      return;
    }
    let topCoordinate;
    let bottomCoordinate;
    if (options.relativeGradient) {
      topCoordinate = this._items[this._itemsVisibleRange.from].y;
      bottomCoordinate = this._items[this._itemsVisibleRange.from].y;
      for (let i = this._itemsVisibleRange.from; i < this._itemsVisibleRange.to; i++) {
        const item = this._items[i];
        if (item.y < topCoordinate) {
          topCoordinate = item.y;
        }
        if (item.y > bottomCoordinate) {
          bottomCoordinate = item.y;
        }
      }
    }
    this._baselineAreaRenderer.setData({
      items: this._items,
      lineWidth: options.lineWidth,
      lineStyle: options.lineStyle,
      lineType: options.lineType,
      baseLevelCoordinate,
      topCoordinate,
      bottomCoordinate,
      invertFilledArea: false,
      visibleRange: this._itemsVisibleRange,
      barWidth
    });
    this._baselineLineRenderer.setData({
      items: this._items,
      lineWidth: options.lineWidth,
      lineStyle: options.lineStyle,
      lineType: options.lineVisible ? options.lineType : void 0,
      pointMarkersRadius: options.pointMarkersVisible ? options.pointMarkersRadius || options.lineWidth / 2 + 2 : void 0,
      baseLevelCoordinate,
      topCoordinate,
      bottomCoordinate,
      visibleRange: this._itemsVisibleRange,
      barWidth
    });
  }
};

// ../lib/prod/src/model/series/baseline-series.js
var baselineStyleDefaults = {
  baseValue: {
    type: "price",
    price: 0
  },
  relativeGradient: false,
  topFillColor1: "rgba(38, 166, 154, 0.28)",
  topFillColor2: "rgba(38, 166, 154, 0.05)",
  topLineColor: "rgba(38, 166, 154, 1)",
  bottomFillColor1: "rgba(239, 83, 80, 0.05)",
  bottomFillColor2: "rgba(239, 83, 80, 0.28)",
  bottomLineColor: "rgba(239, 83, 80, 1)",
  lineWidth: 3,
  lineStyle: 0,
  lineType: 0,
  lineVisible: true,
  crosshairMarkerVisible: true,
  crosshairMarkerRadius: 4,
  crosshairMarkerBorderColor: "",
  crosshairMarkerBorderWidth: 2,
  crosshairMarkerBackgroundColor: "",
  lastPriceAnimation: 0,
  pointMarkersVisible: false
};
var createPaneView3 = (series, model) => new SeriesBaselinePaneView(series, model);
var createSeries = () => {
  const definition = {
    type: "Baseline",
    isBuiltIn: true,
    defaultOptions: baselineStyleDefaults,
    /**
     * @internal
     */
    createPaneView: createPaneView3
  };
  return definition;
};
var baselineSeries = createSeries();

// ../lib/prod/src/renderers/area-renderer.js
var PaneRendererArea = class extends PaneRendererAreaBase {
  constructor() {
    super(...arguments);
    this._fillCache = new GradientStyleCache();
  }
  _fillStyle(renderingScope, item) {
    return this._fillCache.get(renderingScope, {
      topColor1: item.topColor,
      topColor2: "",
      bottomColor1: "",
      bottomColor2: item.bottomColor,
      topCoordinate: this._data?.topCoordinate ?? 0,
      bottomCoordinate: renderingScope.bitmapSize.height
    });
  }
};

// ../lib/prod/src/model/series/area-pane-view.js
var SeriesAreaPaneView = class extends LinePaneViewBase {
  constructor(series, model) {
    super(series, model);
    this._renderer = new CompositeRenderer();
    this._areaRenderer = new PaneRendererArea();
    this._lineRenderer = new PaneRendererLine();
    this._renderer.setRenderers([this._areaRenderer, this._lineRenderer]);
  }
  _createRawItem(time, price, colorer) {
    return {
      ...this._createRawItemBase(time, price),
      ...colorer.barStyle(time)
    };
  }
  _prepareRendererData() {
    const options = this._series.options();
    if (this._itemsVisibleRange === null || this._items.length === 0) {
      return;
    }
    let topCoordinate;
    if (options.relativeGradient) {
      topCoordinate = this._items[this._itemsVisibleRange.from].y;
      for (let i = this._itemsVisibleRange.from; i < this._itemsVisibleRange.to; i++) {
        const item = this._items[i];
        if (item.y < topCoordinate) {
          topCoordinate = item.y;
        }
      }
    }
    this._areaRenderer.setData({
      lineType: options.lineType,
      items: this._items,
      lineStyle: options.lineStyle,
      lineWidth: options.lineWidth,
      baseLevelCoordinate: null,
      topCoordinate,
      invertFilledArea: options.invertFilledArea,
      visibleRange: this._itemsVisibleRange,
      barWidth: this._model.timeScale().barSpacing()
    });
    this._lineRenderer.setData({
      lineType: options.lineVisible ? options.lineType : void 0,
      items: this._items,
      lineStyle: options.lineStyle,
      lineWidth: options.lineWidth,
      visibleRange: this._itemsVisibleRange,
      barWidth: this._model.timeScale().barSpacing(),
      pointMarkersRadius: options.pointMarkersVisible ? options.pointMarkersRadius || options.lineWidth / 2 + 2 : void 0
    });
  }
};

// ../lib/prod/src/model/series/area-series.js
var areaStyleDefaults = {
  topColor: "rgba( 46, 220, 135, 0.4)",
  bottomColor: "rgba( 40, 221, 100, 0)",
  invertFilledArea: false,
  relativeGradient: false,
  lineColor: "#33D778",
  lineStyle: 0,
  lineWidth: 3,
  lineType: 0,
  lineVisible: true,
  crosshairMarkerVisible: true,
  crosshairMarkerRadius: 4,
  crosshairMarkerBorderColor: "",
  crosshairMarkerBorderWidth: 2,
  crosshairMarkerBackgroundColor: "",
  lastPriceAnimation: 0,
  pointMarkersVisible: false
};
var createPaneView4 = (series, model) => new SeriesAreaPaneView(series, model);
var createSeries2 = () => {
  const definition = {
    type: "Area",
    isBuiltIn: true,
    defaultOptions: areaStyleDefaults,
    /**
     * @internal
     */
    createPaneView: createPaneView4
  };
  return definition;
};
var areaSeries = createSeries2();

// ../lib/prod/src/renderers/optimal-bar-width.js
function optimalBarWidth(barSpacing, pixelRatio) {
  return Math.floor(barSpacing * 0.3 * pixelRatio);
}
function optimalCandlestickWidth(barSpacing, pixelRatio) {
  const barSpacingSpecialCaseFrom = 2.5;
  const barSpacingSpecialCaseTo = 4;
  const barSpacingSpecialCaseCoeff = 3;
  if (barSpacing >= barSpacingSpecialCaseFrom && barSpacing <= barSpacingSpecialCaseTo) {
    return Math.floor(barSpacingSpecialCaseCoeff * pixelRatio);
  }
  const barSpacingReducingCoeff = 0.2;
  const coeff = 1 - barSpacingReducingCoeff * Math.atan(Math.max(barSpacingSpecialCaseTo, barSpacing) - barSpacingSpecialCaseTo) / (Math.PI * 0.5);
  const res = Math.floor(barSpacing * coeff * pixelRatio);
  const scaledBarSpacing = Math.floor(barSpacing * pixelRatio);
  const optimal = Math.min(res, scaledBarSpacing);
  return Math.max(Math.floor(pixelRatio), optimal);
}

// ../lib/prod/src/renderers/bars-renderer.js
var PaneRendererBars = class extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    this._data = null;
    this._barWidth = 0;
    this._barLineWidth = 0;
  }
  setData(data) {
    this._data = data;
  }
  // eslint-disable-next-line complexity
  _drawImpl({ context: ctx, horizontalPixelRatio, verticalPixelRatio }) {
    if (this._data === null || this._data.bars.length === 0 || this._data.visibleRange === null) {
      return;
    }
    this._barWidth = this._calcBarWidth(horizontalPixelRatio);
    if (this._barWidth >= 2) {
      const lineWidth = Math.max(1, Math.floor(horizontalPixelRatio));
      if (lineWidth % 2 !== this._barWidth % 2) {
        this._barWidth--;
      }
    }
    this._barLineWidth = this._data.thinBars ? Math.min(this._barWidth, Math.floor(horizontalPixelRatio)) : this._barWidth;
    let prevColor = null;
    const drawOpenClose = this._barLineWidth <= this._barWidth && this._data.barSpacing >= Math.floor(1.5 * horizontalPixelRatio);
    for (let i = this._data.visibleRange.from; i < this._data.visibleRange.to; ++i) {
      const bar = this._data.bars[i];
      if (prevColor !== bar.barColor) {
        ctx.fillStyle = bar.barColor;
        prevColor = bar.barColor;
      }
      const bodyWidthHalf = Math.floor(this._barLineWidth * 0.5);
      const bodyCenter = Math.round(bar.x * horizontalPixelRatio);
      const bodyLeft = bodyCenter - bodyWidthHalf;
      const bodyWidth = this._barLineWidth;
      const bodyRight = bodyLeft + bodyWidth - 1;
      const high = Math.min(bar.highY, bar.lowY);
      const low = Math.max(bar.highY, bar.lowY);
      const bodyTop = Math.round(high * verticalPixelRatio) - bodyWidthHalf;
      const bodyBottom = Math.round(low * verticalPixelRatio) + bodyWidthHalf;
      const bodyHeight = Math.max(bodyBottom - bodyTop, this._barLineWidth);
      ctx.fillRect(bodyLeft, bodyTop, bodyWidth, bodyHeight);
      const sideWidth = Math.ceil(this._barWidth * 1.5);
      if (drawOpenClose) {
        if (this._data.openVisible) {
          const openLeft = bodyCenter - sideWidth;
          let openTop = Math.max(bodyTop, Math.round(bar.openY * verticalPixelRatio) - bodyWidthHalf);
          let openBottom = openTop + bodyWidth - 1;
          if (openBottom > bodyTop + bodyHeight - 1) {
            openBottom = bodyTop + bodyHeight - 1;
            openTop = openBottom - bodyWidth + 1;
          }
          ctx.fillRect(openLeft, openTop, bodyLeft - openLeft, openBottom - openTop + 1);
        }
        const closeRight = bodyCenter + sideWidth;
        let closeTop = Math.max(bodyTop, Math.round(bar.closeY * verticalPixelRatio) - bodyWidthHalf);
        let closeBottom = closeTop + bodyWidth - 1;
        if (closeBottom > bodyTop + bodyHeight - 1) {
          closeBottom = bodyTop + bodyHeight - 1;
          closeTop = closeBottom - bodyWidth + 1;
        }
        ctx.fillRect(bodyRight + 1, closeTop, closeRight - bodyRight, closeBottom - closeTop + 1);
      }
    }
  }
  _calcBarWidth(pixelRatio) {
    const limit = Math.floor(pixelRatio);
    return Math.max(limit, Math.floor(optimalBarWidth(ensureNotNull(this._data).barSpacing, pixelRatio)));
  }
};

// ../lib/prod/src/model/series/bars-pane-view-base.js
var BarsPaneViewBase = class extends SeriesPaneViewBase {
  constructor(series, model) {
    super(series, model, false);
  }
  _convertToCoordinates(priceScale, timeScale, firstValue) {
    timeScale.indexesToCoordinates(this._items, undefinedIfNull(this._itemsVisibleRange));
    priceScale.barPricesToCoordinates(this._items, firstValue, undefinedIfNull(this._itemsVisibleRange));
  }
  _createDefaultItem(time, bar, colorer) {
    return {
      time,
      open: bar.value[
        0
        /* PlotRowValueIndex.Open */
      ],
      high: bar.value[
        1
        /* PlotRowValueIndex.High */
      ],
      low: bar.value[
        2
        /* PlotRowValueIndex.Low */
      ],
      close: bar.value[
        3
        /* PlotRowValueIndex.Close */
      ],
      x: NaN,
      openY: NaN,
      highY: NaN,
      lowY: NaN,
      closeY: NaN
    };
  }
  _fillRawPoints() {
    const colorer = this._series.barColorer();
    this._items = this._series.conflatedBars().rows().map((row) => this._createRawItem(row.index, row, colorer));
  }
};

// ../lib/prod/src/model/series/bars-pane-view.js
var SeriesBarsPaneView = class extends BarsPaneViewBase {
  constructor() {
    super(...arguments);
    this._renderer = new PaneRendererBars();
  }
  _createRawItem(time, bar, colorer) {
    return {
      ...this._createDefaultItem(time, bar, colorer),
      ...colorer.barStyle(time)
    };
  }
  _prepareRendererData() {
    const barStyleProps = this._series.options();
    this._renderer.setData({
      bars: this._items,
      barSpacing: this._model.timeScale().barSpacing(),
      openVisible: barStyleProps.openVisible,
      thinBars: barStyleProps.thinBars,
      visibleRange: this._itemsVisibleRange
    });
  }
};

// ../lib/prod/src/model/series/bar-series.js
var barStyleDefaults = {
  upColor: "#26a69a",
  downColor: "#ef5350",
  openVisible: true,
  thinBars: true
};
var createPaneView5 = (series, model) => new SeriesBarsPaneView(series, model);
var createSeries3 = () => {
  const definition = {
    type: "Bar",
    isBuiltIn: true,
    defaultOptions: barStyleDefaults,
    /**
     * @internal
     */
    createPaneView: createPaneView5
  };
  return definition;
};
var barSeries = createSeries3();

// ../lib/prod/src/renderers/candlesticks-renderer.js
var Constants10;
(function(Constants14) {
  Constants14[Constants14["BarBorderWidth"] = 1] = "BarBorderWidth";
})(Constants10 || (Constants10 = {}));
var PaneRendererCandlesticks = class extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    this._data = null;
    this._barWidth = 0;
  }
  setData(data) {
    this._data = data;
  }
  _drawImpl(renderingScope) {
    if (this._data === null || this._data.bars.length === 0 || this._data.visibleRange === null) {
      return;
    }
    const { horizontalPixelRatio } = renderingScope;
    this._barWidth = optimalCandlestickWidth(this._data.barSpacing, horizontalPixelRatio);
    if (this._barWidth >= 2) {
      const wickWidth = Math.floor(horizontalPixelRatio);
      if (wickWidth % 2 !== this._barWidth % 2) {
        this._barWidth--;
      }
    }
    const bars = this._data.bars;
    if (this._data.wickVisible) {
      this._drawWicks(renderingScope, bars, this._data.visibleRange);
    }
    if (this._data.borderVisible) {
      this._drawBorder(renderingScope, bars, this._data.visibleRange);
    }
    const borderWidth = this._calculateBorderWidth(horizontalPixelRatio);
    if (!this._data.borderVisible || this._barWidth > borderWidth * 2) {
      this._drawCandles(renderingScope, bars, this._data.visibleRange);
    }
  }
  _drawWicks(renderingScope, bars, visibleRange) {
    if (this._data === null) {
      return;
    }
    const { context: ctx, horizontalPixelRatio, verticalPixelRatio } = renderingScope;
    let prevWickColor = "";
    let wickWidth = Math.min(Math.floor(horizontalPixelRatio), Math.floor(this._data.barSpacing * horizontalPixelRatio));
    wickWidth = Math.max(Math.floor(horizontalPixelRatio), Math.min(wickWidth, this._barWidth));
    const wickOffset = Math.floor(wickWidth * 0.5);
    let prevEdge = null;
    for (let i = visibleRange.from; i < visibleRange.to; i++) {
      const bar = bars[i];
      if (bar.barWickColor !== prevWickColor) {
        ctx.fillStyle = bar.barWickColor;
        prevWickColor = bar.barWickColor;
      }
      const top = Math.round(Math.min(bar.openY, bar.closeY) * verticalPixelRatio);
      const bottom = Math.round(Math.max(bar.openY, bar.closeY) * verticalPixelRatio);
      const high = Math.round(bar.highY * verticalPixelRatio);
      const low = Math.round(bar.lowY * verticalPixelRatio);
      const scaledX = Math.round(horizontalPixelRatio * bar.x);
      let left = scaledX - wickOffset;
      const right = left + wickWidth - 1;
      if (prevEdge !== null) {
        left = Math.max(prevEdge + 1, left);
        left = Math.min(left, right);
      }
      const width = right - left + 1;
      ctx.fillRect(left, high, width, top - high);
      ctx.fillRect(left, bottom + 1, width, low - bottom);
      prevEdge = right;
    }
  }
  _calculateBorderWidth(pixelRatio) {
    let borderWidth = Math.floor(1 * pixelRatio);
    if (this._barWidth <= 2 * borderWidth) {
      borderWidth = Math.floor((this._barWidth - 1) * 0.5);
    }
    const res = Math.max(Math.floor(pixelRatio), borderWidth);
    if (this._barWidth <= res * 2) {
      return Math.max(Math.floor(pixelRatio), Math.floor(1 * pixelRatio));
    }
    return res;
  }
  _drawBorder(renderingScope, bars, visibleRange) {
    if (this._data === null) {
      return;
    }
    const { context: ctx, horizontalPixelRatio, verticalPixelRatio } = renderingScope;
    let prevBorderColor = "";
    const borderWidth = this._calculateBorderWidth(horizontalPixelRatio);
    let prevEdge = null;
    for (let i = visibleRange.from; i < visibleRange.to; i++) {
      const bar = bars[i];
      if (bar.barBorderColor !== prevBorderColor) {
        ctx.fillStyle = bar.barBorderColor;
        prevBorderColor = bar.barBorderColor;
      }
      let left = Math.round(bar.x * horizontalPixelRatio) - Math.floor(this._barWidth * 0.5);
      const right = left + this._barWidth - 1;
      const top = Math.round(Math.min(bar.openY, bar.closeY) * verticalPixelRatio);
      const bottom = Math.round(Math.max(bar.openY, bar.closeY) * verticalPixelRatio);
      if (prevEdge !== null) {
        left = Math.max(prevEdge + 1, left);
        left = Math.min(left, right);
      }
      if (this._data.barSpacing * horizontalPixelRatio > 2 * borderWidth) {
        fillRectInnerBorder(ctx, left, top, right - left + 1, bottom - top + 1, borderWidth);
      } else {
        const width = right - left + 1;
        ctx.fillRect(left, top, width, bottom - top + 1);
      }
      prevEdge = right;
    }
  }
  _drawCandles(renderingScope, bars, visibleRange) {
    if (this._data === null) {
      return;
    }
    const { context: ctx, horizontalPixelRatio, verticalPixelRatio } = renderingScope;
    let prevBarColor = "";
    const borderWidth = this._calculateBorderWidth(horizontalPixelRatio);
    for (let i = visibleRange.from; i < visibleRange.to; i++) {
      const bar = bars[i];
      let top = Math.round(Math.min(bar.openY, bar.closeY) * verticalPixelRatio);
      let bottom = Math.round(Math.max(bar.openY, bar.closeY) * verticalPixelRatio);
      let left = Math.round(bar.x * horizontalPixelRatio) - Math.floor(this._barWidth * 0.5);
      let right = left + this._barWidth - 1;
      if (bar.barColor !== prevBarColor) {
        const barColor = bar.barColor;
        ctx.fillStyle = barColor;
        prevBarColor = barColor;
      }
      if (this._data.borderVisible) {
        left += borderWidth;
        top += borderWidth;
        right -= borderWidth;
        bottom -= borderWidth;
      }
      if (top > bottom) {
        continue;
      }
      ctx.fillRect(left, top, right - left + 1, bottom - top + 1);
    }
  }
};

// ../lib/prod/src/model/series/candlesticks-pane-view.js
var SeriesCandlesticksPaneView = class extends BarsPaneViewBase {
  constructor() {
    super(...arguments);
    this._renderer = new PaneRendererCandlesticks();
  }
  _createRawItem(time, bar, colorer) {
    return {
      ...this._createDefaultItem(time, bar, colorer),
      ...colorer.barStyle(time)
    };
  }
  _prepareRendererData() {
    const candlestickStyleProps = this._series.options();
    this._renderer.setData({
      bars: this._items,
      barSpacing: this._model.timeScale().barSpacing(),
      wickVisible: candlestickStyleProps.wickVisible,
      borderVisible: candlestickStyleProps.borderVisible,
      visibleRange: this._itemsVisibleRange
    });
  }
};

// ../lib/prod/src/model/series/candlestick-series.js
var candlestickStyleDefaults = {
  upColor: "#26a69a",
  downColor: "#ef5350",
  wickVisible: true,
  borderVisible: true,
  borderColor: "#378658",
  borderUpColor: "#26a69a",
  borderDownColor: "#ef5350",
  wickColor: "#737375",
  wickUpColor: "#26a69a",
  wickDownColor: "#ef5350"
};
var createPaneView6 = (series, model) => new SeriesCandlesticksPaneView(series, model);
var createSeries4 = () => {
  const definition = {
    type: "Candlestick",
    isBuiltIn: true,
    defaultOptions: candlestickStyleDefaults,
    /**
     * @internal
     */
    createPaneView: createPaneView6
  };
  return definition;
};
var candlestickSeries = createSeries4();

// ../lib/prod/src/renderers/histogram-renderer.js
var showSpacingMinimalBarWidth = 1;
var alignToMinimalWidthLimit = 4;
var PaneRendererHistogram = class extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    this._data = null;
    this._precalculatedCache = [];
  }
  setData(data) {
    this._data = data;
    this._precalculatedCache = [];
  }
  _drawImpl({ context: ctx, horizontalPixelRatio, verticalPixelRatio }) {
    if (this._data === null || this._data.items.length === 0 || this._data.visibleRange === null) {
      return;
    }
    if (!this._precalculatedCache.length) {
      this._fillPrecalculatedCache(horizontalPixelRatio);
    }
    const tickWidth = Math.max(1, Math.floor(verticalPixelRatio));
    const histogramBase = Math.round(this._data.histogramBase * verticalPixelRatio);
    const topHistogramBase = histogramBase - Math.floor(tickWidth / 2);
    const bottomHistogramBase = topHistogramBase + tickWidth;
    for (let i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
      const item = this._data.items[i];
      const current = this._precalculatedCache[i - this._data.visibleRange.from];
      const y = Math.round(item.y * verticalPixelRatio);
      ctx.fillStyle = item.barColor;
      let top;
      let bottom;
      if (y <= topHistogramBase) {
        top = y;
        bottom = bottomHistogramBase;
      } else {
        top = topHistogramBase;
        bottom = y - Math.floor(tickWidth / 2) + tickWidth;
      }
      ctx.fillRect(current.left, top, current.right - current.left + 1, bottom - top);
    }
  }
  // eslint-disable-next-line complexity
  _fillPrecalculatedCache(pixelRatio) {
    if (this._data === null || this._data.items.length === 0 || this._data.visibleRange === null) {
      this._precalculatedCache = [];
      return;
    }
    const spacing = Math.ceil(this._data.barSpacing * pixelRatio) <= showSpacingMinimalBarWidth ? 0 : Math.max(1, Math.floor(pixelRatio));
    const columnWidth = Math.round(this._data.barSpacing * pixelRatio) - spacing;
    this._precalculatedCache = new Array(this._data.visibleRange.to - this._data.visibleRange.from);
    for (let i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
      const item = this._data.items[i];
      const x = Math.round(item.x * pixelRatio);
      let left;
      let right;
      if (columnWidth % 2) {
        const halfWidth = (columnWidth - 1) / 2;
        left = x - halfWidth;
        right = x + halfWidth;
      } else {
        const halfWidth = columnWidth / 2;
        left = x - halfWidth;
        right = x + halfWidth - 1;
      }
      this._precalculatedCache[i - this._data.visibleRange.from] = {
        left,
        right,
        roundedCenter: x,
        center: item.x * pixelRatio,
        time: item.time
      };
    }
    for (let i = this._data.visibleRange.from + 1; i < this._data.visibleRange.to; i++) {
      const current = this._precalculatedCache[i - this._data.visibleRange.from];
      const prev = this._precalculatedCache[i - this._data.visibleRange.from - 1];
      if (current.time !== prev.time + 1) {
        continue;
      }
      if (current.left - prev.right !== spacing + 1) {
        if (prev.roundedCenter > prev.center) {
          prev.right = current.left - spacing - 1;
        } else {
          current.left = prev.right + spacing + 1;
        }
      }
    }
    let minWidth = Math.ceil(this._data.barSpacing * pixelRatio);
    for (let i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
      const current = this._precalculatedCache[i - this._data.visibleRange.from];
      if (current.right < current.left) {
        current.right = current.left;
      }
      const width = current.right - current.left + 1;
      minWidth = Math.min(width, minWidth);
    }
    if (spacing > 0 && minWidth < alignToMinimalWidthLimit) {
      for (let i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
        const current = this._precalculatedCache[i - this._data.visibleRange.from];
        const width = current.right - current.left + 1;
        if (width > minWidth) {
          if (current.roundedCenter > current.center) {
            current.right -= 1;
          } else {
            current.left += 1;
          }
        }
      }
    }
  }
};

// ../lib/prod/src/model/series/histogram-pane-view.js
var SeriesHistogramPaneView = class extends LinePaneViewBase {
  constructor() {
    super(...arguments);
    this._renderer = new PaneRendererHistogram();
  }
  _createRawItem(time, price, colorer) {
    return {
      ...this._createRawItemBase(time, price),
      ...colorer.barStyle(time)
    };
  }
  _prepareRendererData() {
    const data = {
      items: this._items,
      barSpacing: this._model.timeScale().barSpacing(),
      visibleRange: this._itemsVisibleRange,
      histogramBase: this._series.priceScale().priceToCoordinate(this._series.options().base, ensureNotNull(this._series.firstValue()).value)
    };
    this._renderer.setData(data);
  }
};

// ../lib/prod/src/model/series/histogram-series.js
var histogramStyleDefaults = {
  color: "#26a69a",
  base: 0
};
var createPaneView7 = (series, model) => new SeriesHistogramPaneView(series, model);
var createSeries5 = () => {
  const definition = {
    type: "Histogram",
    isBuiltIn: true,
    defaultOptions: histogramStyleDefaults,
    /**
     * @internal
     */
    createPaneView: createPaneView7
  };
  return definition;
};
var histogramSeries = createSeries5();

// ../lib/prod/src/plugins/pane-primitive-wrapper.js
var PanePrimitiveWrapper2 = class {
  constructor(pane, primitive) {
    this._pane = pane;
    this._primitive = primitive;
    this._attach();
  }
  detach() {
    this._pane.detachPrimitive(this._primitive);
  }
  getPane() {
    return this._pane;
  }
  applyOptions(options) {
    this._primitive.applyOptions?.(options);
  }
  _attach() {
    this._pane.attachPrimitive(this._primitive);
  }
};

// ../lib/prod/src/plugins/text-watermark/options.js
var textWatermarkOptionsDefaults = {
  visible: true,
  horzAlign: "center",
  vertAlign: "center",
  lines: []
};
var textWatermarkLineOptionsDefaults = {
  color: "rgba(0, 0, 0, 0.5)",
  fontSize: 48,
  fontFamily: defaultFontFamily,
  fontStyle: "",
  text: ""
};

// ../lib/prod/src/plugins/text-watermark/pane-renderer.js
var TextWatermarkRenderer = class {
  constructor(options) {
    this._metricsCache = /* @__PURE__ */ new Map();
    this._data = options;
  }
  draw(target) {
    target.useMediaCoordinateSpace((scope) => {
      if (!this._data.visible) {
        return;
      }
      const { context: ctx, mediaSize } = scope;
      let textHeight = 0;
      for (const line of this._data.lines) {
        if (line.text.length === 0) {
          continue;
        }
        ctx.font = line.font;
        const textWidth = this._metrics(ctx, line.text);
        if (textWidth > mediaSize.width) {
          line.zoom = mediaSize.width / textWidth;
        } else {
          line.zoom = 1;
        }
        textHeight += line.lineHeight * line.zoom;
      }
      let vertOffset = 0;
      switch (this._data.vertAlign) {
        case "top":
          vertOffset = 0;
          break;
        case "center":
          vertOffset = Math.max((mediaSize.height - textHeight) / 2, 0);
          break;
        case "bottom":
          vertOffset = Math.max(mediaSize.height - textHeight, 0);
          break;
      }
      for (const line of this._data.lines) {
        ctx.save();
        ctx.fillStyle = line.color;
        let horzOffset = 0;
        switch (this._data.horzAlign) {
          case "left":
            ctx.textAlign = "left";
            horzOffset = line.lineHeight / 2;
            break;
          case "center":
            ctx.textAlign = "center";
            horzOffset = mediaSize.width / 2;
            break;
          case "right":
            ctx.textAlign = "right";
            horzOffset = mediaSize.width - 1 - line.lineHeight / 2;
            break;
        }
        ctx.translate(horzOffset, vertOffset);
        ctx.textBaseline = "top";
        ctx.font = line.font;
        ctx.scale(line.zoom, line.zoom);
        ctx.fillText(line.text, 0, line.vertOffset);
        ctx.restore();
        vertOffset += line.lineHeight * line.zoom;
      }
    });
  }
  _metrics(ctx, text) {
    const fontCache = this._fontCache(ctx.font);
    let result = fontCache.get(text);
    if (result === void 0) {
      result = ctx.measureText(text).width;
      fontCache.set(text, result);
    }
    return result;
  }
  _fontCache(font) {
    let fontCache = this._metricsCache.get(font);
    if (fontCache === void 0) {
      fontCache = /* @__PURE__ */ new Map();
      this._metricsCache.set(font, fontCache);
    }
    return fontCache;
  }
};

// ../lib/prod/src/plugins/text-watermark/pane-view.js
var TextWatermarkPaneView = class {
  constructor(options) {
    this._options = buildRendererOptions(options);
  }
  update(options) {
    this._options = buildRendererOptions(options);
  }
  renderer() {
    return new TextWatermarkRenderer(this._options);
  }
};
function buildRendererLineOptions(lineOption) {
  return {
    ...lineOption,
    font: makeFont(lineOption.fontSize, lineOption.fontFamily, lineOption.fontStyle),
    lineHeight: lineOption.lineHeight || lineOption.fontSize * 1.2,
    vertOffset: 0,
    zoom: 0
  };
}
function buildRendererOptions(options) {
  return {
    ...options,
    lines: options.lines.map(buildRendererLineOptions)
  };
}

// ../lib/prod/src/plugins/text-watermark/primitive.js
function mergeLineOptionsWithDefaults(options) {
  return {
    ...textWatermarkLineOptionsDefaults,
    ...options
  };
}
function mergeOptionsWithDefaults(options) {
  return {
    ...textWatermarkOptionsDefaults,
    ...options,
    lines: options.lines?.map(mergeLineOptionsWithDefaults) ?? []
  };
}
var TextWatermark = class {
  constructor(options) {
    this._options = mergeOptionsWithDefaults(options);
    this._paneViews = [new TextWatermarkPaneView(this._options)];
  }
  updateAllViews() {
    this._paneViews.forEach((pw) => pw.update(this._options));
  }
  paneViews() {
    return this._paneViews;
  }
  attached({ requestUpdate }) {
    this.requestUpdate = requestUpdate;
  }
  detached() {
    this.requestUpdate = void 0;
  }
  applyOptions(options) {
    this._options = mergeOptionsWithDefaults({ ...this._options, ...options });
    if (this.requestUpdate) {
      this.requestUpdate();
    }
  }
};
function createTextWatermark(pane, options) {
  return new PanePrimitiveWrapper2(pane, new TextWatermark(options));
}

// ../lib/prod/src/plugins/image-watermark/options.js
var imageWatermarkOptionsDefaults = {
  alpha: 1,
  padding: 0
};

// ../lib/prod/src/plugins/image-watermark/pane-renderer.js
var ImageWatermarkRenderer = class {
  constructor(data) {
    this._data = data;
  }
  draw(target) {
    target.useMediaCoordinateSpace((scope) => {
      const ctx = scope.context;
      const pos = this._determinePlacement(this._data, scope.mediaSize);
      if (!pos || !this._data.imgElement) {
        return;
      }
      ctx.globalAlpha = this._data.alpha ?? 1;
      ctx.drawImage(this._data.imgElement, pos.x, pos.y, pos.width, pos.height);
    });
  }
  _determinePlacement(data, paneSize) {
    const { maxHeight, maxWidth, imgHeight, imgWidth, padding } = data;
    const plotCentreX = Math.round(paneSize.width / 2);
    const plotCentreY = Math.round(paneSize.height / 2);
    const paddingSize = padding ?? 0;
    let availableWidth = paneSize.width - 2 * paddingSize;
    let availableHeight = paneSize.height - 2 * paddingSize;
    if (maxHeight) {
      availableHeight = Math.min(availableHeight, maxHeight);
    }
    if (maxWidth) {
      availableWidth = Math.min(availableWidth, maxWidth);
    }
    const scaleX = availableWidth / imgWidth;
    const scaleY = availableHeight / imgHeight;
    const scaleToUse = Math.min(scaleX, scaleY);
    const drawWidth = imgWidth * scaleToUse;
    const drawHeight = imgHeight * scaleToUse;
    const x = plotCentreX - 0.5 * drawWidth;
    const y = plotCentreY - 0.5 * drawHeight;
    return {
      x,
      y,
      height: drawHeight,
      width: drawWidth
    };
  }
};

// ../lib/prod/src/plugins/image-watermark/pane-view.js
var ImageWatermarkPaneView = class {
  constructor(options) {
    this._image = null;
    this._imageWidth = 0;
    this._imageHeight = 0;
    this._options = options;
    this._rendererOptions = buildRendererOptions2(this._options, this._image, this._imageWidth, this._imageHeight);
  }
  stateUpdate(state) {
    if (state.imageWidth !== void 0) {
      this._imageWidth = state.imageWidth;
    }
    if (state.imageHeight !== void 0) {
      this._imageHeight = state.imageHeight;
    }
    if (state.image !== void 0) {
      this._image = state.image;
    }
    this.update();
  }
  optionsUpdate(options) {
    this._options = options;
    this.update();
  }
  zOrder() {
    return "bottom";
  }
  update() {
    this._rendererOptions = buildRendererOptions2(this._options, this._image, this._imageWidth, this._imageHeight);
  }
  renderer() {
    return new ImageWatermarkRenderer(this._rendererOptions);
  }
};
function buildRendererOptions2(options, imgElement, imgWidth, imgHeight) {
  return {
    ...options,
    imgElement,
    imgWidth,
    imgHeight
  };
}

// ../lib/prod/src/plugins/image-watermark/primitive.js
function mergeOptionsWithDefaults2(options) {
  return {
    ...imageWatermarkOptionsDefaults,
    ...options
  };
}
var ImageWatermark = class {
  constructor(imageUrl, options) {
    this._imgElement = null;
    this._imageUrl = imageUrl;
    this._options = mergeOptionsWithDefaults2(options);
    this._paneViews = [new ImageWatermarkPaneView(this._options)];
  }
  updateAllViews() {
    this._paneViews.forEach((pw) => pw.update());
  }
  paneViews() {
    return this._paneViews;
  }
  attached(attachedParams) {
    const { requestUpdate } = attachedParams;
    this._requestUpdate = requestUpdate;
    this._imgElement = new Image();
    this._imgElement.onload = () => {
      const imageHeight = this._imgElement?.naturalHeight ?? 1;
      const imageWidth = this._imgElement?.naturalWidth ?? 1;
      this._paneViews.forEach((pv) => pv.stateUpdate({
        imageHeight,
        imageWidth,
        image: this._imgElement
      }));
      if (this._requestUpdate) {
        this._requestUpdate();
      }
    };
    this._imgElement.src = this._imageUrl;
  }
  detached() {
    this._requestUpdate = void 0;
    this._imgElement = null;
  }
  applyOptions(options) {
    this._options = mergeOptionsWithDefaults2({ ...this._options, ...options });
    this._updateOptions();
    if (this.requestUpdate) {
      this.requestUpdate();
    }
  }
  requestUpdate() {
    if (this._requestUpdate) {
      this._requestUpdate();
    }
  }
  _updateOptions() {
    this._paneViews.forEach((pw) => pw.optionsUpdate(this._options));
  }
};
function createImageWatermark(pane, imageUrl, options) {
  return new PanePrimitiveWrapper2(pane, new ImageWatermark(imageUrl, options));
}

// ../lib/prod/src/plugins/series-primitive-adapter.js
var SeriesPrimitiveAdapter = class {
  constructor(series, primitive) {
    this._series = series;
    this._primitive = primitive;
    this._attach();
  }
  detach() {
    this._series.detachPrimitive(this._primitive);
  }
  getSeries() {
    return this._series;
  }
  applyOptions(options) {
    if (this._primitive && this._primitive.applyOptions) {
      this._primitive.applyOptions(options);
    }
  }
  _attach() {
    this._series.attachPrimitive(this._primitive);
  }
};

// ../lib/prod/src/plugins/series-markers/options.js
var seriesMarkerOptionsDefaults = {
  autoScale: true,
  zOrder: "normal"
};

// ../lib/prod/src/plugins/series-markers/utils.js
var Constants11;
(function(Constants14) {
  Constants14[Constants14["MinShapeSize"] = 12] = "MinShapeSize";
  Constants14[Constants14["MaxShapeSize"] = 30] = "MaxShapeSize";
  Constants14[Constants14["MinShapeMargin"] = 3] = "MinShapeMargin";
})(Constants11 || (Constants11 = {}));
function size2(barSpacing, coeff) {
  const result = Math.min(
    Math.max(
      barSpacing,
      12
      /* Constants.MinShapeSize */
    ),
    30
    /* Constants.MaxShapeSize */
  ) * coeff;
  return ceiledOdd(result);
}
function shapeSize(shape, originalSize) {
  switch (shape) {
    case "arrowDown":
    case "arrowUp":
      return size2(originalSize, 1);
    case "circle":
      return size2(originalSize, 0.8);
    case "square":
      return size2(originalSize, 0.7);
  }
}
function calculateShapeHeight(barSpacing) {
  return ceiledEven(size2(barSpacing, 1));
}
function shapeMargin(barSpacing) {
  return Math.max(
    size2(barSpacing, 0.1),
    3
    /* Constants.MinShapeMargin */
  );
}
function calculateAdjustedMargin(margin, hasSide, hasInBar) {
  if (hasSide) {
    return margin;
  } else if (hasInBar) {
    return Math.ceil(margin / 2);
  }
  return 0;
}

// ../lib/prod/src/plugins/series-markers/series-markers-arrow.js
function drawArrow(up, ctx, coords, size3) {
  const arrowSize = shapeSize("arrowUp", size3);
  const halfArrowSize = (arrowSize - 1) / 2 * coords.pixelRatio;
  const baseSize = ceiledOdd(size3 / 2);
  const halfBaseSize = (baseSize - 1) / 2 * coords.pixelRatio;
  ctx.beginPath();
  if (up) {
    ctx.moveTo(coords.x - halfArrowSize, coords.y);
    ctx.lineTo(coords.x, coords.y - halfArrowSize);
    ctx.lineTo(coords.x + halfArrowSize, coords.y);
    ctx.lineTo(coords.x + halfBaseSize, coords.y);
    ctx.lineTo(coords.x + halfBaseSize, coords.y + halfArrowSize);
    ctx.lineTo(coords.x - halfBaseSize, coords.y + halfArrowSize);
    ctx.lineTo(coords.x - halfBaseSize, coords.y);
  } else {
    ctx.moveTo(coords.x - halfArrowSize, coords.y);
    ctx.lineTo(coords.x, coords.y + halfArrowSize);
    ctx.lineTo(coords.x + halfArrowSize, coords.y);
    ctx.lineTo(coords.x + halfBaseSize, coords.y);
    ctx.lineTo(coords.x + halfBaseSize, coords.y - halfArrowSize);
    ctx.lineTo(coords.x - halfBaseSize, coords.y - halfArrowSize);
    ctx.lineTo(coords.x - halfBaseSize, coords.y);
  }
  ctx.fill();
}
function hitTestArrow(up, centerX, centerY, size3, x, y) {
  const arrowSize = shapeSize("arrowUp", size3);
  const halfArrowSize = (arrowSize - 1) / 2;
  const baseSize = ceiledOdd(size3 / 2);
  const halfBaseSize = (baseSize - 1) / 2;
  const triangleTolerance = 3;
  const rectTolerance = 2;
  const baseLeft = centerX - halfBaseSize - rectTolerance;
  const baseRight = centerX + halfBaseSize + rectTolerance;
  const baseTop = up ? centerY : centerY - halfArrowSize;
  const baseBottom = up ? centerY + halfArrowSize : centerY;
  if (x >= baseLeft && x <= baseRight && y >= baseTop - rectTolerance && y <= baseBottom + rectTolerance) {
    return true;
  }
  const isInTriangleBounds = () => {
    const headLeft = centerX - halfArrowSize - triangleTolerance;
    const headRight = centerX + halfArrowSize + triangleTolerance;
    const headTop = up ? centerY - halfArrowSize - triangleTolerance : centerY;
    const headBottom = up ? centerY : centerY + halfArrowSize + triangleTolerance;
    if (x < headLeft || x > headRight || y < headTop || y > headBottom) {
      return false;
    }
    const dx = Math.abs(x - centerX);
    const dy = up ? Math.abs(y - centerY) : Math.abs(y - centerY);
    return dy + triangleTolerance >= dx / 2;
  };
  return isInTriangleBounds();
}

// ../lib/prod/src/plugins/series-markers/series-markers-circle.js
function drawCircle(ctx, coords, size3) {
  const circleSize = shapeSize("circle", size3);
  const halfSize = (circleSize - 1) / 2;
  ctx.beginPath();
  ctx.arc(coords.x, coords.y, halfSize * coords.pixelRatio, 0, 2 * Math.PI, false);
  ctx.fill();
}
function hitTestCircle(centerX, centerY, size3, x, y) {
  const circleSize = shapeSize("circle", size3);
  const tolerance = 2 + circleSize / 2;
  const xOffset = centerX - x;
  const yOffset = centerY - y;
  const dist = Math.sqrt(xOffset * xOffset + yOffset * yOffset);
  return dist <= tolerance;
}

// ../lib/prod/src/plugins/series-markers/series-markers-square.js
function drawSquare(ctx, coords, size3) {
  const squareSize = shapeSize("square", size3);
  const halfSize = (squareSize - 1) * coords.pixelRatio / 2;
  const left = coords.x - halfSize;
  const top = coords.y - halfSize;
  ctx.fillRect(left, top, squareSize * coords.pixelRatio, squareSize * coords.pixelRatio);
}
function hitTestSquare(centerX, centerY, size3, x, y) {
  const squareSize = shapeSize("square", size3);
  const halfSize = (squareSize - 1) / 2;
  const left = centerX - halfSize;
  const top = centerY - halfSize;
  return x >= left && x <= left + squareSize && y >= top && y <= top + squareSize;
}

// ../lib/prod/src/plugins/series-markers/series-markers-text.js
function drawText(ctx, text, x, y, horizontalPixelRatio, verticalPixelRatio) {
  ctx.save();
  ctx.scale(horizontalPixelRatio, verticalPixelRatio);
  ctx.fillText(text, x, y);
  ctx.restore();
}
function hitTestText(textX, textY, textWidth, textHeight, x, y) {
  const halfHeight = textHeight / 2;
  return x >= textX && x <= textX + textWidth && y >= textY - halfHeight && y <= textY + halfHeight;
}

// ../lib/prod/src/plugins/series-markers/renderer.js
var SeriesMarkersRenderer = class {
  constructor() {
    this._data = null;
    this._textWidthCache = new TextWidthCache();
    this._fontSize = -1;
    this._fontFamily = "";
    this._font = "";
    this._zOrder = "normal";
  }
  setData(data) {
    this._data = data;
  }
  setParams(fontSize, fontFamily, zOrder) {
    if (this._fontSize !== fontSize || this._fontFamily !== fontFamily) {
      this._fontSize = fontSize;
      this._fontFamily = fontFamily;
      this._font = makeFont(fontSize, fontFamily);
      this._textWidthCache.reset();
    }
    this._zOrder = zOrder;
  }
  hitTest(x, y) {
    if (this._data === null || this._data.visibleRange === null) {
      return null;
    }
    for (let i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
      const item = this._data.items[i];
      if (item && hitTestItem(item, x, y)) {
        return {
          zOrder: "normal",
          externalId: item.externalId ?? ""
        };
      }
    }
    return null;
  }
  draw(target) {
    if (this._zOrder === "aboveSeries") {
      return;
    }
    target.useBitmapCoordinateSpace((scope) => {
      this._drawImpl(scope);
    });
  }
  drawBackground(target) {
    if (this._zOrder !== "aboveSeries") {
      return;
    }
    target.useBitmapCoordinateSpace((scope) => {
      this._drawImpl(scope);
    });
  }
  _drawImpl({ context: ctx, horizontalPixelRatio, verticalPixelRatio }) {
    if (this._data === null || this._data.visibleRange === null) {
      return;
    }
    ctx.textBaseline = "middle";
    ctx.font = this._font;
    for (let index = this._data.visibleRange.from; index < this._data.visibleRange.to; index++) {
      const item = this._data.items[index];
      if (item.text !== void 0) {
        item.text.width = this._textWidthCache.measureText(ctx, item.text.content);
        item.text.height = this._fontSize;
        item.text.x = item.x - item.text.width / 2;
      }
      drawItem(item, ctx, horizontalPixelRatio, verticalPixelRatio);
    }
  }
};
function bitmapShapeItemCoordinates(item, horizontalPixelRatio, verticalPixelRatio) {
  const tickWidth = Math.max(1, Math.floor(horizontalPixelRatio));
  const correction = tickWidth % 2 / 2;
  return {
    x: Math.round(item.x * horizontalPixelRatio) + correction,
    y: item.y * verticalPixelRatio,
    pixelRatio: horizontalPixelRatio
  };
}
function drawItem(item, ctx, horizontalPixelRatio, verticalPixelRatio) {
  ctx.fillStyle = item.color;
  if (item.text !== void 0) {
    drawText(ctx, item.text.content, item.text.x, item.text.y, horizontalPixelRatio, verticalPixelRatio);
  }
  drawShape(item, ctx, bitmapShapeItemCoordinates(item, horizontalPixelRatio, verticalPixelRatio));
}
function drawShape(item, ctx, coordinates) {
  if (item.size === 0) {
    return;
  }
  switch (item.shape) {
    case "arrowDown":
      drawArrow(false, ctx, coordinates, item.size);
      return;
    case "arrowUp":
      drawArrow(true, ctx, coordinates, item.size);
      return;
    case "circle":
      drawCircle(ctx, coordinates, item.size);
      return;
    case "square":
      drawSquare(ctx, coordinates, item.size);
      return;
  }
  ensureNever(item.shape);
}
function hitTestItem(item, x, y) {
  if (item.text !== void 0 && hitTestText(item.text.x, item.text.y, item.text.width, item.text.height, x, y)) {
    return true;
  }
  return hitTestShape(item, x, y);
}
function hitTestShape(item, x, y) {
  if (item.size === 0) {
    return false;
  }
  switch (item.shape) {
    case "arrowDown":
      return hitTestArrow(true, item.x, item.y, item.size, x, y);
    case "arrowUp":
      return hitTestArrow(false, item.x, item.y, item.size, x, y);
    case "circle":
      return hitTestCircle(item.x, item.y, item.size, x, y);
    case "square":
      return hitTestSquare(item.x, item.y, item.size, x, y);
  }
}

// ../lib/prod/src/plugins/series-markers/pane-view.js
var Constants12;
(function(Constants14) {
  Constants14[Constants14["TextMargin"] = 0.1] = "TextMargin";
})(Constants12 || (Constants12 = {}));
function isPriceMarker(position) {
  return position === "atPriceTop" || position === "atPriceBottom" || position === "atPriceMiddle";
}
function getPrice(seriesData, marker, isInverted) {
  if (isPriceMarker(marker.position) && marker.price !== void 0) {
    return marker.price;
  }
  if (isValueData(seriesData)) {
    return seriesData.value;
  }
  if (isOhlcData(seriesData)) {
    if (marker.position === "inBar") {
      return seriesData.close;
    }
    if (marker.position === "aboveBar") {
      if (!isInverted) {
        return seriesData.high;
      }
      return seriesData.low;
    }
    if (marker.position === "belowBar") {
      if (!isInverted) {
        return seriesData.low;
      }
      return seriesData.high;
    }
  }
  return;
}
function fillSizeAndY(rendererItem, marker, seriesData, offsets, textHeight, shapeMargin2, series, chart) {
  const price = getPrice(seriesData, marker, series.priceScale().options().invertScale);
  if (price === void 0) {
    return;
  }
  const ignoreOffset = isPriceMarker(marker.position);
  const timeScale = chart.timeScale();
  const sizeMultiplier = isNumber(marker.size) ? Math.max(marker.size, 0) : 1;
  const shapeSize2 = calculateShapeHeight(timeScale.options().barSpacing) * sizeMultiplier;
  const halfSize = shapeSize2 / 2;
  rendererItem.size = shapeSize2;
  const position = marker.position;
  switch (position) {
    case "inBar":
    case "atPriceMiddle": {
      rendererItem.y = ensureNotNull(series.priceToCoordinate(price));
      if (rendererItem.text !== void 0) {
        rendererItem.text.y = rendererItem.y + halfSize + shapeMargin2 + textHeight * (0.5 + 0.1);
      }
      return;
    }
    case "aboveBar":
    case "atPriceTop": {
      const offset = ignoreOffset ? 0 : offsets.aboveBar;
      rendererItem.y = ensureNotNull(series.priceToCoordinate(price)) - halfSize - offset;
      if (rendererItem.text !== void 0) {
        rendererItem.text.y = rendererItem.y - halfSize - textHeight * (0.5 + 0.1);
        offsets.aboveBar += textHeight * (1 + 2 * 0.1);
      }
      if (!ignoreOffset) {
        offsets.aboveBar += shapeSize2 + shapeMargin2;
      }
      return;
    }
    case "belowBar":
    case "atPriceBottom": {
      const offset = ignoreOffset ? 0 : offsets.belowBar;
      rendererItem.y = ensureNotNull(series.priceToCoordinate(price)) + halfSize + offset;
      if (rendererItem.text !== void 0) {
        rendererItem.text.y = rendererItem.y + halfSize + shapeMargin2 + textHeight * (0.5 + 0.1);
        offsets.belowBar += textHeight * (1 + 2 * 0.1);
      }
      if (!ignoreOffset) {
        offsets.belowBar += shapeSize2 + shapeMargin2;
      }
      return;
    }
  }
  ensureNever(position);
}
function isValueData(data) {
  return "value" in data && typeof data.value === "number";
}
function isOhlcData(data) {
  return "open" in data && "high" in data && "low" in data && "close" in data;
}
var SeriesMarkersPaneView = class {
  constructor(series, chart, options) {
    this._markers = [];
    this._invalidated = true;
    this._dataInvalidated = true;
    this._renderer = new SeriesMarkersRenderer();
    this._series = series;
    this._chart = chart;
    this._data = {
      items: [],
      visibleRange: null
    };
    this._options = options;
  }
  renderer() {
    if (!this._series.options().visible) {
      return null;
    }
    if (this._invalidated) {
      this._makeValid();
    }
    const layout = this._chart.options()["layout"];
    this._renderer.setParams(layout.fontSize, layout.fontFamily, this._options.zOrder);
    this._renderer.setData(this._data);
    return this._renderer;
  }
  setMarkers(markers) {
    this._markers = markers;
    this.update("data");
  }
  update(updateType) {
    this._invalidated = true;
    if (updateType === "data") {
      this._dataInvalidated = true;
    }
  }
  updateOptions(options) {
    this._invalidated = true;
    this._options = options;
  }
  zOrder() {
    return this._options.zOrder === "aboveSeries" ? "top" : this._options.zOrder;
  }
  _makeValid() {
    const timeScale = this._chart.timeScale();
    const seriesMarkers = this._markers;
    if (this._dataInvalidated) {
      this._data.items = seriesMarkers.map((marker) => ({
        time: marker.time,
        x: 0,
        y: 0,
        size: 0,
        shape: marker.shape,
        color: marker.color,
        externalId: marker.id,
        internalId: marker.internalId,
        text: void 0
      }));
      this._dataInvalidated = false;
    }
    const layoutOptions = this._chart.options()["layout"];
    this._data.visibleRange = null;
    const visibleBars = timeScale.getVisibleLogicalRange();
    if (visibleBars === null) {
      return;
    }
    const visibleBarsRange = new RangeImpl(Math.floor(visibleBars.from), Math.ceil(visibleBars.to));
    const firstValue = this._series.data()[0];
    if (firstValue === null) {
      return;
    }
    if (this._data.items.length === 0) {
      return;
    }
    let prevTimeIndex = NaN;
    const shapeMargin2 = shapeMargin(timeScale.options().barSpacing);
    const offsets = {
      aboveBar: shapeMargin2,
      belowBar: shapeMargin2
    };
    this._data.visibleRange = visibleTimedValues(this._data.items, visibleBarsRange, true);
    for (let index = this._data.visibleRange.from; index < this._data.visibleRange.to; index++) {
      const marker = seriesMarkers[index];
      if (marker.time !== prevTimeIndex) {
        offsets.aboveBar = shapeMargin2;
        offsets.belowBar = shapeMargin2;
        prevTimeIndex = marker.time;
      }
      const rendererItem = this._data.items[index];
      rendererItem.x = ensureNotNull(timeScale.logicalToCoordinate(marker.time));
      if (marker.text !== void 0 && marker.text.length > 0) {
        rendererItem.text = {
          content: marker.text,
          x: 0,
          y: 0,
          width: 0,
          height: 0
        };
      }
      const dataAt = this._series.dataByIndex(
        marker.time,
        0
        /* MismatchDirection.None */
      );
      if (dataAt === null) {
        continue;
      }
      fillSizeAndY(rendererItem, marker, dataAt, offsets, layoutOptions.fontSize, shapeMargin2, this._series, this._chart);
    }
    this._invalidated = false;
  }
};

// ../lib/prod/src/plugins/series-markers/primitive.js
function mergeOptionsWithDefaults3(options) {
  return {
    ...seriesMarkerOptionsDefaults,
    ...options
  };
}
var SeriesMarkersPrimitive = class {
  constructor(options) {
    this._paneView = null;
    this._markers = [];
    this._indexedMarkers = [];
    this._dataChangedHandler = null;
    this._series = null;
    this._chart = null;
    this._autoScaleMarginsInvalidated = true;
    this._autoScaleMargins = null;
    this._markersPositions = null;
    this._cachedBarSpacing = null;
    this._recalculationRequired = true;
    this._options = mergeOptionsWithDefaults3(options);
  }
  attached(param) {
    this._recalculateMarkers();
    this._chart = param.chart;
    this._series = param.series;
    this._paneView = new SeriesMarkersPaneView(this._series, ensureNotNull(this._chart), this._options);
    this._requestUpdate = param.requestUpdate;
    this._series.subscribeDataChanged((scope) => this._onDataChanged(scope));
    this._recalculationRequired = true;
    this.requestUpdate();
  }
  requestUpdate() {
    if (this._requestUpdate) {
      this._requestUpdate();
    }
  }
  detached() {
    if (this._series && this._dataChangedHandler) {
      this._series.unsubscribeDataChanged(this._dataChangedHandler);
    }
    this._chart = null;
    this._series = null;
    this._paneView = null;
    this._dataChangedHandler = null;
  }
  setMarkers(markers) {
    this._recalculationRequired = true;
    this._markers = markers;
    this._recalculateMarkers();
    this._autoScaleMarginsInvalidated = true;
    this._markersPositions = null;
    this.requestUpdate();
  }
  markers() {
    return this._markers;
  }
  paneViews() {
    return this._paneView ? [this._paneView] : [];
  }
  updateAllViews() {
    this._updateAllViews();
  }
  hitTest(x, y) {
    if (this._paneView) {
      return this._paneView.renderer()?.hitTest(x, y) ?? null;
    }
    return null;
  }
  autoscaleInfo(startTimePoint, endTimePoint) {
    if (this._options.autoScale && this._paneView) {
      const margins = this._getAutoScaleMargins();
      if (margins) {
        return {
          priceRange: null,
          margins
        };
      }
    }
    return null;
  }
  applyOptions(options) {
    this._options = mergeOptionsWithDefaults3({ ...this._options, ...options });
    if (this.requestUpdate) {
      this.requestUpdate();
    }
  }
  _getAutoScaleMargins() {
    const chart = ensureNotNull(this._chart);
    const barSpacing = chart.timeScale().options().barSpacing;
    if (this._autoScaleMarginsInvalidated || barSpacing !== this._cachedBarSpacing) {
      this._cachedBarSpacing = barSpacing;
      if (this._markers.length > 0) {
        const shapeMargin2 = shapeMargin(barSpacing);
        const marginValue = calculateShapeHeight(barSpacing) * 1.5 + shapeMargin2 * 2;
        const positions = this._getMarkerPositions();
        this._autoScaleMargins = {
          above: calculateAdjustedMargin(marginValue, positions.aboveBar, positions.inBar),
          below: calculateAdjustedMargin(marginValue, positions.belowBar, positions.inBar)
        };
      } else {
        this._autoScaleMargins = null;
      }
      this._autoScaleMarginsInvalidated = false;
    }
    return this._autoScaleMargins;
  }
  _getMarkerPositions() {
    if (this._markersPositions === null) {
      this._markersPositions = this._markers.reduce((acc, marker) => {
        if (!acc[marker.position]) {
          acc[marker.position] = true;
        }
        return acc;
      }, {
        inBar: false,
        aboveBar: false,
        belowBar: false,
        atPriceTop: false,
        atPriceBottom: false,
        atPriceMiddle: false
      });
    }
    return this._markersPositions;
  }
  _recalculateMarkers() {
    if (!this._recalculationRequired || !this._chart || !this._series) {
      return;
    }
    const timeScale = this._chart.timeScale();
    const seriesData = this._series?.data();
    if (timeScale.getVisibleLogicalRange() == null || !this._series || seriesData.length === 0) {
      this._indexedMarkers = [];
      return;
    }
    const firstDataIndex = timeScale.timeToIndex(ensureNotNull(seriesData[0].time), true);
    this._indexedMarkers = this._markers.map((marker, index) => {
      const timePointIndex = timeScale.timeToIndex(marker.time, true);
      const searchMode = timePointIndex < firstDataIndex ? 1 : -1;
      const seriesDataByIndex = ensureNotNull(this._series).dataByIndex(timePointIndex, searchMode);
      const finalIndex = timeScale.timeToIndex(ensureNotNull(seriesDataByIndex).time, false);
      const baseMarker = {
        time: finalIndex,
        position: marker.position,
        shape: marker.shape,
        color: marker.color,
        id: marker.id,
        internalId: index,
        text: marker.text,
        size: marker.size,
        price: marker.price,
        originalTime: marker.time
      };
      if (marker.position === "atPriceTop" || marker.position === "atPriceBottom" || marker.position === "atPriceMiddle") {
        if (marker.price === void 0) {
          throw new Error(`Price is required for position ${marker.position}`);
        }
        return {
          ...baseMarker,
          position: marker.position,
          // TypeScript knows this is SeriesMarkerPricePosition
          price: marker.price
        };
      } else {
        return {
          ...baseMarker,
          position: marker.position,
          // TypeScript knows this is SeriesMarkerBarPosition
          price: marker.price
          // Optional for bar positions
        };
      }
    });
    this._recalculationRequired = false;
  }
  _updateAllViews(updateType) {
    if (this._paneView) {
      this._recalculateMarkers();
      this._paneView.setMarkers(this._indexedMarkers);
      this._paneView.updateOptions(this._options);
      this._paneView.update(updateType);
    }
  }
  _onDataChanged(scope) {
    this._recalculationRequired = true;
    this.requestUpdate();
  }
};

// ../lib/prod/src/plugins/series-markers/wrapper.js
var SeriesMarkersPrimitiveWrapper = class extends SeriesPrimitiveAdapter {
  constructor(series, primitive, markers) {
    super(series, primitive);
    if (markers) {
      this.setMarkers(markers);
    }
  }
  setMarkers(markers) {
    this._primitive.setMarkers(markers);
  }
  markers() {
    return this._primitive.markers();
  }
};
function createSeriesMarkers(series, markers, options) {
  const wrapper = new SeriesMarkersPrimitiveWrapper(series, new SeriesMarkersPrimitive(options ?? {}));
  if (markers) {
    wrapper.setMarkers(markers);
  }
  return wrapper;
}

// ../lib/prod/src/plugins/up-down-markers-plugin/expiring-markers-manager.js
var ExpiringMarkerManager = class {
  constructor(updateCallback) {
    this._markers = /* @__PURE__ */ new Map();
    this._updateCallback = updateCallback;
  }
  setMarker(marker, key, timeout) {
    this.clearMarker(key);
    if (timeout !== void 0) {
      const timeoutId = window.setTimeout(() => {
        this._markers.delete(key);
        this._triggerUpdate();
      }, timeout);
      const markerWithTimeout = {
        ...marker,
        timeoutId,
        expiresAt: Date.now() + timeout
      };
      this._markers.set(key, markerWithTimeout);
    } else {
      this._markers.set(key, {
        ...marker,
        timeoutId: void 0,
        expiresAt: void 0
      });
    }
    this._triggerUpdate();
  }
  clearMarker(key) {
    const marker = this._markers.get(key);
    if (marker && marker.timeoutId !== void 0) {
      window.clearTimeout(marker.timeoutId);
    }
    this._markers.delete(key);
    this._triggerUpdate();
  }
  clearAllMarkers() {
    for (const [point] of this._markers) {
      this.clearMarker(point);
    }
  }
  getMarkers() {
    const now = Date.now();
    const activeMarkers = [];
    for (const [time, marker] of this._markers) {
      if (!marker.expiresAt || marker.expiresAt > now) {
        activeMarkers.push({ time: marker.time, sign: marker.sign, value: marker.value });
      } else {
        this.clearMarker(time);
      }
    }
    return activeMarkers;
  }
  setUpdateCallback(callback) {
    this._updateCallback = callback;
  }
  _triggerUpdate() {
    if (this._updateCallback) {
      this._updateCallback();
    }
  }
};

// ../lib/prod/src/plugins/up-down-markers-plugin/options.js
var upDownMarkersPluginOptionDefaults = {
  positiveColor: "#22AB94",
  negativeColor: "#F7525F",
  updateVisibilityDuration: 5e3
};

// ../lib/prod/src/plugins/up-down-markers-plugin/renderer.js
var Constants13;
(function(Constants14) {
  Constants14[Constants14["Radius"] = 4] = "Radius";
  Constants14[Constants14["ArrowSize"] = 4.7] = "ArrowSize";
  Constants14[Constants14["ArrowOffset"] = 7] = "ArrowOffset";
  Constants14[Constants14["ArrowLineWidth"] = 2] = "ArrowLineWidth";
  Constants14[Constants14["VerticalScale"] = 0.5] = "VerticalScale";
})(Constants13 || (Constants13 = {}));
var MarkersPrimitiveRenderer = class {
  constructor(data, neutralColor, negativeColor, positiveColor) {
    this._data = data;
    this._neutralColor = neutralColor;
    this._negativeColor = negativeColor;
    this._positiveColor = positiveColor;
  }
  draw(target) {
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      const tickWidth = Math.max(1, Math.floor(scope.horizontalPixelRatio));
      const correction = tickWidth % 2 / 2;
      const rad = 4 * scope.verticalPixelRatio + correction;
      this._data.forEach((item) => {
        const centreX = Math.round(item.x * scope.horizontalPixelRatio) + correction;
        ctx.beginPath();
        const color = this._getColor(item.sign);
        ctx.fillStyle = color;
        ctx.arc(centreX, item.y * scope.verticalPixelRatio, rad, 0, 2 * Math.PI, false);
        ctx.fill();
        if (item.sign) {
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.floor(2 * scope.horizontalPixelRatio);
          ctx.beginPath();
          ctx.moveTo((item.x - 4.7) * scope.horizontalPixelRatio + correction, (item.y - 7 * item.sign) * scope.verticalPixelRatio);
          ctx.lineTo(item.x * scope.horizontalPixelRatio + correction, (item.y - 7 * item.sign - 7 * item.sign * 0.5) * scope.verticalPixelRatio);
          ctx.lineTo((item.x + 4.7) * scope.horizontalPixelRatio + correction, (item.y - 7 * item.sign) * scope.verticalPixelRatio);
          ctx.stroke();
        }
      });
    });
  }
  _getColor(sign) {
    if (sign === 0) {
      return this._neutralColor;
    }
    return sign > 0 ? this._positiveColor : this._negativeColor;
  }
};

// ../lib/prod/src/plugins/up-down-markers-plugin/view.js
function isAreaStyleOptions(opts, seriesType) {
  return seriesType === "Area";
}
function getNeutralColor(opts, seriesType) {
  if (isAreaStyleOptions(opts, seriesType)) {
    return opts.lineColor;
  }
  return opts.color;
}
var MarkersPrimitivePaneView = class {
  constructor(series, timeScale, options) {
    this._data = [];
    this._series = series;
    this._timeScale = timeScale;
    this._options = options;
  }
  update(markers) {
    this._data = markers.map((marker) => {
      const y = this._series.priceToCoordinate(marker.value);
      if (y === null) {
        return null;
      }
      const x = ensureNotNull(this._timeScale.timeToCoordinate(marker.time));
      return {
        x,
        y,
        sign: marker.sign
      };
    }).filter(notNull);
  }
  renderer() {
    const options = this._series.options();
    const seriesType = this._series.seriesType();
    const neutralColor = getNeutralColor(options, seriesType);
    return new MarkersPrimitiveRenderer(this._data, neutralColor, this._options.negativeColor, this._options.positiveColor);
  }
};

// ../lib/prod/src/plugins/up-down-markers-plugin/primitive.js
function isLineData(item, type) {
  return type === "Line" || type === "Area";
}
var UpDownMarkersPrimitive = class {
  constructor(options) {
    this._chart = void 0;
    this._series = void 0;
    this._paneViews = [];
    this._horzScaleBehavior = null;
    this._managedDataPoints = /* @__PURE__ */ new Map();
    this._markersManager = new ExpiringMarkerManager(() => this.requestUpdate());
    this._options = {
      ...upDownMarkersPluginOptionDefaults,
      ...options
    };
  }
  applyOptions(options) {
    this._options = {
      ...this._options,
      ...options
    };
    this.requestUpdate();
  }
  setMarkers(markers) {
    this._markersManager.clearAllMarkers();
    const horzBehaviour = this._horzScaleBehavior;
    if (!horzBehaviour) {
      return;
    }
    markers.forEach((marker) => {
      this._markersManager.setMarker(marker, horzBehaviour.key(marker.time));
    });
  }
  markers() {
    return this._markersManager.getMarkers();
  }
  requestUpdate() {
    this._requestUpdate?.();
  }
  attached(params) {
    const { chart, series, requestUpdate, horzScaleBehavior } = params;
    this._chart = chart;
    this._series = series;
    this._horzScaleBehavior = horzScaleBehavior;
    const seriesType = this._series.seriesType();
    if (seriesType !== "Area" && seriesType !== "Line") {
      throw new Error("UpDownMarkersPrimitive is only supported for Area and Line series types");
    }
    this._paneViews = [
      new MarkersPrimitivePaneView(this._series, this._chart.timeScale(), this._options)
    ];
    this._requestUpdate = requestUpdate;
    this.requestUpdate();
  }
  detached() {
    this._chart = void 0;
    this._series = void 0;
    this._requestUpdate = void 0;
  }
  chart() {
    return ensureDefined(this._chart);
  }
  series() {
    return ensureDefined(this._series);
  }
  updateAllViews() {
    this._paneViews.forEach((pw) => pw.update(this.markers()));
  }
  paneViews() {
    return this._paneViews;
  }
  setData(data) {
    if (!this._series) {
      throw new Error("Primitive not attached to series");
    }
    const seriesType = this._series.seriesType();
    this._managedDataPoints.clear();
    const horzBehaviour = this._horzScaleBehavior;
    if (horzBehaviour) {
      data.forEach((d) => {
        if (isFulfilledData(d) && isLineData(d, seriesType)) {
          this._managedDataPoints.set(horzBehaviour.key(d.time), d.value);
        }
      });
    }
    ensureDefined(this._series).setData(data);
  }
  update(data, historicalUpdate) {
    if (!this._series || !this._horzScaleBehavior) {
      throw new Error("Primitive not attached to series");
    }
    const seriesType = this._series.seriesType();
    const horzKey = this._horzScaleBehavior.key(data.time);
    if (isWhitespaceData(data)) {
      this._managedDataPoints.delete(horzKey);
    }
    if (isFulfilledData(data) && isLineData(data, seriesType)) {
      const existingPrice = this._managedDataPoints.get(horzKey);
      if (existingPrice) {
        this._markersManager.setMarker({
          time: data.time,
          value: data.value,
          sign: getSign(data.value, existingPrice)
        }, horzKey, this._options.updateVisibilityDuration);
      }
    }
    ensureDefined(this._series).update(data, historicalUpdate);
  }
  clearMarkers() {
    this._markersManager.clearAllMarkers();
  }
};
function getSign(newValue, oldValue) {
  if (newValue === oldValue) {
    return 0;
  }
  return newValue - oldValue > 0 ? 1 : -1;
}

// ../lib/prod/src/plugins/up-down-markers-plugin/wrapper.js
var SeriesUpDownMarkerPrimitiveWrapper = class extends SeriesPrimitiveAdapter {
  setData(data) {
    return this._primitive.setData(data);
  }
  update(data, historicalUpdate) {
    return this._primitive.update(data, historicalUpdate);
  }
  markers() {
    return this._primitive.markers();
  }
  setMarkers(markers) {
    return this._primitive.setMarkers(markers);
  }
  clearMarkers() {
    return this._primitive.clearMarkers();
  }
};
function createUpDownMarkers(series, options = {}) {
  const wrapper = new SeriesUpDownMarkerPrimitiveWrapper(series, new UpDownMarkersPrimitive(options));
  return wrapper;
}

// ../lib/prod/src/drawing/internal/TTLCache.js
var TTLCache = class {
  constructor(limit, ttlMs, nowProvider) {
    const l = Math.max(1, Math.floor(Number.isFinite(limit) ? limit : 1));
    this._limit = l;
    this._ttlMs = Math.max(0, Math.floor(Number.isFinite(ttlMs) ? ttlMs : 0));
    this._now = nowProvider ?? (() => Date.now());
    this._map = /* @__PURE__ */ new Map();
  }
  get(key) {
    const e = this._map.get(key);
    if (!e) {
      return void 0;
    }
    if (this._isFresh(e.stamp)) {
      return e.value;
    }
    return void 0;
  }
  set(key, value) {
    if (!this._map.has(key) && this._map.size >= this._limit) {
      this._evictOne();
    }
    this._map.set(key, { value, stamp: this._now() });
  }
  getOrCompute(key, compute) {
    const now = this._now();
    const e = this._map.get(key);
    if (e && this._isFresh(e.stamp, now)) {
      return e.value;
    }
    const value = compute();
    if (!this._map.has(key) && this._map.size >= this._limit) {
      this._evictOne();
    }
    this._map.set(key, { value, stamp: now });
    return value;
  }
  clear() {
    this._map.clear();
  }
  _evictOne() {
    const it = this._map.keys();
    const first = it.next();
    if (!first.done) {
      this._map.delete(first.value);
    }
  }
  _isFresh(stamp, now) {
    const n = now ?? this._now();
    return n - stamp <= this._ttlMs;
  }
};

// ../lib/prod/src/drawing/internal/PointerEventUtils.js
function pointerEventFromParams(params, type) {
  if (!params.point) {
    return null;
  }
  const source = params.sourceEvent;
  const pointX = params.point.x;
  const pointY = params.point.y;
  const price = params.hoveredSeries ? params.hoveredSeries.coordinateToPrice(pointY) : null;
  return {
    clientX: source?.clientX ?? pointX,
    clientY: source?.clientY ?? pointY,
    point: { x: pointX, y: pointY },
    rawEvent: createSyntheticMouseEvent(type, source),
    time: params.time,
    logical: params.logical,
    price: price ?? void 0,
    pointerType: "mouse",
    isPrimary: true,
    altKey: source?.altKey ?? false,
    ctrlKey: source?.ctrlKey ?? false,
    metaKey: source?.metaKey ?? false,
    shiftKey: source?.shiftKey ?? false
  };
}
function createSyntheticMouseEvent(type, data) {
  if (typeof globalThis.MouseEvent === "function") {
    return new MouseEvent(type, {
      clientX: data?.clientX,
      clientY: data?.clientY,
      screenX: data?.screenX,
      screenY: data?.screenY,
      ctrlKey: data?.ctrlKey ?? false,
      altKey: data?.altKey ?? false,
      shiftKey: data?.shiftKey ?? false,
      metaKey: data?.metaKey ?? false
    });
  }
  return { type };
}

// ../lib/prod/src/drawing/internal/ChartSubscriptions.js
function subscribeAll(chart, handlers) {
  chart.subscribeClick(handlers.click);
  chart.subscribeCrosshairMove(handlers.move);
  const chartWithDbl = chart;
  let dblClickSubscribed = false;
  if (handlers.dblClick && typeof chartWithDbl.subscribeDblClick === "function") {
    chartWithDbl.subscribeDblClick(handlers.dblClick);
    dblClickSubscribed = true;
  }
  return {
    dblClickSubscribed,
    unsubscribe: () => {
      chart.unsubscribeClick(handlers.click);
      chart.unsubscribeCrosshairMove(handlers.move);
      if (dblClickSubscribed && typeof chartWithDbl.unsubscribeDblClick === "function" && handlers.dblClick) {
        chartWithDbl.unsubscribeDblClick(handlers.dblClick);
      }
    }
  };
}

// ../lib/prod/src/drawing/handles/handle-controller.js
var HandleController = class {
  constructor() {
    this._handles = /* @__PURE__ */ new Map();
  }
  add(handle) {
    this._handles.set(handle.id(), handle);
  }
  upsert(handle) {
    this._handles.set(handle.id(), handle);
  }
  delete(id) {
    this._handles.delete(id);
  }
  clear() {
    this._handles.clear();
  }
  has(id) {
    return this._handles.has(id);
  }
  get(id) {
    return this._handles.get(id);
  }
  handles() {
    return this._handles.values();
  }
  setHovered(id) {
    for (const handle of this._handles.values()) {
      handle.setHovered(handle.id() === id);
    }
  }
  setActive(id) {
    for (const handle of this._handles.values()) {
      handle.setActive(handle.id() === id);
    }
  }
  hitTest(x, y) {
    for (const handle of Array.from(this._handles.values()).reverse()) {
      const descriptor = handle.descriptor();
      if (this._containsPoint(descriptor, x, y)) {
        return { handle, descriptor };
      }
    }
    return null;
  }
  _containsPoint(descriptor, x, y) {
    const size3 = descriptor.style.size ?? 8;
    const half = size3 / 2;
    const left = descriptor.position.x - half;
    const top = descriptor.position.y - half;
    const right = descriptor.position.x + half;
    const bottom = descriptor.position.y + half;
    return x >= left && x <= right && y >= top && y <= bottom;
  }
};

// ../lib/prod/src/drawing/state/state-machine.js
var DrawingStateMachine = class {
  constructor(initial) {
    this._states = /* @__PURE__ */ new Map();
    this._afterTransitionHook = null;
    this._initialState = initial;
    this._currentState = initial;
  }
  registerState(id, handlers) {
    this._states.set(id, handlers);
  }
  state() {
    return this._currentState;
  }
  setAfterTransitionHook(hook) {
    this._afterTransitionHook = hook;
  }
  transition(next, context) {
    if (this._currentState === next) {
      return;
    }
    this._states.get(this._currentState)?.onExit?.();
    const previous = this._currentState;
    this._currentState = next;
    this._states.get(this._currentState)?.onEnter?.(context);
    this._afterTransitionHook?.(previous, next, context);
  }
  pointerClick(context) {
    this._states.get(this._currentState)?.onPointerClick?.(context);
  }
  pointerMove(context) {
    this._states.get(this._currentState)?.onPointerMove?.(context);
  }
  pointerCancel() {
    this._states.get(this._currentState)?.onPointerCancel?.();
  }
  reset() {
    this._states.get(this._currentState)?.onReset?.();
    if (this._currentState !== this._initialState) {
      this._states.get(this._currentState)?.onExit?.();
      const previous = this._currentState;
      this._currentState = this._initialState;
      this._states.get(this._currentState)?.onEnter?.();
      this._afterTransitionHook?.(previous, this._currentState);
    }
  }
};

// ../lib/prod/src/drawing/drawing-primitive-base.js
var RAF_FALLBACK_TIMEOUT = 16;
var DEFAULT_CACHE_LIMIT = 256;
var DEFAULT_CACHE_TTL = 32;
var DrawingPrimitiveBase = class {
  constructor(initialState = "idle", cacheLimit = DEFAULT_CACHE_LIMIT, cacheTtl = DEFAULT_CACHE_TTL) {
    this._handleController = new HandleController();
    this._pendingFrame = null;
    this._pendingTimeout = null;
    this._handleChartClick = (params) => {
      if (!this._environment) {
        return;
      }
      const pointerEvent = pointerEventFromParams(params, "click");
      if (!pointerEvent) {
        return;
      }
      this._stateMachine.pointerClick(pointerEvent);
      this.handlePointerClick(pointerEvent);
    };
    this._handleCrosshairMove = (params) => {
      if (!this._environment) {
        return;
      }
      const pointerEvent = pointerEventFromParams(params, "mousemove");
      if (!pointerEvent) {
        this._stateMachine.pointerCancel();
        this.handlePointerCancel();
        return;
      }
      this._stateMachine.pointerMove(pointerEvent);
      this.handlePointerMove(pointerEvent);
    };
    this._handleChartDblClick = () => {
      if (this.handlePointerDblClick()) {
        return;
      }
      this._stateMachine.reset();
    };
    this._flushUpdate = () => {
      this._pendingFrame = null;
      this._pendingTimeout = null;
      this._clearCoordinateCaches();
      this._requestUpdateInternal?.();
    };
    this._stateMachine = new DrawingStateMachine(initialState);
    this._coordinateCacheLimit = cacheLimit;
    this._coordinateCacheTtl = cacheTtl;
    this._priceToCoordinateCache = new TTLCache(this._coordinateCacheLimit, this._coordinateCacheTtl);
    this._coordinateToPriceCache = new TTLCache(this._coordinateCacheLimit, this._coordinateCacheTtl);
    this._timeToCoordinateCache = new TTLCache(this._coordinateCacheLimit, this._coordinateCacheTtl);
    this._coordinateToTimeCache = new TTLCache(this._coordinateCacheLimit, this._coordinateCacheTtl);
    this._stateMachine.setAfterTransitionHook(this._afterTransitionHook.bind(this));
    this.configureStateMachine(this._stateMachine);
  }
  // ------------------------------------------------------------------------------------
  // ISeriesPrimitive implementation
  // ------------------------------------------------------------------------------------
  attached(param) {
    const { chart, series, requestUpdate } = param;
    this._clearCoordinateCaches();
    this._environment = {
      chart,
      series,
      requestUpdate: () => this.requestUpdate(),
      coordinateTransform: {
        priceToCoordinate: (price) => this._priceToCoordinateCache.getOrCompute(price, () => series.priceToCoordinate(price)),
        coordinateToPrice: (y) => this._coordinateToPriceCache.getOrCompute(y, () => series.coordinateToPrice(y)),
        timeToCoordinate: (time) => this._timeToCoordinateCache.getOrCompute(time, () => chart.timeScale().timeToCoordinate(time)),
        coordinateToTime: (x) => this._coordinateToTimeCache.getOrCompute(x, () => chart.timeScale().coordinateToTime(x))
      }
    };
    this._requestUpdateInternal = requestUpdate;
    this._subscriptions = subscribeAll(chart, {
      click: this._handleChartClick,
      move: this._handleCrosshairMove,
      dblClick: this._handleChartDblClick
    });
    this._stateMachine.reset();
    this.updateAllGeometry();
    this.requestUpdate();
  }
  detached() {
    if (!this._environment) {
      return;
    }
    this._subscriptions?.unsubscribe();
    this._cancelScheduledUpdate();
    this._clearCoordinateCaches();
    this._environment = void 0;
    this._requestUpdateInternal = void 0;
    this._subscriptions = void 0;
    this._stateMachine.reset();
  }
  // Backwards-compatible aliases (some external code/tests may use attach/detach)
  attach(param) {
    this.attached(param);
  }
  detach() {
    this.detached();
  }
  updateAllViews() {
    this._clearCoordinateCaches();
    this.updateAllGeometry();
    this.requestUpdate();
  }
  paneViews() {
    return this.collectViews().pane;
  }
  priceAxisViews() {
    return this.collectViews().priceAxis ?? [];
  }
  timeAxisViews() {
    return this.collectViews().timeAxis ?? [];
  }
  priceAxisPaneViews() {
    return this.collectViews().priceAxisPane ?? [];
  }
  timeAxisPaneViews() {
    return this.collectViews().timeAxisPane ?? [];
  }
  hitTest(x, y) {
    if (!this._environment) {
      return null;
    }
    const pointerEvent = {
      clientX: x,
      clientY: y,
      point: { x, y },
      rawEvent: createSyntheticMouseEvent("mousemove"),
      pointerType: "mouse",
      isPrimary: true,
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false
    };
    const hoverResult = this.performHitTest(pointerEvent);
    if (!hoverResult) {
      return null;
    }
    return {
      cursorStyle: hoverResult.cursor,
      externalId: hoverResult.externalId ?? "__drawing__",
      zOrder: this.zOrderToPane(hoverResult.zOrder),
      isBackground: hoverResult.isBackground ?? false
    };
  }
  // ------------------------------------------------------------------------------------
  // Protected helper API
  // ------------------------------------------------------------------------------------
  environment() {
    return ensureDefined(this._environment);
  }
  stateMachine() {
    return this._stateMachine;
  }
  requestUpdate() {
    const g = typeof globalThis !== "undefined" ? globalThis : void 0;
    const w = g?.window;
    const raf = g?.requestAnimationFrame ?? w?.requestAnimationFrame;
    if (this._pendingFrame !== null) {
      return;
    }
    if (this._pendingTimeout !== null) {
      if (typeof raf === "function") {
        clearTimeout(this._pendingTimeout);
        this._pendingTimeout = null;
        this._pendingFrame = raf(this._flushUpdate);
      }
      return;
    }
    if (typeof raf === "function") {
      this._pendingFrame = raf(this._flushUpdate);
    } else {
      this._pendingTimeout = setTimeout(this._flushUpdate, RAF_FALLBACK_TIMEOUT);
    }
  }
  renderScope(target) {
    return {
      target,
      horizontalPixelRatio: target.horizontalPixelRatio,
      verticalPixelRatio: target.verticalPixelRatio
    };
  }
  zOrderToPane(zOrder) {
    switch (zOrder) {
      case "bottom":
      case "normal":
      case "top":
        return zOrder;
      default:
        return "normal";
    }
  }
  handlesController() {
    return this._handleController;
  }
  setAfterTransitionHook(hook) {
    this._stateMachine.setAfterTransitionHook(hook);
  }
  // Optional extension point
  onAfterStateTransition(_from, _to, _context) {
  }
  // Optional dblclick hook; return true to consume and prevent default reset
  // Subclasses may override to implement dblclick semantics (e.g., enter editing).
  // No event is passed because dblclick coordinates aren't provided by ChartSubscriptions.
  // Tools should decide based on their current state/anchors.
  // Default: not handled (returns false).
  handlePointerDblClick() {
    return false;
  }
  _clearCoordinateCaches() {
    this._priceToCoordinateCache.clear();
    this._coordinateToPriceCache.clear();
    this._timeToCoordinateCache.clear();
    this._coordinateToTimeCache.clear();
  }
  _cancelScheduledUpdate() {
    const g = typeof globalThis !== "undefined" ? globalThis : void 0;
    const w = g?.window;
    const caf = g?.cancelAnimationFrame ?? w?.cancelAnimationFrame;
    if (this._pendingFrame !== null && typeof caf === "function") {
      caf(this._pendingFrame);
    }
    if (this._pendingTimeout !== null) {
      clearTimeout(this._pendingTimeout);
    }
    this._pendingFrame = null;
    this._pendingTimeout = null;
  }
  _afterTransitionHook(from, to, context) {
    this.onAfterStateTransition(from, to, context);
  }
};

// ../lib/prod/src/drawing/handles/base-handle.js
var BaseHandle = class {
  constructor(id, position, renderer, shape, style = {}, cursor, metadata) {
    this._renderer = renderer;
    this._descriptor = {
      id,
      position: { x: position.x, y: position.y },
      shape,
      style: { ...style },
      cursor,
      metadata: metadata ? { ...metadata } : void 0,
      halo: style.size,
      isHovered: false,
      isActive: false
    };
  }
  id() {
    return this._descriptor.id;
  }
  position() {
    return this._descriptor.position;
  }
  descriptor() {
    return this._descriptor;
  }
  renderer() {
    return this._renderer;
  }
  setPosition(position) {
    this._descriptor = {
      ...this._descriptor,
      position: { x: position.x, y: position.y }
    };
  }
  setHovered(hovered) {
    if (this._descriptor.isHovered === hovered) {
      return;
    }
    this._descriptor = {
      ...this._descriptor,
      isHovered: hovered
    };
  }
  setActive(active) {
    if (this._descriptor.isActive === active) {
      return;
    }
    this._descriptor = {
      ...this._descriptor,
      isActive: active
    };
  }
  updateStyle(style) {
    const nextStyle = {
      ...this._descriptor.style,
      ...style
    };
    this._descriptor = {
      ...this._descriptor,
      style: nextStyle,
      halo: style.size ?? this._descriptor.halo
    };
  }
  updateMetadata(metadata) {
    this._descriptor = {
      ...this._descriptor,
      metadata: {
        ...this._descriptor.metadata ?? {},
        ...metadata
      }
    };
  }
};

// ../lib/prod/src/drawing/handles/default-handle-style.js
var DEFAULT_HANDLE_STYLE = Object.freeze({
  // Visual size in CSS pixels (scaled by canvas pixel ratio in renderer)
  size: 8,
  // Base colors
  fill: "#ffffff",
  stroke: "#333333",
  lineWidth: 1,
  // Interaction variants
  hoverFill: "#ffeeaa",
  activeFill: "#ffcc66"
});

// ../lib/prod/src/drawing/controller/drawing-tool-controller.js
var DrawingToolControllerImpl = class {
  constructor() {
    this._installed = false;
    this._stack = [];
    this._onKeyDown = (ev) => {
      const last = this._stack[this._stack.length - 1];
      if (last && typeof last.onKeyDownFromController === "function") {
        try {
          last.onKeyDownFromController(ev);
        } catch (_err) {
          void _err;
        }
      }
    };
  }
  register(tool) {
    const i = this._stack.indexOf(tool);
    if (i >= 0) {
      this._stack.splice(i, 1);
    }
    this._stack.push(tool);
    this._ensureInstalled();
  }
  deregister(tool) {
    const i = this._stack.indexOf(tool);
    if (i >= 0) {
      this._stack.splice(i, 1);
    }
    this._teardownIfIdle();
  }
  _ensureInstalled() {
    if (this._installed) {
      return;
    }
    try {
      const g = typeof globalThis !== "undefined" ? globalThis : void 0;
      const w = g?.window ?? g;
      if (w && typeof w.addEventListener === "function") {
        w.addEventListener("keydown", this._onKeyDown, true);
        this._installed = true;
      }
    } catch {
    }
  }
  _teardownIfIdle() {
    if (this._stack.length > 0 || !this._installed) {
      return;
    }
    try {
      const g = typeof globalThis !== "undefined" ? globalThis : void 0;
      const w = g?.window ?? g;
      if (w && typeof w.removeEventListener === "function") {
        w.removeEventListener("keydown", this._onKeyDown, true);
        this._installed = false;
      }
    } catch {
    }
  }
};
var singleton = null;
function getDrawingToolController() {
  if (singleton == null) {
    singleton = new DrawingToolControllerImpl();
  }
  return singleton;
}

// ../lib/prod/src/drawing/tools/__generated__/rectangle.js
var rectangleSpec = {
  "toolId": "rectangle",
  "featureFlag": "drawingTools.rectangle",
  "description": "Price/time anchored rectangle drawing tool with four corner handles and axis labels.",
  "anchors": [
    {
      "id": "start",
      "type": "price-time",
      "description": "First corner anchor defined by price/time."
    },
    {
      "id": "end",
      "type": "price-time",
      "description": "Opposite corner anchor defined by price/time."
    }
  ],
  "states": [
    "idle",
    "anchoring",
    "preview",
    "editing",
    "completed"
  ],
  "handles": [
    {
      "id": "topLeft",
      "type": "corner",
      "cursor": "nwse-resize"
    },
    {
      "id": "topRight",
      "type": "corner",
      "cursor": "nesw-resize"
    },
    {
      "id": "bottomLeft",
      "type": "corner",
      "cursor": "nesw-resize"
    },
    {
      "id": "bottomRight",
      "type": "corner",
      "cursor": "nwse-resize"
    }
  ],
  "views": {
    "pane": {
      "renderer": "rectangle-fill",
      "zOrder": "normal",
      "supportsPreview": true
    },
    "handles": {
      "renderer": "square-handle",
      "zOrder": "top"
    },
    "timeAxis": {
      "labels": [
        {
          "anchor": "start"
        },
        {
          "anchor": "end"
        }
      ]
    },
    "priceAxis": {
      "labels": [
        {
          "anchor": "start"
        },
        {
          "anchor": "end"
        }
      ]
    }
  },
  "autoscale": {
    "mode": "vertical-bounds",
    "padding": 0
  },
  "serialization": {
    "version": 1,
    "snapshot": [
      "anchors.start",
      "anchors.end",
      "options"
    ]
  },
  "options": [
    {
      "name": "fillColor",
      "type": "color",
      "default": "rgba(200, 50, 100, 0.75)"
    },
    {
      "name": "previewFillColor",
      "type": "color",
      "default": "rgba(200, 50, 100, 0.25)"
    },
    {
      "name": "labelColor",
      "type": "color",
      "default": "rgba(200, 50, 100, 1)"
    },
    {
      "name": "labelTextColor",
      "type": "color",
      "default": "#ffffff"
    },
    {
      "name": "showLabels",
      "type": "boolean",
      "default": true
    }
  ],
  "testing": {
    "unit": [
      "geometry normalization",
      "state machine transitions",
      "handles movement",
      "autoscale info",
      "serialization round-trip"
    ],
    "e2e": [
      "add-preview-complete",
      "handle-drag-edit",
      "delete-undo-redo",
      "autoscale verification"
    ],
    "performance": {
      "maxInstances": 200,
      "targetFps": 60
    }
  }
};

// ../lib/prod/src/drawing/runtime/geometry.js
function rectBoundsPx(env, start, end) {
  if (!start || !end) {
    return null;
  }
  const x1 = env.coordinateTransform.timeToCoordinate(start.time);
  const x2 = env.coordinateTransform.timeToCoordinate(end.time);
  const y1 = env.coordinateTransform.priceToCoordinate(start.price);
  const y2 = env.coordinateTransform.priceToCoordinate(end.price);
  if (x1 == null || x2 == null || y1 == null || y2 == null) {
    return null;
  }
  const left = Math.min(x1, x2);
  const right = Math.max(x1, x2);
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);
  return { left, right, top, bottom };
}
function rectCornersPx(env, start, end) {
  const bounds = rectBoundsPx(env, start, end);
  if (!bounds) {
    return null;
  }
  return {
    topLeft: { x: bounds.left, y: bounds.top },
    topRight: { x: bounds.right, y: bounds.top },
    bottomLeft: { x: bounds.left, y: bounds.bottom },
    bottomRight: { x: bounds.right, y: bounds.bottom }
  };
}

// ../lib/prod/src/drawing/tools/rectangle.impl.js
var RectangleDrawingPrimitive = class _RectangleDrawingPrimitive extends DrawingPrimitiveBase {
  constructor() {
    super(rectangleSpec.states?.[0] ?? "idle");
    this._start = null;
    this._end = null;
    this._startPxCache = null;
    this._endPxCache = null;
    this._options = {
      fillColor: rectangleSpec.options.find((o) => o.name === "fillColor")?.default ?? "rgba(200, 50, 100, 0.75)",
      previewFillColor: rectangleSpec.options.find((o) => o.name === "previewFillColor")?.default ?? "rgba(200, 50, 100, 0.25)",
      labelColor: rectangleSpec.options.find((o) => o.name === "labelColor")?.default ?? "rgba(200, 50, 100, 1)",
      labelTextColor: rectangleSpec.options.find((o) => o.name === "labelTextColor")?.default ?? "#ffffff",
      showLabels: rectangleSpec.options.find((o) => o.name === "showLabels")?.default ?? true,
      priceLabelFormatter: (p) => String(p),
      timeLabelFormatter: (t) => String(t)
    };
    this._undoStack = [];
    this._redoStack = [];
    this._dragTarget = "none";
    this._activeHandleId = null;
    this._origStart = null;
    this._origEnd = null;
    this._dragStartPx = null;
    this._onKeyDown = (ev) => {
      const kobj = ev;
      const keyRaw = String(kobj?.key ?? kobj?.code ?? "");
      const key = keyRaw.toLowerCase();
      const state = this.stateMachine().state();
      if (key === "escape" || key === "esc") {
        if (state === "anchoring" || state === "preview") {
          this._pushUndo();
          this._start = null;
          this._end = null;
          this.handlesController().clear();
          this.stateMachine().transition("idle");
          this.requestUpdate();
          return;
        }
        if (state === "editing") {
          if (this._origStart && this._origEnd) {
            this._start = { price: this._origStart.price, time: this._origStart.time };
            this._end = { price: this._origEnd.price, time: this._origEnd.time };
            this.updateAllGeometry();
          }
          this._dragTarget = "none";
          this._activeHandleId = null;
          this._origStart = null;
          this._origEnd = null;
          this.stateMachine().transition("completed");
          this.requestUpdate();
          return;
        }
      }
      if (key === "delete" || key === "backspace") {
        if (this._start && this._end) {
          this.deleteSelf();
        }
      }
    };
    this._paneFillView = new RectanglePaneView(this);
    this._handlesView = new RectangleHandlesPaneView(this);
    this._priceAxisPaneView = new RectanglePriceAxisPaneView(this);
    this._timeAxisPaneView = new RectangleTimeAxisPaneView(this);
  }
  getStartAnchor() {
    return this._start;
  }
  getEndAnchor() {
    return this._end;
  }
  configureStateMachine(machine) {
    machine.registerState("idle", {});
    machine.registerState("anchoring", {});
    machine.registerState("preview", {});
    machine.registerState("editing", {});
    machine.registerState("completed", {});
  }
  /* eslint-disable-next-line complexity */
  handlePointerClick(event) {
    const state = this.stateMachine().state();
    if (this._start === null && event.price != null && event.time != null) {
      this._beginAnchoring(event);
      return;
    }
    if (this._start !== null && (state === "anchoring" || state === "preview")) {
      this._completeAnchoring(event);
      return;
    }
    if (this._start !== null && this._end !== null) {
      const hit = event.point && event.point.x != null && event.point.y != null ? this.handlesController().hitTest(event.point.x, event.point.y) : null;
      if (hit) {
        this._beginHandleEdit(hit.handle.id(), event);
        return;
      }
      const bounds = this._boundsPx();
      if (event.point && event.point.x != null && event.point.y != null) {
        let inside = false;
        if (bounds) {
          const { left, right, top, bottom } = bounds;
          inside = event.point.x >= left && event.point.x <= right && event.point.y >= top && event.point.y <= bottom;
        }
        if (!inside && this._startPxCache && this._endPxCache) {
          const l = Math.min(this._startPxCache.x, this._endPxCache.x);
          const r = Math.max(this._startPxCache.x, this._endPxCache.x);
          const t = Math.min(this._startPxCache.y, this._endPxCache.y);
          const b = Math.max(this._startPxCache.y, this._endPxCache.y);
          inside = event.point.x >= l && event.point.x <= r && event.point.y >= t && event.point.y <= b;
        }
        if (inside) {
          this._beginBodyDrag(event);
          return;
        }
      }
      if (state === "editing") {
        this._dragTarget = "none";
        this._activeHandleId = null;
        this._origStart = null;
        this._origEnd = null;
        this.stateMachine().transition("completed", event);
      }
      return;
    }
  }
  /* eslint-disable-next-line complexity */
  handlePointerMove(event) {
    const state = this.stateMachine().state();
    if (state === "anchoring" && this._start !== null && event.price != null && event.time != null) {
      this._end = { price: event.price, time: event.time };
      if (event.point && event.point.x != null && event.point.y != null) {
        this._endPxCache = { x: event.point.x, y: event.point.y };
      }
      this.stateMachine().transition("preview", event);
      this.updateAllGeometry();
      this.requestUpdate();
      return;
    }
    if (state === "editing" && this._start !== null && this._end !== null) {
      const handleId = this._dragTarget === "handle" ? this._activeHandleId : event.point && event.point.x != null && event.point.y != null ? this.handlesController().hitTest(event.point.x, event.point.y)?.handle.id() : void 0;
      if (handleId && event.price != null && event.time != null) {
        this._applyHandleDelta(handleId, event);
        return;
      }
      if (this._dragTarget === "body" && this._origStart && this._origEnd && this._dragStartPx && event.point && event.point.x != null && event.point.y != null) {
        this._applyBodyDelta(event);
      }
    }
  }
  handlePointerCancel() {
    this._pointerCancel();
  }
  // Interaction primitives (skeletons) to reduce complexity and enable reuse across tools
  // These helpers intentionally keep current behavior intact; wiring will be incremental.
  _pointerCancel() {
    const state = this.stateMachine().state();
    if (state === "anchoring" || state === "preview") {
      this._pushUndo();
      this._start = null;
      this._end = null;
      this.handlesController().clear();
      this.stateMachine().transition("idle");
      this.requestUpdate();
      return;
    }
    if (state === "editing") {
      if (this._origStart && this._origEnd) {
        this._start = { price: this._origStart.price, time: this._origStart.time };
        this._end = { price: this._origEnd.price, time: this._origEnd.time };
        this.updateAllGeometry();
      }
      this._dragTarget = "none";
      this._activeHandleId = null;
      this._origStart = null;
      this._origEnd = null;
      this.stateMachine().transition("completed");
      this.requestUpdate();
    }
  }
  // Start anchoring with first click (keeps original behavior)
  _beginAnchoring(event) {
    this._pushUndo();
    if (event.price != null && event.time != null) {
      this._start = { price: event.price, time: event.time };
    }
    if (event.point && event.point.x != null && event.point.y != null) {
      this._startPxCache = { x: event.point.x, y: event.point.y };
    }
    this.stateMachine().transition("anchoring", event);
    this.requestUpdate();
  }
  // Complete anchoring → completed
  _completeAnchoring(event) {
    if (event.price != null && event.time != null) {
      this._pushUndo();
      this._end = { price: event.price, time: event.time };
    }
    if (event.point && event.point.x != null && event.point.y != null) {
      this._endPxCache = { x: event.point.x, y: event.point.y };
    }
    this.stateMachine().transition("completed", event);
    this.updateAllGeometry();
    this.requestUpdate();
  }
  // Enter handle editing given a handle id
  _beginHandleEdit(handleId, event) {
    this._pushUndo();
    this._origStart = this._start ? { price: this._start.price, time: this._start.time } : null;
    this._origEnd = this._end ? { price: this._end.price, time: this._end.time } : null;
    this._dragTarget = "handle";
    this._activeHandleId = handleId;
    this.stateMachine().transition("editing", event);
  }
  // Apply handle delta on pointer move
  _applyHandleDelta(handleId, event) {
    if (event.price == null || event.time == null || this._start == null || this._end == null) {
      return;
    }
    switch (handleId) {
      case "topLeft":
        this._start = { price: event.price, time: event.time };
        break;
      case "bottomRight":
        this._end = { price: event.price, time: event.time };
        break;
      case "topRight":
        this._start = { price: event.price, time: this._start.time };
        this._end = { price: this._end.price, time: event.time };
        break;
      case "bottomLeft":
        this._start = { price: this._start.price, time: event.time };
        this._end = { price: event.price, time: this._end.time };
        break;
    }
    this.updateAllGeometry();
    this.requestUpdate();
  }
  // Enter body drag editing
  _beginBodyDrag(event) {
    this._pushUndo();
    this._dragTarget = "body";
    this._activeHandleId = null;
    this._origStart = this._start ? { price: this._start.price, time: this._start.time } : null;
    this._origEnd = this._end ? { price: this._end.price, time: this._end.time } : null;
    this._dragStartPx = event.point && event.point.x != null && event.point.y != null ? { x: event.point.x, y: event.point.y } : null;
    this.stateMachine().transition("editing", event);
  }
  // Apply body delta using pixel transform (reduced complexity via helpers)
  _applyBodyDelta(event) {
    if (!this._canApplyBodyDelta(event)) {
      return;
    }
    const env = this.environment();
    const dx = event.point.x - this._dragStartPx.x;
    const dy = event.point.y - this._dragStartPx.y;
    const coords = this._resolveAnchorCoordinates(this._origStart, this._origEnd, env);
    if (!coords) {
      return;
    }
    const next = this._computeNextAnchorsFromDelta(dx, dy, coords, env);
    if (!next) {
      return;
    }
    this._start = next.start;
    this._end = next.end;
    this.updateAllGeometry();
    this.requestUpdate();
  }
  // Narrow pointer event for body-drag applicability to reduce complexity inside _applyBodyDelta
  _canApplyBodyDelta(event) {
    if (this._origStart == null || this._origEnd == null) {
      return false;
    }
    if (this._dragStartPx == null) {
      return false;
    }
    const p = event.point;
    if (!p) {
      return false;
    }
    if (p.x == null || p.y == null) {
      return false;
    }
    return true;
  }
  // Resolve pixel coordinates of current anchors; returns null if any transform is unavailable
  _resolveAnchorCoordinates(start, end, env) {
    const sTimePx = env.coordinateTransform.timeToCoordinate(start.time);
    const eTimePx = env.coordinateTransform.timeToCoordinate(end.time);
    const sPricePx = env.coordinateTransform.priceToCoordinate(start.price);
    const ePricePx = env.coordinateTransform.priceToCoordinate(end.price);
    if (sTimePx == null || eTimePx == null || sPricePx == null || ePricePx == null) {
      return null;
    }
    return {
      sTimePx,
      eTimePx,
      sPricePx,
      ePricePx
    };
  }
  // Compute next anchors after applying dx/dy in pixel space and mapping back via environment transforms
  _computeNextAnchorsFromDelta(dx, dy, coords, env) {
    const nextStartTime = env.coordinateTransform.coordinateToTime(coords.sTimePx + dx);
    const nextEndTime = env.coordinateTransform.coordinateToTime(coords.eTimePx + dx);
    const nextStartPrice = env.coordinateTransform.coordinateToPrice(coords.sPricePx + dy);
    const nextEndPrice = env.coordinateTransform.coordinateToPrice(coords.ePricePx + dy);
    if (nextStartPrice == null || nextEndPrice == null || nextStartTime == null || nextEndTime == null) {
      return null;
    }
    return {
      start: { price: nextStartPrice, time: nextStartTime },
      end: { price: nextEndPrice, time: nextEndTime }
    };
  }
  collectViews() {
    const priceAxis = [];
    const timeAxis = [];
    if (this._options.showLabels) {
      if (this._start) {
        priceAxis.push(new RectAxisLabelViewPrice(this, "start"));
        timeAxis.push(new RectAxisLabelViewTime(this, "start"));
      }
      if (this._end) {
        priceAxis.push(new RectAxisLabelViewPrice(this, "end"));
        timeAxis.push(new RectAxisLabelViewTime(this, "end"));
      }
    }
    return {
      pane: [this._paneFillView, this._handlesView],
      priceAxis,
      timeAxis,
      priceAxisPane: [this._priceAxisPaneView],
      timeAxisPane: [this._timeAxisPaneView]
    };
  }
  performHitTest(event) {
    if (!event.point || event.point.x == null || event.point.y == null) {
      this.handlesController().setHovered(null);
      return null;
    }
    const hit = this.handlesController().hitTest(event.point.x, event.point.y);
    if (hit) {
      this.handlesController().setHovered(hit.handle.id());
      return {
        cursor: hit.descriptor.cursor ?? "default",
        externalId: `rectangle-handle-${hit.handle.id()}`,
        zOrder: "top"
      };
    }
    this.handlesController().setHovered(null);
    const bounds = this._boundsPx();
    if (!bounds) {
      return null;
    }
    const { left, right, top, bottom } = bounds;
    const inside = event.point.x >= left && event.point.x <= right && event.point.y >= top && event.point.y <= bottom;
    if (!inside) {
      return null;
    }
    return {
      cursor: "move",
      externalId: "rectangle-body",
      zOrder: "normal"
    };
  }
  updateAllGeometry() {
    const h = this.handlesController();
    const corners = this._cornerPositionsPx();
    if (!corners) {
      h.clear();
      return;
    }
    const style = DEFAULT_HANDLE_STYLE;
    const renderer = new SquareHandleRenderer();
    const upsert = (id, pos, cursor) => {
      const existing = h.get(id);
      if (existing) {
        existing.setPosition(pos);
        existing.updateStyle(style);
        existing.updateMetadata({ corner: id });
      } else {
        const handle = new BaseHandle(id, pos, renderer, "square", style, cursor, { corner: id });
        h.add(handle);
      }
    };
    upsert("topLeft", corners.topLeft, "nwse-resize");
    upsert("topRight", corners.topRight, "nesw-resize");
    upsert("bottomLeft", corners.bottomLeft, "nesw-resize");
    upsert("bottomRight", corners.bottomRight, "nwse-resize");
  }
  autoscaleInfo(startLogical, endLogical) {
    if (this._start === null || this._end === null) {
      return null;
    }
    const min2 = Math.min(this._start.price, this._end.price);
    const max = Math.max(this._start.price, this._end.price);
    return {
      priceRange: { minValue: min2, maxValue: max },
      margins: { above: 0, below: 0 }
    };
  }
  _boundsPx() {
    return rectBoundsPx(this.environment(), this._start, this._end);
  }
  _cornerPositionsPx() {
    return rectCornersPx(this.environment(), this._start, this._end);
  }
  // Public proxies for renderers
  getBoundsPxForView() {
    return this._boundsPx();
  }
  getOptions() {
    return this._options;
  }
  getState() {
    return this.stateMachine().state();
  }
  drawHandlesToTarget(target) {
    target.useBitmapCoordinateSpace((scope) => {
      for (const handle of this.handlesController().handles()) {
        handle.renderer().draw(handle.descriptor(), scope.context, {
          pixelRatio: { horizontal: scope.horizontalPixelRatio, vertical: scope.verticalPixelRatio }
        });
      }
    });
  }
  _snapshot() {
    return {
      version: 1,
      anchors: { start: this._start, end: this._end },
      options: {
        fillColor: this._options.fillColor,
        previewFillColor: this._options.previewFillColor,
        labelColor: this._options.labelColor,
        labelTextColor: this._options.labelTextColor,
        showLabels: this._options.showLabels
      }
    };
  }
  _applySnapshot(s) {
    this._start = s.anchors.start;
    this._end = s.anchors.end;
    this._options = { ...this._options, ...s.options };
    if (this._start && this._end) {
      this.stateMachine().transition("completed");
    } else {
      this.stateMachine().transition("idle");
    }
    this.updateAllGeometry();
    this.requestUpdate();
  }
  _pushUndo() {
    this._undoStack.push(this._snapshot());
    this._redoStack.length = 0;
    if (this._undoStack.length > 64) {
      this._undoStack.shift();
    }
  }
  toJSON() {
    return this._snapshot();
  }
  static fromJSON(snapshot) {
    const inst = new _RectangleDrawingPrimitive();
    if (snapshot && snapshot.version === 1) {
      inst._start = snapshot.anchors.start;
      inst._end = snapshot.anchors.end;
      inst._options = { ...inst._options, ...snapshot.options };
      if (snapshot.anchors.start && snapshot.anchors.end) {
        inst.stateMachine().transition("completed");
      }
    }
    return inst;
  }
  undo() {
    if (this._undoStack.length === 0) {
      return false;
    }
    const prev = this._undoStack.pop();
    const current = this._snapshot();
    this._redoStack.push(current);
    this._applySnapshot(prev);
    return true;
  }
  redo() {
    if (this._redoStack.length === 0) {
      return false;
    }
    const next = this._redoStack.pop();
    const current = this._snapshot();
    this._undoStack.push(current);
    this._applySnapshot(next);
    return true;
  }
  deleteSelf() {
    this._pushUndo();
    this._start = null;
    this._end = null;
    this._dragTarget = "none";
    this._activeHandleId = null;
    this._origStart = null;
    this._origEnd = null;
    this.handlesController().clear();
    this.stateMachine().transition("idle");
    this.requestUpdate();
  }
  // Ensure state restoration after attach (e.g., fromJSON or undo/redo) when anchors exist.
  attached(param) {
    super.attached(param);
    this._dragTarget = "none";
    this._activeHandleId = null;
    this._origStart = null;
    this._origEnd = null;
    getDrawingToolController().register(this);
    this._dragStartPx = null;
    if (this._start && this._end) {
      this.stateMachine().transition("completed");
      this.updateAllGeometry();
      this.requestUpdate();
    }
  }
  // Enter editing mode on double-click when anchors exist (consumes dblclick)
  handlePointerDblClick() {
    if (this._start && this._end) {
      this._dragTarget = "none";
      this._activeHandleId = null;
      this._origStart = null;
      this._origEnd = null;
      this.stateMachine().transition("editing");
      this.requestUpdate();
      return true;
    }
    return false;
  }
  detached() {
    getDrawingToolController().deregister(this);
    this._dragTarget = "none";
    this._activeHandleId = null;
    this._dragStartPx = null;
    this._origStart = null;
    this._origEnd = null;
    super.detached();
  }
  // Controller entrypoint: forward centralized key events to internal handler
  onKeyDownFromController(ev) {
    this._onKeyDown(ev);
  }
};
var RectanglePaneRenderer = class {
  constructor(p) {
    this._primitive = p;
  }
  draw(target, _utils) {
    const bounds = this._primitive.getBoundsPxForView();
    if (!bounds) {
      return;
    }
    const state = this._primitive.getState();
    const fill = state === "preview" ? this._primitive.getOptions().previewFillColor : this._primitive.getOptions().fillColor;
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      ctx.save();
      ctx.fillStyle = fill;
      const w = Math.max(0, bounds.right - bounds.left);
      const h = Math.max(0, bounds.bottom - bounds.top);
      ctx.fillRect(bounds.left, bounds.top, w, h);
      ctx.restore();
    });
  }
};
var SquareHandleRenderer = class {
  draw(descriptor, ctx, _context) {
    const size3 = descriptor.style.size ?? 8;
    const half = size3 / 2;
    const x = descriptor.position.x - half;
    const y = descriptor.position.y - half;
    const fill = descriptor.isActive ? descriptor.style.activeFill ?? descriptor.style.fill ?? "#fff" : descriptor.isHovered ? descriptor.style.hoverFill ?? descriptor.style.fill ?? "#fff" : descriptor.style.fill ?? "#fff";
    const stroke = descriptor.style.stroke ?? "#333";
    const lw = descriptor.style.lineWidth ?? 1;
    ctx.save();
    ctx.lineWidth = lw;
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    if (descriptor.style.shadowBlur && descriptor.style.shadowColor) {
      ctx.shadowBlur = descriptor.style.shadowBlur;
      ctx.shadowColor = descriptor.style.shadowColor;
    }
    ctx.beginPath();
    ctx.rect(x, y, size3, size3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
};
var RectangleHandlesRenderer = class {
  constructor(p) {
    this._primitive = p;
  }
  draw(target) {
    this._primitive.drawHandlesToTarget(target);
  }
};
var RectanglePaneView = class {
  constructor(p) {
    this._renderer = new RectanglePaneRenderer(p);
  }
  renderer() {
    return this._renderer;
  }
  zOrder() {
    return "normal";
  }
};
var RectangleHandlesPaneView = class {
  constructor(p) {
    this._renderer = new RectangleHandlesRenderer(p);
  }
  renderer() {
    return this._renderer;
  }
  zOrder() {
    return "top";
  }
};
var RectAxisLabelViewPrice = class {
  constructor(p, anchor) {
    this._primitive = p;
    this._anchor = anchor;
  }
  coordinate() {
    if (!this._primitive.getOptions().showLabels) {
      return -1;
    }
    const env = this._primitive.environment();
    const a = this._anchor === "start" ? this._primitive.getStartAnchor() : this._primitive.getEndAnchor();
    if (!a) {
      return -1;
    }
    const y = env.coordinateTransform.priceToCoordinate(a.price);
    return y ?? -1;
  }
  fixedCoordinate() {
    return void 0;
  }
  text() {
    const a = this._anchor === "start" ? this._primitive.getStartAnchor() : this._primitive.getEndAnchor();
    const fmt = this._primitive.getOptions().priceLabelFormatter;
    return a ? fmt ? fmt(a.price) : String(a.price) : "";
  }
  textColor() {
    return this._primitive.getOptions().labelTextColor;
  }
  backColor() {
    return this._primitive.getOptions().labelColor;
  }
  visible() {
    const a = this._anchor === "start" ? this._primitive.getStartAnchor() : this._primitive.getEndAnchor();
    return this._primitive.getOptions().showLabels && !!a;
  }
  tickVisible() {
    return true;
  }
};
var RectAxisLabelViewTime = class {
  constructor(p, anchor) {
    this._primitive = p;
    this._anchor = anchor;
  }
  coordinate() {
    if (!this._primitive.getOptions().showLabels) {
      return -1;
    }
    const env = this._primitive.environment();
    const a = this._anchor === "start" ? this._primitive.getStartAnchor() : this._primitive.getEndAnchor();
    if (!a) {
      return -1;
    }
    const x = env.coordinateTransform.timeToCoordinate(a.time);
    return x ?? -1;
  }
  fixedCoordinate() {
    return void 0;
  }
  text() {
    const a = this._anchor === "start" ? this._primitive.getStartAnchor() : this._primitive.getEndAnchor();
    const fmt = this._primitive.getOptions().timeLabelFormatter;
    return a ? fmt ? fmt(a.time) : String(a.time) : "";
  }
  textColor() {
    return this._primitive.getOptions().labelTextColor;
  }
  backColor() {
    return this._primitive.getOptions().labelColor;
  }
  visible() {
    const a = this._anchor === "start" ? this._primitive.getStartAnchor() : this._primitive.getEndAnchor();
    return this._primitive.getOptions().showLabels && !!a;
  }
  tickVisible() {
    return true;
  }
};
var RectangleAxisPaneRenderer = class {
  constructor(p, vertical) {
    this._primitive = p;
    this._vertical = vertical;
  }
  draw(target) {
    const start = this._primitive.getStartAnchor();
    const end = this._primitive.getEndAnchor();
    if (!start || !end) {
      return;
    }
    const env = this._primitive.environment();
    const c1 = this._vertical ? env.coordinateTransform.priceToCoordinate(start.price) : env.coordinateTransform.timeToCoordinate(start.time);
    const c2 = this._vertical ? env.coordinateTransform.priceToCoordinate(end.price) : env.coordinateTransform.timeToCoordinate(end.time);
    if (c1 == null || c2 == null) {
      return;
    }
    const a = Math.min(c1, c2);
    const b = Math.max(c1, c2);
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = this._primitive.getOptions().labelColor;
      if (this._vertical) {
        const h = Math.max(0, b - a);
        const w = Math.max(2, 12 * scope.horizontalPixelRatio);
        ctx.fillRect(0, a, w, h);
      } else {
        const w = Math.max(0, b - a);
        const h = Math.max(2, 12 * scope.verticalPixelRatio);
        ctx.fillRect(a, 0, w, h);
      }
      ctx.restore();
    });
  }
};
var RectanglePriceAxisPaneView = class {
  constructor(p) {
    this._renderer = new RectangleAxisPaneRenderer(p, true);
  }
  renderer() {
    return this._renderer;
  }
  zOrder() {
    return "bottom";
  }
};
var RectangleTimeAxisPaneView = class {
  constructor(p) {
    this._renderer = new RectangleAxisPaneRenderer(p, false);
  }
  renderer() {
    return this._renderer;
  }
  zOrder() {
    return "bottom";
  }
};
var RectangleDrawingTool = class {
  constructor() {
    this.spec = rectangleSpec;
  }
};

// ../lib/prod/src/index.js
var customSeriesDefaultOptions = {
  ...seriesOptionsDefaults,
  ...customStyleDefaults
};
function version() {
  return "wave0-demo";
}
export {
  areaSeries as AreaSeries,
  barSeries as BarSeries,
  baselineSeries as BaselineSeries,
  candlestickSeries as CandlestickSeries,
  ColorType,
  CrosshairMode,
  histogramSeries as HistogramSeries,
  LastPriceAnimationMode,
  lineSeries as LineSeries,
  LineStyle,
  LineType,
  MismatchDirection,
  PriceLineSource,
  PriceScaleMode,
  RectangleDrawingPrimitive,
  RectangleDrawingTool,
  TickMarkType,
  TrackingModeExitMode,
  createChart,
  createChartEx,
  createImageWatermark,
  createOptionsChart,
  createSeriesMarkers,
  createTextWatermark,
  createUpDownMarkers,
  createYieldCurveChart,
  customSeriesDefaultOptions,
  defaultHorzScaleBehavior,
  isBusinessDay,
  isUTCTimestamp,
  rectangleSpec,
  version
};
//# sourceMappingURL=lwc.esm.js.map
