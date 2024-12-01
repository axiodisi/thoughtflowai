import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscriptUpdate: (text: string) => void;
}

export const VoiceInput = ({ onTranscriptUpdate }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
    chunksRef.current = [];
  }, []);

  const handleStartRecording = async () => {
    try {
      cleanup();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });

      recorder.addEventListener("stop", async () => {
        try {
          setIsProcessing(true);
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("audio", blob);

          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("Transcription failed");
          const data = await response.json();
          onTranscriptUpdate(data.transcript);
        } catch (err) {
          setError("Failed to process audio");
          console.error(err);
        } finally {
          setIsProcessing(false);
          cleanup();
        }
      });

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError("Failed to start recording");
      cleanup();
    }
  };

  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const buttonClasses = cn(
    "w-full h-full flex items-center justify-center gap-3 rounded-2xl text-2xl font-medium transition-all",
    {
      "bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:opacity-90":
        !isRecording,
      "bg-gradient-to-r from-red-800 via-red-700 to-red-600 animate-pulse":
        isRecording,
    },
    "disabled:opacity-50"
  );

  if (error) {
    return (
      <Alert className="h-full">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="h-full relative">
      <Button
        onClick={toggleRecording}
        className={buttonClasses}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Processing...</span>
          </>
        ) : isRecording ? (
          <>
            <MicOff className="h-6 w-6" />
            <span>Stop Recording</span>
          </>
        ) : (
          <>
            <Mic className="h-6 w-6" />
            <span>Start Recording</span>
          </>
        )}
      </Button>
      {isRecording && (
        <div className="absolute top-0 left-0 w-full h-full rounded-2xl animate-ping bg-red-500/20" />
      )}
    </div>
  );
};
