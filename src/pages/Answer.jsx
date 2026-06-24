import { useState } from "react";

export default function Answer({ gameId, questionId }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const submitResult = async (team) => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/games/submit-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId,
          questionId,
          answer: "", // الحكم ما يحتاج إجابة هنا
          team, // teamA | teamB | null
        }),
      });

      const data = await res.json();
      setResult(data.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col items-center justify-center p-10">

      <h1 className="text-3xl mb-10">Answer Review</h1>

      {/* RESULT */}
      {result && (
        <div className="mb-10 text-center">
          <p className="text-xl">
            {result.isCorrect ? "✅ Correct Answer" : "❌ Wrong Answer"}
          </p>

          <p className="text-gray-400 mt-2">
            Correct: {result.correctAnswer}
          </p>

          <p className="mt-2">
            Score: {result.score.teamA} - {result.score.teamB}
          </p>
        </div>
      )}

      {/* BUTTONS */}
      <div className="flex gap-6">

        <button
          disabled={loading}
          onClick={() => submitResult("teamA")}
          className="px-6 py-3 bg-blue-600 rounded-xl"
        >
          Team 1 Answered
        </button>

        <button
          disabled={loading}
          onClick={() => submitResult("teamB")}
          className="px-6 py-3 bg-red-600 rounded-xl"
        >
          Team 2 Answered
        </button>

        <button
          disabled={loading}
          onClick={() => submitResult(null)}
          className="px-6 py-3 bg-gray-600 rounded-xl"
        >
          No Answer
        </button>

      </div>
    </div>
  );
}