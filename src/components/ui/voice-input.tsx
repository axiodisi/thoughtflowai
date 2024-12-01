import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VoiceInputProps {
  onTranscriptUpdate: (text: string) => void;
}

type WebkitSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const SpeechRecognitionAPI = (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionAPI) {
        setError("Speech recognition not supported");
        return;
      }

      const recognition = new SpeechRecognitionAPI() as WebkitSpeechRecognition;
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const newTranscript = fullTranscript + " " + transcript;
        setFullTranscript(newTranscript.trim());
        onTranscriptUpdate(newTranscript.trim());
      };

      recognition.onend = () => {
        // Only restart if we're still meant to be recording
        if (isRecording) {
          try {
            recognition.start();
          } catch (e) {
            setIsRecording(false);
          }
        }
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
