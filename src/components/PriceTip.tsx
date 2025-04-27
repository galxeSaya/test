import { useMemo, useState } from "react";
import {
  DECREASE_COLOR,
  DEFAULT_COLOR,
  INCREASE_COLOR,
  TTooltipData,
} from "./VisxCandleStickChartV2";

const PriceTip = ({ tooltipData }: { tooltipData?: TTooltipData }) => {
  const [priceColor, setPriceColor] = useState(DEFAULT_COLOR);

  const props = useMemo(() => {
    setPriceColor(DEFAULT_COLOR);
    let res = {
      O: "",
      H: "",
      L: "",
      C: "",
      volume: "",
    };
    if (tooltipData && tooltipData.candlePoint) {
      const data = tooltipData.candlePoint;
      res.O = data.open.toFixed(2) || res.O;
      res.H = data.high.toFixed(2) || res.H;
      res.L = data.low.toFixed(2) || res.L;
      res.C = data.close.toFixed(2) || res.C;
      res.volume =
        ((data.volume as number) / 1000).toFixed(0) + "K" || res.volume;
      setPriceColor(res.C > res.O ? INCREASE_COLOR : DECREASE_COLOR);
    }
    return res;
  }, [tooltipData]);

  return (
    <div className="pt-6 p-6 flex flex-col gap-1 select-none">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-3">
          <span>BTC/ETH</span>
          <div className="w-1 h-1 rounded-full bg-slate-400"></div>
          <span>Uniswap</span>
        </div>
        <div className="flex gap-4 *:flex *:gap-1">
          {Object.entries(props)
            .filter(([key, value]) => key !== "volume" && !!value)
            .map(([key, value]) => (
              <div key={key} className="min-w-20">
                <strong>{key}</strong>
                <span style={{ color: priceColor }}>{value}</span>
              </div>
            ))}
        </div>
      </div>
      <div className="flex gap-4 *:flex *:gap-1">
        {props.volume && <div>
          <strong>Volume</strong>
          <span style={{ color: priceColor }}>{props.volume}</span>
        </div>}
      </div>
    </div>
  );
};

export default PriceTip;
