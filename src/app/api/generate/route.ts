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

    const prompt = `You are a senior developer and Claude Skill expert for the Anthropic Claude Code ecosystem.
Based on the following project answers, generate a complete, production-ready Claude Skill in the official 2026 format.

The skill MUST be in the following Markdown format with YAML frontmatter:

\`\`\`
---
name: <Skill Name>
description: <One-line description>
model: claude-sonnet-4-20250514
max_tokens: 4000
temperature: 0.1
---

# <Skill Name>

<Full Markdown instructions for Claude here>
\`\`\`

The skill instructions should include:
- Project context (language, framework, architecture)
- Code style rules and conventions specific to the stack
- File structure and naming conventions
- Architecture patterns and design constraints
- Security best practices for this tech stack
- Testing strategy
- Common patterns and examples
- Error handling conventions

Project answers:
${JSON.stringify(answers, null, 2)}

IMPORTANT:
- Output ONLY the Markdown file content (starting with --- frontmatter), no extra explanation.
- The file will be saved as .claude/skills/project-skill/SKILL.md
- Include specific, actionable rules — not generic advice.
- Tailor everything to the exact stack and architecture chosen.
- Use proper Markdown formatting with headers, bullet points, and code blocks.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const skillContent =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Strip any markdown code fences if the model wrapped the output
    const cleaned = skillContent
      .replace(/^```(?:markdown|yaml|md)?\s*/m, "")
      .replace(/\s*```\s*$/m, "")
      .trim();

    return NextResponse.json({ yaml: cleaned });
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
