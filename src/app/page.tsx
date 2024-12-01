"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [input, setInput] = useState("");

  return (
    <div className="fixed inset-0 bg-black">
      {/* Stronger gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-orange-500/20" />

      {/* Main content - fixed height, no scrolling */}
      <main className="fixed inset-0 flex flex-col p-8">
        {/* Header */}
        <h1 className="text-4xl md:text-3xl font-medium bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 inline-block text-transparent bg-clip-text mb-8">
          Thought Refiner
        </h1>

        {/* Security notice with better contrast */}
        <div className="bg-zinc-900/80 rounded-2xl p-6 flex gap-4 border border-zinc-800 shadow-[0_8px_32px_-4px_rgba(255,0,255,0.2)] mb-8">
          <AlertCircle className="h-6 w-6 shrink-0 text-orange-500" />
          <p className="text-lg md:text-base text-zinc-200">
            Your input is processed securely and not stored. Feel free to
            express yourself freely.
          </p>
        </div>

        {/* Textarea container - flex-grow to fill space */}
        <div className="flex-1 mb-8">
          <textarea
            placeholder="Get it all out... Type (or paste) your raw thoughts here. Don't worry about formatting or clarity - just let it flow."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-full rounded-2xl bg-zinc-900/80 p-6 text-xl md:text-base text-zinc-200 placeholder:text-zinc-500 focus:outline-none border border-zinc-800 shadow-[0_8px_32px_-4px_rgba(255,0,255,0.2)]"
          />
        </div>

        {/* Buttons - always visible at bottom */}
        <div className="grid grid-cols-2 gap-6">
          <button
            type="button"
            className="h-20 md:h-16 flex items-center justify-center gap-3 bg-white rounded-2xl text-black text-2xl md:text-lg font-medium shadow-[0_8px_32px_-4px_rgba(255,255,255,0.2)] hover:opacity-90 transition-opacity"
          >
            🎤 Record
          </button>

          <button
            type="submit"
            className="h-20 md:h-16 flex items-center justify-center gap-3 rounded-2xl text-2xl md:text-lg font-medium text-white bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 shadow-[0_8px_32px_-4px_rgba(255,0,255,0.2)] hover:opacity-90 transition-opacity"
          >
            Refine
          </button>
        </div>
      </main>
    </div>
  );
}
