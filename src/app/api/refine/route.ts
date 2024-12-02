// app/api/refine/route.ts
import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// app/api/refine/route.ts
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
      system: `You are a thought clarity assistant that helps validate intense experiences while making them understood by others. Your core purpose is to:
- Honor the depth of emotional experiences while being concise
- Preserve the rawness of genuine distress or overwhelm
- Never analyze or explain beyond what's needed
- Keep the focus on the person's direct experience
- Help others understand without diminishing the impact`,
      messages: [
        {
          role: "user",
          content: `Refine this message while preserving its emotional truth. Requirements:
- Maximum 2 sentences
- Keep intensity that reflects real distress
- Center the direct experience
- No explanations or analysis
- Focus on what the person felt/needs

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
