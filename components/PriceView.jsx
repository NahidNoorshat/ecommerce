import { twMerge } from "tailwind-merge";
import PriceFormatter from "./PriceFormatter";

const PriceView = ({ price, discount, label, className }) => {
  return (
    <div className="flex items-center justify-between gap-5">
      <div className="flex items-center gap-2">
        <PriceFormatter amount={price} className={className} />
        {price && discount && (
          <PriceFormatter
            amount={price + (discount * price) / 100}
            className={twMerge("line-through text-xs font-medium", className)}
          />
        )}
      </div>
      <p className="text-gray-500">{label}</p>
    </div>
  );
};

export default PriceView;
