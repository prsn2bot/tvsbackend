# AI Processing Queue Setup and Testing Guide

This guide explains how to start and test the AI processing queue system for document analysis and draft generation.

## 🚀 Quick Start

### 1. Start the AI Processing Worker

The worker processes AI jobs asynchronously in the background:

```bash
npm run start:worker
```

This starts the BullMQ worker that listens for AI processing jobs and processes them using the `aiDraftProcessor`.

### 2. Start the Main Application

In a separate terminal, start your main Express application:

```bash
npm run dev
```

### 3. Test the AI Processing Queue

Run the test script to verify the complete flow:

```bash
npm run test:ai-queue
```

## 📋 What the Test Does

The test script (`scripts/test-ai-queue.ts`) performs these steps:

1. **Creates a test case** in the database
2. **Adds a test document** to the case
3. **Enqueues an AI processing job** using BullMQ
4. **Checks the processing status** and database updates
5. **Verifies AI draft creation** and case status changes
6. **Cleans up test data**

## 🔍 Monitoring and Debugging

### Check Job Status

The worker logs all job processing activities. Look for these log messages:

```
✅ AI Processing Worker started and listening for jobs...
✅ Job completed for document ID: [document-id]
❌ Job failed for document ID: [document-id]
```

### Database Verification

After running the test, check your database for:

- **Documents table**: OCR text, vector embedding, and OCR status
- **AI Drafts table**: Generated defence drafts with scores
- **Cases table**: Updated status to `awaiting_officer_review`

### Queue Monitoring

The BullMQ queue stores jobs in Redis. You can monitor:

- **Waiting jobs**: Jobs queued but not yet processed
- **Active jobs**: Currently being processed
- **Completed jobs**: Successfully processed
- **Failed jobs**: Jobs that failed after retries

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Case Service  │───▶│   BullMQ Queue   │───▶│   AI Worker     │
│                 │    │   (Redis)        │    │   Processor     │
│ addDocument()   │    │                  │    │                 │
│ ──────────────  │    │ ai-processing    │    │ aiDraftProcessor│
│ enqueue job     │    │ queue            │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Documents     │    │   Job Status      │    │   AI Drafts     │
│   Table         │    │   Monitoring      │    │   Table         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔧 Configuration

### Environment Variables

Make sure these are set in your `.env` file:

```env
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Worker Configuration

The worker is configured in `src/jobs/worker.ts`:

- **Concurrency**: 2 jobs processed simultaneously
- **Rate Limiting**: Max 10 jobs per second
- **Retries**: 3 attempts with exponential backoff
- **Connection**: Uses your Redis configuration

## 🧪 Manual Testing

### Using API Endpoints

1. **Create a case** via your API
2. **Upload a document** to the case (this triggers AI processing)
3. **Monitor logs** for processing status
4. **Check database** for AI draft generation

### Example API Call

```bash
# Upload document to case (replace with actual case ID)
curl -X POST http://localhost:3000/api/v1/cases/{caseId}/documents \
  -H "Authorization: Bearer {your-token}" \
  -F "file=@document.pdf"
```

## 📊 Performance Considerations

- **Worker Scaling**: Run multiple worker instances for high throughput
- **Redis Clustering**: Use Redis cluster for production scalability
- **Database Indexing**: Ensure proper indexes on frequently queried fields
- **Rate Limiting**: AI services may have rate limits to consider

## 🚨 Troubleshooting

### Common Issues

1. **Worker not starting**: Check Redis connection and environment variables
2. **Jobs not processing**: Verify worker is running and queue name matches
3. **Database errors**: Check database connection and table schemas
4. **AI service failures**: Verify API keys and service availability

### Debug Mode

Enable detailed logging by setting:

```env
LOG_LEVEL=debug
```

### Queue Inspection

Check queue status programmatically:

```typescript
import { aiProcessingQueue } from "./src/jobs/queue";

// Get queue statistics
const waiting = await aiProcessingQueue.getWaiting();
const active = await aiProcessingQueue.getActive();
const completed = await aiProcessingQueue.getCompleted();
const failed = await aiProcessingQueue.getFailed();
```

## 🎯 Next Steps

After successful testing:

1. **Replace mock services** with real AI APIs (OpenAI, Google AI, etc.)
2. **Add monitoring dashboard** using Bull Board
3. **Implement progress tracking** for long-running jobs
4. **Add job prioritization** for urgent cases
5. **Set up alerts** for failed jobs

## 📚 Additional Resources

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Documentation](https://redis.io/documentation)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Happy coding!** 🎉 The AI processing queue is now ready for production use.
