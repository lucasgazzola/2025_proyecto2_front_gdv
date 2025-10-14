import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import type { Invoice } from "@/types/Invoice";

type Props = {
  recentInvoices: Invoice[];
  pieData: { name: string; value: number }[];
};

export default function DashboardCharts({ recentInvoices, pieData }: Props) {
  return (
    <div className="lg:col-span-2">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Ventas recientes</CardTitle>
          <CardDescription>
            Ventas totales por día (últimos 14 días)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={(() => {
                  if (recentInvoices.length === 0) return [];
                  const map = new Map<string, number>();
                  const now = new Date();
                  for (let i = 13; i >= 0; i--) {
                    const date = new Date(
                      now.getFullYear(),
                      now.getMonth(),
                      now.getDate() - i
                    );
                    const dateKey = date.toISOString().split("T")[0];
                    map.set(dateKey, 0);
                  }
                  recentInvoices.forEach((inv) => {
                    if (!inv.createdAt) return;
                    const date = new Date(inv.createdAt);
                    const dateKey = date.toISOString().split("T")[0];
                    if (map.has(dateKey))
                      map.set(
                        dateKey,
                        (map.get(dateKey) || 0) + inv.priceTotal
                      );
                  });
                  return Array.from(map.entries()).map(([date, total]) => ({
                    date,
                    total,
                  }));
                })()}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ee" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 md:grid-cols-2 gap-4">
            <div className="">
              <Card>
                <CardHeader>
                  <CardTitle>Productos por marca</CardTitle>
                  <CardDescription>Distribución de productos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={70}
                          innerRadius={30}
                          fill="#8884d8"
                        >
                          {pieData.map((_, idx) => {
                            const colors = [
                              "#60a5fa",
                              "#34d399",
                              "#f97316",
                              "#a78bfa",
                              "#f472b6",
                            ];
                            return (
                              <Cell
                                key={`cell-${idx}`}
                                fill={colors[idx % colors.length]}
                              />
                            );
                          })}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => `${value} productos`}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
