import BtcIcon from '../assets/btc.png';
import Arrow from '../assets/Arrow.svg';

const TopTool = () => {
  return <div>
    <div>
    <img src={BtcIcon} alt="btc" className="w-4 h-4 rounded-full" />
    <span>Bitcoin</span>
    </div>
    <div>
      <Arrow />
    </div>
  </div>
}

export default TopTool;