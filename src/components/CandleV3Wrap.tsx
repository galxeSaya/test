import { ParentSize } from "@visx/responsive";
import { ErrorBoundary } from "../App";
import VisxCandleStickChart from "./VisxCandleStickChartV3";
import {
  generateCandleStickData,
  generateNewsPoints,
} from "../data/sampleCandleDataV3";
import { useEffect, useState } from "react";
import { CandleStickNewsPoint, CandleStickPoint } from "../types/candlestickV3";
import { getIsMobile } from "../utils";
import clsx from "clsx";

// todo
// 1. scale  工具条 -- done
// 2. 左右边界触发数据变更
// 3. 复现新闻弹窗不出现的问题
// 4. 新闻弹窗 字段修改通用化表示的字段名称
// 5. 抽离弹窗部分
// 6. 传入不同的弹窗展示不同的数据形式
// 7. 同时展示两种不同的弹窗内容
// 8. 非被动事件合并处理
// 9. 移动端弹窗信息样式处理到底部
// 10. 移动端价格信息单独处理到顶部

const defaultInterval = "15m";

const getRandomNum = (max: number) => Math.ceil(Math.random() * max);

const TooltipContent = (newsPoint: CandleStickNewsPoint) => {
  const isMobile = getIsMobile();
  return (
    <div className={clsx({
      "p-6": isMobile
    })}>
      <strong>{newsPoint.title}</strong>
      <p>{newsPoint.content}</p>
    </div>
  );
};

const CandleV2Wrap = () => {
  const isMobile = getIsMobile();
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
                  height={isMobile ? 300 : 500} // 提供一个初始高度
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

export default CandleV2Wrap;
