import clsx from "clsx";
import BtcIcon from "../assets/btc.png";
import { ReactComponent as ArrowIcon } from "../assets/Arrow.svg";
import { ReactComponent as ExpandIcon } from "../assets/Expand.svg";
import { ReactComponent as SnapShotIcon } from "../assets/SnapShot.svg";
import { Fragment, useState } from "react";

export type TSwitchInterval = ({
  interval
}: {
  interval: TINTERVAL_ITEM;
}) => void

export enum INTERVAL_ITEM {
  "1s" = "1s",
  "15s" = "15s",
  "30s" = "30s",
  "1m" = "1m",
  "5m" = "5m",
  "15m" = "15m",
  "30m" = "30m",
  "1h" = "1h",
  "2h" = "2h",
  "4h" = "4h",
  "6h" = "6h",
  "8h" = "8h",
  "12h" = "12h",
  "1d" = "1d",
  "3d" = "3d",
  "1w" = "1w",
  "1mo" = "1mo",
}

export type TINTERVAL_ITEM = keyof typeof INTERVAL_ITEM;

const INTERVAL_LIST: TINTERVAL_ITEM[] = Object.values(INTERVAL_ITEM);

const TopTool = ({
  isMini,
  isExpand,
  defaultInterval = "15m",
  intervalList = INTERVAL_LIST,
  toogleMini,
  toogleExpand,
  handleSnapShot,
  switchInterval
}: {
  isMini?: boolean;
  isExpand?: boolean;
  toogleMini?: () => void;
  toogleExpand?: () => void;
  handleSnapShot?: () => void;
  switchInterval?: TSwitchInterval;
  defaultInterval?: TINTERVAL_ITEM;
  intervalList?: TINTERVAL_ITEM[];
}) => {
  const [curInterVal, setCurInterVal] =
    useState<TINTERVAL_ITEM>(defaultInterval);
  const [showLeftInterval, setShowLeftInterval] = useState(false);

  const changeInterval = (interval: TINTERVAL_ITEM) => {
    setCurInterVal(interval);
    if (switchInterval) {
      switchInterval && switchInterval({ interval });
    }
  };

  return (
    <div className="flex justify-between items-center px-6 py-3">
      {<div className="flex items-center">
        <img src={BtcIcon} alt="btc" className="w-4 h-4 rounded-full mr-2" />
        <span>Bitcoin</span>
      </div>}
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <img src={BtcIcon} alt="btc" className="w-4 h-4 rounded-full mr-2" />
          <span>Bitcoin</span>
        </div>
        {!isMini && <div>
          <ul className="flex items-center gap-2">
            {intervalList.slice(0, 2).map(interval => (
              <li
                key={interval}
                className={clsx(
                  "inline-block px-2 rounded-full cursor-pointer",
                  {
                    "bg-gray-200 text-gray-800": curInterVal === interval,
                    "text-gray-900": curInterVal !== interval,
                  }
                )}
                onClick={() => {
                  changeInterval(interval);
                  setShowLeftInterval(false);
                }}>
                {interval}
              </li>
            ))}
            <li
              className={clsx(
                "px-2 rounded-full cursor-pointer relative flex items-center justify-center gap-1",
                {
                  "bg-gray-200 text-gray-800": intervalList
                    .slice(2)
                    .includes(curInterVal),
                  "text-gray-400": !intervalList
                    .slice(2)
                    .includes(curInterVal),
                }
              )}
              onClick={() => setShowLeftInterval(!showLeftInterval)}>
              {intervalList.slice(2).includes(INTERVAL_ITEM[curInterVal]) && (
                <span>{curInterVal}</span>
              )}
              <ArrowIcon
                className={clsx("w-4 h-4 fill-gray-600 cursor-pointer", {
                  "rotate-90": !!showLeftInterval,
                })}
              />
              {showLeftInterval && (
                <ul className="absolute z-[5] top-8 left-0 bg-white shadow-[0px_0px_5px_0px_#00000024] rounded-lg p-2 w-48 flex flex-wrap gap-1">
                  {intervalList.slice(2).map(interval => (
                    <li
                      key={interval}
                      className={clsx(
                        "px-2 rounded-full cursor-pointer w-14 flex items-center justify-center",
                        {
                          "bg-gray-900 text-white": curInterVal === interval,
                          "text-gray-900": curInterVal !== interval,
                        }
                      )}
                      onClick={() => {
                        changeInterval(interval);
                        setShowLeftInterval(false);
                      }}>
                      {interval}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </div>}
      </div>
      <div className="flex items-center gap-2">
        {!isMini && (
          <Fragment>
            <div
              className="w-5 h-5 flex items-center justify-center"
              onClick={toogleExpand}>
              <ExpandIcon
                className={clsx("w-5 h-5 fill-gray-900 cursor-pointer")}
              />
            </div>
            <div
              className="w-5 h-5 flex items-center justify-center"
              onClick={handleSnapShot}>
              <SnapShotIcon
                className={clsx("w-5 h-5 fill-gray-900 cursor-pointer")}
              />
            </div>
          </Fragment>
        )}
        {!isExpand && (
          <div
            className="w-5 h-5 flex items-center justify-center"
            onClick={toogleMini}>
            <ArrowIcon
              className={clsx("w-4 h-4 fill-gray-600 cursor-pointer", {
                "rotate-90": !!isMini,
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TopTool;
