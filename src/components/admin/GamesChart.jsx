import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function GamesChart({ active, finished }) {
  const data = [
    { name: "Active", value: active },
    { name: "Finished", value: finished },
  ];

  return (
    <div className="bg-white/10 p-5 rounded-xl">
      <h2 className="mb-4 text-lg">Games Status</h2>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={100}>
            {data.map((_, i) => (
              <Cell key={i} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}