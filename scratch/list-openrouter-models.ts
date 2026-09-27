import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const apiKey = process.env.OPENROUTER_API_KEY || process.env.NVIDIA_API_KEY;

async function listOpenRouterFreeModels() {
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const data = await res.json();
  const freeModels = data.data.filter((m: any) => m.id.endsWith(":free") || (m.pricing && m.pricing.prompt === "0" && m.pricing.completion === "0"));
  console.log(`Found ${freeModels.length} free models:`);
  freeModels.forEach((m: any) => console.log(`- ${m.id} (${m.context_length} ctx)`));
}

listOpenRouterFreeModels();
