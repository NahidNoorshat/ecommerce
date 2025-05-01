"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useTransition } from "react";
import Container from "./Container";
import logo from "../public/ecommerce_images/logo.png";
import CartIcon from "./CartIcon";
import { BsBasket } from "react-icons/bs";
import UserHeader from "./UserHeader";
import CategoryDropdown from "./CategoryDropdown";

const Header = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      startTransition(() => {
        router.push(`/search?query=${encodeURIComponent(query.trim())}`);
      });
    }
  };

  return (
    <div className="bg-white sticky top-0 z-50 border-b border-gray-200 py-1">
      <Container>
        <header className="flex gap-4 flex-wrap justify-between items-center py-2">
          {/* Logo */}
          <Link href="/">
            <Image
              src={logo}
              alt="logo"
              width={96}
              height={24}
              className="w-24"
              priority
            />
          </Link>

          {/* Category Dropdown */}
          <CategoryDropdown />

          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full sm:flex-1 sm:mx-4 sm:mt-0 relative"
            autoComplete="off"
          >
            <input
              type="text"
              name="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              required
              className="bg-gray-50 text-gray-800 px-4 py-2.5 w-full outline-none rounded-md border border-gray-200 
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                focus:border-blue-500 hover:shadow-md transition 
                placeholder-gray-400 text-sm pr-10"
            />
            {isPending && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </form>

          {/* Cart, User, Orders */}
          <div className="flex items-center space-x-4 flex-1 sm:flex-none">
            <CartIcon />
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
