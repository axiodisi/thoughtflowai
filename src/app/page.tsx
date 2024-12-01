"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [input, setInput] = useState("");
  const [refinedText, setRefinedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRefinedText(data.refined);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-orange-500/20" />

      <main className="fixed inset-0 flex flex-col px-8 pt-8 pb-4">
        <h1 className="text-4xl font-medium bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 inline-block text-transparent bg-clip-text mb-4">
          Thought Refiner
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="bg-zinc-900/80 rounded-2xl p-4 flex gap-4 border border-zinc-800 shadow-[0_8px_32px_-4px_rgba(255,0,255,0.2)] mb-4">
            <AlertCircle className="h-6 w-6 shrink-0 text-orange-500" />
            <p className="text-base text-zinc-200">
              Your input is processed securely and not stored. Feel free to
              express yourself freely.
            </p>
          </div>

          <div className="w-full h-[25vh] mb-4">
            <textarea
              placeholder="Get it all out... Type (or paste) your raw thoughts here. Don't worry about formatting or clarity - just let it flow."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-full rounded-2xl bg-zinc-900/80 p-4 text-base text-zinc-200 placeholder:text-zinc-500 focus:outline-none border border-zinc-800 shadow-[0_8px_32px_-4px_rgba(255,0,255,0.2)]"
            />
          </div>

          {refinedText && (
            <div className="w-full h-[25vh] mb-4">
              <div className="h-full rounded-2xl bg-zinc-900/80 p-4 text-base text-zinc-200 border border-zinc-800 shadow-[0_8px_32px_-4px_rgba(255,0,255,0.2)]">
                <h3 className="text-xl font-medium bg-gradient-to-r from-pink-500 to-purple-500 inline-block text-transparent bg-clip-text mb-2">
                  Refined Version:
                </h3>
                <p className="text-zinc-200">{refinedText}</p>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-auto -mb-[2vh]">
            <button
              type="button"
              className="flex-1 h-36 flex items-center justify-center gap-2 bg-white rounded-2xl text-black text-2xl font-medium"
            >
              🎤 Record
            </button>

            <button
              type="submit"
              disabled={!input.trim() || isProcessing}
              className="flex-1 h-36 flex items-center justify-center gap-3 rounded-2xl text-2xl font-medium text-white bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 shadow-[0_8px_32px_-4px_rgba(255,0,255,0.2)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isProcessing ? "Refining..." : "Refine"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
