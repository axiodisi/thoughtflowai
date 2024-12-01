import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VoiceInputProps {
  onTranscriptUpdate: (text: string) => void;
}

export const VoiceInput = ({ onTranscriptUpdate }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string>("");
  const [fullTranscript, setFullTranscript] = useState("");

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const SpeechRecognitionAPI =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      if (!SpeechRecognitionAPI) {
        setError("Speech recognition not supported");
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const transcript =
          event.results[event.results.length - 1][0].transcript;
        const newTranscript = fullTranscript + " " + transcript;
        setFullTranscript(newTranscript.trim());
        onTranscriptUpdate(newTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        if (event.error !== "no-speech") {
          setError(`Microphone error: ${event.error}`);
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      setIsRecording(true);
      setError("");
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
