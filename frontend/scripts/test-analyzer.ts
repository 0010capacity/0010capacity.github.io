import { analyzeUserTechStack } from "../lib/github";

async function testAnalyzer() {
  console.log("Testing GitHub repository analyzer...");
  try {
    const result = await analyzeUserTechStack("0010capacity");
    console.log("✅ Tech stack analysis successful:");
    console.log(result);
  } catch (error) {
    console.error("❌ Error analyzing tech stack:", error);
    // Show expected fallback behavior
    console.log("Expected to use fallback tech stack");
  }
}

testAnalyzer();
