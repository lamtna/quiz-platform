import { useState } from "react";

export default function AnswerPage() {
  const [result, setResult] = useState(null);

  return (
    <div className="p-6 text-white">

      <h1 className="text-2xl mb-4">صفحة الإجابة</h1>

      {/* الجواب */}
      <div className="bg-gray-800 p-4 rounded">
        <p>الإجابة الصحيحة: هنا</p>
      </div>

      {/* الأزرار */}
      <div className="mt-6 flex gap-4">

        <button
          onClick={() => setResult("teamA")}
          className="bg-green-600 px-4 py-2 rounded"
        >
          فريق 1 جاوب
        </button>

        <button
          onClick={() => setResult("teamB")}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          فريق 2 جاوب
        </button>

        <button
          onClick={() => setResult("none")}
          className="bg-gray-600 px-4 py-2 rounded"
        >
          ولا أحد
        </button>

      </div>

      {/* عرض النتيجة */}
      {result && (
        <div className="mt-6">
          اخترت: {result}
        </div>
      )}

    </div>
  );
}