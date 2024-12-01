import React, { useState, useEffect } from "react";
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
  const [touchTimeout, setTouchTimeout] = useState<NodeJS.Timeout | null>(null);

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

    // Cleanup
    return () => {
      if (touchTimeout) {
        clearTimeout(touchTimeout);
      }
    };
  }, []);

  const startRecording = async () => {
    if (!recognition || isRecording) return;

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

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const timeout = setTimeout(() => {
      startRecording();
    }, 200);
    setTouchTimeout(timeout);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchTimeout) {
      clearTimeout(touchTimeout);
      setTouchTimeout(null);
    }
    stopRecording();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchTimeout) {
      clearTimeout(touchTimeout);
      setTouchTimeout(null);
    }
    stopRecording();
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
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchCancel={handleTouchEnd}
        variant={isRecording ? "destructive" : "default"}
        size="default"
        className="touch-none select-none w-full h-16"
      >
        <Mic className={`mr-2 h-4 w-4 ${isRecording ? "animate-pulse" : ""}`} />
        {isRecording ? "Recording..." : "Hold to Record"}
      </Button>
    </div>
  );
};
