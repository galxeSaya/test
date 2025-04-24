import React, {
  useMemo,
  useState,
  useCallback,
  WheelEvent,
  useRef,
  useEffect,
} from "react";
import { scaleLinear, scaleTime } from "@visx/scale";
import { AxisRight, AxisBottom } from "@visx/axis";
import { GridRows, GridColumns } from "@visx/grid";
import { Group } from "@visx/group";
import { localPoint } from "@visx/event";
import { TooltipWithBounds, defaultStyles } from "@visx/tooltip";
import { CandleStickPoint, CandleStickNewsPoint } from "../types/candlestick";
import { Bar, Line } from "@visx/shape"; // 添加Line导入
import PriceTip from "./PriceTip";
import TopTool from "./TopTool";
import clsx from "clsx";

// 默认显示的数据点数量
const DEFAULT_VISIBLE_ITEMS = 50;
// 缩放系数
const ZOOM_FACTOR = 0.1;
// 最小可见数据点数量
const MIN_VISIBLE_ITEMS = 5;

export const INCREASE_COLOR = "#4caf50"; // 绿色
export const DECREASE_COLOR = "#ff5722"; // 红色
export const DEFAULT_COLOR = "#383838"; // 灰色

// 添加一个禁用文本选择的CSS类样式
const noSelectStyle = {
  userSelect: "none",
  WebkitUserSelect: "none",
  MozUserSelect: "none",
  msUserSelect: "none",
};

interface VisxCandleStickChartProps {
  width: number;
  height: number;
  data: CandleStickPoint[];
  newsPoints: CandleStickNewsPoint[];
  margin?: { top: number; right: number; bottom: number; left: number };
}

// Tooltip 样式
const tooltipStyles = {
  ...defaultStyles,
  background: "white",
  border: "1px solid #ddd",
  borderRadius: "4px",
  padding: "12px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  fontSize: "14px",
  lineHeight: "1.5",
};

export type TTooltipData = {
  candlePoint?: CandleStickPoint;
  newsPoint?: CandleStickNewsPoint;
  x: number;
  y: number;
  isHoveringNewsPoint: boolean;
};

