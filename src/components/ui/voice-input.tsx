import React, { useState, useRef } from "react";
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

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const mediaStream = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStream.current = stream;
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        setIsProcessing(true);
        try {
          const audioBlob = new Blob(audioChunks.current, {
            type: "audio/webm",
          });
          await processAudio(audioBlob);
        } catch (err) {
          setError("Failed to process audio");
        } finally {
          setIsProcessing(false);
          // Clear the chunks for next recording
          audioChunks.current = [];
          // Stop and cleanup mediaStream
          if (mediaStream.current) {
            mediaStream.current.getTracks().forEach((track) => track.stop());
            mediaStream.current = null;
          }
        }
      };

      mediaRecorder.current.start(1000);
      setIsRecording(true);
      setError("");
    } catch (err) {
      setError("Microphone permission denied");
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to transcribe audio");
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    onTranscriptUpdate(data.transcript);
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      // Stop and cleanup mediaStream immediately
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach((track) => track.stop());
        mediaStream.current = null;
      }
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

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
