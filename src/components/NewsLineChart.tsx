import React, { useMemo, useState } from 'react';
import { scaleLinear, scaleTime } from '@visx/scale';
import { LinePath, AreaClosed } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { Group } from '@visx/group';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { DataPoint, NewsPoint } from '../types/chart';

interface NewsLineChartProps {
  width: number;
  height: number;
  data: DataPoint[];
  newsPoints: NewsPoint[];
  margin?: { top: number; right: number; bottom: number; left: number };
}

const tooltipStyles = {
  ...defaultStyles,
  background: 'white',
  border: '1px solid #ddd',
  borderRadius: '4px',
  padding: '12px',
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  fontSize: '14px',
  lineHeight: '1.5',
};

const NewsLineChart: React.FC<NewsLineChartProps> = ({
  width,
  height,
  data,
  newsPoints,
  margin = { top: 40, right: 30, bottom: 50, left: 60 },
}) => {
  const [tooltipData, setTooltipData] = useState<{
    dataPoint?: DataPoint;
    newsPoint?: NewsPoint;
    x: number;
    y: number;
    isHoveringNewsPoint: boolean; // 新增：跟踪是否悬停在新闻点上
  } | null>(null);

  // 计算图表区域尺寸
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // 数据访问器
  const getX = (d: DataPoint) => d.x;
  const getY = (d: DataPoint) => d.y;

  // 创建比例尺
  const xScale = useMemo(
    () => scaleTime({
      domain: [Math.min(...data.map(d => +getX(d))), Math.max(...data.map(d => +getX(d)))],
      range: [0, innerWidth],
    }),
    [data, innerWidth]
  );

  const yScale = useMemo(
    () => scaleLinear({
      domain: [0, Math.max(...data.map(d => getY(d))) * 1.1],
      range: [innerHeight, 0],
      nice: true,
    }),
    [data, innerHeight]
  );

  // 查找数据点对应的新闻点
  const getNewsPointForDataPoint = (point: DataPoint): NewsPoint | undefined => {
    return newsPoints.find(
      (newsPoint) => newsPoint.x.getTime() === point.x.getTime()
    );
  };

  // 处理鼠标移动事件
  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const { x, y } = localPoint(event) || { x: 0, y: 0 };
    
    // 计算最近的数据点
    const x0 = xScale.invert(x - margin.left);
    const index = data.reduce((prev, curr, i) => {
      return Math.abs(+getX(curr) - +x0) < Math.abs(+getX(data[prev]) - +x0) ? i : prev;
    }, 0);

    const dataPoint = data[index];
    const newsPoint = getNewsPointForDataPoint(dataPoint);
    
    // 默认假设不是在新闻点上悬停
    let isHoveringNewsPoint = false;
    
    // 如果存在新闻点，检查鼠标是否悬停在新闻点上
    if (newsPoint) {
      const newsPointX = xScale(getX(dataPoint));
      const newsPointY = yScale(getY(dataPoint)) - 10; // 新闻点在数据点上方10px
      
      // 检查鼠标是否在新闻点方块区域内
      if (
        x >= newsPointX - 5 + margin.left && 
        x <= newsPointX + 5 + margin.left && 
        y >= newsPointY - 5 + margin.top && 
        y <= newsPointY + 5 + margin.top
      ) {
        isHoveringNewsPoint = true;
      }
    }

    setTooltipData({
      dataPoint,
      newsPoint,
      x,
      y,
      isHoveringNewsPoint
    });
  };

  const handleMouseLeave = () => {
    setTooltipData(null);
  };

  // 渐变色ID
  const gradientId = 'area-gradient';

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <LinearGradient
          id={gradientId}
          from="#ffcccb" // 淡红色
          to="#00ff00" // 绿色
          toOpacity={0.5}
          fromOpacity={0.3}
        />
        <rect x={0} y={0} width={width} height={height} fill="#fff" rx={14} />
        <Group left={margin.left} top={margin.top}>
          {/* 网格线 */}
          <GridRows 
            scale={yScale}
            width={innerWidth}
            height={innerHeight}
            stroke="#e0e0e0"
            strokeDasharray="2,2"
          />
          <GridColumns
            scale={xScale}
            width={innerWidth}
            height={innerHeight}
            stroke="#e0e0e0"
            strokeDasharray="2,2"
          />

          {/* 填充区域 - 使用渐变色 */}
          <AreaClosed
            data={data}
            x={(d) => xScale(getX(d))}
            y={(d) => yScale(getY(d))}
            yScale={yScale}
            curve={curveMonotoneX}
            fill={`url(#${gradientId})`}
          />

          {/* 折线 - 修改为透明度为0.5的灰色 */}
          <LinePath
            data={data}
            x={(d) => xScale(getX(d))}
            y={(d) => yScale(getY(d))}
            stroke="rgba(128, 128, 128, 0.5)" // 透明度为0.5的灰色
            strokeWidth={2}
            curve={curveMonotoneX}
          />

          {/* 数据点 - 只显示当前鼠标悬停位置的点 */}
          {tooltipData && tooltipData.dataPoint && (
            <circle
              key="active-point"
              cx={xScale(getX(tooltipData.dataPoint))}
              cy={yScale(getY(tooltipData.dataPoint))}
              r={4}
              fill="#333"
              stroke="white"
              strokeWidth={2}
            />
          )}

          {/* 新闻点 - 在折线点上方10px的正方形 */}
          {newsPoints.map((newsPoint, i) => {
            const dataPointIndex = data.findIndex(
              d => d.x.getTime() === newsPoint.x.getTime()
            );
            if (dataPointIndex === -1) return null;
            
            const dataPoint = data[dataPointIndex];
            const x = xScale(getX(dataPoint));
            const y = yScale(getY(dataPoint)) - 10; // 在折线点上方10px
            
            // 判断是否是当前悬停的新闻点
            const isActive = tooltipData?.isHoveringNewsPoint && 
                            tooltipData?.newsPoint?.x.getTime() === newsPoint.x.getTime();
            
            return (
              <g key={i}>
                <rect
                  x={x - 5}
                  y={y - 5}
                  width={10}
                  height={10}
                  fill={isActive ? "#ff6666" : "red"} // 悬停时颜色变亮
                  stroke="#fff"
                  strokeWidth={1}
                  style={{ cursor: 'pointer' }}
                />
              </g>
            );
          })}
          
          {/* 坐标轴 */}
          <AxisBottom 
            scale={xScale} 
            top={innerHeight} 
            label="日期" 
            stroke="#333" 
            tickStroke="#333"
          />
          <AxisLeft 
            scale={yScale} 
            label="数值" 
            stroke="#333" 
            tickStroke="#333"
            labelOffset={40}
          />
        </Group>
      </svg>
      
      {/* 工具提示 */}
      {tooltipData && (
        <TooltipWithBounds
          key={Math.random()} // 确保更新位置
          style={tooltipStyles}
          top={tooltipData.y + 10}
          left={tooltipData.x + 10}
        >
          <div>
            <div><strong>日期:</strong> {tooltipData.dataPoint?.x.toLocaleDateString()}</div>
            <div><strong>数值:</strong> {tooltipData.dataPoint?.y.toFixed(2)}</div>
            {/* 只有在悬停在新闻点上时才显示新闻信息 */}
            {tooltipData.isHoveringNewsPoint && tooltipData.newsPoint && (
              <div style={{ borderTop: '1px solid #ccc', marginTop: '8px', paddingTop: '8px' }}>
                <strong>{tooltipData.newsPoint.title}</strong>
                <p>{tooltipData.newsPoint.content}</p>
              </div>
            )}
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
};

export default NewsLineChart;
