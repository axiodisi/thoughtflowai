"use client";

import { useState } from "react";
import { AlertCircle, Send, Loader2 } from "lucide-react";
import { VoiceInput } from "@/components/ui/voice-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="min-h-screen bg-black p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-zinc-900 rounded-3xl border border-zinc-800 shadow-[0_8px_32px_-4px_rgba(255,0,255,0.1)] flex flex-col min-h-[80vh]">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-2xl font-medium bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 inline-block text-transparent bg-clip-text">
            Thought Refiner
          </h1>
        </div>

        <div className="flex flex-col flex-1 p-6 space-y-6">
          <div className="bg-zinc-800/50 rounded-2xl p-4 flex gap-3 border border-zinc-700/30">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-orange-500" />
            <p className="text-sm text-zinc-300">
              Your input is processed securely and not stored. Feel free to
              express yourself freely.
            </p>
          </div>

          {refinedText && (
            <div className="bg-zinc-800/50 rounded-2xl p-4 border border-zinc-700/30">
              <h3 className="text-lg font-medium mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                Refined Version:
              </h3>
              <p className="text-zinc-300 leading-relaxed">{refinedText}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <textarea
              placeholder="Get it all out... Type (or paste) your raw thoughts here. Don't worry about formatting or clarity - just let it flow."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 w-full min-h-[160px] rounded-2xl bg-zinc-800/50 border border-zinc-700/30 p-4 text-base text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 transition-all"
            />

            <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700/30 mt-4">
              <h3 className="text-sm font-medium text-zinc-400 mb-3">
                Or use voice input:
              </h3>
              <VoiceInput onTranscriptUpdate={setInput} />
            </div>

            <div className="sticky bottom-0 left-0 right-0 flex gap-4 mt-4">
              <Button
                type="submit"
                className="flex-1 h-14 text-lg bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:opacity-90"
                disabled={!input.trim() || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Refining
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Refine
                  </>
                )}
              </Button>
            </div>
          </form>

          {error && (
            <Alert>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
