import { CandleStickPoint, CandleStickNewsPoint } from '../types/candlestick';

// 生成随机的蜡烛图数据
export function generateCandleStickData(days: number): CandleStickPoint[] {
  const data: CandleStickPoint[] = [];
  const today = new Date();
  let price = 100; // 起始价格

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - i - 1));
    
    // 随机波动
    const change = (Math.random() - 0.5) * 10;
    const open = price;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    
    // 生成随机成交量，与价格波动幅度正相关
    const volume = Math.abs(change) * 50000 + Math.random() * 100000;
    
    data.push({
      date,
      open,
      close,
      high,
      low,
      volume
    });
    
    price = close; // 下一天的开盘价是前一天的收盘价
  }
  
  return data;
}

// 生成随机的新闻点
export function generateNewsPoints(data: CandleStickPoint[], count: number): CandleStickNewsPoint[] {
  const newsPoints: CandleStickNewsPoint[] = [];
  const usedIndices = new Set<number>();
  
  // 确保我们不会尝试生成超过数据点数量的新闻点
  const maxCount = Math.min(count, data.length);
  
  while (newsPoints.length < maxCount) {
    const index = Math.floor(Math.random() * data.length);
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      
      const dataPoint = data[index];
      const newsPoint: CandleStickNewsPoint = {
        date: new Date(dataPoint.date),
        title: `市场新闻 #${index + 1}`,
        content: `这是关于 ${dataPoint.date.toLocaleDateString()} 的重要市场动态。当日价格从 ${dataPoint.open.toFixed(2)} 变化到 ${dataPoint.close.toFixed(2)}.`,
      };
      
      newsPoints.push(newsPoint);
    }
  }
  
  return newsPoints;
}


// 生成随机的蜡烛图数据
export function generateCandleStickDataV2(): CandleStickPoint[] {
  const dataLength = Math.ceil(Math.random() * 200); // 随机生成数据个数
  const data: CandleStickPoint[] = [];
  const today = new Date();
  let price = 100; // 起始价格

  for (let i = 0; i < dataLength; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (dataLength - i - 1));
    
    // 随机波动
    const change = (Math.random() - 0.5) * 10;
    const open = price;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    
    // 生成随机成交量，与价格波动幅度正相关
    const volume = Math.abs(change) * 50000 + Math.random() * 100000;
    
    data.push({
      date,
      open,
      close,
      high,
      low,
      volume
    });
    
    price = close; // 下一天的开盘价是前一天的收盘价
  }
  
  return data;
}

// 生成示例数据
export const sampleCandleData = generateCandleStickData(200);
export const sampleCandleNewsPoints = generateNewsPoints(sampleCandleData, 5);



