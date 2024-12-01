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
  const [currentRecognition, setCurrentRecognition] = useState<any>(null);

  const stopRecording = () => {
    if (currentRecognition) {
      currentRecognition.stop();
      setCurrentRecognition(null);
    }
    setIsRecording(false);
  };

  const startRecording = async () => {
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
      recognition.continuous = false; // Changed to false for Android
      recognition.interimResults = true; // Changed to true to get faster feedback
      recognition.maxAlternatives = 1;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        console.log("Recognition started");
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        console.log("Got result:", event);
        const transcript =
          event.results[event.results.length - 1][0].transcript;
        const newTranscript = fullTranscript + " " + transcript;
        setFullTranscript(newTranscript.trim());
        onTranscriptUpdate(newTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        console.error("Recognition error:", event.error);
        if (event.error !== "no-speech") {
          setError(`Microphone error: ${event.error}`);
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        console.log("Recognition ended");
        // If still recording, start a new session
        if (isRecording) {
          console.log("Restarting recognition");
          recognition.start();
        } else {
          setIsRecording(false);
        }
      };

      setCurrentRecognition(recognition);
      recognition.start();
      setError("");
    } catch (err) {
      console.error("Start recording error:", err);
      setError("Microphone permission denied");
      setIsRecording(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
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
