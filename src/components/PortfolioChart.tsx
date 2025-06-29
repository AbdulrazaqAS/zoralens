import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#6366f1",
  "#facc15",
  "#34d399",
  "#f472b6",
  "#60a5fa",
  "#a78bfa",
];

type CoinSlice = {
  name: string;
  value: number;
};

export default function PortfolioChart({ coins }: { coins: CoinSlice[] }) {
  const filtered = coins.filter((c) => c.value > 0);
  const total = filtered.reduce((sum, c) => sum + c.value, 0);

  const data = filtered.map((c) => ({
    ...c,
    percent: ((c.value / total) * 100).toFixed(2),
  }));

  return (
    <div className="w-full mx-auto mb-8">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={120}
            innerRadius={60}

            // label={({ name, percent }) => `${name} (${percent}%)`}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: any) => `${v.toFixed(4)} USD`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
