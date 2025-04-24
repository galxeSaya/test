import React, { ErrorInfo, ReactNode } from 'react';
import { ParentSize } from '@visx/responsive';
import NewsLineChart from './components/NewsLineChart';
import RechartsNewsLineChart from './components/RechartsNewsLineChart';
import VisxCandleStickChart from './components/VisxCandleStickChart';
import VisxCandleStickChartV2 from './components/VisxCandleStickChartV2';
import { sampleData, sampleNewsPoints } from './data/sampleData';
import { sampleCandleData, sampleCandleNewsPoints } from './data/sampleCandleData';

// 添加错误边界组件
class ErrorBoundary extends React.Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("图表渲染错误:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h3>渲染出错</h3>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>重试</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  // 添加控制台输出来调试
  console.log("sampleData:", sampleData);
  console.log("sampleNewsPoints:", sampleNewsPoints);
  
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1000px', 
      margin: '0 auto'
    }}>
      <h1 style={{ textAlign: 'center' }}>新闻数据折线图</h1>
      
      {/* ViSX 实现 */}
      <h2>ViSX 实现</h2>
      <div style={{ width: '100%', height: '500px', border: '1px solid #ddd', borderRadius: '8px' }}>
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
              ) : <div>调整大小中...</div>
            )}
          </ParentSize>
        </ErrorBoundary>
      </div>
      
      {/* Recharts 实现 */}
      <h2 style={{ marginTop: '30px' }}>Recharts 实现</h2>
      <div style={{ width: '100%', height: '500px', border: '1px solid #ddd', borderRadius: '8px' }}>
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
              ) : <div>调整大小中...</div>
            )}
          </ParentSize>
        </ErrorBoundary>
      </div>
      
      {/* ViSX 蜡烛图实现 */}
      <h2 style={{ marginTop: '30px' }}>ViSX 蜡烛图实现</h2>
      <div style={{ width: '100%', height: '500px', border: '1px solid #ddd', borderRadius: '8px' }}>
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
              ) : <div>调整大小中...</div>
            )}
          </ParentSize>
        </ErrorBoundary>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>提示: 将鼠标悬停在折线上可查看数据点信息，红色方块代表新闻事件，悬停在上面可查看详情。</p>
      </div>

      {/* ViSX 蜡烛图实现 */}
      <h2 style={{ marginTop: '30px' }}>ViSX 蜡烛图实现 V2</h2>
      <div style={{ width: '100%', height: '500px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <ErrorBoundary>
          <ParentSize>
            {({ width, height }) => (
              width > 0 && height > 0 ? (
                <VisxCandleStickChartV2
                  width={width}
                  height={height}
                  data={sampleCandleData}
                  newsPoints={sampleCandleNewsPoints}
                />
              ) : <div>调整大小中...</div>
            )}
          </ParentSize>
        </ErrorBoundary>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>提示: 将鼠标悬停在折线上可查看数据点信息，红色方块代表新闻事件，悬停在上面可查看详情。</p>
      </div>
    </div>
  );
};

export default App;
