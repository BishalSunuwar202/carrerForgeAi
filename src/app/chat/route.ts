import { streamText } from 'ai';
import { google } from "@ai-sdk/google";
import { extractTextFromPDF } from "@/lib/pdf-extractor";
import { getRandomJobPosting, getJobPostingById } from "@/data/mock-jobs";
import {
  parseMessages,
  MAX_PDF_SIZE_BYTES,
  PDF_MIME_TYPE,
  MAX_MESSAGE_LENGTH,
} from "@/lib/chat-validation";
import {
  getSystemPrompt,
  getAnalysisPrompt,
  buildJobRequirementsText,
} from "@/lib/prompts";
import { rateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { opikClient, isOpikEnabled } from "@/lib/opik/client";
import { evaluateSkillGapAsync } from "@/lib/opik/evaluators/skill-gap-evaluator";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function errorResponse(message: string, status: number = 400, details?: string) {
  return new Response(
    JSON.stringify({
      error: message,
      ...(details && { details }),
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function POST(req: Request) {
  const startTime = Date.now();
  let opikTraceId: string | undefined;

  try {
    // Generate trace ID for Opik integration
    if (isOpikEnabled()) {
      opikTraceId = `trace-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      console.log("Opik trace ID:", opikTraceId);
    }

    const id = getRateLimitIdentifier(req);
    const { success: allowed, remaining } = rateLimit(id);
    if (!allowed) {
      return errorResponse(
        "Too many requests",
        429,
        "Please wait a minute before sending more messages."
      );
    }

    const formData = await req.formData();
    let rawMessage = (formData.get("message") as string) || "";
    const pdfFile = formData.get("pdf") as File | null;
    const messagesStr = (formData.get("messages") as string) || "";

    // Basic sanitization: strip HTML/script tags
    rawMessage = rawMessage.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    // Validate message length
    if (rawMessage.length > MAX_MESSAGE_LENGTH) {
      return errorResponse(
        "Message is too long",
        400,
        `Maximum length is ${MAX_MESSAGE_LENGTH} characters.`
      );
    }
    const message = rawMessage.trim();

    // Validate: must have either message or PDF
    if (!message && !pdfFile) {
      return errorResponse(
        "Missing input",
        400,
        "Please provide a message or upload a PDF resume."
      );
    }

    // Validate PDF if present
    if (pdfFile && pdfFile.size > 0) {
      if (pdfFile.type !== PDF_MIME_TYPE) {
        return errorResponse(
          "Invalid file type",
          400,
          "Only PDF files are accepted."
        );
      }
      if (pdfFile.size > MAX_PDF_SIZE_BYTES) {
        return errorResponse(
          "File too large",
          400,
          `PDF must be under ${MAX_PDF_SIZE_BYTES / 1024 / 1024}MB.`
        );
      }
    }

    const existingMessages = parseMessages(messagesStr) as Message[];
    const jobId = (formData.get("jobId") as string) || null;

    let pdfText = "";
    if (pdfFile && pdfFile.size > 0) {
      try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        pdfText = await extractTextFromPDF(buffer);
      } catch (pdfError) {
        console.error("PDF extraction error:", pdfError);
        return errorResponse(
          "Failed to read PDF",
          422,
          "The file may be corrupted or not a valid PDF. Try re-saving or uploading a different file."
        );
      }
    }

    // Get job posting: selected by user or random
    const jobPosting =
      (jobId && getJobPostingById(jobId)) || getRandomJobPosting();

    const userInput = message || "";
    const userProfile = pdfText
      ? `Resume/PDF Content:\n${pdfText}\n\nAdditional Skills:\n${userInput}`
      : `User Skills Description:\n${userInput}`;

    const jobRequirements = buildJobRequirementsText(jobPosting);
    const systemPrompt = getSystemPrompt(jobPosting.roleType);
    const analysisPrompt = getAnalysisPrompt(userProfile, jobRequirements);

    // Build messages array for the model - only include recent non-analysis messages
    const recentMessages = existingMessages
      .slice(-3) // Keep only last 3 messages for context
      .filter((m) => m.role === "user" && !m.content.includes("Analyze the following"))
      .map((m) => ({
        role: "user" as const,
        content: m.content,
      }));

    const messages = [
      ...recentMessages,
      {
        role: "user" as const,
        content: analysisPrompt,
      },
    ];

    console.log("Calling AI model with", messages.length, "messages")
    console.log("API Key configured:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY)
    
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("GOOGLE_GENERATIVE_AI_API_KEY is not set")
      return new Response(
        JSON.stringify({ 
          error: "API key not configured", 
          details: "Please set GOOGLE_GENERATIVE_AI_API_KEY in your .env.local file and restart the server" 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }
    
    const result = streamText({
      model: google("gemini-2.5-flash-lite"),
      system: systemPrompt,
      messages: messages,
      temperature: 0.7,
    });

    console.log("Stream created successfully, returning text stream response")
    const response = result.toTextStreamResponse();
    response.headers.set("X-RateLimit-Remaining", String(remaining));

    // Add Opik trace ID to response headers if available
    if (opikTraceId) {
      response.headers.set("X-Opik-Trace-ID", opikTraceId);
    }

    // Trigger async evaluation after response (fire-and-forget)
    // We'll collect the full AI response for evaluation
    Promise.resolve(result.text).then((fullText) => {
      if (isOpikEnabled() && opikTraceId) {
        // Log interaction metadata
        console.log("AI Response complete:", {
          traceId: opikTraceId,
          latencyMs: Date.now() - startTime,
          jobId: jobPosting.id,
          hasPDF: !!pdfText,
        });

        // Trigger async LLM-as-judge evaluation
        evaluateSkillGapAsync({
          userProfile,
          jobRequirements,
          aiAnalysis: fullText,
        });
      }
    }).catch((err: unknown) => {
      console.error("Failed to process AI response for evaluation:", err);
    });

    return response;
  } catch (error) {
    console.error("Chat route error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return errorResponse(
      "Failed to process request",
      500,
      errorMessage
    );
  }
}