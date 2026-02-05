import { z } from "zod"

/** Max message length to prevent abuse */
export const MAX_MESSAGE_LENGTH = 50_000

/** Max PDF size in bytes (10MB) */
export const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024

/** Allowed PDF MIME type */
export const PDF_MIME_TYPE = "application/pdf"

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
})

export const chatRequestSchema = z.object({
  message: z.string().max(MAX_MESSAGE_LENGTH, "Message is too long").optional(),
  messagesStr: z.string().optional(),
})

export function parseMessages(messagesStr: string | null): z.infer<typeof chatMessageSchema>[] {
  if (!messagesStr) return []
  try {
    const parsed = JSON.parse(messagesStr) as unknown
    return z.array(chatMessageSchema).parse(parsed)
  } catch {
    return []
  }
}

export type ChatRequest = z.infer<typeof chatRequestSchema>
export type ChatMessageValidated = z.infer<typeof chatMessageSchema>
