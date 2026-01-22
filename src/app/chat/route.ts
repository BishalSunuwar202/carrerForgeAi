import { streamText } from 'ai';
import { google } from "@ai-sdk/google";
import { extractTextFromPDF } from "@/lib/pdf-extractor";
import { getRandomJobPosting } from "@/data/mock-jobs";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  try {
    let message = "";
    let pdfFile: File | null = null;
    let existingMessages: Message[] = [];

    // Handle FormData (file upload)
    const formData = await req.formData();
    message = (formData.get("message") as string) || "";
    pdfFile = formData.get("pdf") as File | null;
    const messagesStr = formData.get("messages") as string;
    
    console.log("Received request:", { message: message.substring(0, 50), hasPdf: !!pdfFile })
    
    if (messagesStr) {
      try {
        existingMessages = JSON.parse(messagesStr) as Message[];
      } catch {
        existingMessages = [];
      }
    }

    let pdfText = "";
    if (pdfFile) {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      pdfText = await extractTextFromPDF(buffer);
    }

    // Get a mock job posting for skill gap analysis
    const jobPosting = getRandomJobPosting();

    // Build context for skill gap analysis
    const userInput = message || "";
    const userProfile = pdfText
      ? `Resume/PDF Content:\n${pdfText}\n\nAdditional Skills:\n${userInput}`
      : `User Skills Description:\n${userInput}`;

    const jobRequirements = `Job Title: ${jobPosting.title}\nCompany: ${jobPosting.company}\n\nRequired Skills:\n${jobPosting.requirements.join("\n")}\n\nPreferred Skills:\n${jobPosting.preferred.join("\n")}`;

    // Create system prompt for skill gap analysis
    const systemPrompt = `You are CareerForgeAI, an expert career guidance assistant for programmers. Your role is to analyze a user's skills against job requirements and provide structured, actionable feedback.

When analyzing skills, provide:
1. **Skill Gaps** - Skills the user lacks that are required for the position
2. **Weak Skills** - Skills the user has but may need to strengthen  
3. **Recommended Learning Path** - Prioritized list of skills to learn, with suggested resources and timeline
4. **Strength Areas** - Skills the user already has that match the requirements

Format your response using clear markdown with headers, bullet points, and structured sections. Be encouraging and constructive.`;

    // Build the analysis prompt
    const analysisPrompt = `Analyze the following user profile against this job posting:

${userProfile}

---

${jobRequirements}

Provide a comprehensive skill gap analysis with actionable recommendations.`;

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
    // Use toTextStreamResponse for simpler text streaming format
    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat route error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: "Failed to process request", details: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}