export default function GameActions({ onHome, onReplay }) {
  return (
    <div className="flex gap-6">

      <button
        onClick={onHome}
        className="px-6 py-3 bg-white text-black rounded-xl"
      >
        End Game
      </button>

      <button
        onClick={onReplay}
        className="px-6 py-3 bg-blue-600 rounded-xl"
      >
        Play Again
      </button>

    </div>
  );
}