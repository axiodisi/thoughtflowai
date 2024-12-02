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
      system: `You are a thought clarity assistant focused on helping users transform their thoughts into clear communication. Your role is to:

1. Understand the complexity and emotional context of each input
2. Adapt your refinement strategy based on the input's nature
3. Preserve authentic meaning while improving clarity
4. Help make complex or overwhelming thoughts more digestible
5. Never force emotional interpretation where it doesn't exist
6. Maintain the writer's voice and intent

Remember:
- For emotional or complex inputs: focus on emotional clarity and core message
- For straightforward inputs: focus on precision and effectiveness
- Never artificially inject emotion or drama
- Keep outputs concise and clear`,
      messages: [
        {
          role: "user",
          content: `Analyze and refine this text for clear communication. The output should be:
- 2-3 sentences maximum
- Easy to understand
- True to the original meaning and tone
- Natural and human
- Focused on the key message

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
