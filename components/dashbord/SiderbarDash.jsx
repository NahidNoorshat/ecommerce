"use client";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar } from "@/lib/feature/sidebar/sidebarSlice";
import Link from "next/link";
import { FaChevronDown, FaChevronUp, FaBars, FaTimes } from "react-icons/fa"; // Importing React Icons
import { sidebarLinks } from "../sidebarLinks"; // Assuming the updated sidebarLinks are imported

const SidebarDash = ({ role }) => {
  const dispatch = useDispatch();
  const isCollapsed = useSelector((state) => !state.sidebar.isSidebarOpen);

  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const roleTitles = {
    admin: "Admin Dashboard",
    seller: "Seller Dashboard",
    customer: "Customer Dashboard",
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-gray-800 text-white flex flex-col transition-all duration-300 z-50
      ${isCollapsed ? "w-16" : "w-64"}`}
    >
      {/* Sidebar Header (Visible When Open) */}
      {!isCollapsed && (
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">
            {roleTitles[role] || "Dashboard"}
          </h2>
        </div>
      )}

      {/* Toggle Button - Stays in the Top-Right */}
      <button
        className="absolute top-3 right-3 p-2 text-white hover:bg-gray-700 rounded"
        onClick={() => dispatch(toggleSidebar())}
      >
        {isCollapsed ? (
          <FaBars size={24} color="white" />
        ) : (
          <FaTimes size={24} color="white" />
        )}
      </button>

      {/* Divider and Gap (Visible in Both States) */}
      <div
        className={` ${isCollapsed ? " py-8 border-b border-gray-700" : "  "}`}
      ></div>

      {/* Sidebar Links */}
      <nav className="flex flex-col p-4 space-y-2">
        {sidebarLinks[role]?.map((item, index) => (
          <div key={index}>
            {item.subLinks ? (
              <button
                className="flex items-center justify-between w-full p-2 hover:bg-gray-700 rounded"
                onClick={() => toggleMenu(item.name)}
              >
                <div className="flex items-center gap-2">
                  {item.icon && (
                    <span
                      className={`flex items-center justify-center ${
                        isCollapsed ? "h-10" : ""
                      }`}
                    >
                      <item.icon size={18} color="white" />
                    </span>
                  )}
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
                {!isCollapsed &&
                  (openMenus[item.name] ? (
                    <FaChevronUp size={18} color="white" />
                  ) : (
                    <FaChevronDown size={18} color="white" />
                  ))}
              </button>
            ) : (
              <Link href={item.path}>
                <h2
                  className={`flex items-center p-2 hover:bg-gray-700 rounded cursor-pointer gap-2 ${
                    isCollapsed ? "justify-center h-12" : ""
                  }`}
                >
                  {item.icon && (
                    <span className="flex items-center justify-center h-10">
                      <item.icon size={18} color="white" />
                    </span>
                  )}
                  {!isCollapsed && <span>{item.name}</span>}
                </h2>
              </Link>
            )}

            {/* Sub-links */}
            {openMenus[item.name] && item.subLinks && !isCollapsed && (
              <div className="ml-4 mt-1 space-y-1">
                {item.subLinks.map((sub, subIndex) => (
                  <Link key={subIndex} href={sub.path}>
                    <h2 className="p-2 hover:bg-gray-600 rounded">
                      {sub.name}
                    </h2>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default SidebarDash;
