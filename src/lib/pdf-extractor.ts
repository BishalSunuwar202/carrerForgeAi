// Server-side PDF text extraction utility

const MAX_PAGES_DEFAULT = 50

/**
 * Extract text from a PDF buffer.
 * Handles empty/corrupt files and limits pages for large PDFs.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  if (!buffer?.length) {
    throw new Error("PDF file is empty")
  }

  try {
    const pdf = require("pdf-parse") as (buf: Buffer, opts?: { max?: number }) => Promise<{ text: string; numpages: number }>
    const data = await pdf(buffer, { max: MAX_PAGES_DEFAULT })
    const text = (data.text ?? "").trim()

    if (!text) {
      throw new Error(
        "No text could be extracted. The PDF might be scanned images (use OCR) or empty."
      )
    }

    return text
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
  }
}
