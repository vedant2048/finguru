import { z } from "zod";
import type { SecurityCandidate } from "@/lib/portfolio/types";
import { generateStructured } from "./client";

const ResolutionSchema = z.object({
  resolutions: z.array(
    z.object({
      id: z.number().describe("The id of the input being resolved"),
      input: z.string(),
      company: z.string().nullable().describe("Canonical listed company name, or null if unsure"),
      symbol: z.string().nullable().describe("NSE/BSE ticker without exchange suffix, or null if unsure"),
      exchange: z.enum(["NSE", "BSE"]).nullable(),
      confidence: z.number().describe("0 to 1"),
      reason: z.string().describe("One sentence explaining the match or why it is uncertain"),
    })
  ),
});

export type AIResolution = z.infer<typeof ResolutionSchema>["resolutions"][number];

const SYSTEM = `You map holding names typed by Indian retail investors (from broker exports and spreadsheets) to the listed company they refer to.

For each input you receive candidate listings returned by a market-data search. Rules:
- Prefer a symbol from the candidates list. Prefer the NSE listing when both NSE and BSE exist.
- Abbreviations such as "IND", "BK", "FIN", "CORP", "SERV", "LTD" and dropped words are normal; use your knowledge of Indian company naming to interpret them.
- If the input could reasonably refer to more than one distinct company (for example a group name shared by several listed companies), set confidence below 0.6 and explain the ambiguity.
- Only propose a symbol outside the candidates when you are certain of the exact current NSE ticker. It will be verified against the exchange and rejected if it does not exist.
- If you do not know, return null for company and symbol. Never invent a ticker.
- Do not include prices or any other financial figures.`;

export async function resolveStocksWithAI(
  items: { id: number; input: string; symbolHint: string | null; candidates: SecurityCandidate[] }[]
): Promise<AIResolution[]> {
  if (items.length === 0) return [];

  const payload = items.map((i) => ({
    id: i.id,
    input: i.input,
    symbolColumn: i.symbolHint,
    candidates: i.candidates.map((c) => ({ symbol: c.symbol, exchange: c.exchange, company: c.company })),
  }));

  const result = await generateStructured({
    schema: ResolutionSchema,
    system: SYSTEM,
    effort: "medium",
    prompt: `Resolve each of these portfolio holdings to a listed Indian company. Return exactly one resolution per id.\n\n${JSON.stringify(payload, null, 2)}`,
  });

  return result.resolutions.map((r) => ({ ...r, confidence: Math.min(1, Math.max(0, r.confidence)) }));
}
