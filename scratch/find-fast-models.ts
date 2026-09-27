import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const apiKey = process.env.OPENROUTER_API_KEY || process.env.NVIDIA_API_KEY;
const client = new OpenAI({
  apiKey,
  baseURL: "https://openrouter.ai/api/v1",
});

async function findFastFreeModels() {
  const modelsToTest = [
    "meta-llama/llama-3.2-3b-instruct:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
    "google/gemini-2.0-flash-lite-preview-02-05:free",
    "google/gemini-2.0-flash-thinking-exp:free",
    "google/gemini-2.0-pro-exp-02-05:free",
    "deepseek/deepseek-r1:free",
    "qwen/qwen-2.5-72b-instruct:free",
    "qwen/qwen-2.5-coder-32b-instruct:free",
    "nvidia/llama-3.1-nemotron-70b-instruct:free",
  ];

  for (const m of modelsToTest) {
    const start = Date.now();
    try {
      const res = await client.chat.completions.create({
        model: m,
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 10,
      });
      console.log(`✓ ${m} responded in ${(Date.now() - start) / 1000}s`);
    } catch (err: any) {
      console.log(`✗ ${m}: ${err.status} - ${err.message?.slice(0, 80)}`);
    }
  }
}

findFastFreeModels();
