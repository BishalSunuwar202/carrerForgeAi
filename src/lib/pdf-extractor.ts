// Server-side PDF text extraction utility

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdf = require("pdf-parse")
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    throw new Error("Failed to extract text from PDF")
  }
}
