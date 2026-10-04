# ScholarSathi Backend Engine

Production-grade, modular Node.js/TypeScript backend for **ScholarSathi** — India's trusted AI-powered scholarship discovery and deterministic eligibility platform.

---

## 🏛️ System Architecture

```
Frontend (Next.js 14+ / React)
       ↓  (HTTPS REST API / Bearer Token)
Backend Gateway & API Layer (Express / TypeScript)
       ├── Rate Limiting & Helmet Security Headers
       ├── Firebase Auth Middleware (Token Verification & UID Extraction)
       ├── Zod Schema Validation (Request Sanitization)
       ↓
Domain Services
       ├── Deterministic Eligibility Engine (Pure rules-based mathematical evaluation)
       ├── Recommendation & Ranking Engine (Multi-factor priority ranking)
       ├── Document Understanding Service (Magic bytes check, Gemini server-side extraction)
       ├── Grounded AI Assistant (Contextual tool-calling, Prompt injection protection)
       └── Audit Logging & RBAC Service
       ↓
Persistence & Cloud Infrastructure
       ├── Firebase Authentication (Managed identity & ID tokens)
       ├── Cloud Firestore (Profiles, Scholarships, Applications, Documents, Notifications)
       ├── Firebase Storage (Encrypted student certificates & documents)
       └── Google Gemini API (Server-side Flash & Pro models via `@google/generative-ai`)
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v20+ (tested on v25.8.0)
- **npm**: v10+

### 2. Installation
```bash
cd backend
npm install
```

### 3. Environment Variables Configuration
Copy the template environment file:
```bash
cp .env.example .env
```
Configure your environment variables:
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | HTTP Server port | `5000` |
| `NODE_ENV` | Environment (`development`, `production`, `test`) | `development` |
| `API_PREFIX` | Base REST API route prefix | `/api` |
| `CORS_ORIGIN` | Allowed client origin(s) | `http://localhost:3000` |
| `FIREBASE_PROJECT_ID` | Firebase Project ID | `scholarsaathi-549cd` |
| `FIREBASE_STORAGE_BUCKET`| Firebase Storage bucket | `scholarsaathi-549cd.appspot.com` |
| `FIREBASE_SERVICE_ACCOUNT_KEY`| Path to service account JSON or raw JSON string | *(optional)* |
| `GEMINI_API_KEY` | Google Gemini API Key (**Server-side only**) | *(provided in env)* |
| `GEMINI_MODEL_FLASH` | Model used for document understanding | `gemini-1.5-flash` |
| `GEMINI_MODEL_PRO` | Model used for conversational assistant | `gemini-1.5-pro` |

> [!IMPORTANT]
> Never expose `GEMINI_API_KEY` to the client browser. Never use `NEXT_PUBLIC_GEMINI_API_KEY`.

