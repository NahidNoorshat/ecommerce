import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

const data = [
  { name: "Page A", uv: 4000, pv: 2400, amt: 2400 },
  { name: "Page B", uv: 3000, pv: 1398, amt: 2210 },
  { name: "Page C", uv: 2000, pv: 9800, amt: 2290 },
  { name: "Page D", uv: 2780, pv: 3908, amt: 2000 },
  { name: "Page E", uv: 1890, pv: 4800, amt: 2181 },
  { name: "Page F", uv: 2390, pv: 3800, amt: 2500 },
  { name: "Page G", uv: 3490, pv: 4300, amt: 2100 },
];

const SalesAreaChart = () => {
  const { theme } = useTheme(); // Get the current theme

  // Define styles for light and dark modes
  const styles = {
    light: {
      background: "#fff",
      textColor: "#333",
      gridColor: "#ccc",
      tooltipBackground: "#fff",
      tooltipText: "#333",
    },
    dark: {
      background: "#1e1e1e",
      textColor: "#ccc",
      gridColor: "#444",
      tooltipBackground: "#333",
      tooltipText: "#fff",
    },
  };

  // Select the appropriate styles based on the current theme
  const currentStyles = theme === "dark" ? styles.dark : styles.light;

  return (
    <div
      style={{
        background: currentStyles.background,
        padding: "20px",
        borderRadius: "8px",
      }}
    >
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            stroke={currentStyles.textColor}
            tick={{ fill: currentStyles.textColor }}
          />
          <YAxis
            stroke={currentStyles.textColor}
            tick={{ fill: currentStyles.textColor }}
          />
          <CartesianGrid
            stroke={currentStyles.gridColor}
            strokeDasharray="5 5"
            strokeOpacity={0.8}
          />
          <Tooltip
            contentStyle={{
              background: currentStyles.tooltipBackground,
              border: "none",
              borderRadius: "5px",
              color: currentStyles.tooltipText,
            }}
          />
          <Area
            type="monotone"
            dataKey="uv"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorUv)"
          />
          <Area
            type="monotone"
            dataKey="pv"
            stroke="#82ca9d"
            fillOpacity={1}
            fill="url(#colorPv)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesAreaChart;
