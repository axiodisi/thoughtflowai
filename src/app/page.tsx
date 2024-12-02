"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { VoiceInput } from "@/components/ui/voice-input";

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
    <div className="fixed inset-0 bg-black">
      <div className="fixed inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-orange-500/20" />

      <main
        className="fixed inset-0 flex flex-col p-6"
        style={{ paddingBottom: "10vh" }}
      >
        <div className="w-[90%] mx-auto flex flex-col h-full">
          <h1 className="text-6xl font-medium bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 inline-block text-transparent bg-clip-text mb-8">
            Refine Your Thoughts
          </h1>

          <div className="bg-zinc-900/80 rounded-2xl p-6 flex gap-4 border border-zinc-800 shadow-[0_8px_32px_-4px_rgba(255,0,255,0.2)] mb-6">
            <AlertCircle className="h-6 w-6 shrink-0 text-orange-500" />
            <p className="text-lg text-zinc-200">
              Your input is processed securely and not stored. Feel free to
              express yourself freely.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <textarea
              placeholder="When you have a lot on your mind and need help expressing it clearly - type, paste, or speak your thoughts here. The more you share, the better we can help refine your message. Perfect for turning complex thoughts into clear communication."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-[25vh] rounded-2xl bg-zinc-900/80 p-4 text-xl text-zinc-200 placeholder:text-zinc-500 focus:outline-none border border-zinc-800 shadow-[0_8px_32px_-4px_rgba(255,0,255,0.2)] mb-4"
            />

            {refinedText && (
              <div className="h-[25vh] rounded-2xl bg-zinc-900/80 p-4 text-base text-zinc-200 border border-zinc-800 shadow-[0_8px_32px_-4px_rgba(255,0,255,0.2)] mb-8">
                <h3 className="text-2xl font-medium bg-gradient-to-r from-pink-500 to-purple-500 inline-block text-transparent bg-clip-text mb-3">
                  Refined Version:
                </h3>
                <p className="text-lg text-zinc-200">{refinedText}</p>
              </div>
            )}

            <div className="flex gap-4 mt-auto">
              <div className="flex-1 h-32">
                <VoiceInput onTranscriptUpdate={setInput} />
              </div>

              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className="flex-1 h-32 flex items-center justify-center gap-3 rounded-2xl text-2xl font-medium text-white bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 shadow-[0_8px_32px_-4px_rgba(255,0,255,0.2)] hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isProcessing ? "Refining..." : "Refine"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
