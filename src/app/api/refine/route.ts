// app/api/refine/route.ts
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const { text } = await req.json();

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Make this emotional outpouring quick and easy to understand. Help the reader immediately get why the person is frustrated and empathize with them. Think tweet-length, not essay.

Must:
- Max 3 sentences  
- Use clear, straightforward language
- Get straight to the point 
- Focus on one key feeling/situation
- Skip self-reflection and philosophical bits
- Keep a professional tone
- No slang, swearing, or informal expressions
- No colloquialisms
- Maintain composure while preserving emotional truth
          
Text to transform:
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
