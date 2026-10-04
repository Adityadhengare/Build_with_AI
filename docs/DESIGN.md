# System Design Document

## Project: ScholarSathi
**Document Version:** 1.0.0  
**Status:** Approved for Core Engineering  
**Architecture Pattern:** Modular Monolith with Clean Architecture & Pure Functional Rule Engine

---

## 1. High-Level Architecture Overview

ScholarSathi is designed to provide high throughput, extreme reliability, and sub-second deterministic rule processing while isolating AI operations into non-blocking, sandboxed pipelines.

```mermaid
graph TD
    subgraph Client ["Client Presentation Tier (Next.js 14+ / React)"]
        UI["Student & Admin Web Interface<br/>(Light Theme / Accessible WCAG 2.1 AA)"]
    end

    subgraph Edge ["Edge & Gateway Tier"]
        Proxy["Reverse Proxy / Nginx / Cloudflare"]
        RateLimit["Rate Limiting & Threat Shield"]
        AuthFilter["Session / Cookie Validation Middleware"]
    end

    subgraph AppServer ["Application Core (Node.js / Modular Services)"]
        Router["API Gateway / Request Router"]
        
        subgraph Services ["Decoupled Service Domain"]
            AuthSvc["Authentication Service"]
            ProfileSvc["Profile & Education Service"]
            Engine["Deterministic Eligibility Engine"]
            RecomSvc["Recommendation & Ranking Service"]
            DocSvc["Document Ingestion Service"]
            GeminiSvc["Gemini AI Bridge Service"]
            NotifSvc["Notification Service"]
            AdminSvc["Admin & Audit Service"]
        end
    end

    subgraph DataTier ["Data & Persistence Tier"]
        PG[(PostgreSQL 15+ Cluster<br/>Relational Data + pgvector)]
        S3[(Private Encrypted Object Storage<br/>S3 / MinIO / Cloudinary)]
    end

    subgraph External ["External Ecosystem"]
        GeminiAPI["Google Gemini AI Platform"]
        OfficialSites["Official Government & Trust Portals"]
    end

    UI <-->|HTTPS / REST / JSON| Proxy
    Proxy --> RateLimit
    RateLimit --> AuthFilter
    AuthFilter --> Router

    Router --> AuthSvc
    Router --> ProfileSvc
    Router --> Engine
    Router --> RecomSvc
    Router --> DocSvc
    Router --> GeminiSvc
    Router --> NotifSvc
    Router --> AdminSvc

    AuthSvc --> PG
    ProfileSvc --> PG
    Engine --> PG
    RecomSvc --> Engine
    RecomSvc --> PG
    DocSvc --> S3
    DocSvc --> PG
    GeminiSvc <-->|HTTPS Server-to-Server| GeminiAPI
    GeminiSvc --> PG
    NotifSvc --> PG
    AdminSvc --> PG

    UI -.->|Direct Student Application| OfficialSites

    style Client fill:#EFF6FF,stroke:#1E3A8A,stroke-width:2px,color:#0F2942
    style Edge fill:#F8FAFC,stroke:#0F2942,stroke-width:2px,color:#0F2942
    style AppServer fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#92400E
    style DataTier fill:#F0FDF4,stroke:#059669,stroke-width:2px,color:#065F46
    style External fill:#FAF5FF,stroke:#7E22CE,stroke-width:2px,color:#581C87
```

---

## 2. Component Architecture & Service Boundaries

ScholarSathi uses a **Modular Monolith** architecture with strict domain boundaries. This eliminates the operational overhead of microservices while maintaining clean dependency isolation.

### 2.1 Component Catalog

1. **Frontend Presentation Component (`frontend/`):**
   - Built on Next.js 14+ App Router, utilizing Server Components for public catalog indexing and Client Components for interactive dashboards, forms, and the AI assistant.
2. **Authentication Service (`services/auth/`):**
   - Enforces Argon2id hashing, generates and rotates HTTP-Only SameSite session cookies, and handles role verification (`STUDENT`, `ADMIN`, `SUPER_ADMIN`).
