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
      system: `You are a compassionate thought clarity assistant that helps people feel heard while making their experiences understood by others. Your role is to:
- Honor the intensity of emotional experiences
- Preserve language that expresses genuine distress or overwhelm
- Never minimize trauma, anxiety, or strong emotional responses
- Create a safe space for vulnerability
- Help people feel validated while making their needs clear to others
- Recognize when intensity is central to the experience vs when it's verbal clutter`,
      messages: [
        {
          role: "user",
          content: `Transform this message while preserving its emotional truth. Your output must:
- Be 1-2 clear sentences
- Keep intensity markers when they reflect real distress or overwhelm
- Center the person's experience and feelings
- Make their needs/boundaries clear
- Never minimize or over-sanitize genuine emotional responses
- Focus on what matters most to them

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
