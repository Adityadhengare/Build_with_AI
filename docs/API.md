# ScholarSathi REST API Reference Manual

**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`  
**Authentication Scheme:** `Authorization: Bearer <Firebase_ID_Token>`

---

## 1. Global Conventions & Standards

### 1.1 Response Format

All successful responses adhere to the standard JSON envelope:
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... } // Optional for list endpoints
}
```

All failure responses return standardized error envelopes:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable explanation of error.",
    "details": [
      {
        "field": "familyAnnualIncome",
        "issue": "Income must be a non-negative number."
      }
    ]
  }
}
```

### 1.2 Common HTTP Status Codes

| Code | Meaning | Context |
| :--- | :--- | :--- |
| `200 OK` | Success | Standard read/update response |
| `201 Created` | Created | Resource successfully created |
| `202 Accepted` | Accepted | File upload accepted for asynchronous processing |
| `400 Bad Request` | Validation Failure | Zod validation error or malformed payload |
| `401 Unauthorized`| Missing / Invalid Token | Authorization header missing or expired |
| `403 Forbidden` | Insufficient Permissions | Student attempting admin action or cross-user IDOR access |
| `404 Not Found` | Resource Missing | Scholarship, document, or application not found |
| `413 Payload Too Large` | Oversized Upload | File exceeds 5MB limit |
| `415 Unsupported Media` | Invalid Magic Bytes | File is not authentic PDF, JPEG, or PNG |
| `429 Rate Limited`| Throttled | Exceeded sliding-window request limit |
| `500 Server Error`| Internal Server Error | Uncaught server exception (sanitized in production) |

---

## 2. API Endpoints Catalog

---

### 2.1 Authentication (`/api/auth`)

#### `POST /api/auth/register`
Create a new student user in Firebase Auth and initialize profile record.
- **Access:** Public
- **Body:**
  ```json
  {
    "email": "student@example.com",
    "password": "SecurePassword123!",
    "firstName": "Aditya",
    "lastName": "Patil",
    "phone": "+919876543210"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "userId": "usr_1728000000",
      "email": "student@example.com",
      "role": "STUDENT",
      "message": "Account created successfully."
    }
  }
  ```

#### `POST /api/auth/login`
Authenticate user credentials and issue session token.
- **Access:** Public
- **Body:** `{"email": "student@example.com", "password": "..."}`
- **Response (200 OK):** `{"success": true, "data": { "token": "...", "userId": "...", "role": "STUDENT" }}`

#### `GET /api/auth/me`
Retrieve currently authenticated session details.
- **Access:** Authenticated (`Bearer <Token>`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "userId": "test-student-uid-1",
      "email": "aditya.patil@engg.edu.in",
      "role": "STUDENT",
      "profileCompleted": true,
      "profileCompleteness": 85
    }
  }
  ```

---

### 2.2 Student Profile (`/api/profile`)

#### `GET /api/profile`
Fetch authenticated student's personal, socio-economic, and academic profile.
- **Access:** Authenticated (`STUDENT`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "sp_test_student_1",
      "userId": "test-student-uid-1",
      "fullName": "Aditya Ramesh Patil",
      "gender": "MALE",
      "domicileState": "Maharashtra",
      "domicileDistrict": "Pune",
      "category": "OBC",
      "familyAnnualIncome": 235000,
      "profileCompleteness": 85,
      "education": {
        "currentEducationLevel": "UNDERGRADUATE",
        "courseName": "B.Tech",
        "institutionName": "Government College of Engineering, Pune",
        "percentageOrCgpa": 78.4,
        "gradingScale": "PERCENTAGE"
      }
    }
  }
  ```

#### `PUT /api/profile`
Update personal, demographic, and financial details.
- **Access:** Authenticated (`STUDENT`)
- **Body:**
  ```json
  {
    "fullName": "Aditya R. Patil",
    "domicileDistrict": "Pune Urban",
    "familyAnnualIncome": 240000
  }
  ```

#### `PUT /api/profile/academic`
Update education level, institution, and percentage/CGPA.
- **Access:** Authenticated (`STUDENT`)
- **Body:**
  ```json
  {
    "currentEducationLevel": "UNDERGRADUATE",
    "courseName": "B.Tech Computer Science",
    "institutionName": "COEP Pune",
    "percentageOrCgpa": 82.5
  }
  ```

---

### 2.3 Scholarships Discovery & Catalog (`/api/scholarships`)

#### `GET /api/scholarships`
Search and filter scholarships. Enriched with personalized match status if user is authenticated.
- **Access:** Public / Optional Auth
- **Query Parameters:**
  - `search` / `q`: Keyword search across title, description, and provider
  - `state`: e.g. `Maharashtra` or `ALL`
  - `category`: `GENERAL`, `OBC`, `SC`, `ST`, `EWS`
  - `educationLevel`: `UNDERGRADUATE`, `DIPLOMA`, `POSTGRADUATE`
  - `providerType`: `GOVERNMENT_STATE`, `GOVERNMENT_CENTRAL`, `PRIVATE_TRUST`, `CORPORATE_CSR`
  - `sortBy`: `match` (default), `deadline`, `amount`
  - `page`: default `1`
  - `limit`: default `20` (max `100`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "sch-mahadbt-post-matric-obc",
        "title": "MahaDBT Post-Matric Scholarship for OBC Students",
        "financialAssistance": "100% Tuition & Exam Fee Reimbursement",
        "applicationDeadline": "2026-11-30T23:59:59Z",
        "officialPortalUrl": "https://mahadbt.maharashtra.gov.in",
        "matchScore": 94,
        "matchStatus": "ELIGIBLE"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 6, "totalPages": 1 }
  }
  ```

