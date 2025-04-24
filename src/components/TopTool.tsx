import BtcIcon from '../assets/btc.png';
import { ReactComponent as ArrowIcon } from '../assets/Arrow.svg';

const TopTool = () => {
  return <div className="flex justify-between items-center p-3">
    <div className="flex items-center">
      <img src={BtcIcon} alt="btc" className="w-4 h-4 rounded-full mr-2" />
      <span>Bitcoin</span>
    </div>
    <div>
      <ArrowIcon className="w-4 h-4 fill-gray-800 cursor-pointer" />
    </div>
  </div>
}

export default TopTool;