import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

// Sample data for monthly sales
const data = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 2000 },
  { month: "Apr", sales: 2780 },
  { month: "May", sales: 1890 },
  { month: "Jun", sales: 2390 },
  { month: "Jul", sales: 3490 },
  { month: "Aug", sales: 4200 },
  { month: "Sep", sales: 3800 },
  { month: "Oct", sales: 5000 },
  { month: "Nov", sales: 4500 },
  { month: "Dec", sales: 6000 },
];

const SimpleBarChart = () => {
  const { theme } = useTheme(); // Get the current theme

  // Define styles for light and dark modes
  const styles = {
    light: {
      background: "#fff",
      textColor: "#333",
      gridColor: "#ccc",
      tooltipBackground: "#fff",
      tooltipText: "#333",
      barColor: "#8884d8",
    },
    dark: {
      background: "#1e1e1e",
      textColor: "#ccc",
      gridColor: "#444",
      tooltipBackground: "#333",
      tooltipText: "#fff",
      barColor: "#82ca9d",
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
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={currentStyles.gridColor}
          />
          <XAxis dataKey="month" stroke={currentStyles.textColor} />
          <YAxis stroke={currentStyles.textColor} />
          <Tooltip
            contentStyle={{
              background: currentStyles.tooltipBackground,
              border: "none",
              borderRadius: "5px",
              color: currentStyles.tooltipText,
            }}
          />
          <Bar dataKey="sales" fill={currentStyles.barColor} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimpleBarChart;
