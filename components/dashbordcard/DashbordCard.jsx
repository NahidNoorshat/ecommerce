"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  defs,
} from "recharts";

const DashboardCard = ({ title, value, percentageChange, chartData }) => {
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const lineColor = isDark ? "#82ca9d" : "#1f2937"; // slate-800
  const fillGradientId = `sparkline-gradient-${title.replace(/\s+/g, "-")}`;

  return (
    <Card className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-2xl font-bold text-black dark:text-white">
          {value}
        </div>
        {percentageChange && (
          <p className="text-xs text-muted-foreground">{percentageChange}</p>
        )}
      </CardHeader>

      <CardContent className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            {/* Gradient */}
            <defs>
              <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.4} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <Tooltip
              cursor={false}
              contentStyle={{
                background: isDark ? "#1f2937" : "#ffffff",
                border: "none",
                fontSize: "0.75rem",
                borderRadius: "0.375rem",
                color: isDark ? "#fff" : "#111",
              }}
              labelStyle={{ display: "none" }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              fill={`url(#${fillGradientId})`}
              dot={{ r: 2, stroke: lineColor }}
              activeDot={{ r: 4 }}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
