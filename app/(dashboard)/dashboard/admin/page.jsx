"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaDollarSign, FaShoppingCart, FaUsers } from "react-icons/fa";

import DashbordCard from "@/components/dashbordcard/DashbordCard";
import SalesAreaChart from "@/components/SalesAreaChart";
import SimpleBarChart from "@/components/SimpleBarChart";
import SimplePieChart from "@/components/SimplePieChart";
import RecentOrders from "@/components/orders/RecentOrders";
import AnalyticsFilter from "@/components/analytics/AnalyticsFilter";
import BarFilter from "@/components/analytics/BarFilter";
import PieFilter from "@/components/analytics/PieFilter";
import { ANALYTICS_API } from "@/utils/config";
import { secureFetch } from "@/lib/api/secureFetch";

const DashboardPage = () => {
  const isSidebarOpen = useSelector((state) => state.sidebar.isSidebarOpen);
  const dispatch = useDispatch();

  const [stats, setStats] = useState({
    total_orders: 0,
    total_revenue: 0,
    total_users: 0,
  });
  const [filter, setFilter] = useState("weekly");
  const [salesData, setSalesData] = useState([]);
  const [barRange, setBarRange] = useState("all");
  const [barChartData, setBarChartData] = useState([]);
  const [pieRange, setPieRange] = useState("all");
  const [pieData, setPieData] = useState([]);
  const [trendData, setTrendData] = useState({
    revenue_trend: [],
    order_trend: [],
    user_trend: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const generalRes = await secureFetch(
          `${ANALYTICS_API}/general/`,
          {},
          dispatch
        );
        if (generalRes) {
          const data = await generalRes.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch general analytics:", err);
      }

      try {
        const trendRes = await secureFetch(
          `${ANALYTICS_API}/sales-trend/?filter=${filter}`,
          {},
          dispatch
        );
        if (trendRes) {
          const data = await trendRes.json();
          setSalesData(data.sales_data);
        }
      } catch (err) {
        console.error("Failed to fetch sales trend:", err);
      }

      try {
        const barRes = await secureFetch(
          `${ANALYTICS_API}/category-sales-bar/?range=${barRange}`,
          {},
          dispatch
        );
        if (barRes) {
          const data = await barRes.json();
          setBarChartData(data.category_sales);
        }
      } catch (err) {
        console.error("Failed to fetch bar chart data:", err);
      }

      try {
        const pieRes = await secureFetch(
          `${ANALYTICS_API}/order-status-pie/?range=${pieRange}`,
          {},
          dispatch
        );
        if (pieRes) {
          const data = await pieRes.json();
          setPieData(data.status_data);
        }
      } catch (err) {
        console.error("Failed to fetch pie chart data:", err);
      }

      try {
        const trendFull = await secureFetch(
          `${ANALYTICS_API}/trends/`,
          {},
          dispatch
        );
        if (trendFull) {
          const data = await trendFull.json();
          setTrendData(data);
        }
      } catch (err) {
        console.error("Failed to fetch trend data:", err);
      }
    };

    fetchAnalytics();
  }, [filter, barRange, pieRange, dispatch]);

  const cardData = [
    {
      title: "Total Revenue",
      value: `$${stats.total_revenue.toLocaleString()}`,
      icon: <FaDollarSign />,
      chartData: trendData.revenue_trend.map((v) => ({ value: v })),
    },
    {
      title: "Total Orders",
      value: stats.total_orders,
      icon: <FaShoppingCart />,
      chartData: trendData.order_trend.map((v) => ({ value: v })),
    },
    {
      title: "Total Customers",
      value: stats.total_users,
      icon: <FaUsers />,
      chartData: trendData.user_trend.map((v) => ({ value: v })),
    },
  ];

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-8 mt-12 ">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {cardData.map((stat, index) => (
          <DashbordCard
            key={index}
            title={stat.title}
            value={stat.value}
            chartData={stat.chartData}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 shadow-md rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 sm:gap-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
            Sales Analytics ({filter.charAt(0).toUpperCase() + filter.slice(1)})
          </h2>
          <AnalyticsFilter onChange={(selected) => setFilter(selected)} />
        </div>
        <SalesAreaChart data={salesData} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 shadow-md rounded-2xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Revenue by Category
          </h2>
          <BarFilter onChange={(val) => setBarRange(val)} />
          <SimpleBarChart data={barChartData} />
        </div>
        <div className="bg-white dark:bg-slate-900 shadow-md rounded-2xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Orders by Status
          </h2>
          <PieFilter onChange={(val) => setPieRange(val)} />
          <SimplePieChart data={pieData} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 shadow-md rounded-2xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Recent Orders
        </h2>
        <RecentOrders />
      </div>
    </div>
  );
};

export default DashboardPage;
