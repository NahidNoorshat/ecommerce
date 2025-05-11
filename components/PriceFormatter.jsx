import { TbCurrencyTaka } from "react-icons/tb";
import { twMerge } from "tailwind-merge";

const PriceFormatter = ({ amount, className }) => {
  const formattedAmount = Number(amount).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <span
      className={twMerge(
        "text-sm font-semibold text-darkText inline-flex items-center",
        className
      )}
    >
      <TbCurrencyTaka className="text-base" />
      {formattedAmount}
    </span>
  );
};

export default PriceFormatter;
