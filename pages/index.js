import { useState } from 'react';

export default function Journal() {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const minWords = 60;

  const handleSubmit = async () => {
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount < minWords) {
      alert(`Please write at least ${minWords} words.`);
      return;
    }

    const r = await fetch('/api/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry: text }),
    });

    if (!r.ok) {
      alert('Failed to unlock — check logs in Vercel');
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return <div className="p-8 text-xl">✅ You’re unlocked for the day!</div>;
  }

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl mb-4">Daily FT Journal</h1>
      <textarea
        className="w-full h-40 p-2 border rounded"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your summary..."
      />
      <button
        className="mt-4 p-2 bg-blue-600 text-white rounded"
        onClick={handleSubmit}
      >
        Submit & Unlock
      </button>
    </div>
  );
}
