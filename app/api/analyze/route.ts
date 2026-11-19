// Our API endpoint: POST /api/analyze
//
// This code runs ONLY on the server, never in the browser. That is why the
// real AI call (and the secret API key) will live behind this endpoint later.
//
// Its only job is HTTP: read the request, validate it, call analyzeText(),
// and send back JSON in the shape defined in lib/types.ts.

import { AnalysisError, analyzeText } from "@/lib/analyzer";
import { MAX_TEXT_LENGTH, type AnalysisResult, type ApiError } from "@/lib/types";

// Small typed helpers, so every response matches our contract.
function success(result: AnalysisResult) {
  return Response.json(result, { status: 200 });
}
function failure(message: string, status: 400 | 500) {
  const body: ApiError = { error: message };
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  // 1. Parse the JSON body. If it isn't valid JSON, that's the client's fault (400).
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure("Request body must be valid JSON.", 400);
  }

  // 2. Validate. Never trust the browser: someone could call this endpoint directly
  //    (for example with curl), skipping the checks the page does.
  const text =
    typeof body === "object" && body !== null && "text" in body
      ? (body as { text: unknown }).text
      : undefined;

  if (typeof text !== "string" || text.trim().length === 0) {
    return failure("Please enter some text to analyze.", 400);
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return failure(`Text is too long. Please keep it under ${MAX_TEXT_LENGTH} characters.`, 400);
  }

  // 3. Analyze. Any unexpected failure becomes a 500 with a friendly message.
  //    The real error is logged on the server, but not shown to the user.
  try {
    const result = await analyzeText(text.trim());
    return success(result);
  } catch (err) {
    // AnalysisError messages were written to be user-friendly (e.g. "API key is invalid"),
    // so show them. Anything else is unexpected: log it and show a generic message.
    if (err instanceof AnalysisError) {
      return failure(err.message, 500);
    }
    console.error("Analysis failed:", err);
    return failure("Something went wrong while analyzing your text. Please try again.", 500);
  }
}
