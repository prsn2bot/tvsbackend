import { addAiProcessingJob } from "../src/jobs/queue";
import { CaseModel } from "../src/models/case.model";
import { AiDraftModel } from "../src/models/aiDraft.model";
import { pool } from "../src/config/database";

/**
 * Test script for AI processing queue
 * This script tests the complete flow of adding a document and processing it through the AI queue
 */
async function testAiQueue() {
  console.log("🧪 Testing AI Processing Queue...\n");

  try {
    // Step 1: Create a test case
    console.log("1. Creating test case...");
    const testCase = await CaseModel.create({
      title: "Test Case for AI Processing",
      description:
        "This is a test case to verify AI processing queue functionality",
      status: "intake",
      officer_user_id: 5, // Test user ID (integer)
    });
    console.log(`✅ Test case created with ID: ${testCase.id}\n`);

    // Step 2: Add a test document
    console.log("2. Adding test document...");
    const testDocument = await CaseModel.createDocument({
      case_id: testCase.id,
      cloudinary_public_id: "dummy_1.pdf",
      secure_url:
        "https://res.cloudinary.com/looye/raw/upload/v1527240070/dummy_1.pdf",
    });
    console.log(`✅ Test document created with ID: ${testDocument.id}\n`);

    // Step 3: Enqueue AI processing job
    console.log("3. Enqueuing AI processing job...");
    await addAiProcessingJob({ documentId: testDocument.id });
    console.log("✅ AI processing job enqueued\n");

    // Step 4: Wait for processing (in a real scenario, the worker would process this)
    console.log("4. Waiting for job processing...");
    console.log(
      "   (In production, the worker process would handle this asynchronously)"
    );
    console.log("   For testing, you can:");
    console.log("   - Start the worker: npm run start:worker");
    console.log("   - Check logs for processing status");
    console.log("   - Verify database updates\n");

    // Step 5: Check current state
    console.log("5. Checking current document state...");
    const documentAfter = await CaseModel.findDocumentById(testDocument.id);
    console.log(
      `Document OCR status: ${documentAfter?.ocr_status || "not set"}`
    );
    console.log(`Document has OCR text: ${!!documentAfter?.ocr_text}`);
    console.log(
      `Document has vector embedding: ${!!documentAfter?.vector_embedding}`
    );

    // Step 6: Check for AI drafts
    console.log("\n6. Checking for AI drafts...");
    const aiDrafts = await AiDraftModel.findByCaseId(testCase.id.toString());
    console.log(`Found ${aiDrafts.length} AI drafts for the case`);

    if (aiDrafts.length > 0) {
      console.log("✅ AI draft created successfully!");
      console.log(`   Defence Score: ${aiDrafts[0].defence_score}`);
      console.log(`   Confidence Score: ${aiDrafts[0].confidence_score}`);
      console.log(
        `   Content length: ${aiDrafts[0].content.length} characters`
      );
    }

    // Step 7: Check case status
    console.log("\n7. Checking case status...");
    const updatedCase = await CaseModel.findById(testCase.id);
    console.log(`Case status: ${updatedCase?.status}`);

    console.log(
      "\n🎉 Test completed! Check the logs for detailed processing information."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    // Cleanup: Remove test data
    console.log("\n🧹 Cleaning up test data...");
    try {
      await pool.query(
        "DELETE FROM documents WHERE cloudinary_public_id = $1",
        ["test-doc-123"]
      );
      await pool.query("DELETE FROM cases WHERE case_title = $1", [
        "Test Case for AI Processing",
      ]);
      console.log("✅ Test data cleaned up");
    } catch (cleanupError) {
      console.warn("⚠️  Cleanup failed:", cleanupError);
    }

    await pool.end();
  }
}

// Run the test
testAiQueue().catch(console.error);
