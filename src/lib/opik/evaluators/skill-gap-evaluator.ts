/**
 * Skill Gap Evaluator
 * Uses LLM-as-judge to score skill gap analysis quality
 */

import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { opikClient, isOpikEnabled } from "../client";
import {
  getJudgePrompt,
  parseJudgeResponse,
  type SkillGapInput,
  type SkillGapScores,
} from "../judges/skill-gap-judge";

export interface EvaluationResult {
  scores: SkillGapScores;
  opikTraceId?: string;
  timestamp: number;
}

/**
 * Evaluate skill gap analysis using LLM-as-judge
 * @param input User profile, job requirements, and AI analysis
 * @returns Evaluation scores and Opik trace ID
 */
export async function evaluateSkillGapAnalysis(
  input: SkillGapInput
): Promise<EvaluationResult> {
  const startTime = Date.now();

  try {
    // Generate judge prompt
    const judgePrompt = getJudgePrompt(input);

    // Call LLM judge (using cheaper model for cost efficiency)
    const judgeResponse = await generateText({
      model: google("gemini-2.0-flash-lite"), // Cheaper model for judging
      prompt: judgePrompt,
      temperature: 0.3, // Lower temperature for more consistent evaluation
    });

    // Parse scores from judge response
    const scores = parseJudgeResponse(judgeResponse.text);

    // Log to Opik if enabled
    let opikTraceId: string | undefined;
    if (isOpikEnabled()) {
      try {
        const trace = opikClient.trace({
          name: "skill-gap-evaluation",
          input: {
            userProfile: input.userProfile.substring(0, 500), // Truncate for logging
            jobRequirements: input.jobRequirements.substring(0, 500),
            aiAnalysis: input.aiAnalysis.substring(0, 1000),
          },
          output: scores,
          metadata: {
            evaluationType: "llm-as-judge",
            judgeModel: "gemini-2.0-flash-lite",
            latencyMs: Date.now() - startTime,
          },
        });

        opikTraceId = trace.id;

        // Log individual scores as metrics
        opikClient.log({
          traceId: trace.id,
          name: "evaluation-scores",
          type: "llm",
          input: judgePrompt,
          output: judgeResponse.text,
          metadata: {
            scores: {
              accuracy: scores.accuracy,
              completeness: scores.completeness,
              relevance: scores.relevance,
              falsePositives: scores.falsePositives,
              actionability: scores.actionability,
              overall: scores.overall,
            },
            reasoning: scores.reasoning,
          },
        });
      } catch (opikError) {
        console.error("Failed to log to Opik:", opikError);
        // Continue even if Opik logging fails
      }
    }

    return {
      scores,
      opikTraceId,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Skill gap evaluation failed:", error);

    // Return default scores on error
    return {
      scores: {
        accuracy: 0,
        completeness: 0,
        relevance: 0,
        falsePositives: 0,
        actionability: 0,
        overall: 0,
        reasoning: `Evaluation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      timestamp: Date.now(),
    };
  }
}

/**
 * Evaluate skill gap analysis asynchronously (fire-and-forget)
 * Used when we don't want to block the main response
 */
export function evaluateSkillGapAsync(input: SkillGapInput): void {
  evaluateSkillGapAnalysis(input)
    .then((result) => {
      console.log("Async evaluation complete:", {
        overall: result.scores.overall,
        opikTraceId: result.opikTraceId,
      });
    })
    .catch((error) => {
      console.error("Async evaluation failed:", error);
    });
}