### 4. Seed the Database
Populate verified Indian scholarships (NSP, MahaDBT, Tata Trusts, HDFC Badhte Kadam, AICTE Pragati, etc.) and a demo student profile:
```bash
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Run Automated Test Suite
```bash
npm test
```

### 7. Compile for Production
```bash
npm run build
npm start
```

---

## 🔒 Security Architecture

1. **Authentication Verification**:
   - Every protected request expects `Authorization: Bearer <Firebase ID Token>`.
   - The backend verifies the token using `firebaseAdmin.auth().verifyIdToken()`.
   - **Never trust client UID**: The verified `uid` is attached to `req.user.uid`. Any `req.body.uid` is ignored.
2. **Role-Based Access Control (RBAC)**:
   - Roles: `STUDENT`, `ADMIN`, `SUPER_ADMIN`.
   - Admin routes (`/api/admin/*`) require role verification against verified claims or the Firestore database record.
3. **File Security & Upload Sandboxing**:
   - Magic byte header inspection (`%PDF-`, `\xFF\xD8\xFF`, `\x89PNG`). File extensions alone are never trusted.
   - Max file size limit: 5MB (HTTP 413 on violation).
   - Safe UUID storage paths (`users/{uid}/documents/{uuid}/{filename}`).
   - Pre-signed time-limited download URLs (15-minute TTL).
4. **Prompt Injection Guardrails**:
   - Document contents and scholarship descriptions are isolated as untrusted data (`<untrusted_document_content>`).
   - Strict JSON response schema enforcement via Zod.
   - Zero execution privileges for extracted text.

---

## 📡 REST API Reference

### Health Check
- `GET /health` / `GET /api/health` — Service health status.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create student account.
- `POST /api/auth/login` — Sign in and issue token.
- `GET /api/auth/me` — Get current authenticated user session context.
- `POST /api/auth/logout` — Invalidate session.

### Student Profile (`/api/profile`)
- `GET /api/profile` — Fetch complete student profile and completeness score.
- `POST /api/profile` — Create profile.
- `PUT /api/profile` — Update personal and socio-economic details.
- `PUT /api/profile/academic` — Update current educational program and marks.
- `POST /api/profile/recalculate-matches` — Trigger match count re-computation.

### Scholarships Catalog & Bookmarks (`/api/scholarships`)
- `GET /api/scholarships` — Search and filter scholarships (by query, state, category, degree, provider).
- `GET /api/scholarships/:id` — Retrieve full scholarship details, eligibility rules, and required documents.
- `GET /api/scholarships/saved` — Get authenticated user's bookmarked scholarships.
- `POST /api/scholarships/:id/save` — Bookmark scholarship.
- `DELETE /api/scholarships/:id/save` — Remove bookmark.

### Deterministic Eligibility Engine (`/api/eligibility`)
- `GET /api/scholarships/:scholarshipId/eligibility` — Evaluate student profile against scholarship rules and explain pass/fail reasons.
- `POST /api/eligibility/check` — Evaluate arbitrary profile attributes against a scholarship.

### Personalized Recommendations (`/api/recommendations`)
- `GET /api/recommendations` — Return personalized scholarships ranked by deterministic suitability score.

### Document Vault (`/api/documents`)
- `POST /api/documents/upload` — Multipart file upload, magic-byte check, Gemini OCR extraction.
- `GET /api/documents` — List user's uploaded certificates.
- `GET /api/documents/:id` — Get certificate details and temporary download URL.
- `POST /api/documents/:id/verify` — Confirm extracted fields and synchronize with profile.
- `DELETE /api/documents/:id` — Delete document from storage and database.

### AI Assistant (`/api/ai`)
- `POST /api/ai/chat` — Context-aware chatbot with server-side tool calling.
- `POST /api/ai/explain-eligibility/:scholarshipId` — Natural language synthesis of deterministic rule evaluation.

### Application Tracking (`/api/applications`)
- `GET /api/applications` — List user's tracked scholarship applications.
- `GET /api/applications/:id` — Get single application details (with IDOR protection).
- `POST /api/applications` — Track application on official portal.
- `PUT /api/applications/:id/status` — Update stage (`SAVED`, `APPLIED`, `UNDER_REVIEW`, `SELECTED`, `REJECTED`).
- `DELETE /api/applications/:id` — Remove tracked record.

### In-App Notifications (`/api/notifications`)
- `GET /api/notifications` — List notifications for authenticated user.
- `PATCH /api/notifications/:id/read` — Mark notification as read.
- `PATCH /api/notifications/read-all` — Mark all notifications as read.

### Administrative Management (`/api/admin`)
- `GET /api/admin/metrics` — Aggregate platform statistics.
- `GET /api/admin/scholarships` — List all scholarships (including drafts and archived).
- `POST /api/admin/scholarships` — Create new scholarship with structured machine rules.
- `PUT /api/admin/scholarships/:id` — Edit scholarship metadata and cutoffs.
- `DELETE /api/admin/scholarships/:id` — Delete or archive scholarship.
- `GET /api/admin/audit-logs` — Immutable audit log of administrative actions.

---

## ⚙️ Deterministic Eligibility Logic

The engine executes in 5 sequential stages with zero probabilistic LLM inference:
1. **Domicile / State Check**: Verifies applicant state against scheme allowed states (`ALL` or specific state).
2. **Category Quota Check**: Verifies applicant category (`GENERAL`, `OBC`, `SC`, `ST`, `EWS`).
3. **Income Ceiling Check**: Compares family annual income against `maxFamilyIncome`.
4. **Academic Cutoff Check**: Compares percentage/CGPA against `minPercentage`.
5. **Mandatory Document Audit**: Checks student document vault for mandatory verified certificates.

### Status Codes
- `ELIGIBLE`: All hard criteria met and all mandatory documents verified.
- `LIKELY_ELIGIBLE`: All hard criteria met; minor self-declared fields pending.
- `NEEDS_VERIFICATION`: Hard criteria met; mandatory document missing from vault.
- `NOT_ELIGIBLE`: Fails one or more hard criteria.

---

## 📊 Multi-Factor Recommendation Formula

$$\text{RankingScore} = (0.50 \times \text{Status}) + (0.25 \times \text{Deadline}) + (0.15 \times \text{Benefit}) + (0.10 \times \text{Completeness})$$

- **Status (50%)**: `ELIGIBLE` (100 pts), `LIKELY_ELIGIBLE` (80 pts), `NEEDS_VERIFICATION` (60 pts), `NOT_ELIGIBLE` (20 pts).
- **Deadline Urgency (25%)**: $\le 7$ days (100 pts), $\le 21$ days (85 pts), $\le 45$ days (70 pts), $> 45$ days (50 pts).
- **Financial Benefit (15%)**: $\ge ₹1,00,000$ (100 pts), $\ge ₹50,000$ (85 pts), $\ge ₹25,000$ (70 pts).
- **Profile Completeness (10%)**: Dynamic score (0 to 100).
