// Server-side PDF text extraction utility
import { PDFParse } from "pdf-parse";

/**
 * Extract text from a PDF buffer.
 * Handles empty/corrupt files.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  if (!buffer?.length) {
    throw new Error("PDF file is empty")
  }

  let parser: PDFParse | null = null;
  try {
    parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    const text = (result.text ?? "").trim();

    if (!text) {
      throw new Error(
        "No text could be extracted. The PDF might be scanned images (use OCR) or empty."
      )
    }

    return text;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("empty") || error.message.includes("No text")) {
        throw error
      }
      console.error("Error extracting text from PDF:", error)
      throw new Error(
        "Failed to read PDF. The file may be corrupted or password-protected."
      )
    }
    throw new Error("Failed to extract text from PDF")
  } finally {
    await parser?.destroy().catch(() => {});
  }
}
