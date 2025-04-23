// SalesAreaChart.jsx
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
const SalesAreaChart = ({ data }) => {
  const { theme } = useTheme();

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

  const currentStyles = theme === "dark" ? styles.dark : styles.light;

  if (!data || data.length === 0) return <p className="text-center">No data</p>;

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
            dataKey="date"
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
            dataKey="sales"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorUv)"
          />
          <Area
            type="monotone"
            dataKey="orders"
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
