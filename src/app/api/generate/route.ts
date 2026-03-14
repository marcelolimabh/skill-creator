import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  try {
    const { answers } = await req.json();

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Missing or invalid 'answers' in request body" },
        { status: 400 },
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured" },
        { status: 500 },
      );
    }

    const client = new Anthropic({ apiKey });

    const prompt = `You are a senior developer and Claude Skill expert. Based on the following project answers, generate a complete, production-ready Claude Skill in YAML format.

The skill should include:
- Project metadata (name, version, description)
- Tech stack details
- Architecture patterns and conventions
- Code style rules
- File structure conventions
- Security best practices
- Testing strategy
- Common patterns and examples
- Error handling conventions

Project answers:
${JSON.stringify(answers, null, 2)}

IMPORTANT:
- Output ONLY valid YAML, no markdown fences, no extra text.
- The YAML must be a complete, detailed Claude Skill ready for production use.
- Include specific, actionable rules — not generic advice.
- Tailor everything to the exact stack and architecture chosen.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const yaml =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ yaml });
  } catch (error) {
    console.error("Generate API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
