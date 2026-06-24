export default function Dashboard() {
  return (
    <div className="p-10 text-white bg-black min-h-screen">

      <h1 className="text-3xl mb-10">📊 Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white/10 p-6 rounded-xl">
          <h2>Total Questions</h2>
          <p className="text-2xl">120</p>
        </div>

        <div className="bg-white/10 p-6 rounded-xl">
          <h2>Active Games</h2>
          <p className="text-2xl">5</p>
        </div>

        <div className="bg-white/10 p-6 rounded-xl">
          <h2>Categories</h2>
          <p className="text-2xl">8</p>
        </div>

      </div>

    </div>
  );
}