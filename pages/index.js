import { useState } from "react";

export default function Journal() {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [profileId, setProfileId] = useState("");
  const minWords = 60;

  const handleSubmit = async () => {
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < minWords) {
      alert(`Please write at least ${minWords} words.`);
      return;
    }

    const res = await fetch("/api/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry: text }),
    });

    if (!res.ok) {
      alert("Failed to generate unlocked profile ID — check Vercel logs.");
      return;
    }

    const data = await res.json();
    setProfileId(data.profileId);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg w-full text-center">
          <h2 className="text-2xl font-semibold mb-4 text-green-600">
            ✅ Journal submitted!
          </h2>
          <p className="mb-6 text-gray-700">
            Use this profile ID in the NextDNS app to unlock for today:
          </p>
          <div className="bg-gray-100 p-4 rounded-lg font-mono text-lg text-gray-800 break-all">
            {profileId}
          </div>
          <p className="mt-6 text-gray-500 text-sm">
            Your phone will automatically revert to the locked profile at midnight.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Daily FT Journal</h1>
        <textarea
          className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none text-gray-700"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your 60+ word summary..."
        />
        <button
          className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          onClick={handleSubmit}
        >
          Submit & Get Profile ID
        </button>
      </div>
    </div>
  );
}
