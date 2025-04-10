import React, { useState, useRef, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Area, ReferenceDot
} from 'recharts';
import { DataPoint, NewsPoint } from '../types/chart';

interface RechartsNewsLineChartProps {
  width: number;
  height: number;
  data: DataPoint[];
  newsPoints: NewsPoint[];
  margin?: { top: number; right: number; bottom: number; left: number };
}

// 自定义 Tooltip 组件
const CustomTooltip = ({ active, payload, newsPoints, activeNewsPoint }: any) => {
  if (!active || !payload || !payload.length) return null;
  
  const dataPoint = payload[0].payload;
  const date = new Date(dataPoint.x);
  const value = dataPoint.y;
  
  // 根据传入的 activeNewsPoint 判断是否显示新闻信息
  const showNewsInfo = activeNewsPoint && activeNewsPoint.x.getTime() === date.getTime();
  
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      maxWidth: '300px'
    }}>
      <div><strong>日期:</strong> {date.toLocaleDateString()}</div>
      <div><strong>数值:</strong> {value.toFixed(2)}</div>
      
      {showNewsInfo && (
        <div style={{ borderTop: '1px solid #ccc', marginTop: '8px', paddingTop: '8px' }}>
          <strong>{activeNewsPoint.title}</strong>
          <p>{activeNewsPoint.content}</p>
        </div>
      )}
    </div>
  );
};

// 自定义新闻点渲染器
const CustomNewsPoint = (props: any) => {
  const { cx, cy, isActive } = props;
  
  return (
    <rect
      x={cx - 5}
      y={cy - 5}
      width={10}
      height={10}
      fill={isActive ? "#ff6666" : "red"}
      stroke="#fff"
      strokeWidth={1}
      style={{ cursor: 'pointer' }}
    />
  );
};

const RechartsNewsLineChart: React.FC<RechartsNewsLineChartProps> = ({
  width,
  height,
  data,
  newsPoints,
  margin = { top: 40, right: 30, bottom: 50, left: 60 },
}) => {
  // 使用状态直接跟踪当前活动的新闻点
  const [activeNewsPoint, setActiveNewsPoint] = useState<NewsPoint | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // 将数据转换为 recharts 可用的格式
  const chartData = data.map(point => {
    const isNewsPoint = newsPoints.some(
      newsPoint => newsPoint.x.getTime() === point.x.getTime()
    );
    
    return {
      x: point.x.getTime(),
      y: point.y,
      date: point.x,
      isNewsPoint
    };
  });
  
  // 为自定义事件处理创建对象引用
  const customEventsRef = useRef({
    lastTooltipIndex: -1,
    mousePosition: { x: 0, y: 0 }
  });
  
  // 检查点是否为新闻点
  const isNewsPoint = useCallback((date: number) => {
    return newsPoints.some(np => np.x.getTime() === date);
  }, [newsPoints]);
  
  // 鼠标移动时检查是否接近新闻点
  const handleMouseMove = useCallback((e: any) => {
    if (!e || e.activeTooltipIndex === undefined) return;
    
    const dataPoint = chartData[e.activeTooltipIndex];
    if (!dataPoint) return;
    
    // 保存当前鼠标位置
    const mouseX = e.chartX || e.clientX;
    const mouseY = e.chartY || e.clientY;
    customEventsRef.current.mousePosition = { x: mouseX, y: mouseY };
    
    // 检查当前点是否为新闻点
    if (dataPoint.isNewsPoint) {
      // 找到对应的新闻点
      const currentNewsPoint = newsPoints.find(np => np.x.getTime() === dataPoint.x);
      
      // 获取图表区域和SVG元素位置
      const containerRect = chartRef.current?.getBoundingClientRect();
      if (!containerRect || !currentNewsPoint) return;
      
      // 找到当前新闻点在SVG中的位置
      const svgPoint = document.querySelector(`.recharts-reference-dot-dot[data-timestamp="${dataPoint.x}"]`);
      if (svgPoint) {
        const rect = svgPoint.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // 计算鼠标与新闻点中心的距离
        const distance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + 
          Math.pow(e.clientY - centerY, 2)
        );
        
        // 如果距离小于阈值，激活新闻点
        if (distance < 20) {
          setActiveNewsPoint(currentNewsPoint);
          const newsIndex = newsPoints.findIndex(np => np.x.getTime() === dataPoint.x);
          setActiveIndex(newsIndex);
        } else {
          setActiveNewsPoint(null);
          setActiveIndex(null);
        }
      }
    } else {
      setActiveNewsPoint(null);
      setActiveIndex(null);
    }
  }, [chartData, newsPoints]);
  
  const handleMouseLeave = useCallback(() => {
    setActiveNewsPoint(null);
    setActiveIndex(null);
  }, []);
  
  return (
    <div style={{ width, height, position: 'relative' }} ref={chartRef}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={margin}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffcccb" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00ff00" stopOpacity={0.5}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" />
          
          <XAxis 
            dataKey="x" 
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
            label={{ value: '日期', position: 'insideBottom', offset: -10 }}
          />
          
          <YAxis 
            domain={[0, 'auto']}
            label={{ value: '数值', angle: -90, position: 'insideLeft', offset: -20 }}
          />
          
          <Tooltip 
            content={<CustomTooltip 
              newsPoints={newsPoints} 
              activeNewsPoint={activeNewsPoint} 
            />}
            allowEscapeViewBox={{ x: true, y: true }}
            cursor={{ stroke: 'rgba(0,0,0,0.2)', strokeWidth: 1 }}
          />
          
          {/* 区域填充渐变色 */}
          <Area 
            type="monotone" 
            dataKey="y" 
            stroke="none" 
            fill="url(#areaGradient)" 
            fillOpacity={1} 
          />
          
          {/* 折线 */}
          <Line 
            type="monotone" 
            dataKey="y" 
            stroke="rgba(128, 128, 128, 0.5)" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 4, fill: '#333', stroke: 'white', strokeWidth: 2 }}
          />
          
          {/* 新闻点 */}
          {newsPoints.map((newsPoint, idx) => {
            const dataIndex = chartData.findIndex(
              d => d.x === newsPoint.x.getTime()
            );
            
            if (dataIndex === -1) return null;
            
            return (
              <ReferenceDot 
                key={idx}
                className="recharts-reference-dot"
                x={chartData[dataIndex].x}
                y={chartData[dataIndex].y}
                r={0}
                isFront={true}
                shape={(props) => (
                  <CustomNewsPoint 
                    {...props} 
                    isActive={activeIndex === idx} 
                    data-timestamp={chartData[dataIndex].x}
                  />
                )}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RechartsNewsLineChart;
