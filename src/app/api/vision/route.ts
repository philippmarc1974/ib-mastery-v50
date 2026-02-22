import { NextResponse } from "next/server";

const MAX_BASE64_LENGTH = Math.ceil(10 * 1024 * 1024 * (4 / 3)); // 10MB

export async function POST(request: Request) {
  if (!process.env.GOOGLE_VISION_API_KEY) {
    return NextResponse.json(
      { error: "Vision API not configured" },
      { status: 503 }
    );
  }

  let body: { imageBase64?: string; mimeType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { imageBase64 } = body;

  if (!imageBase64 || typeof imageBase64 !== "string") {
    return NextResponse.json(
      { error: "imageBase64 required" },
      { status: 400 }
    );
  }

  if (imageBase64.length > MAX_BASE64_LENGTH) {
    return NextResponse.json(
      { error: "Image too large (max 10MB)" },
      { status: 413 }
    );
  }

  try {
    const res = await fetch(
      `https://vision.googleapis.com/v1/images:annotate` +
        `?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: imageBase64 },
              features: [
                { type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 },
              ],
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      console.error("[/api/vision] upstream error:", res.status);
      return NextResponse.json(
        { error: "OCR service error" },
        { status: res.status }
      );
    }

    const data = await res.json();
    const text = data.responses?.[0]?.fullTextAnnotation?.text ?? "";
    return NextResponse.json({ text });
  } catch (error) {
    console.error("[/api/vision] error:", error);
    return NextResponse.json({ error: "OCR failed" }, { status: 500 });
  }
}
