import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const apiKey = process.env.OPENROUTER_API_KEY || process.env.NVIDIA_API_KEY;
const client = new OpenAI({
  apiKey,
  baseURL: "https://openrouter.ai/api/v1",
});

async function testCandidate(model: string) {
  const start = Date.now();
  try {
    const res = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: "You are a fast financial analyst. Return a JSON object with a brief 2-sentence summary." },
        { role: "user", content: "Analyze: 20 Reliance shares (₹29000), 10 TCS shares (₹35000). Total: ₹64000." },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });
    console.log(`✓ ${model} -> ${(Date.now() - start) / 1000}s:`, res.choices[0]?.message?.content?.slice(0, 80));
  } catch (err: any) {
    console.log(`✗ ${model} -> ${(Date.now() - start) / 1000}s:`, err.message);
  }
}

async function testAll() {
  await testCandidate("nvidia/nemotron-3.5-lightning:free");
  await testCandidate("inclusionai/ling-3.0-flash-fin:free");
  await testCandidate("google/gemma-4-31b-it:free");
  await testCandidate("google/gemma-4-26b-a4b-it:free");
  await testCandidate("openrouter/free");
}

testAll();
