import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function DifficultyChart({ data }) {
  const formatted = data.map((d) => ({
    difficulty: d._id,
    total: d.total,
  }));

  return (
    <div className="bg-white/10 p-5 rounded-xl">
      <h2 className="mb-4 text-lg">Questions by Difficulty</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formatted}>
          <XAxis dataKey="difficulty" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}