3. **Student Profile Service (`services/profile/`):**
   - Manages personal, demographic, category, and academic attributes. Computes the dynamic Profile Completeness Score (0–100%).
4. **Scholarship Catalog Service (`services/scholarship/`):**
   - Provides faceted full-text search, provider registration, category taxonomy, and links to verified official application portals.
5. **Deterministic Eligibility Engine (`services/engine/`):**
   - Pure, stateless, mathematical evaluation module. Evaluates student profile attributes against structured rule records. Has **zero** dependency on LLMs.
6. **Recommendation & Ranking Service (`services/recommendation/`):**
   - Orchestrates candidate retrieval, runs candidate scholarships through the Deterministic Eligibility Engine, applies the multi-factor ranking formula, and persists recommendation scores.
7. **Document Ingestion Service (`services/document/`):**
   - Validates file streams (magic number check), persists encrypted binaries into private object storage, generates 15-minute presigned URLs, and dispatches extraction jobs.
8. **Gemini AI Service (`services/ai/`):**
   - Server-side interface to Google Gemini models. Manages extraction prompts, enforces JSON schemas, and coordinates tool-calling functions for the conversational assistant.
9. **Notification Service (`services/notification/`):**
   - Evaluates deadline urgency (7 days, 3 days, 1 day) and dispatches in-app notifications to affected students.
10. **Admin & Audit Service (`services/admin/`):**
    - Governs administrative operations, scholarship rule building, provider verification, and immutable audit logging.

---

## 3. End-to-End System Data Flows

---

### 3.1 Data Flow 1: Student Registration & Profile Creation

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as Web Frontend
    participant Auth as Auth Service
    participant Profile as Profile Service
    participant DB as PostgreSQL DB

    Student->>UI: Enter Email & Password
    UI->>Auth: POST /api/auth/register
    Auth->>Auth: Hash password with Argon2id
    Auth->>DB: INSERT into `users` (role='STUDENT')
    Auth->>UI: 201 Created + Set HTTP-Only Cookie
    
    UI->>Student: Redirect to Profile Onboarding Wizard
    Student->>UI: Submit Domicile, Category, Income, Degree & Marks
    UI->>Profile: PUT /api/profile + PUT /api/profile/academic
    Profile->>Profile: Calculate Completeness Score
    Profile->>DB: INSERT / UPDATE `student_profiles` & `education_profiles`
    Profile-->>UI: 200 OK (Completeness: 85%)
    UI->>Student: Present Dashboard with Initial Matches
```

---

### 3.2 Data Flow 2: Document Ingestion, Gemini Extraction, & Verification

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as Web Frontend
    participant DocSvc as Document Service
    participant S3 as Encrypted Object Storage
    participant GeminiSvc as Gemini AI Service
    participant DB as PostgreSQL DB

    Student->>UI: Upload Income Certificate (PDF / Image)
    UI->>DocSvc: POST /api/documents/upload (Multipart Stream)
    DocSvc->>DocSvc: Validate file signature bytes (%PDF- or JFIF)
    DocSvc->>S3: PutObject with randomized UUID key
    DocSvc->>DB: INSERT `documents` (status='PROCESSING')
    DocSvc-->>UI: 202 Accepted (Upload Complete, Analysis Underway)

    DocSvc->>GeminiSvc: Process Document with Structured Vision Extraction
    GeminiSvc->>GeminiSvc: Call gemini-1.5-flash with Response Schema
    GeminiSvc-->>DocSvc: Return Validated JSON (Income: 235000, FY: 2026-27, Conf: 0.96)
    DocSvc->>DB: INSERT `document_extractions` & UPDATE `documents` (status='EXTRACTED')
    DocSvc->>DB: INSERT `notifications` ("Extraction ready for review")

    UI->>Student: Display Side-by-Side Review Modal
    Student->>UI: Verify & Click "Confirm Extracted Income"
    UI->>DocSvc: POST /api/documents/:id/verify
    DocSvc->>DB: UPDATE `documents` (status='VERIFIED')
    DocSvc->>DB: UPDATE `student_profiles` (family_annual_income=235000)
    DocSvc-->>UI: 200 OK (Profile auto-updated & verified)
```

