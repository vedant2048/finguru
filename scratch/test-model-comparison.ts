import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const apiKey = process.env.OPENROUTER_API_KEY || process.env.NVIDIA_API_KEY;
const client = new OpenAI({
  apiKey,
  baseURL: "https://openrouter.ai/api/v1",
});

async function testModel(modelName: string, enableReasoning = false) {
  const start = Date.now();
  console.log(`\nTesting ${modelName} (reasoning: ${enableReasoning})...`);
  try {
    const extraBody: Record<string, any> = {};
    if (enableReasoning) extraBody.reasoning = { enabled: true };

    const res = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: "You are a concise financial analyst. Return a short JSON object with summary and risk." },
        { role: "user", content: "Analyze: 20 Reliance shares (₹29000), 10 TCS shares (₹35000). Total: ₹64000." },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
      ...(Object.keys(extraBody).length > 0 ? { extra_body: extraBody } : {}),
    });
    console.log(`✓ ${modelName} completed in ${(Date.now() - start) / 1000}s!`);
    console.log("Snippet:", res.choices[0]?.message?.content?.slice(0, 100));
  } catch (err: any) {
    console.error(`✗ ${modelName} failed in ${(Date.now() - start) / 1000}s:`, err.message);
  }
}

async function runAll() {
  await testModel("google/gemini-2.0-flash-001", false);
  await testModel("meta-llama/llama-3.3-70b-instruct:free", false);
  await testModel("nvidia/nemotron-3-ultra-550b-a55b:free", false);
}

runAll();
