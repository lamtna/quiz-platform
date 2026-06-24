import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="h-screen w-64 bg-black text-white p-6">

      <h1 className="text-2xl font-bold mb-10">Admin Panel</h1>

      <div className="flex flex-col gap-4">

        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/questions">Questions</Link>
        <Link to="/admin/categories">Categories</Link>
        <Link to="/admin/games">Games</Link>

      </div>

    </div>
  );
}