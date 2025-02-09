import { twMerge } from "tailwind-merge";

const PriceFormatter = ({ amount, className }) => {
  const formattedPrice = Number(amount).toLocaleString("en-US", {
    currency: "USD",
    style: "currency",
    minimumFractionDigits: 2,
  });

  return (
    <span className={twMerge("text-sm font-semibold text-darkText", className)}>
      {formattedPrice}
    </span>
  );
};

export default PriceFormatter;
