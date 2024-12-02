// components/access-code-dialog.tsx
import React, { useEffect, useState } from "react";

interface AccessCodeDialogProps {
  onCodeSubmit: (code: string) => void;
}

export const AccessCodeDialog = ({ onCodeSubmit }: AccessCodeDialogProps) => {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    const savedCode = localStorage.getItem("thoughtflow-code");
    if (!savedCode) {
      setOpen(true);
    } else {
      onCodeSubmit(savedCode);
    }
  }, [onCodeSubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("thoughtflow-code", code);
    onCodeSubmit(code);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-medium bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 inline-block text-transparent bg-clip-text mb-3">
          Enter Your Clarity Key
        </h2>
        <p className="text-zinc-300 text-lg mb-6">
          Join us in making communication clearer, one thought at a time.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter your key..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Begin Your Journey
          </button>
        </form>
      </div>
    </div>
  );
};
