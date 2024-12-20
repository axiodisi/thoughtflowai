import React, { useState, useRef } from "react";
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

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

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
        }

        audioChunks.current = [];
        stream.getTracks().forEach((track) => track.stop());
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

  return (
    <div className="h-full relative">
      <Button
        onClick={toggleRecording}
        variant="default"
        className="w-full h-full flex items-center justify-center gap-3 rounded-2xl text-2xl font-medium bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 hover:opacity-90 transition-opacity disabled:opacity-50"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Converting...</span>
          </>
        ) : isRecording ? (
          <>
            <MicOff className="h-6 w-6" />
            <span>Stop</span>
          </>
        ) : (
          <>
            <Mic className="h-6 w-6" />
            <span>Speak</span>
          </>
        )}
      </Button>
      {isRecording && (
        <div className="absolute top-2 right-2">
          <div className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
          <div className="absolute top-0 h-3 w-3 rounded-full bg-red-500" />
        </div>
      )}
    </div>
  );
};
