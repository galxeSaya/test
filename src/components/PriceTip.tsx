import { useMemo } from "react";
import { TTooltipData } from "./VisxCandleStickChartV2";

const PriceTip = ({ tooltipData }: { tooltipData?: TTooltipData }) => {
  const props = useMemo(() => {
    let res = {
      date: "-",
      open: "-",
      close: "-",
      high: "-",
      low: "-",
      volume: "-",
    };
    if (tooltipData && tooltipData.candlePoint) {
      const data = tooltipData.candlePoint;
      res.date = data.date.toLocaleDateString() || res.date;
      res.open = data.open.toFixed(2) || res.open;
      res.close = data.close.toFixed(2) || res.close;
      res.high = data.high.toFixed(2) || res.high;
      res.low = data.low.toFixed(2) || res.low;
      res.volume =
        ((data.volume as number) / 1000).toFixed(0) + "K" || res.volume;
    }
    return res;
  }, [tooltipData]);
  return (
    <div className="py-3 pl-16 pr-6 border-t border-t-gray-300">
      <div className="flex *:w-1/4 flex-wrap">
        <div className="mb-1">
          <strong>日期1:</strong>
          {props.date}
        </div>
        <div className="mb-1">
          <strong>开盘价:</strong> {props.open}
        </div>
        <div className="mb-1">
          <strong>收盘价:</strong> {props.close}
        </div>
        <div className="mb-1">
          <strong>最高价:</strong> {props.high}
        </div>
        <div className="mb-1">
          <strong>最低价:</strong> {props.low}
        </div>
        <div className="mb-1">
          <strong>成交量:</strong> {props.volume}
        </div>
      </div>
    </div>
  );
};

export default PriceTip;
