"use client";

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

const SimplePieChart = ({ data }) => {
  const { theme } = useTheme();

  const styles = {
    light: {
      background: "#fff",
      textColor: "#333",
      tooltipBackground: "#fff",
      tooltipText: "#333",
      legendColor: "#333",
      colors: ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"],
    },
    dark: {
      background: "#1e1e1e",
      textColor: "#ccc",
      tooltipBackground: "#333",
      tooltipText: "#fff",
      legendColor: "#ccc",
      colors: ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"],
    },
  };

  const currentStyles = theme === "dark" ? styles.dark : styles.light;

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          background: currentStyles.background,
          padding: "20px",
          borderRadius: "8px",
          textAlign: "center",
          color: currentStyles.textColor,
        }}
      >
        No data available for selected range.
      </div>
    );
  }

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
            nameKey="status"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={currentStyles.colors[index % currentStyles.colors.length]}
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
              color: currentStyles.legendColor,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimplePieChart;
