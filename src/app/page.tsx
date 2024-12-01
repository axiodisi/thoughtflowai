"use client";

import { useState } from "react";
import { AlertCircle, Loader2, Send } from "lucide-react";
import { VoiceInput } from "@/components/ui/voice-input";

export default function Home() {
  const [input, setInput] = useState("");
  const [refinedText, setRefinedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    setError("");

    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to process text");

      setRefinedText(data.refined);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setInput((prevInput) => {
      // If there's existing input, add a space before the new text
      const separator = prevInput.trim() ? " " : "";
      return prevInput + separator + text;
    });
  };

  return (
    <div className="min-h-screen bg-black p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-zinc-900 rounded-3xl border border-zinc-800 shadow-[0_8px_32px_-4px_rgba(255,0,255,0.1)]">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-2xl font-medium bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 inline-block text-transparent bg-clip-text">
            Thought Refiner
          </h1>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-zinc-800/50 rounded-2xl p-4 flex gap-3 border border-zinc-700/30">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-orange-500" />
            <p className="text-sm text-zinc-300">
              Your input is processed securely and not stored. Feel free to
              express yourself freely.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <textarea
                placeholder="Get it all out... Type (or paste) your raw thoughts here. Don't worry about formatting or clarity - just let it flow."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full min-h-[160px] rounded-2xl bg-zinc-800/50 border border-zinc-700/30 p-4 text-base text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all"
              />

              <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/30">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">
                  Or use voice input:
                </h3>
                <VoiceInput onTranscriptComplete={handleVoiceTranscript} />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className="group flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:pointer-events-none transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Refining</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    <span>Refine</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-zinc-800/50 text-pink-400 rounded-2xl p-4 flex gap-3 border border-zinc-700/30">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {refinedText && (
            <div className="bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700/30">
              <h3 className="text-lg font-medium mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                Refined Version:
              </h3>
              <p className="text-zinc-300 leading-relaxed">{refinedText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
