import { ResponsiveContainer, LineChart, Line } from "recharts";

type SparklineProps = {
  data: Array<{ value: number }>; // simple series
  color?: string;
  height?: number;
};

export default function Sparkline({
  data,
  color = "#2563eb",
  height = 40,
}: SparklineProps) {
  if (!data || data.length === 0) return <div style={{ height }} />;

  return (
    <div className="w-28" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
