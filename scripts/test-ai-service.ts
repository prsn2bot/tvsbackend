import {
  generateDraftWithAI,
  createVectorEmbedding,
} from "../src/services/ai.service";

/**
 * Simple test script for AI service functions
 * Tests the AI service directly without the queue system
 */
async function testAiService() {
  console.log("🧪 Testing AI Service Functions...\n");

  try {
    // Test data - sample document text
    const testText = `
      MEMORANDUM

      To: Government Officer
      From: Investigation Department
      Date: January 15, 2024

      Subject: Allegation of Undue Favoritism in Contract Award

      Dear Officer,

      This memorandum serves to inform you of allegations regarding your involvement in the award of Contract No. XYZ-2023-001 to ABC Corporation. The allegations suggest that you may have shown undue favoritism towards ABC Corporation during the bidding process.

      The specific allegations are:

      1. You allegedly met privately with representatives of ABC Corporation prior to the bid submission deadline.

      2. You allegedly provided confidential information about competing bids to ABC Corporation.

      3. The contract was awarded to ABC Corporation despite their bid being 15% higher than the lowest qualified bidder.

      Please provide your written response to these allegations within 30 days of receipt of this memorandum.

      Sincerely,
      Investigation Officer
    `;

    console.log("1. Testing generateDraftWithAI function...");
    console.log("   Input text length:", testText.length, "characters");

    const aiResult = await generateDraftWithAI(testText);

    console.log("✅ AI draft generation successful!");
    console.log(`   Defence Score: ${aiResult.defenceScore}`);
    console.log(`   Confidence Score: ${aiResult.confidenceScore}`);
    console.log(
      `   Draft Content Length: ${aiResult.draftContent.length} characters`
    );
    console.log(
      `   Draft Preview: ${aiResult.draftContent.substring(0, 200)}...\n`
    );

    console.log("2. Testing createVectorEmbedding function...");
    const embedding = await createVectorEmbedding(testText);

    console.log("✅ Vector embedding creation successful!");
    console.log(`   Embedding dimensions: ${embedding.length}`);
    console.log(
      `   Sample values: [${embedding
        .slice(0, 5)
        .map((v) => v.toFixed(4))
        .join(", ")}...]`
    );
    console.log(
      `   Vector range: ${Math.min(...embedding).toFixed(4)} to ${Math.max(
        ...embedding
      ).toFixed(4)}\n`
    );

    console.log("🎉 All AI service functions are working correctly!");
  } catch (error: any) {
    console.error("❌ AI service test failed:");
    console.error("   Error:", error.message);

    if (error.code) {
      console.error("   Error Code:", error.code);
    }

    if (error.response) {
      console.error("   Response Status:", error.response.status);
      console.error("   Response Data:", error.response.data);
    }

    console.error("\n🔍 Troubleshooting tips:");
    console.error("   - Check your GOOGLE_AI_API_KEY environment variable");
    console.error("   - Verify internet connection for API calls");
    console.error("   - Check API quota limits");
    console.error("   - Ensure the AI service configuration is correct");
  }
}

// Run the test
testAiService().catch(console.error);
