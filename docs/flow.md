# Application Flow Diagram

## User Journey Flow for Officers

```mermaid
flowchart TD
    A[Login/Sign-Up Screen] --> B{Authentication}
    B -->|Success| C[Main Dashboard]
    B -->|Failure| A

    C --> D[All Cases Screen]
    C --> E[New Case Intake Screen]
    C --> F[Account Management]

    E --> G[Case Details Dashboard]
    D --> G

    G --> H[Document Viewer Screen]
    G --> I[AI Defence Assistant Chat Screen]
    G --> J[Final Draft & Submission Screen]

    F --> K[Profile & Settings Screen]

    J --> L[Submission Complete]
```

## Backend Flow for Case Creation

```mermaid
flowchart TD
    A[Client: POST /api/v1/cases] --> B[Route: case.routes.ts]
    B --> C[Middleware: authenticate]
    C --> D[Middleware: hasRole(['officer'])]
    D --> E[Controller: createCase]
    E --> F[Validation: Zod schema]
    F --> G[Service: CaseService.createCase]
    G --> H[Model: CaseModel.create]
    H --> I[Database: INSERT INTO cases]
    I --> J[Response: 201 Created]

    K[Document Upload] --> L[Client: POST /api/v1/cases/:caseId/documents]
    L --> M[Document Service: save to DB]
    M --> N[Enqueue AI Job: BullMQ]
    N --> O[Worker: aiDraftProcessor]
    O --> P[Fetch OCR from Cloudinary]
    P --> Q[Send to AI Service]
    Q --> R[Save AI Draft to DB]
```

## System Architecture Overview

```mermaid
graph TB
    subgraph Client
        WebApp[Web Application]
    end

    subgraph API Gateway
        Express[Express Server]
        Routes[Routes /v1/*]
        Middleware[Auth, Rate Limit, etc.]
    end

    subgraph Services
        AuthSvc[Auth Service]
        UserSvc[User Service]
        CaseSvc[Case Service]
        PlanSvc[Plan Service]
        SubSvc[Subscription Service]
    end

    subgraph Models
        AuthModel[Auth Model]
        UserModel[User Model]
        CaseModel[Case Model]
        PlanModel[Plan Model]
        SubModel[Subscription Model]
    end

    subgraph Database
        Postgres[(PostgreSQL)]
    end

    subgraph External
        Cloudinary[Cloudinary for Files]
        AI[AI Service]
        Redis[(Redis for Queue)]
        Email[Email Service]
    end

    WebApp --> Express
    Express --> Routes
    Routes --> Middleware
    Middleware --> Services
    Services --> Models
    Models --> Postgres

    CaseSvc --> Cloudinary
    CaseSvc --> AI
    CaseSvc --> Redis
    AuthSvc --> Email
```
