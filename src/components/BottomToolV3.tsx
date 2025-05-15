import { ReactComponent as AddIcon } from '../assets/Add.svg'
import { ReactComponent as DecreaseIcon } from '../assets/Decrease.svg'
import { ReactComponent as ArrowIcon } from '../assets/Arrow.svg'
import { ReactComponent as RefreshIcon } from '../assets/Refresh.svg'
import clsx from 'clsx'

const BottomToolV3 = ({
  className,
  addRangeFn,
  decreaseRangeFn,
  refreshFn,
  leftMoveFn,
  rightMoveFn,
}: {
  className?: string
  addRangeFn?: () => void
  decreaseRangeFn?: () => void
  refreshFn?: () => void
  leftMoveFn?: () => void
  rightMoveFn?: () => void
}) => {
  return (
    <div
      className={clsx(
        'absolute left-0 right-[60px] z-[1] items-center justify-between hidden group-hover:flex',
        className
      )}
    >
      <div className="absolute bottom-[58px] left-1/2 w-fit -translate-x-1/2">
        <ul className="*:border-gray-400/80 *:rounded-[4px] *:bg-slate-50/50 *:*:fill-slate-700 *:shadow-[0px_4px_5px_0px_rgba(0,0,0,0.06)] flex *:flex *:*:h-4 *:h-6 *:*:w-4 *:w-6 *:cursor-pointer *:items-center *:justify-center *:border *:border-solid *:backdrop-blur-[3px]">
          <li className="mr-2" onClick={decreaseRangeFn}>
            <DecreaseIcon />
          </li>
          <li className="mr-3" onClick={addRangeFn}>
            <AddIcon/>
          </li>
          <li className="mr-2" onClick={leftMoveFn}>
            <ArrowIcon className="rotate-180" />
          </li>
          <li className="mr-3" onClick={rightMoveFn}>
            <ArrowIcon />
          </li>
          <li onClick={refreshFn}>
            <RefreshIcon />
          </li>
        </ul>
      </div>
    </div>
  )
}

export default BottomToolV3