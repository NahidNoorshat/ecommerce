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
      router.push("/"); // Redirect to login page
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
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            {user.role === "admin" && (
              <DropdownMenuItem>
                <Link href="/dashboard/admin">Admin Dashboard</Link>
              </DropdownMenuItem>
            )}
            {user.role === "seller" && (
              <DropdownMenuItem>
                <Link href="/dashboard/seller">Saler Dashboard</Link>
              </DropdownMenuItem>
            )}
            {user.role === "customer" && (
              <DropdownMenuItem>
                <Link href="/dashboard/customer">Customer Dashboard</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <button onClick={handleLogout}>Log Out</button>
            </DropdownMenuItem>
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
