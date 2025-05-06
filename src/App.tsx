import React from 'react';
/* import NewsLineChart from './components/NewsLineChart';
import RechartsNewsLineChart from './components/RechartsNewsLineChart';
import VisxCandleStickChart from './components/VisxCandleStickChart';
import VisxCandleStickChartV2 from './components/VisxCandleStickChartV2';
import { ParentSize } from '@visx/responsive';
import { sampleData, sampleNewsPoints } from './data/sampleData';
import { sampleCandleData, sampleCandleNewsPoints } from './data/sampleCandleData'; */
import CandleV2Wrap from './components/CandleV2Wrap';

// 添加错误边界组件
export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by error boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-600 bg-red-100 rounded-lg">组件加载出错，请刷新页面重试。</div>;
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-center text-3xl font-bold mb-6">新闻数据折线图</h1>
      
      {/* ViSX 实现 */}
      {/* <h2 className="text-2xl font-semibold mb-4">ViSX 实现</h2>
      <div className="w-full h-[500px] border border-gray-300 rounded-lg">
        <ErrorBoundary>
          <ParentSize>
            {({ width, height }) => (
              width > 0 && height > 0 ? (
                <NewsLineChart
                  width={width}
                  height={height}
                  data={sampleData}
                  newsPoints={sampleNewsPoints}
                />
              ) : <div className="flex items-center justify-center h-full">调整大小中...</div>
            )}
          </ParentSize>
        </ErrorBoundary>
      </div> */}
      
      {/* Recharts 实现 */}
      {/* <h2 className="text-2xl font-semibold mt-8 mb-4">Recharts 实现</h2>
      <div className="w-full h-[500px] border border-gray-300 rounded-lg">
        <ErrorBoundary>
          <ParentSize>
            {({ width, height }) => (
              width > 0 && height > 0 ? (
                <RechartsNewsLineChart
                  width={width}
                  height={height}
                  data={sampleData}
                  newsPoints={sampleNewsPoints}
                />
              ) : <div className="flex items-center justify-center h-full">调整大小中...</div>
            )}
          </ParentSize>
        </ErrorBoundary>
      </div> */}
      
      {/* ViSX 蜡烛图实现 */}
      {/* <h2 className="text-2xl font-semibold mt-8 mb-4">ViSX 蜡烛图实现</h2>
      <div className="w-full h-[500px] border border-gray-300 rounded-lg">
        <ErrorBoundary>
          <ParentSize>
            {({ width, height }) => (
              width > 0 && height > 0 ? (
                <VisxCandleStickChart
                  width={width}
                  height={height}
                  data={sampleCandleData}
                  newsPoints={sampleCandleNewsPoints}
                />
              ) : <div className="flex items-center justify-center h-full">调整大小中...</div>
            )}
          </ParentSize>
        </ErrorBoundary>
      </div> */}
      
      {/* ViSX 蜡烛图实现 V2 */}
      <CandleV2Wrap />
    </div>
  );
};

export default App;
