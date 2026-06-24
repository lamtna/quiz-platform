import { useEffect, useState } from "react";

export default function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data.data || []));
  }, []);

  return (
    <div className="p-10 bg-black text-white min-h-screen">

      <h1 className="text-3xl mb-6">Categories</h1>

      {categories.map((c) => (
        <div key={c._id} className="bg-white/10 p-4 rounded mb-3">
          {c.name}
        </div>
      ))}

    </div>
  );
}