#### `GET /api/scholarships/:id`
Retrieve full scholarship details, eligibility rules, and required documents checklist.
- **Access:** Public / Optional Auth
- **Response (200 OK):** Returns detailed scheme criteria with official portal link.

#### `GET /api/scholarships/saved`
Retrieve list of scholarships bookmarked by the student.
- **Access:** Authenticated (`STUDENT`)

#### `POST /api/scholarships/:id/save`
Bookmark a scholarship.
- **Access:** Authenticated (`STUDENT`)
- **Body:** `{"notes": "Prepare Tahsildar certificate by Friday"}`

#### `DELETE /api/scholarships/:id/save`
Remove a bookmarked scholarship.
- **Access:** Authenticated (`STUDENT`)

---

### 2.4 Deterministic Eligibility Engine (`/api/eligibility`)

#### `GET /api/scholarships/:scholarshipId/eligibility`
Evaluate student profile against structured rules and return detailed check evaluations.
- **Access:** Authenticated (`STUDENT`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "scholarshipId": "sch-mahadbt-post-matric-obc",
      "status": "ELIGIBLE",
      "matchScore": 94,
      "explanation": "You are 100% eligible! You satisfy domicile, category, income ceiling, and academic cutoffs.",
      "checks": [
        {
          "rule": "state",
          "required": "Maharashtra",
          "actual": "Maharashtra",
          "passed": true
        },
        {
          "rule": "category",
          "required": "OBC",
          "actual": "OBC",
          "passed": true
        },
        {
          "rule": "income",
          "required": "≤ ₹8,00,000",
          "actual": "₹2,35,000",
          "passed": true
        },
        {
          "rule": "minimumPercentage",
          "required": "≥ 50%",
          "actual": "78.4%",
          "passed": true
        }
      ],
      "passedRules": ["Matches domicile requirement (Maharashtra).", "Category (OBC) is eligible."],
      "failedReasons": [],
      "missingDocuments": []
    }
  }
  ```

---

### 2.5 Personalized Recommendations (`/api/recommendations`)

#### `GET /api/recommendations`
Return student-personalized scholarships sorted by multi-factor composite priority score.
- **Access:** Authenticated (`STUDENT`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "totalRecommendations": 6,
      "recommendations": [
        {
          "scholarshipId": "sch-mahadbt-post-matric-obc",
          "name": "MahaDBT Post-Matric Scholarship for OBC Students",
          "status": "ELIGIBLE",
          "matchScore": 94,
          "rankingScore": 88.5,
          "reasons": ["Matches domicile requirement.", "Category is eligible."],
          "deadline": "2026-11-30T23:59:59Z",
          "estimatedAmount": "100% Tuition & Exam Fee Reimbursement",
          "officialPortalUrl": "https://mahadbt.maharashtra.gov.in"
        }
      ]
    }
  }
  ```

---

### 2.6 Document Vault & Gemini Extraction (`/api/documents`)

