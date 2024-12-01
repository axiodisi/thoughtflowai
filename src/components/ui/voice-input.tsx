import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VoiceInputProps {
  onTranscriptUpdate: (text: string) => void;
}

export const VoiceInput = ({ onTranscriptUpdate }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string>("");
  const [recognition, setRecognition] = useState<any>(null);
  const [fullTranscript, setFullTranscript] = useState("");

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const SpeechRecognitionAPI =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;

      if (SpeechRecognitionAPI) {
        const recognitionInstance = new SpeechRecognitionAPI();

        // Mobile-specific settings
        if (isMobile) {
          recognitionInstance.continuous = false;
          recognitionInstance.interimResults = false;
        } else {
          recognitionInstance.continuous = true;
          recognitionInstance.interimResults = false;
        }

        recognitionInstance.lang = "en-US";

        recognitionInstance.onresult = (event: any) => {
          const transcript =
            event.results[event.results.length - 1][0].transcript;
          const newTranscript = fullTranscript + " " + transcript;
          setFullTranscript(newTranscript.trim());
          onTranscriptUpdate(newTranscript.trim());
        };

        recognitionInstance.onend = () => {
          // On mobile, we need to manually restart if still recording
          if (isRecording && isMobile) {
            try {
              recognitionInstance.start();
            } catch (e) {
              setIsRecording(false);
            }
          }
        };

        recognitionInstance.onerror = (event: any) => {
          if (event.error === "no-speech") {
            // Ignore no-speech error on mobile
            if (!isMobile) {
              setError("No speech detected");
            }
          } else if (event.error === "not-allowed") {
            setError("Microphone access denied");
          } else {
            setError(`Error: ${event.error}`);
          }
          setIsRecording(false);
        };

        setRecognition(recognitionInstance);
      } else {
        setError("Speech recognition not supported in this browser");
      }
    }
  }, [isRecording, fullTranscript, onTranscriptUpdate]);

  const toggleRecording = async () => {
    if (!recognition) return;

    try {
      if (!isRecording) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setFullTranscript("");
        recognition.start();
        setIsRecording(true);
        setError("");
      } else {
        recognition.stop();
        setIsRecording(false);
      }
    } catch (err) {
      setError("Microphone permission denied");
      setIsRecording(false);
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
