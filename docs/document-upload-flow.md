# Document Upload Flow

This document outlines the business-level flow for handling document uploads by users in the case management system.

## Business Process Overview

1. **User Initiates Upload**: Officer selects documents (PDF, scans, audio notes) for a specific case.
2. **Client-Side Processing**: Client uploads files to Cloudinary for storage and OCR processing.
3. **Backend Validation**: Server validates the upload request and associates the document with the case.
4. **Database Storage**: Document metadata is saved in the database.
5. **Asynchronous AI Processing**: Job is enqueued to process the document with AI for draft generation.
6. **Notification**: User is notified of successful upload and processing status.

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant Cloudinary
    participant Backend
    participant DB
    participant Queue
    participant Worker

    User->>Client: Select and upload documents for case
    Client->>Cloudinary: Upload file (PDF/scan/audio)
    Cloudinary->>Cloudinary: Store file, perform OCR if applicable
    Cloudinary-->>Client: Return secure_url, public_id, OCR text
    Client->>Backend: POST /api/v1/cases/:caseId/documents with Cloudinary data
    Backend->>Backend: Authenticate user, validate case ownership
    Backend->>DB: INSERT INTO documents (case_id, cloudinary_public_id, secure_url, ...)
    DB-->>Backend: Return document record
    Backend->>Queue: Enqueue AI processing job (documentId)
    Queue-->>Backend: Job queued
    Backend-->>Client: 201 Created with document data
    Client-->>User: Show upload success, processing in progress
    Worker->>Queue: Pick up job
    Worker->>Cloudinary: Fetch document text/OCR
    Worker->>AI Service: Send text for draft generation
    AI Service-->>Worker: Return AI draft
    Worker->>DB: INSERT INTO ai_drafts (case_id, content, ...)
    Worker->>Backend: (Optional) Notify user via email/websocket
```

## Key Components

- **Cloudinary**: Handles file storage, provides secure URLs, and performs OCR on images/PDFs.
- **Backend API**: Validates requests, saves metadata, enqueues jobs.
- **BullMQ Queue**: Manages asynchronous processing to avoid blocking the API response.
- **AI Worker**: Processes documents in background, generates drafts, updates database.
- **Database**: Stores document metadata and AI-generated content.

## Error Handling

- If Cloudinary upload fails, client retries or shows error.
- If backend validation fails (e.g., invalid case), return 400/403.
- If job enqueue fails, log error, but still return success to user.
- Worker failures are retried via BullMQ.

## Security Considerations

- Files are uploaded directly to Cloudinary with signed requests.
- Backend verifies user has access to the case.
- Sensitive documents are secured with access controls.

## Starting Point

To implement this, start with setting up Cloudinary configuration in `src/config/cloudinary.ts`, then implement the document upload route in `case.controller.ts` and `case.service.ts`.
