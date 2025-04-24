import clsx from "clsx";
import BtcIcon from "../assets/btc.png";
import { ReactComponent as ArrowIcon } from "../assets/Arrow.svg";

const TopTool = ({ isMini, toogleMini }: { isMini?: boolean
  toogleMini?: () => void }) => {
  return (
    <div className="flex justify-between items-center px-6 py-3">
      <div className="flex items-center">
        <img src={BtcIcon} alt="btc" className="w-4 h-4 rounded-full mr-2" />
        <span>Bitcoin</span>
      </div>
      <div>
        <div className="w-5 h-5 flex items-center justify-center" onClick={toogleMini}>
          <ArrowIcon
            className={clsx("w-4 h-4 fill-gray-600 cursor-pointer", {
              "rotate-90": !!isMini,
            })}
          />
        </div>
      </div>
    </div>
  );
};

export default TopTool;
