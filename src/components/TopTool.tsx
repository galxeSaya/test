import clsx from "clsx";
import BtcIcon from "../assets/btc.png";
import { ReactComponent as ArrowIcon } from "../assets/Arrow.svg";
import { ReactComponent as ExpandIcon } from "../assets/Expand.svg";
import { ReactComponent as SnapShotIcon } from "../assets/SnapShot.svg";
import { Fragment } from "react";

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
  return (
    <div className="flex justify-between items-center px-6 py-3">
      <div>
        <div className="flex items-center">
          <img src={BtcIcon} alt="btc" className="w-4 h-4 rounded-full mr-2" />
          <span>Bitcoin</span>
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
