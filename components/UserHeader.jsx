"use client";

import Link from "next/link";
import { FiUser } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutUser } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

const UserHeader = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser(dispatch);
      router.push("/"); // Redirect after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center text-sm gap-2 border border-gray-200 px-2 py-1 rounded-md shadow-md hover:shadow-none hoverEffect">
              <FiUser className="text-2xl text-darkBlue" />
              <div className="flex flex-col">
                <p className="text-xs">Welcome</p>
                <p className="font-semibold">{user.username}</p>
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onSelect={() => router.push("/customerProfile")}>
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem>Billing</DropdownMenuItem>

            {user.role === "admin" && (
              <DropdownMenuItem
                onSelect={() => router.push("/dashboard/admin")}
              >
                Admin Dashboard
              </DropdownMenuItem>
            )}

            {user.role === "seller" && (
              <DropdownMenuItem
                onSelect={() => router.push("/dashboard/seller")}
              >
                Seller Dashboard
              </DropdownMenuItem>
            )}

            {user.role === "customer" && (
              <>
                <DropdownMenuItem
                  onSelect={() => router.push("/dashboard/customer")}
                >
                  Customer Dashboard
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => router.push("/register/request-seller")}
                >
                  Become a Seller
                </DropdownMenuItem>
              </>
            )}

            <DropdownMenuItem onSelect={handleLogout}>Log Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Link href="/login">
          <div className="flex items-center text-sm gap-2 border border-gray-200 px-2 py-1 rounded-md shadow-md hover:shadow-none hoverEffect">
            <FiUser className="text-2xl text-darkBlue" />
            <div className="flex flex-col">
              <p className="text-xs">Account</p>
              <p className="font-semibold">Login</p>
            </div>
          </div>
        </Link>
      )}
    </>
  );
};

export default UserHeader;
