import { useNavigate } from "react-router-dom";

export default function QuestionPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 text-white">

      <h1 className="text-2xl mb-4">السؤال</h1>

      {/* السؤال */}
      <div className="bg-gray-800 p-4 rounded">
        <p>هنا نص السؤال</p>

        {/* صورة / فيديو / صوت */}
        <div className="mt-4">
          <img src="IMAGE_URL" alt="" />
          <video src="VIDEO_URL" controls />
          <audio src="AUDIO_URL" controls />
        </div>
      </div>

      {/* زر الانتقال */}
      <button
        onClick={() => navigate("/answer")}
        className="mt-6 bg-blue-600 px-4 py-2 rounded"
      >
        إظهار الجواب
      </button>

    </div>
  );
}