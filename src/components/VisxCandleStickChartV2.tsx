import React, { useMemo, useState } from "react";
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

export const INCREASE_COLOR = "#4caf50"; // 绿色
export const DECREASE_COLOR = "#ff5722"; // 红色
export const DEFAULT_COLOR = "#383838"; // 灰色

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
  // 状态管理：用于跟踪当前悬停的蜡烛和新闻点
  const [tooltipData, setTooltipData] = useState<TTooltipData>();
  const [chartHeight, setChartHeight] = useState(height);
  // const bottomComRef = useRef<HTMLDivElement>(null);
  // const topComRef = useRef<HTMLDivElement>(null);
  const [isMini, setIsMini] = useState(false);

  // 计算图表区域尺寸
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  // 使用 useEffect 测量 bottomCom 高度并调整图表高度
  /* useEffect(() => {
    if (bottomComRef.current) {
      const bottomComHeight = bottomComRef.current.offsetHeight;
      // 从总高度中减去 bottomCom 高度，留出一些额外空间
      setChartHeight(height - bottomComHeight);
    }
  }, [height, tooltipData]); */

  // 数据访问器
  const getDate = (d: CandleStickPoint) => d.date;
  const getOpen = (d: CandleStickPoint) => d.open;
  const getClose = (d: CandleStickPoint) => d.close;
  const getHigh = (d: CandleStickPoint) => d.high;
  const getLow = (d: CandleStickPoint) => d.low;
  const getVolume = (d: CandleStickPoint) => d.volume;

  // 创建比例尺
  const xScale = useMemo(() => {
    // 计算时间范围
    const minDate = Math.min(...data.map(d => +getDate(d)));
    const maxDate = Math.max(...data.map(d => +getDate(d)));

    // 添加左右两侧的间隙，确保最边缘的蜡烛完全显示
    const timeRange = maxDate - minDate;
    const padding = timeRange / (data.length * 2); // 半个蜡烛的时间宽度

    return scaleTime({
      domain: [new Date(minDate - padding), new Date(maxDate + padding)],
      range: [0, innerWidth],
    });
  }, [data, innerWidth]);

  const yScale = useMemo(
    () =>
      scaleLinear({
        domain: [
          Math.min(...data.map(d => getLow(d))) * 0.99,
          Math.max(...data.map(d => getHigh(d))) * 1.01,
        ],
        range: [innerHeight, 0],
        nice: true,
      }),
    [data, innerHeight]
  );

  // 成交量的Y轴比例尺 - 只使用图表底部约20%的区域显示成交量
  const volumeYScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, Math.max(...data.map(d => getVolume(d))) * 1.1],
        range: [innerHeight, innerHeight * 0.8], // 只用底部20%的空间
        nice: true,
      }),
    [data, innerHeight]
  );

  // 计算蜡烛宽度
  const xBandwidth = innerWidth / data.length;
  const candleWidth = Math.max(xBandwidth * 0.6, 1);

  // 根据图表宽度自适应计算X轴时间标签
  const customTickValues = useMemo(() => {
    // 估计每个标签需要的最小宽度（像素）
    const minWidthPerLabel = 80; 
    
    // 计算可以容纳的标签数量
    const maxLabels = Math.floor(innerWidth / minWidthPerLabel);
    
    // 计算每隔多少个点显示一个标签
    const interval = Math.max(1, Math.ceil(data.length / maxLabels));
    
    // 生成标签值数组
    return data
      .filter((_, i) => i % interval === 0)
      .map(d => getDate(d));
  }, [data, innerWidth]);
  
  // 查找数据点对应的新闻点
  const getNewsPointForDate = (
    date: Date
  ): CandleStickNewsPoint | undefined => {
    return newsPoints.find(
      newsPoint => newsPoint.date.getTime() === date.getTime()
    );
  };

  // 添加状态跟踪鼠标位置
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(
    null
  );

  // 处理鼠标移动事件
  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
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
    const index = data.reduce((prev, curr, i) => {
      return Math.abs(+getDate(curr) - +x0) <
        Math.abs(+getDate(data[prev]) - +x0)
        ? i
        : prev;
    }, 0);

    const candlePoint = data[index];
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

  const handleMouseLeave = () => {
    setCrosshair(null);
    setTooltipData(undefined);
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
            width={width}
            height={chartHeight}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}>
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
              {data.map((d, i) => {
                const x = xScale(getDate(d));
                const height = innerHeight - volumeYScale(getVolume(d));

                // 使用与蜡烛图相同的颜色策略
                const isIncreasing = getClose(d) > getOpen(d);
                const fillColor = isIncreasing ? INCREASE_COLOR : DECREASE_COLOR;

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
              {data.map((d, i) => {
                const x = xScale(getDate(d));
                const openY = yScale(getOpen(d));
                const closeY = yScale(getClose(d));
                const highY = yScale(getHigh(d));
                const lowY = yScale(getLow(d));

                // 确定蜡烛颜色 - 涨（绿色）跌（红色）
                const isIncreasing = getClose(d) > getOpen(d);
                const fillColor = isIncreasing ? INCREASE_COLOR : DECREASE_COLOR;

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
                      <g>
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
                stroke="rgba(0, 0, 0, 0.5)"
                tickStroke="rgba(0, 0, 0, 0.5)"
                tickValues={customTickValues}
                tickFormat={(date) => {
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
                    const index = data.reduce((prev, curr, i) => {
                      return Math.abs(+getDate(curr) - +x0) <
                        Math.abs(+getDate(data[prev]) - +x0)
                        ? i
                        : prev;
                    }, 0);

                    // 使用实际数据点的时间
                    const pointDate = data[index].date;
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
                style={tooltipStyles}
                top={tooltipData.y + 10}
                left={tooltipData.x + 10}>
                <div>
                  {/* 只有在悬停在新闻点上时才显示新闻信息 */}
                  <div>
                    <strong>{tooltipData.newsPoint.title}</strong>
                    <p>{tooltipData.newsPoint.content}</p>
                  </div>
                </div>
              </TooltipWithBounds>
            )}
        </div>

      </div>
    </div>
  );
};

export default VisxCandleStickChartV2;
