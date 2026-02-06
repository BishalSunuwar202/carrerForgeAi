/**
 * LLM-as-Judge Prompts for Skill Gap Analysis Evaluation
 * Uses a separate LLM to score the quality of skill gap recommendations
 */

export interface SkillGapInput {
  userProfile: string;
  jobRequirements: string;
  aiAnalysis: string;
}

export interface SkillGapScores {
  accuracy: number;        // 0-100: Correctly identified gaps
  completeness: number;    // 0-100: Caught all important gaps
  relevance: number;       // 0-100: Gaps matter for the job
  falsePositives: number;  // 0-100: Didn't hallucinate gaps
  actionability: number;   // 0-100: Recommendations are specific
  overall: number;         // Weighted average
  reasoning: string;       // Explanation of scores
}

// Scoring weights for overall score calculation
export const SCORING_WEIGHTS = {
  accuracy: 0.30,
  completeness: 0.25,
  relevance: 0.20,
  falsePositives: 0.15,
  actionability: 0.10,
};

export function getJudgePrompt(input: SkillGapInput): string {
  return `You are an expert evaluator assessing the quality of skill gap analysis for software developers.

**USER PROFILE:**
${input.userProfile}

**JOB REQUIREMENTS:**
${input.jobRequirements}

**AI ANALYSIS TO EVALUATE:**
${input.aiAnalysis}

---

**YOUR TASK:**
Evaluate the AI's skill gap analysis on these 5 dimensions (score 0-100 for each):

1. **Accuracy (0-100)**: Are the identified skill gaps actually missing from the user's profile? Are they truly required for the job?

2. **Completeness (0-100)**: Did the analysis catch ALL major skill gaps? Are there important missing skills that weren't mentioned?

3. **Relevance (0-100)**: Do the identified gaps actually matter for this specific job? Are they core requirements vs. nice-to-haves?

4. **False Positives (0-100)**: Did the analysis hallucinate or misidentify skills? Higher score = fewer false positives.

5. **Actionability (0-100)**: Are the learning recommendations specific, practical, and helpful? Do they include concrete resources, realistic timelines, and clear next steps?

**OUTPUT FORMAT (JSON only):**
\`\`\`json
{
  "accuracy": <number 0-100>,
  "completeness": <number 0-100>,
  "relevance": <number 0-100>,
  "falsePositives": <number 0-100>,
  "actionability": <number 0-100>,
  "reasoning": "<2-3 sentence explanation of your scoring>"
}
\`\`\`

Be strict but fair. A perfect score (100) should be rare. Provide honest, constructive evaluation.`;
}

export function calculateOverallScore(scores: Omit<SkillGapScores, "overall" | "reasoning">): number {
  return (
    scores.accuracy * SCORING_WEIGHTS.accuracy +
    scores.completeness * SCORING_WEIGHTS.completeness +
    scores.relevance * SCORING_WEIGHTS.relevance +
    scores.falsePositives * SCORING_WEIGHTS.falsePositives +
    scores.actionability * SCORING_WEIGHTS.actionability
  );
}

export function parseJudgeResponse(response: string): SkillGapScores {
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;

    const parsed = JSON.parse(jsonString);

    // Calculate overall score
    const overall = calculateOverallScore(parsed);

    return {
      accuracy: parsed.accuracy || 0,
      completeness: parsed.completeness || 0,
      relevance: parsed.relevance || 0,
      falsePositives: parsed.falsePositives || 0,
      actionability: parsed.actionability || 0,
      overall,
      reasoning: parsed.reasoning || "No reasoning provided",
    };
  } catch (error) {
    console.error("Failed to parse judge response:", error);
    // Return default scores if parsing fails
    return {
      accuracy: 50,
      completeness: 50,
      relevance: 50,
      falsePositives: 50,
      actionability: 50,
      overall: 50,
      reasoning: "Failed to parse evaluation response",
    };
  }
}
