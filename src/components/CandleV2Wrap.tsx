import { ParentSize } from "@visx/responsive";
import { ErrorBoundary } from "../App";
import VisxCandleStickChartV2 from "./VisxCandleStickChartV2";
import { sampleCandleData, sampleCandleNewsPoints } from "../data/sampleCandleData";

const CandleV2Wrap = () => {
  return <>
  <h2 className="text-2xl font-semibold mt-8 mb-4">ViSX 蜡烛图实现 V2</h2>
  <div className="w-full h-auto border border-gray-300 rounded-lg overflow-hidden">
    <ErrorBoundary>
      <ParentSize debounceTime={50}>
        {({ width, height }) => (
          width > 0 ? (
            <VisxCandleStickChartV2
              width={width}
              height={500} // 提供一个初始高度
              data={sampleCandleData}
              newsPoints={sampleCandleNewsPoints}
              
            />
          ) : <div className="flex items-center justify-center h-full">调整大小中...</div>
        )}
      </ParentSize>
    </ErrorBoundary>
  </div>
  
  <div className="mt-4 text-sm text-gray-600">
    <p>提示: 红色方块代表新闻事件，悬停在上面可查看详情。</p>
  </div>
  </>
}

export default CandleV2Wrap;