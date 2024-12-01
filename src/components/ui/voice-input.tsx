import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VoiceInputProps {
  onTranscriptUpdate: (text: string) => void;
}

export const VoiceInput = ({ onTranscriptUpdate }: VoiceInputProps) => {
  const [error, setError] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [fullTranscript, setFullTranscript] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      const SpeechRecognition =
        window.webkitSpeechRecognition || window.SpeechRecognition;
      if (!SpeechRecognition) {
        setError("Speech recognition not supported");
        return;
      }

      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const newTranscript = fullTranscript + " " + transcript;
        setFullTranscript(newTranscript.trim());
        onTranscriptUpdate(newTranscript.trim());
      };

      recognitionInstance.onerror = (event: any) => {
        if (event.error !== "no-speech") {
          setError(`Microphone error: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    } catch (err) {
      setError("Failed to initialize speech recognition");
    }
  }, []);

  const startRecording = async () => {
    if (!recognition) return;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      recognition.start();
      setIsRecording(true);
      setError("");
    } catch (err) {
      setError("Microphone permission denied");
    }
  };

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  // Touch event handlers
  const handleTouchStart = async (e: React.TouchEvent) => {
    e.preventDefault();
    await startRecording();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    stopRecording();
  };

  // Mouse event handlers for desktop
  const handleMouseDown = async (e: React.MouseEvent) => {
    e.preventDefault();
    await startRecording();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    stopRecording();
  };

  // Handle case where mouse/touch leaves button while recording
  const handleMouseLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    }
  };

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-zinc-400">Press and hold to record</p>
      <Button
        ref={buttonRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        variant={isRecording ? "destructive" : "default"}
        size="default"
        className="touch-none select-none"
      >
        <Mic className={`mr-2 h-4 w-4 ${isRecording ? "animate-pulse" : ""}`} />
        {isRecording ? "Recording..." : "Hold to Record"}
      </Button>
    </div>
  );
};
