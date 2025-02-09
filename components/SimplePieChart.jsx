import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTheme } from "next-themes";

// Sample data for the pie chart
const data = [
  { name: "Category A", value: 400 },
  { name: "Category B", value: 300 },
  { name: "Category C", value: 200 },
  { name: "Category D", value: 278 },
  { name: "Category E", value: 189 },
];

const SimplePieChart = () => {
  const { theme } = useTheme(); // Get the current theme

  // Define styles for light and dark modes
  const styles = {
    light: {
      background: "#fff",
      textColor: "#333",
      tooltipBackground: "#fff",
      tooltipText: "#333",
      legendColor: "#333",
      colors: ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"], // Pie chart colors for light mode
    },
    dark: {
      background: "#1e1e1e",
      textColor: "#ccc",
      tooltipBackground: "#333",
      tooltipText: "#fff",
      legendColor: "#ccc",
      colors: ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"], // Pie chart colors for dark mode
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
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={currentStyles.colors[index % currentStyles.colors.length]} // Dynamic colors
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: currentStyles.tooltipBackground,
              border: "none",
              borderRadius: "5px",
              color: currentStyles.tooltipText,
            }}
          />
          <Legend
            wrapperStyle={{
              color: currentStyles.legendColor, // Dynamic legend text color
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimplePieChart;
