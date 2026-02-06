/**
 * Opik Client Configuration
 * Initialize Opik SDK for tracing, evaluation, and experiment tracking
 */

import { Opik } from "opik";

// Initialize Opik client with configuration from environment variables
export const opikClient = new Opik({
  apiKey: process.env.OPIK_API_KEY!,
  workspaceName: process.env.OPIK_WORKSPACE || "careerforgeai",
  projectName: process.env.OPIK_PROJECT || "skill-gap-hackathon",
});

// Helper function to check if Opik is properly configured
export function isOpikEnabled(): boolean {
  return !!process.env.OPIK_API_KEY;
}

// Export types for use in other files
export type { Opik } from "opik";
