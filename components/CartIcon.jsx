import Link from "next/link";
import { MdOutlineShoppingCart } from "react-icons/md";

const CartIcon = () => {
  return (
    <Link
      href="/cart"
      className="flex items-center text-sm gap-2 border border-gray-200 px-2 py-1 rounded-md shadow-md hover:shadow-none hoverEffect"
    >
      <MdOutlineShoppingCart className="text-2xl text-darkBlue" />
      <div className="flex flex-col">
        <p className="text-xs">
          <span className="font-semibold">0</span> items
        </p>
        <p className="font-semibold">Cart</p>
      </div>
    </Link>
  );
};

export default CartIcon;