---

### 3.3 Data Flow 3: Deterministic Recommendation Pipeline

```mermaid
sequenceDiagram
    autonumber
    participant UI as Web Frontend
    participant RecomSvc as Recommendation Service
    participant Engine as Deterministic Eligibility Engine
    participant DB as PostgreSQL DB

    UI->>RecomSvc: GET /api/recommendations
    RecomSvc->>DB: Query Student Profile & Education Data
    RecomSvc->>DB: Query Active Scholarships & Rules (GIN index search)
    Note over DB,RecomSvc: Filters candidate pool from 1000s down to ~50 candidates
    
    loop For each candidate scholarship
        RecomSvc->>Engine: evaluateEligibility(studentProfile, scholarshipRules)
        Engine->>Engine: Run Stage 1 Hard Filters (Domicile, Category, Income)
        Engine->>Engine: Run Stage 2 Cutoff Filters (Marks, Education Level)
        Engine->>Engine: Run Stage 3 Document Check
        Engine-->>RecomSvc: Return Result: (ELIGIBLE, Itemized Reasons, Missing Docs)
    end

    RecomSvc->>RecomSvc: Calculate Composite Priority Scores
    RecomSvc->>DB: UPSERT `scholarship_recommendations`
    RecomSvc-->>UI: 200 OK (Ranked List with Status Badges)
```

---

### 3.4 Data Flow 4: Conversational AI Assistant with Tool Execution

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as Web Frontend
    participant GeminiSvc as Gemini AI Service
    participant Engine as Deterministic Engine
    participant DB as PostgreSQL DB

    Student->>UI: Ask: "Why is the Tata Trust grant marked Needs Verification?"
    UI->>GeminiSvc: POST /api/ai/chat (Message + Auth Context)
    GeminiSvc->>GeminiSvc: Formulate Prompt with System Persona & Tools
    GeminiSvc->>GeminiSvc: Send to Gemini Pro with Tool Definitions
    
    Note over GeminiSvc: Gemini decides to invoke `getRequiredDocuments`
    GeminiSvc->>DB: Execute getRequiredDocuments(scholarshipId)
    DB-->>GeminiSvc: Returns [Bonafide Certificate (Mandatory)]
    
    GeminiSvc->>DB: Check student's uploaded documents
    DB-->>GeminiSvc: Bonafide Certificate NOT found in vault
    
    GeminiSvc->>GeminiSvc: Synthesize Final Answer with Grounded Context
    GeminiSvc->>DB: Store conversation & message turns
    GeminiSvc-->>UI: "It is marked Needs Verification because a College Bonafide Certificate is required, which has not yet been uploaded to your documents vault."
    UI->>Student: Render Answer with "Upload Bonafide Certificate" CTA button
```

---

## 4. The Deterministic Eligibility Engine

The Deterministic Eligibility Engine is the mathematical core of ScholarSathi. **It never uses probabilistic models or LLMs to determine rule satisfaction.**

### 4.1 Multi-Stage Evaluation Pipeline

```mermaid
flowchart TD
    Start["Student Profile + Scholarship Rule Input"] --> Stage1{"Stage 1: Domicile & Category Check"}

    Stage1 -->|Domicile Mismatch| IneligibleState["NOT_ELIGIBLE<br/>(Reason: Domicile Mismatch)"]
    Stage1 -->|Category Mismatch| IneligibleState
    Stage1 -->|Pass| Stage2{"Stage 2: Income Ceiling Check"}

    Stage2 -->|Income > Max Cap| IneligibleState
    Stage2 -->|Pass| Stage3{"Stage 3: Academic Cutoff Check"}

    Stage3 -->|Percentage < Cutoff| IneligibleState
    Stage3 -->|Pass| Stage4{"Stage 4: Education Level & Course Check"}

    Stage4 -->|Degree Level Not Eligible| IneligibleState
    Stage4 -->|Pass| Stage5{"Stage 5: Verification & Document Audit"}

    Stage5 -->|Required Docs Missing / Profile Self-Declared| NeedsVerifState["NEEDS_VERIFICATION or LIKELY_ELIGIBLE<br/>(Passes all hard rules, pending document upload)"]
    Stage5 -->|All Mandatory Docs Uploaded & Verified| EligibleState["ELIGIBLE<br/>(100% Qualified & Ready to Apply)"]

    style IneligibleState fill:#FEF2F2,stroke:#DC2626,stroke-width:2px,color:#991B1B
    style NeedsVerifState fill:#FFFBEB,stroke:#D97706,stroke-width:2px,color:#92400E
    style EligibleState fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46
