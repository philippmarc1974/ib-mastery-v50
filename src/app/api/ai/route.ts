/**
 * Unified Anthropic proxy — handles all call patterns from the migrated app:
 *  - callClaude(sys, prompt)         → { system, prompt, max_tokens }
 *  - callClaudeChat(sys, messages)   → { system, messages, max_tokens }
 *  - callClaudeVision(sys, prompt, base64, mediaType) → { system, prompt, base64, mediaType, max_tokens }
 *
 * The original app called api.anthropic.com directly (no x-api-key header,
 * designed for a native wrapper). All calls are now proxied here so the key
 * stays server-side only.
 *
 * Model routing (personal use cost optimisation):
 *  - Vision/PDF calls          → Sonnet (needs multimodal capability)
 *  - max_tokens > 4096         → Sonnet (long-form grading/analysis)
 *  - Everything else           → Haiku  (~10x cheaper, fast enough for grading/tutor/dispatch)
 */
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL_SONNET = "claude-sonnet-4-5-20250929";
const MODEL_HAIKU  = "claude-haiku-4-5-20250929";

/** Pick model: Sonnet for vision or large outputs, Haiku for everything else */
function pickModel(isVision: boolean, maxTokens: number): string {
  if (isVision) return MODEL_SONNET;
  if (maxTokens > 4096) return MODEL_SONNET;
  return MODEL_HAIKU;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ── Vision / document call ──────────────────────────────────────────────
    if (body.base64 && body.mediaType) {
      const { system, prompt, base64, mediaType, max_tokens = 6000 } = body;
      const contentType = mediaType === "application/pdf" ? "document" : "image";
      const model = pickModel(true, max_tokens);

      const response = await anthropic.messages.create({
        model,
        max_tokens,
        ...(system ? { system } : {}),
        messages: [
          {
            role: "user",
            content: [
              {
                type: contentType as "image" | "document",
                source: { type: "base64", media_type: mediaType, data: base64 },
              } as unknown as Anthropic.ImageBlockParam,
              { type: "text", text: prompt },
            ],
          },
        ],
      });

      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as Anthropic.TextBlock).text)
        .join("\n");

      return NextResponse.json({ content: [{ type: "text", text }] });
    }

    // ── Chat call (array of messages) ───────────────────────────────────────
    if (Array.isArray(body.messages)) {
      const { system, messages, max_tokens = 4096 } = body;
      const model = pickModel(false, max_tokens);

      const response = await anthropic.messages.create({
        model,
        max_tokens,
        ...(system ? { system } : {}),
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      });

      const text = response.content
        .filter((b) => b.type === "text")
        .map((b) => (b as Anthropic.TextBlock).text)
        .join("\n");

      return NextResponse.json({ content: [{ type: "text", text }] });
    }

    // ── Single prompt call ──────────────────────────────────────────────────
    const { system, prompt, max_tokens = 4096 } = body;
    const model = pickModel(false, max_tokens);

    const response = await anthropic.messages.create({
      model,
      max_tokens,
      ...(system ? { system } : {}),
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as Anthropic.TextBlock).text)
      .join("\n");

    return NextResponse.json({ content: [{ type: "text", text }] });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
