// app/api/refine/route.ts
import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const { text, accessCode } = await req.json();
    console.log("Received code:", accessCode);
    const usagesLeft = await kv.get<number>(accessCode);
    console.log("Uses left:", usagesLeft);

    if (!usagesLeft || usagesLeft <= 0) {
      return NextResponse.json(
        { error: "Invalid or expired access code" },
        { status: 403 }
      );
    }
    await kv.decr(accessCode);

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      system: `You help people communicate overwhelming experiences clearly and directly. Your role is to:
- Extract the core emotional truth
- Keep the raw feeling intact
- Be direct about needs and boundaries
- Validate without explaining
- Never diminish emotional intensity`,
      messages: [
        {
          role: "user",
          content: `Distill this message to its essential truth in 1-2 sentences. Keep:
- The core feeling/experience
- Any clear needs or boundaries
- Genuine intensity of emotion
Remove:
- Explanations or justifications
- Analysis of the situation
- Qualifiers or hedging

Text to refine:
"${text}"`,
        },
      ],
    });

    return NextResponse.json({ refined: message.content[0].text });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