```

### 4.2 Deterministic Engine Implementation Specification

```typescript
export interface RuleEvaluationResult {
  status: 'ELIGIBLE' | 'LIKELY_ELIGIBLE' | 'NEEDS_VERIFICATION' | 'NOT_ELIGIBLE';
  matchReasons: string[];
  mismatchReasons: string[];
  missingDocuments: string[];
}

export function evaluateScholarshipEligibility(
  student: StudentProfileData,
  education: EducationProfileData,
  rules: ScholarshipEligibilityRules,
  uploadedDocs: DocumentRecord[]
): RuleEvaluationResult {
  const matchReasons: string[] = [];
  const mismatchReasons: string[] = [];
  const missingDocuments: string[] = [];

  // 1. Domicile Check
  const allowedStates = rules.allowedStates; // e.g. ["Maharashtra", "ALL"]
  if (!allowedStates.includes("ALL") && !allowedStates.includes(student.domicileState)) {
    mismatchReasons.push(`Domicile state '${student.domicileState}' is not eligible. Allowed: ${allowedStates.join(', ')}.`);
  } else {
    matchReasons.push(`Domicile '${student.domicileState}' meets eligibility.`);
  }

  // 2. Category Check
  const allowedCategories = rules.allowedCategories;
  if (!allowedCategories.includes(student.category)) {
    mismatchReasons.push(`Social category '${student.category}' is not eligible for this scheme.`);
  } else {
    matchReasons.push(`Category '${student.category}' is eligible.`);
  }

  // 3. Family Annual Income Check
  if (rules.maxFamilyIncome !== null) {
    if (student.familyAnnualIncome > rules.maxFamilyIncome) {
      mismatchReasons.push(
        `Family income ₹${student.familyAnnualIncome.toLocaleString('en-IN')} exceeds maximum limit of ₹${rules.maxFamilyIncome.toLocaleString('en-IN')}.`
      );
    } else {
      matchReasons.push(
        `Family income ₹${student.familyAnnualIncome.toLocaleString('en-IN')} is within the limit of ₹${rules.maxFamilyIncome.toLocaleString('en-IN')}.`
      );
    }
  }

  // 4. Academic Cutoff Check
  if (rules.minPercentage !== null) {
    if (education.percentageOrCgpa < rules.minPercentage) {
      mismatchReasons.push(
        `Academic score ${education.percentageOrCgpa}% is below the required cutoff of ${rules.minPercentage}%.`
      );
    } else {
      matchReasons.push(
        `Academic score ${education.percentageOrCgpa}% satisfies the minimum cutoff of ${rules.minPercentage}%.`
      );
    }
  }

  // 5. Gender Filter Check
  if (!rules.allowedGenders.includes("ALL") && !rules.allowedGenders.includes(student.gender)) {
    mismatchReasons.push(`Scholarship is restricted to ${rules.allowedGenders.join(', ')} applicants.`);
  }

  // Immediate Hard Rejection
  if (mismatchReasons.length > 0) {
    return {
      status: 'NOT_ELIGIBLE',
      matchReasons,
      mismatchReasons,
      missingDocuments
    };
  }

  // 6. Document & Verification Audit
  const verifiedDocTypes = uploadedDocs
    .filter(doc => doc.status === 'VERIFIED')
    .map(doc => doc.documentType);

  const mandatoryDocTypes = rules.mandatoryDocuments || [];
  for (const docType of mandatoryDocTypes) {
    if (!verifiedDocTypes.includes(docType)) {
      missingDocuments.push(docType);
    }
  }

  if (missingDocuments.length > 0) {
    return {
      status: 'NEEDS_VERIFICATION',
      matchReasons,
      mismatchReasons,
      missingDocuments
    };
  }

  // All criteria and documents fully verified
  return {
    status: 'ELIGIBLE',
    matchReasons,
    mismatchReasons,
    missingDocuments: []
  };
}
```

---

## 5. AI Assistant & Tool-Calling Architecture

The conversational assistant operates via **ReAct (Reasoning + Acting)** tool calling. It never directly accesses raw SQL tables. Instead, it interacts exclusively with strictly scoped helper functions:

```mermaid
graph TD
    UserQuery["Student Query: 'Do I need an income certificate for NSP?'"] --> GeminiModel["Gemini Pro Model (Server-Side)"]
    GeminiModel --> ToolDecide{"Determine Needed Tool"}

    ToolDecide -->|Search Needed| Tool1["searchScholarships(keyword='NSP')"]
    ToolDecide -->|Document List Needed| Tool2["getRequiredDocuments(scholarshipId)"]
    ToolDecide -->|Student Rule Check| Tool3["checkEligibility(scholarshipId)"]

    Tool1 --> ToolExec["Server Tool Executor (Pre-authenticated Session)"]
    Tool2 --> ToolExec
    Tool3 --> ToolExec

    ToolExec --> ResultData["Structured Output Data"]
    ResultData --> GeminiSynthesize["Gemini Context Synthesis"]
    GeminiSynthesize --> SafeResponse["Plain-English Grounded Response"]

    style UserQuery fill:#EFF6FF,stroke:#1E3A8A,stroke-width:2px,color:#0F2942
    style GeminiModel fill:#FAF5FF,stroke:#7E22CE,stroke-width:2px,color:#581C87
    style ToolExec fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#92400E
    style SafeResponse fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#065F46
