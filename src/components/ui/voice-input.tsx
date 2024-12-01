import React, { useState } from "react";
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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = async () => {
        setIsProcessing(true);
        try {
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("Failed to transcribe audio");
          const data = await response.json();
          onTranscriptUpdate(data.transcript);
        } catch (err) {
          setError("Failed to process audio");
        } finally {
          setIsProcessing(false);
          setAudioChunks([]);
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      setError("Microphone permission denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
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
    "w-full h-full flex items-center justify-center gap-3 rounded-2xl text-2xl font-medium",
    {
      "bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:opacity-90":
        !isRecording,
      "bg-gradient-to-r from-red-800 via-red-700 to-red-600": isRecording,
    },
    "disabled:opacity-50"
  );

  return (
    <div className="h-full">
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
    </div>
  );
};
