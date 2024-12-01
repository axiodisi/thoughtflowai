"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VoiceInputProps {
  onTranscriptUpdate: (text: string) => void;
}

export const VoiceInput = ({ onTranscriptUpdate }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");

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

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscriptUpdate(transcript);
      };

      recognition.onend = () => {
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
    <div className="h-full">
      <Button
        onClick={toggleRecording}
        variant={isRecording ? "destructive" : "default"}
        className="h-full w-full text-2xl font-medium"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            Processing...
          </>
        ) : isRecording ? (
          <>
            <MicOff className="mr-2 h-6 w-6" />
            Stop Recording
          </>
        ) : (
          <>
            <Mic className="mr-2 h-6 w-6" />
            Start Recording
          </>
        )}
      </Button>
    </div>
  );
};
