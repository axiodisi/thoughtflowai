"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [input, setInput] = useState("");

  return (
    <div className="min-h-screen bg-black">
      {/* Gradient background effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-orange-500/10" />

      {/* Main content */}
      <main className="relative min-h-screen p-6 flex flex-col">
        {/* Header with large gradient text */}
        <h1 className="text-3xl font-medium bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 inline-block text-transparent bg-clip-text pb-6">
          Thought Refiner
        </h1>

        <div className="bg-zinc-900/50 backdrop-blur-lg rounded-2xl p-4 flex gap-3 border border-zinc-800/50 mb-6">
          <AlertCircle className="h-5 w-5 shrink-0 text-orange-500" />
          <p className="text-sm text-zinc-300">
            Your input is processed securely and not stored. Feel free to
            express yourself freely.
          </p>
        </div>

        {/* Main textarea area - fills available space */}
        <div className="flex-1 relative mb-6">
          <textarea
            placeholder="Get it all out... Type (or paste) your raw thoughts here. Don't worry about formatting or clarity - just let it flow."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="absolute inset-0 rounded-2xl bg-zinc-900/50 backdrop-blur-lg p-6 text-lg text-zinc-200 placeholder:text-zinc-500 focus:outline-none border border-zinc-800/50 resize-none"
          />
        </div>

        {/* Action buttons - large and easily tappable */}
        <div className="grid grid-cols-2 gap-4 pb-6">
          <button
            type="button"
            className="h-16 flex items-center justify-center gap-2 bg-zinc-900/50 backdrop-blur-lg rounded-2xl text-white text-lg border border-zinc-800/50 transition-all active:scale-95"
          >
            🎤 Record
          </button>

          <button
            type="submit"
            className="h-16 flex items-center justify-center gap-2 rounded-2xl text-lg transition-all active:scale-95 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 relative overflow-hidden"
          >
            <span className="relative z-10">Refine</span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 opacity-0 hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </main>
    </div>
  );
}
