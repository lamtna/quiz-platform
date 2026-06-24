import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export default function TopCategoriesChart({ data }) {
  const formatted = data.map((c) => ({
    category: c._id,
    total: c.totalQuestions,
  }));

  return (
    <div className="bg-white/10 p-5 rounded-xl">
      <h2 className="mb-4 text-lg">Top Categories</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formatted} layout="vertical">
          <XAxis type="number" />
          <YAxis dataKey="category" type="category" />
          <Tooltip />
          <Bar dataKey="total" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}