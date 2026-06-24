import { useEffect, useState } from "react";

import {
  onNewQuestion,
  onScoreUpdated,
  onAnswerResult,
  onGameFinished,
  removeAllListeners,
  joinGameRoom,
} from "../socket/events";

export default function Game({ gameId }) {
  const [screen, setScreen] = useState("lobby");
  // lobby | question | answer | result

  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState({ teamA: 0, teamB: 0 });
  const [result, setResult] = useState(null);

  const [lastAnswer, setLastAnswer] = useState(null);

  // ─────────────────────────────
  // 🔌 SOCKET CONNECTION
  // ─────────────────────────────
  useEffect(() => {
    if (!gameId) return;

    joinGameRoom(gameId);

    // ❓ New Question
    onNewQuestion((data) => {
      setQuestion(data.question);
      setScreen("question");
      setResult(null);
    });

    // 📊 Score update
    onScoreUpdated((data) => {
      setScore(data.score);
    });

    // 🎯 Answer result
    onAnswerResult((data) => {
      setLastAnswer(data);
      setResult(data);
      setScreen("answer");
    });

    // 🏁 Game finished
    onGameFinished((data) => {
      setResult(data);
      setScreen("result");
    });

    return () => {
      removeAllListeners();
    };
  }, [gameId]);

  // ─────────────────────────────
  // 🎮 QUESTION SCREEN
  // ─────────────────────────────
  if (screen === "question") {
    return (
      <div className="h-screen bg-black text-white p-10 flex flex-col">
        
        <h2 className="text-3xl mb-6">Question</h2>

        <div className="bg-white/10 p-10 rounded-2xl text-xl">
          {question?.text}
        </div>

        <div className="mt-10 flex gap-10 text-lg">
          <div>Team A: {score.teamA}</div>
          <div>Team B: {score.teamB}</div>
        </div>

        <button
          className="mt-10 px-6 py-3 bg-white text-black rounded-xl w-fit"
          onClick={() => setScreen("answer")}
        >
          Show Answer Screen
        </button>
      </div>
    );
  }

  // ─────────────────────────────
  // 🎯 ANSWER SCREEN
  // ─────────────────────────────
  if (screen === "answer") {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center">

        <h2 className="text-3xl mb-6">Answer Result</h2>

        <p className="text-2xl">
          {result?.isCorrect ? "✅ Correct" : "❌ Wrong"}
        </p>

        <p className="mt-4 text-gray-400">
          Correct Answer: {result?.correctAnswer}
        </p>

        <div className="mt-6 flex gap-10">
          <div>Team A: {score.teamA}</div>
          <div>Team B: {score.teamB}</div>
        </div>

        <button
          className="mt-10 px-6 py-3 bg-white text-black rounded-xl"
          onClick={() => setScreen("question")}
        >
          Next Question
        </button>
      </div>
    );
  }

  // ─────────────────────────────
  // 🏁 RESULT SCREEN
  // ─────────────────────────────
  if (screen === "result") {
    const winner =
      score.teamA > score.teamB
        ? "Team A"
        : score.teamB > score.teamA
        ? "Team B"
        : "Tie";

    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center">

        <h1 className="text-4xl mb-6">🏆 Game Finished</h1>

        <p className="text-2xl mb-4">Winner: {winner}</p>

        <div className="flex gap-10 text-xl mb-10">
          <div>Team A: {score.teamA}</div>
          <div>Team B: {score.teamB}</div>
        </div>

        <button
          className="px-6 py-3 bg-white text-black rounded-xl"
          onClick={() => window.location.href = "/"}
        >
          Back to Home
        </button>
      </div>
    );
  }

  // ─────────────────────────────
  // 🕐 LOBBY
  // ─────────────────────────────
  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <h1>Waiting for game to start...</h1>
    </div>
  );
}