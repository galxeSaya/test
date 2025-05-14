import dayjs from 'dayjs';
import { CandleStickPoint, CandleStickNewsPoint } from '../types/candlestickV3';
import { TINTERVAL_ITEM } from '../components/TopToolV3';


const getSeconds = (interval: TINTERVAL_ITEM): number => {
  // 正则表达式:
  // ^(\d+)     : 匹配字符串开头的一个或多个数字 (捕获组1: 数值)
  // ([smhdw]|mo) : 匹配 "s", "m", "h", "d", "w", 或者 "mo" (捕获组2: 单位)
  // $           : 匹配字符串结尾
  // i           : 忽略大小写 (例如 "1M"也能匹配)
  const regex = /^(\d+)([smhdw]|mo)$/i;
  const match = String(interval).match(regex);

  if (match) {
    const value = parseInt(match[1], 10); // 提取数字部分
    const unit = match[2].toLowerCase();  // 提取单位部分并转为小写

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      case 'w':
        return value * 7 * 24 * 60 * 60;
      case 'mo': // 注意：这里假设一个月为30天，与原函数行为一致
        return value * 30 * 24 * 60 * 60;
      default:
        // 理论上，如果正则匹配成功，不会走到这里，因为单位已被正则限制
        // 但为保持代码健壮性，可以保留
        return 1; // 或者抛出错误 new Error('无法解析单位');
    }
  }

  // 如果格式不匹配 (例如 "invalid-string" 或原函数未定义的格式)
  // 为了与原函数行为保持一致，返回 1。
  // 在实际应用中，对于无效输入，抛出错误可能更合适:
  // throw new Error(`无效的时间间隔格式: ${interval}`);
  return 1;
}

// 生成随机的蜡烛图数据
export const  generateCandleStickData = ({
  num,
  interval,
  startStamp = dayjs().valueOf(),
  type = 'backward',
}:{
  num: number
  interval: TINTERVAL_ITEM
  startStamp?: number
  type?: 'forward' | 'backward'
}): Promise<CandleStickPoint[]> => {
  const data: CandleStickPoint[] = [];
  let price = 100; // 起始价格
  const intervalInSeconds = getSeconds(interval);
  for (let i = 0; i < num; i++) {
    let date = startStamp;
    if (type === 'backward') {
      date = date - (i * intervalInSeconds * 1000);
    } else {
      date = date + (i * intervalInSeconds * 1000);
    }

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
      volume,
    });
    
    price = close; // 下一天的开盘价是前一天的收盘价
  }
  
  const res = type === 'backward' ? data.reverse() : data;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(res);
    }, 1000); // 模拟网络延迟
  })
}

// 生成随机的新闻点
export function generateNewsPoints(data: CandleStickPoint[], count: number): Promise<CandleStickNewsPoint[]> {
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
        date: dataPoint.date,
        title: `市场新闻 #${index + 1}`,
        content: `这是关于 ${dayjs(dataPoint.date).format('YYYY-MM-DD HH:mm:ss')} 的重要市场动态。当日价格从 ${dataPoint.open.toFixed(2)} 变化到 ${dataPoint.close.toFixed(2)}.`,
      };
      
      newsPoints.push(newsPoint);
    }
  }
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(newsPoints);
    }, 1000); // 模拟网络延迟
  });
}

// 生成示例数据
/* export const sampleCandleData = generateCandleStickData({
  num: 200,
  interval: '1d',
});
export const sampleCandleNewsPoints = generateNewsPoints(sampleCandleData, 5); */



