import clsx from "clsx";
import BtcIcon from "../assets/btc.png";
import { ReactComponent as ArrowIcon } from "../assets/Arrow.svg";
import { ReactComponent as ExpandIcon } from "../assets/Expand.svg";
import { ReactComponent as SnapShotIcon } from "../assets/SnapShot.svg";
import { Fragment, useState } from "react";

export enum INTERVAL_ITEM {
  '1s' = '1s',
  '15s' = '15s',
  '30s' = '30s',
  '1m' = '1m',
  '5m' = '5m',
  '15m' = '15m',
  '30m' = '30m',
  '1h' = '1h',
  '2h' = '2h',
  '4h' = '4h',
  '6h' = '6h',
  '8h' = '8h',
  '12h' = '12h',
  '1d' = '1d',
  '3d' = '3d',
  '1w' = '1w',
  '1mo' = '1mo',
}

type TINTERVAL_ITEM = keyof typeof INTERVAL_ITEM;

const INTERVAL_LIST: INTERVAL_ITEM[] = Object.values(INTERVAL_ITEM);

const TopTool = ({
  isMini,
  isExpand,
  toogleMini,
  toogleExpand,
  handleSnapShot
}: {
  isMini?: boolean;
  isExpand?: boolean;
  toogleMini?: () => void;
  toogleExpand?: () => void;
  handleSnapShot?: () => void;
}) => {
  const [curInterVal, setCurInterVal] = useState<TINTERVAL_ITEM>('15m');

  return (
    <div className="flex justify-between items-center px-6 py-3">
      <div>
        <div className="flex items-center">
          <img src={BtcIcon} alt="btc" className="w-4 h-4 rounded-full mr-2" />
          <span>Bitcoin</span>
        </div>
        <div>

        </div>
      </div>
      <div className="flex items-center gap-2">
        {
          !isMini && <Fragment>
            <div className="w-5 h-5 flex items-center justify-center" onClick={toogleExpand}>
              <ExpandIcon
                className={clsx("w-5 h-5 fill-gray-900 cursor-pointer")}
              />
            </div>
            <div className="w-5 h-5 flex items-center justify-center" onClick={handleSnapShot}>
              <SnapShotIcon
                className={clsx("w-5 h-5 fill-gray-900 cursor-pointer")}
              />
            </div>
          </Fragment>
        }
        {!isExpand && <div
          className="w-5 h-5 flex items-center justify-center"
          onClick={toogleMini}>
          <ArrowIcon
            className={clsx("w-4 h-4 fill-gray-600 cursor-pointer", {
              "rotate-90": !!isMini,
            })}
          />
        </div>}
      </div>
    </div>
  );
};

export default TopTool;
