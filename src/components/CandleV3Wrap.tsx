import { ParentSize } from "@visx/responsive";
import { ErrorBoundary } from "../App";
import VisxCandleStickChart from "./VisxCandleStickChartV3";
import {
  generateCandleStickData,
  generateMarkPoints,
} from "../data/sampleCandleDataV3";
import { useEffect, useState } from "react";
import { CandleStickMarkPoint, CandleStickPoint } from "../types/candlestickV3";
import { getIsMobile } from "../utils";
import clsx from "clsx";

// todo
// 2. 左右边界触发数据变更
// 6. 传入不同的弹窗展示不同的数据形式
// 7. 同时展示两种不同的弹窗内容

const defaultInterval = "15m";

const getRandomNum = (max: number) => Math.ceil(Math.random() * max);

const TooltipContent = (markPoint: CandleStickMarkPoint) => {
  const isMobile = getIsMobile();
  return (
    <div className={clsx({
      "p-6": isMobile
    })}>
      <strong>{markPoint.title}</strong>
      <p>{markPoint.content}</p>
    </div>
  );
};

const CandleV3Wrap = () => {
  const isMobile = getIsMobile();
  const [data, setData] = useState<CandleStickPoint[]>([]);
  const [markPoints, setMarkPoints] = useState<CandleStickMarkPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    generateCandleStickData({
      num: getRandomNum(300) + 200,
      interval: defaultInterval,
    })
      .then(res => {
        setData(res);
        return generateMarkPoints(res, 5);
      })
      .then(res => {
        setMarkPoints(res);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error generating data:", error);
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <h2 className="text-2xl font-semibold mt-8 mb-4">ViSX 蜡烛图实现</h2>
      <div className="w-full h-auto border border-gray-300 rounded-lg overflow-hidden">
        <ErrorBoundary>
          <ParentSize debounceTime={50}>
            {({ width, height }) =>
              width > 0 ? (
                <VisxCandleStickChart
                  isLoading={isLoading}
                  defaultInterval={defaultInterval}
                  intervalList={["1m", "5m", "15m", "30m", "1h", "4h", "1d", '3d', '1w', '1mo']}
                  width={width}
                  height={isMobile ? 300 : 500} // 提供一个初始高度
                  data={data}
                  markPoints={markPoints}
                  switchInterval={({ interval }) => {
                    setIsLoading(true);
                    generateCandleStickData({
                      num: getRandomNum(300),
                      interval,
                    })
                      .then(res => {
                        setData(res);
                        return generateMarkPoints(res, 5);
                      })
                      .then(res => {
                        setMarkPoints(res);
                        setIsLoading(false);
                      })
                      .catch(error => {
                        console.error("Error generating data:", error);
                        setIsLoading(false);
                      });
                  }}
                  ToolTip={TooltipContent}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  调整大小中...
                </div>
              )
            }
          </ParentSize>
        </ErrorBoundary>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>提示: 蓝色圆代表新闻事件，可查看详情。</p>
      </div>
    </>
  );
};

export default CandleV3Wrap;
