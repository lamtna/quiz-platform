export default function MediaViewer({ media }) {
  if (!media) return null;

  const { type, url } = media;

  // 🖼 IMAGE
  if (type === "image") {
    return (
      <div className="mt-6">
        <img
          src={url}
          alt="question media"
          className="rounded-2xl max-h-[400px] object-cover"
        />
      </div>
    );
  }

  // 🎥 VIDEO (YouTube or direct mp4)
  if (type === "video") {
    return (
      <div className="mt-6">
        <video
          controls
          className="rounded-2xl w-full max-h-[400px]"
          src={url}
        />
      </div>
    );
  }

  // 🔊 AUDIO
  if (type === "audio") {
    return (
      <div className="mt-6">
        <audio controls className="w-full">
          <source src={url} />
        </audio>
      </div>
    );
  }

  return null;
}