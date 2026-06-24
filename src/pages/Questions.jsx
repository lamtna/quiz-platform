import { useEffect, useState } from "react";

export default function Questions() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/questions")
      .then(res => res.json())
      .then(data => setQuestions(data.data || []));
  }, []);

  return (
    <div className="p-10 bg-black text-white min-h-screen">

      <h1 className="text-3xl mb-6">Questions</h1>

      {questions.map((q) => (
        <div key={q._id} className="bg-white/10 p-4 rounded mb-3">

          <p>{q.text}</p>

          <p className="text-gray-400 text-sm">
            {q.category} | {q.difficulty}
          </p>

        </div>
      ))}

    </div>
  );
}