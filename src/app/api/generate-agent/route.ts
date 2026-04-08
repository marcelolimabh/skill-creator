import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  try {
    const { answers, agentRole, agentFocus } = await req.json();

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

    const prompt = `You are a senior Claude Code architect specializing in the Anthropic 2026 multi-agent standard.

Generate a production-ready AGENT.md for a specialized sub-agent based on the project context below.

The file MUST use this exact format with YAML frontmatter:

\`\`\`
---
name: <agent-name-kebab-case>
description: <one-line description, max 80 chars>
model: claude-sonnet-4-20250514
max_tokens: <4000 to 16000 depending on complexity>
temperature: <0.0 to 0.3>
tools:
  - <Tool1>
  - <Tool2>
role: <orchestrator|specialist>
capabilities:
  - <capability-1>
  - <capability-2>
---

# <Agent Name>

<Full Markdown instructions for the agent here>
\`\`\`

Rules for the tools field:
- Allowed tools: Read, Glob, Grep, Edit, Write, MultiEdit, Bash, WebFetch, TodoWrite
- Security-focused agents must NEVER have Edit, Write, or Bash (read-only by design)
- Analysis-only agents must NEVER have Edit, Write, or Bash
- Orchestrator agents must have TodoWrite and Bash
- Only include tools the agent genuinely needs

Rules for the capabilities field:
- Allowed values: codebase-analysis, pattern-detection, dependency-mapping, code-generation,
  refactoring, test-generation, security-audit, vulnerability-scanning, ci-cd-management,
  infrastructure-as-code, documentation-generation, orchestration

The agent instructions (Markdown body) must include:
- Clear description of the agent's single responsibility
- Step-by-step approach for its core tasks
- Stack-specific guidance adapted to the project context
- Output format the agent should return
- Constraints and what it must NOT do
- How it collaborates with other agents or skills

Project context:
${JSON.stringify(answers, null, 2)}

${agentRole ? `Requested agent role: ${agentRole}` : ""}
${agentFocus ? `Agent focus area: ${agentFocus}` : ""}

IMPORTANT:
- Output ONLY the Markdown file content starting with the --- frontmatter block
- The file will be saved as .claude/agents/<agent-name>/AGENT.md
- Be specific and actionable — tailor everything to the exact stack and architecture
- Do not include generic advice that applies to any project`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const agentContent =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Strip any markdown code fences if the model wrapped the output
    const cleaned = agentContent
      .replace(/^```(?:markdown|yaml|md)?\s*/m, "")
      .replace(/\s*```\s*$/m, "")
      .trim();

    return NextResponse.json({ content: cleaned });
  } catch (error) {
    console.error("Generate Agent API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