```

---

## 6. Multi-Factor Recommendation Pipeline

The recommendation pipeline runs in four distinct phases:
1. **Candidate Retrieval (Database & Vector Filter):**
   - High-speed SQL query using GIN indexes on `allowed_states` and `allowed_categories`.
   - Semantic similarity search using `pgvector` on course names and career goals.
2. **Rule Filtering (Deterministic Engine):**
   - Candidate list evaluated through `evaluateScholarshipEligibility()`.
3. **Multi-Factor Ranking:**
   - Composite priority calculation:
     $$\text{Score} = (0.50 \times \text{Status}) + (0.25 \times \text{Deadline}) + (0.15 \times \text{Benefit}) + (0.10 \times \text{DocCompleteness})$$
4. **Explanation Generation:**
   - Pre-computed template strings or lightweight Gemini synthesis for plain-English display.

---

## 7. Reliability, Resilience & Graceful Degradation

| Failure Mode | Detection / Trigger | Impact | Resilience & Fallback Mechanism |
| :--- | :--- | :--- | :--- |
| **Gemini API Outage / Rate Limit** | HTTP 500 / 429 from Google API | Document OCR extraction or chat assistant stalls | **Graceful Degradation:** The student is prompted to enter certificate values manually. Core search, deterministic eligibility matching, and official application links continue operating with zero degradation. |
| **Document OCR Parse Failure** | Extraction confidence < 0.70 or unreadable scan | Certificate details cannot be reliably extracted | **Human-in-the-Loop:** System flags the extraction, highlights unreadable fields, and presents a manual confirmation screen to the student. |
| **Official Portal Downtime** | External government portal (NSP / MahaDBT) is slow or unreachable | Student clicking "Apply" cannot load portal | **Informational Caching:** ScholarSathi maintains cached instructions, offline guidelines, and required document checklists so students can prepare documents while waiting for the portal to recover. |
| **PostgreSQL Connection Spike** | Active pool connections exceed 90% | API latency increases | **PgBouncer Connection Pooling:** Limits open backend connections to 100 while serving up to 5,000 pooled client connections with transaction-level reuse. |
