"use client";

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

const SimpleBarChart = ({ data }) => {
  const { theme } = useTheme();

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

  const currentStyles = theme === "dark" ? styles.dark : styles.light;

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm">
        No data available to show.
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
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={currentStyles.gridColor}
          />
          <XAxis dataKey="category" stroke={currentStyles.textColor} />
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
