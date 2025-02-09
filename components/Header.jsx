import Link from "next/link";
import React from "react";
import Container from "./Container";
import Image from "next/image";
import logo from "../public/ecommerce_images/logo.png";
import CartIcon from "./CartIcon";
import { BsBasket } from "react-icons/bs";
import UserHeader from "./UserHeader";

const Header = () => {
  return (
    <div className="bg-white sticky top-0 z-50 border-b border-b-gray-200 py-1">
      <Container>
        <header className="flex gap-2 flex-wrap justify-between items-center py-2">
          {/* Logo */}
          <Link href="/">
            <Image
              src={logo}
              alt="logo"
              width={96} // Adjust based on the actual image size
              height={24} // Adjust based on the actual image size
              className="w-24"
              priority
            />
          </Link>

          {/* Search Form */}
          <form
            action="/search"
            className="w-full sm:w-auto sm:flex-1 sm:mx-4 sm:mt-0"
          >
            <input
              type="text"
              name="query"
              placeholder="Search for products"
              aria-label="Search for products"
              className="bg-gray-50 text-gray-800 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 border border-gray-200 w-full rounded-md hover:shadow-md transition-shadow"
            />
          </form>

          {/* Cart and User Icons */}
          <div className="flex items-center space-x-4 sm:mt-0 flex-1 sm:flex-none">
            <CartIcon />
            {/* User icons */}
            <UserHeader />
            <Link
              href="/orders"
              className="flex items-center text-sm gap-2 border border-gray-200 px-2 py-1 rounded-md shadow-md hover:shadow-none transition-shadow"
            >
              <BsBasket className="text-2xl text-darkBlue" />
              <div className="flex flex-col">
                <p className="text-xs">
                  <span className="font-semibold">0</span> items
                </p>
                <p className="font-semibold">Orders</p>
              </div>
            </Link>
          </div>
        </header>
      </Container>
    </div>
  );
};

export default Header;
