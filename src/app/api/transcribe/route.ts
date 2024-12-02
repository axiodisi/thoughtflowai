// app/api/transcribe/route.ts
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import OpenAI from "openai";

export const runtime = "edge";
export const maxDuration = 30;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio");
    const accessCode = formData.get("accessCode")?.toString() || "";

    // Check access code
    const usagesLeft = await kv.get<number>(accessCode);
    if (!usagesLeft || usagesLeft <= 0) {
      return NextResponse.json(
        { error: "Invalid or expired access code" },
        { status: 403 }
      );
    }

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const file = new File([audioFile], "audio.webm", { type: audioFile.type });

    const response = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      language: "en",
    });

    return NextResponse.json({ transcript: response.text });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
