import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

type SpeechRecognitionType = SpeechRecognition | webkitSpeechRecognition;

interface VoiceInputProps {
  onTranscriptComplete: (text: string) => void;
}

export const VoiceInput = ({ onTranscriptComplete }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string>("");
  const [recognition, setRecognition] = useState<SpeechRecognitionType | null>(
    null
  );
  const [fullTranscript, setFullTranscript] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognitionInstance = new SpeechRecognition();
          recognitionInstance.continuous = true;
          recognitionInstance.interimResults = false;

          recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
            const transcript =
              event.results[event.results.length - 1][0].transcript;
            setFullTranscript((prev) => prev + " " + transcript);
          };

          recognitionInstance.onerror = (
            event: SpeechRecognitionErrorEvent
          ) => {
            setError("Microphone error: " + event.error);
            setIsRecording(false);
          };

          setRecognition(recognitionInstance);
        } catch (err) {
          setError("Failed to initialize speech recognition");
        }
      } else {
        setError("Speech recognition is not supported in your browser");
      }
    }
  }, [isRecording]);

  const toggleRecording = async () => {
    if (!recognition) return;

    if (!isRecording) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setFullTranscript("");
        recognition.start();
        setIsRecording(true);
        setError("");
      } catch (err) {
        setError("Microphone permission denied");
      }
    } else {
      recognition.stop();
      setIsRecording(false);
      if (fullTranscript.trim()) {
        onTranscriptComplete(fullTranscript.trim());
      }
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
    <div>
      <Button
        onClick={toggleRecording}
        variant={isRecording ? "destructive" : "default"}
        size="default"
      >
        {isRecording ? (
          <>
            <MicOff className="mr-2 h-4 w-4" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="mr-2 h-4 w-4" />
            Start Recording
          </>
        )}
      </Button>
    </div>
  );
};
