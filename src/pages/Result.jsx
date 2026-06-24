import { useNavigate } from "react-router-dom";
import GameActions from "../components/GameActions";
import FeedbackBox from "../components/FeedbackBox";

export default function Result({ result }) {
  const navigate = useNavigate();

  const winner =
    result?.score?.teamA > result?.score?.teamB
      ? "Team 1"
      : result?.score?.teamB > result?.score?.teamA
      ? "Team 2"
      : "Draw";

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10">

      <h1 className="text-5xl font-bold mb-6">🏁 Game Finished</h1>

      {/* SCORE */}
      <div className="flex gap-10 text-2xl mb-6">
        <div>Team 1: {result?.score?.teamA}</div>
        <div>Team 2: {result?.score?.teamB}</div>
      </div>

      {/* WINNER */}
      <div className="text-3xl text-green-400 mb-10">
        Winner: {winner}
      </div>

      {/* ACTIONS */}
      <GameActions
        onHome={() => navigate("/")}
        onReplay={() => window.location.reload()}
      />

      {/* FEEDBACK */}
      <div className="mt-10 w-full max-w-md">
        <FeedbackBox />
      </div>

    </div>
  );
}