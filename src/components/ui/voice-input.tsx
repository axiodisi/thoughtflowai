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
  const [lastResultTime, setLastResultTime] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        try {
          const recognitionInstance = new SpeechRecognitionAPI();
          recognitionInstance.continuous = true;
          recognitionInstance.interimResults = false;

          recognitionInstance.onresult = (event: any) => {
            const transcript =
              event.results[event.results.length - 1][0].transcript;
            const updatedTranscript = fullTranscript + " " + transcript;
            setFullTranscript(updatedTranscript);
            onTranscriptUpdate(updatedTranscript.trim());
            setLastResultTime(Date.now());
          };

          recognitionInstance.onerror = (event: any) => {
            setError(`Microphone error: ${event.error}`);
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
  }, []);

  const toggleRecording = async () => {
    if (!recognition) return;

    if (!isRecording) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        recognition.start();
        setIsRecording(true);
        setError("");
      } catch (err) {
        setError("Microphone permission denied");
      }
    } else {
      const timeSinceLastResult = Date.now() - lastResultTime;
      if (timeSinceLastResult < 1000) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 - timeSinceLastResult)
        );
      }
      recognition.stop();
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
