import { NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import { simpleParser } from "mailparser";

// Keyword detection — Marc configures tutor details in Archivum UI
// This just identifies which IB subject the email is about
const detectSubject = (emailSubject: string): string | null => {
  const s = (emailSubject ?? "").toLowerCase();
  if (s.includes("math")) return "Math AI HL";
  if (s.includes("history")) return "History SL";
  if (s.includes("english")) return "English Lang & Lit SL";
  if (s.includes("sports") || s.includes("sehs")) return "Sports Science SL";
  return null;
};

// POST — poll Gmail for new homework emails
export async function POST() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return NextResponse.json(
      { error: "Gmail credentials not configured in .env.local" },
      { status: 503 }
    );
  }

  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  const newHomework: object[] = [];

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    try {
      const searchResult = await client.search({ seen: false });
      const uids = Array.isArray(searchResult) ? searchResult : [];

      for (const uid of uids) {
        const { content } = await client.download(String(uid), undefined, {
          uid: true,
        });
        const parsed = await simpleParser(content);

        const subject = parsed.subject ?? "";
        const from = parsed.from?.value?.[0]?.address ?? "";
        const detectedSubject = detectSubject(subject);

        // Not a homework email — skip, leave unread
        if (!detectedSubject) continue;

        // TUTOR-2: Extract attachment data for Drive upload
        const attachments = (parsed.attachments ?? []).map((a) => ({
          filename: a.filename ?? "attachment",
          mimeType: a.contentType ?? "application/octet-stream",
          base64: a.content ? a.content.toString("base64") : null,
          size: a.size ?? 0,
        }));

        const record = {
          id: `hw_${Date.now()}_${uid}`,
          subject: detectedSubject,
          tutorEmail: from,
          emailSubject: subject,
          receivedAt: (parsed.date ?? new Date()).toISOString(),
          status: "RECEIVED",
          hasAttachment: attachments.length > 0,
          attachmentNames: attachments.map((a) => a.filename),
          attachments, // base64 data for client-side Drive upload
          driveFileId: null,
          driveFileUrl: null,
          grade: null,
          feedback: null,
          weaknessSummary: null,
          completedAt: null,
          sentToTutorAt: null,
          sessionId: null,
        };

        // Mark as read to prevent re-ingestion
        await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true });
        newHomework.push(record);
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (error) {
    console.error("[ingest-homework] Gmail error:", error);
    return NextResponse.json(
      { error: "Could not connect to Gmail. Check credentials in .env.local." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ingested: newHomework.length,
    homework: newHomework,
  });
}

// PUT — send completed homework notification to tutor
export async function PUT(request: Request) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return NextResponse.json(
      { error: "Gmail credentials not configured" },
      { status: 503 }
    );
  }

  let body: {
    tutorEmail: string;
    tutorName?: string;
    subject: string;
    grade: number | null;
    feedbackSummary: string | null;
    driveLink: string | null;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!body.tutorEmail || !body.subject) {
    return NextResponse.json(
      { error: "tutorEmail and subject are required" },
      { status: 400 }
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const gradeText =
    body.grade != null
      ? `<strong>AI Pre-Grade: ${body.grade}/7</strong>`
      : "<em>Grading in progress</em>";

  const weaknessLine = body.feedbackSummary
    ? `<p>Main area to focus on: <strong>${body.feedbackSummary}</strong></p>`
    : "";

  const driveLine = body.driveLink
    ? `<p><a href="${body.driveLink}" style="color:#0d9488">
        View Basti&apos;s work and full AI feedback &rarr;
       </a></p>`
    : "<p>Work saved in IB Mastery &mdash; Drive link coming in next update.</p>";

  try {
    await transporter.sendMail({
      from: `IB Mastery <${user}>`,
      to: body.tutorEmail,
      subject: `Basti completed ${body.subject} homework`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;color:#1e293b;
          line-height:1.6">
          <p>Hi ${body.tutorName ?? "there"},</p>
          <p>Basti has completed the
            <strong>${body.subject}</strong> homework.</p>
          <p>${gradeText}</p>
          ${weaknessLine}
          ${driveLine}
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
          <p style="color:#94a3b8;font-size:12px">
            Sent automatically by IB Mastery
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[ingest-homework] email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ sent: true });
}