const VisxCandleStickChartV2: React.FC<VisxCandleStickChartProps> = ({
  width,
  height,
  data,
  newsPoints,
  margin = { top: 10, right: 60, bottom: 50, left: 10 },
}) => {
  const [tooltipData, setTooltipData] = useState<TTooltipData>();
  const [chartHeight, setChartHeight] = useState(height);
  const [isMini, setIsMini] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  // 添加tooltip定时器引用
  const tooltipTimerRef = useRef<number | null>(null);
  const isInNewsTip = useRef<boolean | null>(null);

  // 添加拖动相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartRange, setDragStartRange] = useState({
    startIndex: 0,
    endIndex: 0,
  });

  // 数据范围状态 - 初始化为显示末尾的50个数据点
  const [visibleRange, setVisibleRange] = useState({
    startIndex: Math.max(0, data.length - DEFAULT_VISIBLE_ITEMS),
    endIndex: data.length - 1,
  });

  // 计算图表区域尺寸
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  // 过滤数据，只显示可见范围内的数据
  const visibleData = useMemo(() => {
    return data.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [data, visibleRange.startIndex, visibleRange.endIndex]);

  // 过滤对应的新闻点
  const visibleNewsPoints = useMemo(() => {
    if (!visibleData.length) return [];

    const startDate = visibleData[0].date.getTime();
    const endDate = visibleData[visibleData.length - 1].date.getTime();

    return newsPoints.filter(newsPoint => {
      const newsTime = newsPoint.date.getTime();
      return newsTime >= startDate && newsTime <= endDate;
    });
  }, [visibleData, newsPoints]);

  // 数据访问器
  const getDate = (d: CandleStickPoint) => d.date;
  const getOpen = (d: CandleStickPoint) => d.open;
  const getClose = (d: CandleStickPoint) => d.close;
  const getHigh = (d: CandleStickPoint) => d.high;
  const getLow = (d: CandleStickPoint) => d.low;
  const getVolume = (d: CandleStickPoint) => d.volume;

  // 创建比例尺 - 使用visibleData而不是全部数据
  const xScale = useMemo(() => {
    if (!visibleData.length)
      return scaleTime({
        domain: [new Date(), new Date()],
        range: [0, innerWidth],
      });

    // 计算时间范围
    const minDate = Math.min(...visibleData.map(d => +getDate(d)));
    const maxDate = Math.max(...visibleData.map(d => +getDate(d)));

    // 添加左右两侧的间隙，确保最边缘的蜡烛完全显示
    const timeRange = maxDate - minDate;
    const padding = timeRange / (visibleData.length * 2); // 半个蜡烛的时间宽度

    return scaleTime({
      domain: [new Date(minDate - padding), new Date(maxDate + padding)],
      range: [0, innerWidth],
    });
  }, [visibleData, innerWidth]);

  const yScale = useMemo(() => {
    if (!visibleData.length)
      return scaleLinear({ domain: [0, 100], range: [innerHeight, 0] });

    return scaleLinear({
      domain: [
        Math.min(...visibleData.map(d => getLow(d))) * 0.99,
        Math.max(...visibleData.map(d => getHigh(d))) * 1.01,
      ],
      range: [innerHeight, 0],
      nice: true,
    });
  }, [visibleData, innerHeight]);

  // 成交量的Y轴比例尺 - 只使用图表底部约20%的区域显示成交量
  const volumeYScale = useMemo(() => {
    if (!visibleData.length)
      return scaleLinear({
        domain: [0, 100],
        range: [innerHeight, innerHeight * 0.8],
      });

    return scaleLinear({
      domain: [0, Math.max(...visibleData.map(d => getVolume(d))) * 1.1],
      range: [innerHeight, innerHeight * 0.8], // 只用底部20%的空间
      nice: true,
    });
  }, [visibleData, innerHeight]);

  // 计算蜡烛宽度
  const xBandwidth = innerWidth / (visibleData.length || 1);
  const candleWidth = Math.max(xBandwidth * 0.6, 1);

  // 根据图表宽度自适应计算X轴时间标签
  const customTickValues = useMemo(() => {
    if (!visibleData.length) return [];

    // 估计每个标签需要的最小宽度（像素）
    const minWidthPerLabel = 80;

    // 计算可以容纳的标签数量
    const maxLabels = Math.floor(innerWidth / minWidthPerLabel);

    // 计算每隔多少个点显示一个标签
    const interval = Math.max(1, Math.ceil(visibleData.length / maxLabels));

    // 生成标签值数组
    return visibleData
      .filter((_, i) => i % interval === 0)
      .map(d => getDate(d));
  }, [visibleData, innerWidth]);

  // 查找数据点对应的新闻点
  const getNewsPointForDate = (
    date: Date
  ): CandleStickNewsPoint | undefined => {
    return visibleNewsPoints.find(
      newsPoint => newsPoint.date.getTime() === date.getTime()
    );
  };

  // 添加状态跟踪鼠标位置
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(
    null
  );

  // 添加开始拖动事件处理
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      // 只响应左键点击
      if (event.button !== 0) return;

      const { x } = localPoint(event) || { x: 0 };
      setIsDragging(true);
      setDragStartX(x);
      setDragStartRange({ ...visibleRange });

      // 改变鼠标样式和禁用文本选择
      if (svgRef.current) {
        svgRef.current.style.cursor = "grabbing";

        // 在拖动开始时禁用文档上的文本选择
        document.body.style.userSelect = "none";
      }

      // 防止事件冒泡和默认行为
      event.preventDefault();
      event.stopPropagation();
    },
    [visibleRange]
  );

  // 拖动中的处理
  const handleDragMove = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      if (!isDragging) return;

      const { x } = localPoint(event) || { x: 0 };
      const deltaX = x - dragStartX;

      // 计算移动的数据点数量
      const visibleCount =
        dragStartRange.endIndex - dragStartRange.startIndex + 1;
      const pointsPerPixel = visibleCount / innerWidth;
      const pointsToMove = Math.round(deltaX * pointsPerPixel);

      if (pointsToMove === 0) return;

      // 向右拖动 (deltaX > 0) 应该显示更早的数据 (减小索引)
      // 向左拖动 (deltaX < 0) 应该显示更晚的数据 (增加索引)
      let newStartIndex = dragStartRange.startIndex - pointsToMove;
      let newEndIndex = dragStartRange.endIndex - pointsToMove;

      // 边界检查
      if (newStartIndex < 0) {
        newStartIndex = 0;
        newEndIndex = newStartIndex + visibleCount - 1;
      }

      if (newEndIndex >= data.length) {
        newEndIndex = data.length - 1;
        newStartIndex = Math.max(0, newEndIndex - visibleCount + 1);
      }

      setVisibleRange({
        startIndex: newStartIndex,
        endIndex: newEndIndex,
      });
    },
    [isDragging, dragStartX, dragStartRange, innerWidth, data.length]
  );

  // 结束拖动
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (svgRef.current) {
      svgRef.current.style.cursor = "default";

      // 恢复文本选择
      document.body.style.userSelect = "";
    }
  }, []);

  // 鼠标离开SVG时的处理
  const handleMouseLeave = useCallback(() => {
    setCrosshair(null);
    if (!tooltipTimerRef.current && !isInNewsTip.current) {
      setTooltipData(undefined);
    }

    if (isDragging) {
      setIsDragging(false);
      if (svgRef.current) {
        svgRef.current.style.cursor = "default";

        // 恢复文本选择
        document.body.style.userSelect = "";
      }
    }
  }, [isDragging, tooltipData]);

  const handleNewsPointMouseLeave = useCallback(() => {
    setCrosshair(null);

    // 不立即清除tooltipData，设置延迟
    if (tooltipData?.isHoveringNewsPoint && tooltipData.newsPoint) {
      // 如果当前显示了新闻弹窗，设置延迟隐藏
      if (tooltipTimerRef.current) {
        window.clearTimeout(tooltipTimerRef.current);
      }

      tooltipTimerRef.current = window.setTimeout(() => {
        setTooltipData(undefined);
        tooltipTimerRef.current = null;
      }, 300); // 300ms的延迟，可以根据需要调整
    } else {
      setTooltipData(undefined);
    }

    if (isDragging) {
      setIsDragging(false);
      if (svgRef.current) {
        svgRef.current.style.cursor = "default";

        // 恢复文本选择
        document.body.style.userSelect = "";
      }
    }
  }, [isDragging, tooltipData]);

  // 清除组件卸载时的计时器
  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current !== null) {
        window.clearTimeout(tooltipTimerRef.current);
      }
    };
  }, []);

  // 处理鼠标移入弹窗
  const handleTooltipMouseEnter = () => {
    isInNewsTip.current = true;
    // 鼠标移入弹窗，清除隐藏计时器
    if (tooltipTimerRef.current !== null) {
      window.clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }
  };

  // 处理鼠标移出弹窗
  const handleTooltipMouseLeave = () => {
    // 鼠标移出弹窗，立即隐藏
    setTooltipData(undefined);
    isInNewsTip.current = false;
  };

  // 将wheel事件处理函数修改为不调用preventDefault
  const handleWheel = useCallback(
    (event: WheelEvent<SVGSVGElement>) => {
      // 确定缩放方向：向下滚动(正deltaY)=缩小，向上滚动(负deltaY)=放大
      const isZoomIn = event.deltaY < 0;

      // 获取鼠标在图表上的位置
      const { x } = localPoint(event) || { x: 0 };
      const xPos = (x - margin.left) / innerWidth; // 归一化位置 (0-1)

      // 计算当前可见数据点数量
      const visibleCount = visibleRange.endIndex - visibleRange.startIndex + 1;

      // 计算新的可见数据点数量
      let newVisibleCount = isZoomIn
        ? Math.max(
            MIN_VISIBLE_ITEMS,
            Math.floor(visibleCount * (1 - ZOOM_FACTOR))
          )
        : Math.min(data.length, Math.ceil(visibleCount * (1 + ZOOM_FACTOR)));

      // 确保在数据范围内
      newVisibleCount = Math.min(newVisibleCount, data.length);

      // 计算新的startIndex和endIndex，保持鼠标位置尽量固定
      const centerIndex =
        visibleRange.startIndex + Math.floor(xPos * visibleCount);
      let newStartIndex = Math.floor(centerIndex - xPos * newVisibleCount);
      let newEndIndex = newStartIndex + newVisibleCount - 1;

      // 边界检查
      if (newStartIndex < 0) {
        newStartIndex = 0;
        newEndIndex = Math.min(data.length - 1, newVisibleCount - 1);
      }

      if (newEndIndex >= data.length) {
        newEndIndex = data.length - 1;
        newStartIndex = Math.max(0, newEndIndex - newVisibleCount + 1);
      }

      setVisibleRange({
        startIndex: newStartIndex,
        endIndex: newEndIndex,
      });
    },
    [data.length, innerWidth, margin.left, visibleRange]
  );

  // 使用 useEffect 添加非被动的 wheel 事件监听器
  useEffect(() => {
    const svgElement = svgRef.current;

    if (!svgElement) return;

    const wheelHandler = (e: WheelEvent | Event) => {
      e.preventDefault();

      // 在这里我们不需要重复处理逻辑，只需阻止默认行为
      // 实际的缩放逻辑仍由 onWheel={handleWheel} 处理
    };

    // 添加非被动事件监听器
    svgElement.addEventListener("wheel", wheelHandler, { passive: false });

    // 清理函数
    return () => {
      svgElement.removeEventListener("wheel", wheelHandler);
    };
  }, []);

  // 处理鼠标移动事件
  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    // 如果正在拖动，则调用拖动处理函数
    if (isDragging) {
      handleDragMove(event);
      return;
    }

    if (tooltipTimerRef.current || isInNewsTip.current) return;
    const { x, y } = localPoint(event) || { x: 0, y: 0 };

    // 超出图表区域时不处理
    if (
      x < margin.left ||
      x > width - margin.right ||
      y < margin.top ||
      y > height - margin.bottom
    ) {
      setCrosshair(null);
      return;
    }

    // 更新十字线位置
    setCrosshair({ x, y });

    // 计算最近的数据点
    const x0 = xScale.invert(x - margin.left);

    // 使用可见数据查找最近的点
    const index = visibleData.reduce((prev, curr, i) => {
      return Math.abs(+getDate(curr) - +x0) <
        Math.abs(+getDate(visibleData[prev]) - +x0)
        ? i
        : prev;
    }, 0);

    const candlePoint = visibleData[index];
    const newsPoint = getNewsPointForDate(candlePoint.date);

    // 默认假设不是在新闻点上悬停
    let isHoveringNewsPoint = false;

    // 如果存在新闻点，检查鼠标是否悬停在新闻点上
    if (newsPoint) {
      const newsPointX = xScale(getDate(candlePoint)) + margin.left;
      const newsPointY = yScale(getHigh(candlePoint)) - 15 + margin.top;

      // 计算距离而不是使用边界盒检测 (更可靠)
      const distance = Math.sqrt(
        Math.pow(x - newsPointX, 2) + Math.pow(y - newsPointY, 2)
      );

      // 如果距离在可接受范围内，认为是悬停在新闻点上
      // 使用12作为阈值，大约是新闻标记的大小加一点余量
      if (distance <= 12) {
        isHoveringNewsPoint = true;
        // 鼠标在新闻点上，清除任何现有的隐藏计时器
        if (tooltipTimerRef.current !== null) {

          window.clearTimeout(tooltipTimerRef.current);
          tooltipTimerRef.current = null;
        }
      }
    }

    setTooltipData({
      candlePoint,
      newsPoint,
      x,
      y,
      isHoveringNewsPoint,
    });
  };

  return (
    <div>
      <TopTool toogleMini={() => setIsMini(!isMini)} isMini={isMini} />
      <div
        className={clsx("relative", {
          hidden: isMini,
        })}
        style={{ height: isMini ? "auto" : height, width: width }}>
        <div className="absolute top-0 left-0 right-20 h-fit">
          <PriceTip tooltipData={tooltipData} />
        </div>
        <div style={{ height: chartHeight }} className="relative z-[1]">
          <svg
            ref={svgRef}
            width={width}
            height={chartHeight}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            style={{
              cursor: isDragging ? "grabbing" : "default",
              // 确保SVG本身也禁用文本选择
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
            }}>
            <Group left={margin.left} top={margin.top}>
              {/* 网格线 */}
              <GridRows
                scale={yScale}
                width={innerWidth}
                strokeDasharray="3,3"
                stroke="#e0e0e0"
              />
              <GridColumns
                scale={xScale}
                height={innerHeight}
                strokeDasharray="3,3"
                stroke="#e0e0e0"
              />

              {/* 绘制成交量柱状图 - 先绘制这个，让其在K线图底下 */}
              {visibleData.map((d, i) => {
                const x = xScale(getDate(d));
                const height = innerHeight - volumeYScale(getVolume(d));

                // 使用与蜡烛图相同的颜色策略
                const isIncreasing = getClose(d) > getOpen(d);
                const fillColor = isIncreasing
                  ? INCREASE_COLOR
                  : DECREASE_COLOR;

                return (
                  <Bar
                    key={`volume-${i}`}
                    x={x - candleWidth / 2}
                    y={volumeYScale(getVolume(d))}
                    width={candleWidth}
                    height={height}
                    fill={fillColor}
                    stroke="none"
                    opacity={0.3} // 设置透明度为0.3
                  />
                );
              })}

              {/* 绘制蜡烛图 */}
              {visibleData.map((d, i) => {
                const x = xScale(getDate(d));
                const openY = yScale(getOpen(d));
                const closeY = yScale(getClose(d));
                const highY = yScale(getHigh(d));
                const lowY = yScale(getLow(d));

                // 确定蜡烛颜色 - 涨（绿色）跌（红色）
                const isIncreasing = getClose(d) > getOpen(d);
                const fillColor = isIncreasing
                  ? INCREASE_COLOR
                  : DECREASE_COLOR;

                // 确定是否有关联的新闻点
                const hasNewsPoint = newsPoints.some(
                  np => np.date.getTime() === d.date.getTime()
                );

                return (
                  <Group key={`candle-${i}`}>
                    {/* 蜡烛芯线 - 表示当日最高价到最低价 */}
                    <line
                      x1={x}
                      y1={highY}
                      x2={x}
                      y2={lowY}
                      stroke={fillColor}
                      strokeWidth={2}
                    />

                    {/* 蜡烛实体 - 表示开盘价到收盘价 */}
                    <Bar
                      x={x - candleWidth / 2}
                      y={Math.min(openY, closeY)}
                      width={candleWidth}
                      height={Math.abs(closeY - openY)}
                      fill={fillColor}
                      stroke={fillColor}
                      strokeWidth={1}
                    />

                    {/* 新闻点标记 */}
                    {hasNewsPoint && (
                      <g onMouseLeave={handleNewsPointMouseLeave}>
                        {/* 添加圆形的透明点击区域 (更适合距离检测) */}
                        <circle
                          cx={x}
                          cy={highY - 10}
                          r={12}
                          fill="transparent"
                          style={{ cursor: "pointer" }}
                        />
                        {/* 将可见的新闻标记从方形改为圆形 */}
                        <circle
                          cx={x}
                          cy={highY - 15}
                          r={5} // 圆形半径为5，相当于原来10x10的方形
                          fill="blue"
                          stroke="#fff"
                          strokeWidth={1}
                          style={{ cursor: "pointer" }}
                        />
                      </g>
                    )}
                  </Group>
                );
              })}

              {/* 替换左侧Y轴为右侧Y轴，并移除label */}
              <AxisRight
                scale={yScale}
                left={innerWidth}
                stroke="rgba(0, 0, 0, 0.1)"
                tickStroke="rgba(0, 0, 0, 0.5)"
                hideTicks
                tickFormat={value => `$${value}`}
              />

              {/* 成交量Y轴 - 隐藏 */}
              {/* 
              <AxisRight
                scale={volumeYScale}
                left={innerWidth}
                label="成交量"
                hideAxisLine={true}
                hideTicks={true}
                hideZero={true}
                numTicks={0}
              />
              */}

              {/* X轴 - 使用自适应计算的标签 */}
              <AxisBottom
                hideTicks
                scale={xScale}
                top={innerHeight}
                stroke="rgba(0, 0, 0, 0.1)"
                tickStroke="rgba(0, 0, 0, 0.5)"
                tickValues={customTickValues}
                tickFormat={date => {
                  const d = date as Date;
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />

              {/* 渲染十字线 */}
              {crosshair && (
                <>
                  {/* 垂直线 */}
                  <Line
                    from={{ x: crosshair.x - margin.left, y: 0 }}
                    to={{ x: crosshair.x - margin.left, y: innerHeight }}
                    stroke="rgba(0, 0, 0, 0.3)"
                    strokeWidth={1}
                    strokeDasharray="3,3"
                    pointerEvents="none"
                  />
                  {/* 水平线 */}
                  <Line
                    from={{ x: 0, y: crosshair.y - margin.top }}
                    to={{ x: innerWidth, y: crosshair.y - margin.top }}
                    stroke="rgba(0, 0, 0, 0.3)"
                    strokeWidth={1}
                    strokeDasharray="3,3"
                    pointerEvents="none"
                  />
                  {/* Y轴价格标签 */}
                  <rect
                    x={innerWidth}
                    y={crosshair.y - margin.top - 10}
                    width={margin.right}
                    height={20}
                    fill="rgba(0, 0, 0, 0.7)"
                    rx={3}
                  />
                  <text
                    x={innerWidth + margin.right / 2}
                    y={crosshair.y - margin.top}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={10}
                    pointerEvents="none">
                    {yScale.invert(crosshair.y - margin.top).toFixed(2)}
                  </text>
                  {/* X轴时间标签 - 显示对应数据点的时间 */}
                  {(() => {
                    // 找到最近的数据点
                    const x0 = xScale.invert(crosshair.x - margin.left);
                    const index = visibleData.reduce((prev, curr, i) => {
                      return Math.abs(+getDate(curr) - +x0) <
                        Math.abs(+getDate(visibleData[prev]) - +x0)
                        ? i
                        : prev;
                    }, 0);

                    // 使用实际数据点的时间
                    const pointDate = visibleData[index].date;
                    const dateText = pointDate.toLocaleString();
                    // 估计文本宽度 + 两侧各5px内边距
                    const estimatedWidth = dateText.length * 6;

                    return (
                      <>
                        <rect
                          x={crosshair.x - margin.left - estimatedWidth / 2}
                          y={innerHeight}
                          width={estimatedWidth}
                          height={20}
                          fill="rgba(0, 0, 0, 0.7)"
                          rx={3}
                        />
                        <text
                          x={crosshair.x - margin.left}
                          y={innerHeight + 10}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize={10}
                          pointerEvents="none">
                          {dateText}
                        </text>
                      </>
                    );
                  })()}
                </>
              )}
            </Group>
          </svg>

          {/* 工具提示 */}
          {tooltipData &&
            tooltipData.newsPoint &&
            tooltipData.isHoveringNewsPoint && (
              // @ts-ignore
              <TooltipWithBounds
                key={Math.random()} // 确保更新位置
                style={{
                  ...tooltipStyles,
                  pointerEvents: "auto", // 允许鼠标事件
                }}
                top={tooltipData.y + 10}
                left={tooltipData.x + 10}
                onMouseEnter={handleTooltipMouseEnter}
                onMouseLeave={handleTooltipMouseLeave}>
                <div>
                  <strong>{tooltipData.newsPoint.title}</strong>
                  <p>{tooltipData.newsPoint.content}</p>
                </div>
              </TooltipWithBounds>
            )}
        </div>
      </div>
    </div>
  );
};

export default VisxCandleStickChartV2;
