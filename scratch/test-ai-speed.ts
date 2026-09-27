import { getAIClient, AI_MODEL } from "../lib/ai/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function testAISpeed() {
  const ai = getAIClient();
  console.log("Testing AI Model:", AI_MODEL);
  console.log("Client configured:", Boolean(ai));

  if (!ai) return;

  const start = Date.now();
  try {
    const res = await ai.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: "user", content: "Say hello in 5 words." }],
      max_tokens: 50,
    });
    console.log(`Response received in ${Date.now() - start}ms:`, res.choices[0]?.message?.content);
  } catch (err: any) {
    console.error(`Failed after ${Date.now() - start}ms:`, err.message);
  }
}

testAISpeed();
