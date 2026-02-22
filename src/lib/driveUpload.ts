/**
 * Google Drive upload utility for IB Mastery
 * TUTOR-2: Auto-upload homework attachments to Google Drive
 *
 * Uses either:
 * 1. Google access token from Firebase Auth (signInWithPopup)
 * 2. Existing getGdriveToken() from the app's OAuth2 flow
 */

interface DriveUploadResult {
  fileId: string;
  fileName: string;
  webViewLink: string;
}

/**
 * Upload a file to Google Drive
 * @param token - Google OAuth access token with drive.file scope
 * @param fileName - Name for the file in Drive
 * @param base64Data - File content as base64 string
 * @param mimeType - MIME type of the file
 * @param folderId - Optional Drive folder ID to upload into
 */
export async function uploadToDrive(
  token: string,
  fileName: string,
  base64Data: string,
  mimeType: string,
  folderId?: string
): Promise<DriveUploadResult> {
  // Convert base64 to blob
  const byteChars = atob(base64Data);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  // Build multipart upload
  const metadata: Record<string, unknown> = {
    name: fileName,
    mimeType,
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", blob, fileName);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Drive upload failed (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  return {
    fileId: data.id,
    fileName: data.name,
    webViewLink: data.webViewLink ?? `https://drive.google.com/file/d/${data.id}/view`,
  };
}

/**
 * Create a folder in Google Drive (if it doesn't exist)
 * Returns the folder ID
 */
export async function ensureDriveFolder(
  token: string,
  folderName: string,
  parentFolderId?: string
): Promise<string> {
  // Check if folder already exists
  let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  if (parentFolderId) {
    query += ` and '${parentFolderId}' in parents`;
  }

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files?.length > 0) {
      return searchData.files[0].id;
    }
  }

  // Create folder
  const metadata: Record<string, unknown> = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const createRes = await fetch(
    "https://www.googleapis.com/drive/v3/files?fields=id",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!createRes.ok) {
    throw new Error("Failed to create Drive folder");
  }

  const createData = await createRes.json();
  return createData.id;
}

/**
 * Upload all homework attachments to Drive
 * Creates folder structure: IB Mastery / Homework / [Subject]
 */
export async function uploadHomeworkToDrive(
  token: string,
  homework: {
    subject: string;
    attachments: Array<{
      filename: string;
      mimeType: string;
      base64: string | null;
    }>;
  }
): Promise<DriveUploadResult[]> {
  // Create folder hierarchy
  const rootFolderId = await ensureDriveFolder(token, "IB Mastery");
  const hwFolderId = await ensureDriveFolder(token, "Homework", rootFolderId);
  const subjectFolderId = await ensureDriveFolder(
    token,
    homework.subject,
    hwFolderId
  );

  const results: DriveUploadResult[] = [];

  for (const att of homework.attachments) {
    if (!att.base64) continue;

    const result = await uploadToDrive(
      token,
      att.filename,
      att.base64,
      att.mimeType,
      subjectFolderId
    );
    results.push(result);
  }

  return results;
}
