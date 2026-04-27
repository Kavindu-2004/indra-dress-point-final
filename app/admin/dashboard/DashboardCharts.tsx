"use client";

import {
  BarChart,
  Bar,
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
import { ChevronDown } from "lucide-react";

type SalesPoint = {
  label: string;
  sales: number;
};

type OrdersPoint = {
  label: string;
  orders: number;
};

type TopProductPoint = {
  name: string;
  value: number;
};

type Props = {
  salesData: SalesPoint[];
  ordersData: OrdersPoint[];
  topProducts: TopProductPoint[];
};

const PIE_COLORS = ["#5B5CE2", "#7C83FD", "#60A5FA", "#34D399", "#F59E0B"];

function ChartCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b">
        <h2 className="text-[20px] font-semibold text-black">{title}</h2>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FilterButton({ label = "Monthly" }: { label?: string }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm bg-white hover:bg-gray-50">
      {label}
      <ChevronDown className="w-4 h-4" />
    </button>
  );
}

export default function DashboardCharts({
  salesData,
  ordersData,
  topProducts,
}: Props) {
  const safeTopProducts =
    topProducts?.length > 0 ? topProducts : [{ name: "No Data", value: 1 }];

  return (
    <div className="space-y-6">
      <ChartCard title="Sales" action={<FilterButton label="Monthly" />}>
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="sales" radius={[8, 8, 0, 0]} fill="#5B5CE2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Orders" action={<FilterButton label="Monthly" />}>
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ordersData}>
              <CartesianGrid vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="orders" radius={[8, 8, 0, 0]} fill="#5B5CE2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Top Products" action={<FilterButton label="This Month" />}>
        <div className="h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={safeTopProducts}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={130}
                innerRadius={0}
                paddingAngle={2}
              >
                {safeTopProducts.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}