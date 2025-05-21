// 蜡烛图数据点类型 - 包含价格和成交量信息
export interface CandleStickPoint {
  date: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number; // 成交量字段
}

// 新闻点类型
export interface CandleStickMarkPoint {
  date: number;
  title: string;
  content: string;
  price?: number; // 可选，可以是与新闻相关的价格点
}