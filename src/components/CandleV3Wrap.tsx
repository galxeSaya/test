import { ParentSize } from "@visx/responsive";
import { ErrorBoundary } from "../App";
import VisxCandleStickChart from "./VisxCandleStickChartV3";
import {
  generateCandleStickData,
  generateNewsPoints,
} from "../data/sampleCandleDataV3";
import { useEffect, useState } from "react";
import { CandleStickNewsPoint, CandleStickPoint } from "../types/candlestickV3";

const defaultInterval = "15m";

const getRandomNum = (max: number) => Math.ceil(Math.random() * max);

const CandleV2Wrap = () => {
  const [data, setData] = useState<CandleStickPoint[]>([]);
  const [newsPoints, setNewsPoints] = useState<CandleStickNewsPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    generateCandleStickData({
      num: getRandomNum(300),
      interval: defaultInterval,
    })
      .then(res => {
        setData(res);
        return generateNewsPoints(res, 5);
      })
      .then(res => {
        setNewsPoints(res);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error generating data:", error);
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <h2 className="text-2xl font-semibold mt-8 mb-4">ViSX 蜡烛图实现 V2</h2>
      <div className="w-full h-auto border border-gray-300 rounded-lg overflow-hidden">
        <ErrorBoundary>
          <ParentSize debounceTime={50}>
            {({ width, height }) =>
              width > 0 ? (
                <VisxCandleStickChart
                  isLoading={isLoading}
                  defaultInterval={defaultInterval}
                  intervalList={["1m", "5m", "15m", "30m", "1h", "4h", "1d"]}
                  width={width}
                  height={500} // 提供一个初始高度
                  data={data}
                  newsPoints={newsPoints}
                  switchInterval={({ interval }) => {
                    console.log("switchInterval", interval);
                    setIsLoading(true);
                    generateCandleStickData({
                      num: getRandomNum(300),
                      interval,
                    })
                      .then(res => {
                        setData(res);
                        return generateNewsPoints(res, 5);
                      })
                      .then(res => {
                        setNewsPoints(res);
                        setIsLoading(false);
                      })
                      .catch(error => {
                        console.error("Error generating data:", error);
                        setIsLoading(false);
                      });
                  }}
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
        <p>提示: 蓝色圆代表新闻事件，悬停在上面可查看详情。</p>
      </div>
    </>
  );
};

export default CandleV2Wrap;
