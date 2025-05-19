import { DataPoint, NewsPoint } from '../types/chart';

// 生成示例数据点
const generateData = (): DataPoint[] => {
  const today = new Date();
  const data = Array(30)
    .fill(0)
    .map((_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - 30 + i);
      return {
        x: date,
        y: Math.random() * 100 + 50,
      };
    });
  
  console.log("Generated data:", data);
  return data;
};

// 生成示例新闻点
const generateNewsPoints = (data: DataPoint[]): NewsPoint[] => {
  // 确保数据数组不为空
  if (!data || data.length === 0) {
    console.error("数据数组为空，无法生成新闻点");
    return [];
  }
  
  // 随机选择5个数据点作为新闻点（或者如果数据点少于5个，则使用所有点）
  const pointCount = Math.min(5, data.length);
  const indices = new Set<number>();
  while (indices.size < pointCount) {
    indices.add(Math.floor(Math.random() * data.length));
  }
  
  const newsPoints = Array.from(indices).map((index) => ({
    x: data[index].x,
    title: `重要新闻 ${index + 1}`,
    content: `这是在${data[index].x.toLocaleDateString()}发生的重要事件，该时间点的数值为${data[index].y.toFixed(2)}。`,
  }));
  
  return newsPoints;
};

// 先生成数据
export const sampleData = generateData();
// 然后基于数据生成新闻点
export const sampleNewsPoints = generateNewsPoints(sampleData);