#### `POST /api/documents/upload`
Upload certificate (multipart/form-data), validate magic bytes, store in Firebase Storage, and run Gemini server-side extraction.
- **Access:** Authenticated (`STUDENT`)
- **Headers:** `Content-Type: multipart/form-data`
- **Fields:**
  - `file`: Binary stream (PDF, JPEG, PNG; max 5MB)
  - `documentType`: `INCOME_CERTIFICATE`, `CASTE_CERTIFICATE`, `DOMICILE_CERTIFICATE`, `MARKSHEET_12TH`, etc.
- **Response (202 Accepted):**
  ```json
  {
    "success": true,
    "data": {
      "documentId": "doc_e83912",
      "fileName": "e83912.pdf",
      "documentType": "INCOME_CERTIFICATE",
      "status": "VERIFIED",
      "extraction": {
        "annualIncome": 235000,
        "financialYear": "2026-27",
        "confidenceScore": 0.96,
        "isDocumentLegible": true
      }
    }
  }
  ```

#### `GET /api/documents`
List all uploaded documents in the student's vault.
- **Access:** Authenticated (`STUDENT`)

#### `POST /api/documents/:id/verify`
Student verifies or corrects extracted values, synchronizing them with their official profile.
- **Access:** Authenticated (`STUDENT`)
- **Body:**
  ```json
  {
    "confirmedIncome": 235000,
    "confirmedState": "Maharashtra"
  }
  ```

#### `DELETE /api/documents/:id`
Delete document from vault.
- **Access:** Authenticated (`STUDENT`)

---

### 2.7 AI Scholarship Assistant (`/api/ai`)

#### `POST /api/ai/chat`
Conversational scholarship advisor grounded in server-side tools.
- **Access:** Authenticated (`STUDENT`)
- **Body:**
  ```json
  {
    "message": "Why am I marked as Needs Verification for Tata Trusts?",
    "contextScholarshipId": "sch-tata-trusts-engg"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "sender": "assistant",
      "reply": "You meet all income and academic cutoffs, but you have not uploaded a College Fee Receipt in your documents vault.",
      "toolsUsed": ["checkEligibility", "getRequiredDocuments"],
      "suggestedCards": [ ... ]
    }
  }
  ```

#### `POST /api/ai/explain-eligibility/:scholarshipId`
Generate plain-English synthesis of deterministic rule evaluation.
- **Access:** Authenticated (`STUDENT`)

---

### 2.8 Application Tracker (`/api/applications`)

#### `GET /api/applications`
Fetch all tracked applications for the authenticated student.
- **Access:** Authenticated (`STUDENT`)

#### `POST /api/applications`
Create a new tracked application record.
- **Access:** Authenticated (`STUDENT`)
- **Body:**
  ```json
  {
    "scholarshipId": "sch-mahadbt-post-matric-obc",
    "status": "APPLIED",
    "officialApplicationId": "MH-OBC-2026-981245",
    "appliedDate": "2026-10-04",
    "notes": "Submitted with Tehsildar income cert."
  }
  ```

#### `PUT /api/applications/:id/status`
Update status (`SAVED`, `APPLIED`, `UNDER_REVIEW`, `SELECTED`, `REJECTED`).
- **Access:** Authenticated (`STUDENT` - Owner only)

---

### 2.9 In-App Notifications (`/api/notifications`)

#### `GET /api/notifications`
List deadline, document, and status notifications.
- **Access:** Authenticated (`STUDENT`)

#### `PATCH /api/notifications/:id/read`
Mark single notification as read.
- **Access:** Authenticated (`STUDENT`)

#### `PATCH /api/notifications/read-all`
Mark all notifications as read.
- **Access:** Authenticated (`STUDENT`)

---

### 2.10 Admin Management (`/api/admin`)

*Strictly protected by RBAC (`role in ['ADMIN', 'SUPER_ADMIN']`). Returns 403 Forbidden for students.*

#### `GET /api/admin/metrics`
Retrieve platform metrics: total students, active schemes, cataloged funds, pending verifications.

#### `GET /api/admin/scholarships`
Retrieve full catalog including draft and archived schemes.

#### `POST /api/admin/scholarships`
Create a new scholarship with machine-readable eligibility rules. Creates an immutable entry in `audit_logs`.

#### `PUT /api/admin/scholarships/:id`
Update scholarship details or eligibility rules. Creates an immutable entry in `audit_logs`.

#### `DELETE /api/admin/scholarships/:id`
Delete or archive a scholarship. Creates an immutable entry in `audit_logs`.

#### `GET /api/admin/audit-logs`
Retrieve administrative compliance audit trail.
