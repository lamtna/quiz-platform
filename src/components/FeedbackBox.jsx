import { useState } from "react";

export default function FeedbackBox() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!message) return;

    // هنا لاحقاً نربطه API
    console.log({ name, message });

    setSent(true);
    setMessage("");
    setName("");
  };

  return (
    <div className="bg-white/10 p-6 rounded-2xl">

      <h2 className="text-xl mb-4">💡 Suggestions</h2>

      <input
        placeholder="Nickname (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 mb-3 rounded bg-black text-white"
        maxLength={20}
      />

      <textarea
        placeholder="Your feedback (max 100 chars)"
        value={message}
        maxLength={100}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-2 rounded bg-black text-white"
      />

      <button
        onClick={submit}
        className="mt-3 px-4 py-2 bg-green-600 rounded-xl"
      >
        Send
      </button>

      {sent && (
        <p className="text-green-400 mt-2">Thanks for your feedback!</p>
      )}

    </div>
  );
}