export interface DataPoint {
  x: Date;
  y: number;
}

export interface NewsPoint {
  x: Date; // 与折线图数据点对应的日期
  title: string; // 新闻标题
  content: string; // 新闻内容
}
