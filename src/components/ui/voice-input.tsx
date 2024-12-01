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
  const [isMobileChrome, setIsMobileChrome] = useState(false);

  useEffect(() => {
    // Check if we're on Android Chrome
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isChrome = /Chrome/i.test(navigator.userAgent);
    setIsMobileChrome(isAndroid && isChrome);

    if (typeof window !== "undefined") {
      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognitionAPI) {
        try {
          const recognitionInstance = new SpeechRecognitionAPI();
          recognitionInstance.continuous = true;
          recognitionInstance.interimResults = false;
          // Add specific settings for Android
          if (isAndroid) {
            recognitionInstance.continuous = false; // Single utterance mode works better on Android
            recognitionInstance.maxAlternatives = 1;
          }

          recognitionInstance.onstart = () => {
            console.log("Recognition started");
            setIsRecording(true);
          };

          recognitionInstance.onend = () => {
            console.log("Recognition ended");
            // On Android, we need to restart for continuous recording
            if (isRecording && isAndroid) {
              try {
                recognitionInstance.start();
              } catch (e) {
                console.log("Restart failed:", e);
              }
            } else {
              setIsRecording(false);
            }
          };

          recognitionInstance.onresult = (event: any) => {
            console.log("Got result:", event);
            const transcript =
              event.results[event.results.length - 1][0].transcript;
            const updatedTranscript = fullTranscript + " " + transcript;
            setFullTranscript(updatedTranscript);
            onTranscriptUpdate(updatedTranscript.trim());
            setLastResultTime(Date.now());
          };

          recognitionInstance.onerror = (event: any) => {
            console.error("Recognition error:", event);
            if (event.error === "no-speech") {
              // Don't show error for no speech on Android
              if (!isAndroid) {
                setError("No speech detected. Please try again.");
              }
            } else {
              setError(`Microphone error: ${event.error}`);
              setIsRecording(false);
            }
          };

          setRecognition(recognitionInstance);
        } catch (err) {
          console.error("Init error:", err);
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
        // Reset error state
        setError("");
        // Start recognition
        recognition.start();
      } catch (err) {
        console.error("Toggle recording error:", err);
        setError("Microphone permission denied");
      }
    } else {
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
      {isMobileChrome && (
        <p className="text-xs text-zinc-400 mb-2">
          Note: For best results on Android, speak clearly and pause between
          phrases
        </p>
      )}
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
