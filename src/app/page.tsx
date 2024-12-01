"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [input, setInput] = useState("");

  return (
    <div className="min-h-screen bg-black p-4 flex items-center justify-center">
      <div className="w-full max-w-md md:max-w-md bg-zinc-900 rounded-3xl border border-zinc-800 shadow-[0_8px_32px_-4px_rgba(255,0,255,0.1)] min-h-[75vh] md:min-h-fit">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-2xl font-medium bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 inline-block text-transparent bg-clip-text">
            Thought Refiner
          </h1>
        </div>

        <form className="p-6 flex flex-col h-[calc(100%-5rem)] justify-between">
          <div className="space-y-4 flex-1">
            <div className="bg-zinc-800/50 rounded-xl p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-orange-500" />
              <p className="text-sm text-zinc-300">
                Your input is processed securely and not stored. Feel free to
                express yourself freely.
              </p>
            </div>

            <textarea
              placeholder="Get it all out... Type (or paste) your raw thoughts here. Don't worry about formatting or clarity - just let it flow."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-[calc(100%-4rem)] rounded-xl bg-zinc-800/50 p-4 text-zinc-200 placeholder:text-zinc-500 focus:outline-none border-0"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              type="button"
              className="flex-1 h-12 md:h-12 flex items-center justify-center gap-2 bg-white rounded-xl text-black"
            >
              🎤 Record
            </button>

            <button
              type="submit"
              className="flex-1 h-12 md:h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white"
            >
              Refine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
