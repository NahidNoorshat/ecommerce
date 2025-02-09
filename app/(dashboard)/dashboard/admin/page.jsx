"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { closeSidebar } from "@/lib/feature/sidebar/sidebarSlice";
import DashbordCard from "@/components/dashbordcard/DashbordCard";
import {
  FaDollarSign,
  FaShoppingCart,
  FaUsers,
  FaMoneyBillWave,
} from "react-icons/fa";
import SalesAreaChart from "@/components/SalesAreaChart";
import SimpleBarChart from "@/components/SimpleBarChart";
import SimplePieChart from "@/components/SimplePieChart";

import ProductTabledeepseek from "@/components/productdetils/ProductTabledeepseek";
import ProductTable from "@/components/productManagement/ProductPage";
import RecentOrders from "@/components/orders/RecentOrders";

const products = [
  {
    id: 1,
    image: "https://via.placeholder.com/40",
    name: "Product 1",
    price: "$19.99",
    stock: 10,
  },
  {
    id: 2,
    image: "https://via.placeholder.com/40",
    name: "Product 2",
    price: "$29.99",
    stock: 5,
  },
  // Add more products here
];

const page = () => {
  const isSidebarOpen = useSelector((state) => state.sidebar.isSidebarOpen);
  const dispatch = useDispatch();
  const stats = [
    {
      title: "Total Sales",
      value: "$50,250",
      icon: <FaDollarSign />,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-500",
    },
    {
      title: "Total Orders",
      value: "1,240",
      icon: <FaShoppingCart />,
      bgColor: "bg-green-100",
      iconColor: "text-green-500",
    },
    {
      title: "Total Revenue",
      value: "$120,500",
      icon: <FaMoneyBillWave />,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-500",
    },
    {
      title: "Total Customers",
      value: "5,320",
      icon: <FaUsers />,
      bgColor: "bg-red-100",
      iconColor: "text-red-500",
    },
  ];

  const handleEdit = (product) => {
    console.log("Edit:", product);
  };

  const handleDelete = (product) => {
    console.log("Delete:", product);
  };

  return (
    <>
      <div className=" flex flex-col my-14 w-full gap-y-6 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {stats.map((stat, index) => (
            <div key={index} className="w-full">
              <DashbordCard
                title={stat.title}
                value={stat.value}
                icon={
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <div className={`text-2xl ${stat.iconColor}`}>
                      {stat.icon}
                    </div>
                  </div>
                }
              />
            </div>
          ))}
        </div>

        <div className=" flex gap-5 flex-col lg:flex-row ">
          <div className=" w-full bg-slate-200 ">
            <SalesAreaChart />
          </div>
          <div className=" w-full bg-slate-200 ">
            <SimpleBarChart />
          </div>
          <div className=" bg-slate-200 w-full ">
            <SimplePieChart />
          </div>
        </div>
        {/* <div className="">
          <ProductTable />
        </div> */}
        {/* <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Product Management</h1>
          <ProductTabledeepseek
            data={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div> */}
        <div className="">
          <RecentOrders />
        </div>
      </div>
    </>
  );
};

export default page;
