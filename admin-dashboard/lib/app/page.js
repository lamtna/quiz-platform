"use client";

import { useEffect, useState } from "react";
import API from "../lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get("/admin/stats");
      setData(res.data.data);
    } catch (err) {
      console.log("Dashboard error:", err);
    }
  };

  if (!data) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Loading Admin Dashboard...
      </div>
    );
  }

  const COLORS = ["#4f46e5", "#22c55e", "#f97316", "#ef4444"];

  return (
    <div className="p-10 space-y-10 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* STATS CARDS */}
      <div className="grid grid-cols-3 gap-6">
        <Card title="Users" value={data.stats.users} />
        <Card title="Categories" value={data.stats.categories} />
        <Card title="Questions" value={data.stats.questions.total} />
        <Card title="Games" value={data.stats.games.total} />
        <Card title="Active Games" value={data.stats.games.active} />
        <Card title="Finished Games" value={data.stats.games.finished} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-10">

        {/* PIE CHART */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="mb-4 font-bold">Games Status</h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Active", value: data.stats.games.active },
                  { name: "Finished", value: data.stats.games.finished },
                ]}
                dataKey="value"
                outerRadius={100}
              >
                <Cell fill="#4f46e5" />
                <Cell fill="#22c55e" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="mb-4 font-bold">Questions by Difficulty</h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.questionsByDifficulty}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT GAMES */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="mb-4 font-bold">Recent Games</h2>

        <div className="space-y-2">
          {data.recentGames.map((g) => (
            <div
              key={g._id}
              className="flex justify-between border-b py-2 text-sm"
            >
              <span>{g.gameName}</span>
              <span className="text-gray-500">{g.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────── CARD ───────────── */
function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}