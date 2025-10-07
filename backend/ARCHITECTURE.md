# System Architecture Diagram

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND APPLICATION                         │
│                    (React/Next.js - To be built)                     │
│                                                                       │
│  Employer Dashboard              Applicant Application Page          │
│  ├─ Job Management              ├─ Public Form (No Login)            │
│  ├─ Ranked Candidates           ├─ CV Upload                         │
│  ├─ Feedback & Actions          └─ Optional Assessment               │
│  └─ Real-time Updates                                                │
└───────────────┬──────────────────────────────────┬──────────────────┘
                │                                   │
         REST API Calls                     Public REST Calls
    (with JWT Authentication)              (No Authentication)
                │                                   │
                └────────────────┬──────────────────┘
                                 │
┌────────────────────────────────▼─────────────────────────────────────┐
│                      EXPRESS.JS SERVER (Port 5000)                   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                         ROUTES LAYER                          │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  /api/auth          - Signup, Login (JWT)                    │   │
│  │  /api/jobs          - Job CRUD, Rankings, Export             │   │
│  │  /api/applicants    - Public Apply, Status                   │   │
│  │  /api/assessments   - Questions, Start, Submit               │   │
│  │  /api/feedback      - Recruiter Actions, Overrides           │   │
│  │  /api/webhooks      - Event Registration                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      MIDDLEWARE LAYER                         │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  ✓ JWT Authentication                                        │   │
│  │  ✓ Request Validation (express-validator)                   │   │
│  │  ✓ Error Handling (Global)                                  │   │
│  │  ✓ File Upload (Multer)                                     │   │
│  │  ✓ CORS & Security (Helmet)                                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      SERVICES LAYER                           │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  AI Service          - Gemini API Integration                │   │
│  │                      - CV Analysis                           │   │
│  │                      - Question Generation                   │   │
│  │                      - Requirement Suggestions               │   │
│  │                                                              │   │
│  │  Assessment Service  - Question Pool Management             │   │
│  │                      - Auto-scoring                          │   │
│  │                      - Time Tracking                         │   │
│  │                                                              │   │
│  │  Scoring Service     - Hybrid Algorithm                      │   │
│  │                      - CV Parsing (pdf-parse)                │   │
│  │                      - Ranking & Percentiles                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   SOCKET.IO (WebSocket)                       │   │
│  │  Event: rank_update → Real-time ranking updates              │   │
│  └──────────────────────────────────────────────────────────────┘   │
└───────┬──────────────┬──────────────┬──────────────┬──────────────┬─┘
        │              │              │              │              │
        │              │              │              │              │
┌───────▼─────┐ ┌──────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐ ┌────▼────┐
│ PostgreSQL  │ │   Firebase  │ │  Gemini  │ │   Redis    │ │  Logs   │
│   Database  │ │   Storage   │ │    AI    │ │  + BullMQ  │ │  Files  │
├─────────────┤ ├─────────────┤ ├──────────┤ ├────────────┤ ├─────────┤
│ • Orgs      │ │ • CV Files  │ │ • Analyze│ │ Job Queue  │ │combined │
│ • Recruiters│ │ • Resumes   │ │ • Generate│ │            │ │.log     │
│ • Jobs      │ │ • Documents │ │ • Suggest│ │ Processing │ │error    │
│ • Applicants│ │             │ │          │ │ 5 workers  │ │.log     │
│ • Assessments││ Signed URLs │ │   API    │ │ concurrent │ │         │
│ • Scores    │ │             │ │          │ │            │ │Winston  │
│ • Feedback  │ │             │ │          │ │            │ │ Logger  │
│ • Questions │ │             │ │          │ │            │ │         │
│             │ │             │ │          │ │            │ │         │
│ Prisma ORM  │ │ Admin SDK   │ │ @google/ │ │  Worker    │ │         │
└─────────────┘ └─────────────┘ └──────────┘ └────────────┘ └─────────┘
```

---

## 🔄 Data Flow Diagrams

### Flow 1: Employer Creates Job

```
Recruiter
   │
   │ POST /api/jobs
   │ { title, description, assessmentType: "ai-generated" }
   ▼
┌──────────────────────────────┐
│  Jobs Router                 │
│  • Authenticate user         │
│  • Validate input            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  AI Service                  │
│  • suggestJobRequirements()  │
│  └─► Gemini API              │
│      "Generate requirements" │
└──────────────┬───────────────┘
               │
               │ { skills, experience, education, weights }
               ▼
┌──────────────────────────────┐
│  Assessment Service          │
│  • generateQuestionsForJob() │
│  └─► Gemini API              │
│      "Generate 5 questions"  │
└──────────────┬───────────────┘
               │
               │ [questions array]
               ▼
┌──────────────────────────────┐
│  Database (Prisma)           │
│  • Create Job                │
│  • Create JobAssessment      │
│  • Generate shareableUrl     │
└──────────────┬───────────────┘
               │
               ▼
Response: { job, shareableUrl, message }
```

---

### Flow 2: Applicant Submits Application

```
Applicant (Anonymous)
   │
   │ POST /api/applicants/apply/:shareableId
   │ FormData: { name, email, cv (file), answers }
   ▼
┌──────────────────────────────┐
│  Applicants Router           │
│  • No auth required          │
│  • Validate input            │
│  • Process file upload       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Firebase Storage            │
│  • Upload CV to bucket       │
│  • Generate signed URL       │
└──────────────┬───────────────┘
               │
               │ cvUrl
               ▼
┌──────────────────────────────┐
│  Database (Prisma)           │
│  • Create Applicant record   │
│  • Create Assessment record  │
└──────────────┬───────────────┘
               │
               │ applicantId
               ▼
┌──────────────────────────────┐
│  BullMQ Queue                │
│  • Add to "scoring-queue"    │
│  • Job data: { applicantId } │
└──────────────┬───────────────┘
               │
               ▼
Response: { message, applicantId, hasAssessment }
```

---

### Flow 3: Background Processing (Worker)

```
BullMQ Worker
   │
   │ Job received: { applicantId }
   ▼
┌──────────────────────────────┐
│  Scoring Service             │
│  • processApplicant()        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Fetch Data                  │
│  • Get applicant + job       │
│  • Get assessments           │
│  • Get CV URL                │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Parse CV                    │
│  • Download from URL         │
│  • pdf-parse extraction      │
│  └─► Raw text output         │
└──────────────┬───────────────┘
               │
               │ cvText
               ▼
┌──────────────────────────────┐
│  AI Service                  │
│  • analyzeApplicant()        │
│  └─► Gemini API              │
│      Prompt: CV + Job Req    │
└──────────────┬───────────────┘
               │
               │ aiAnalysis: {
               │   skillsMatch: { score, matched, missing },
               │   experienceMatch: { score, years },
               │   educationMatch: { score, level },
               │   overallFit: { score, confidence },
               │   insights: { strengths, concerns }
               │ }
               ▼
┌──────────────────────────────┐
│  Scoring Service             │
│  • calculateCompositeScore() │
│                              │
│  Formula:                    │
│  composite = Σ(weight × score)│
│                              │
│  finalScore = (0.7 × composite) │
│              + (0.3 × AI)    │
└──────────────┬───────────────┘
               │
               │ { compositeScore, finalScore, mlProb }
               ▼
┌──────────────────────────────┐
│  Database (Prisma)           │
│  • Upsert Score record       │
│  • Update applicant status   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Ranking Update              │
│  • updateRankings()          │
│  • Calculate percentiles     │
│  • Assign ranks              │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Socket.IO Event             │
│  • Emit "rank_update"        │
│  • { jobId, applicantId,     │
│      score, rank }           │
└──────────────────────────────┘
               │
               ▼
    Recruiter Dashboard
    (Real-time update)
```

---

### Flow 4: Assessment Submission

```
Applicant
   │
   │ 1. GET /api/assessments/job/:shareableId
   ▼
┌──────────────────────────────┐
│  Assessment Router           │
│  • Get questions (no answers)│
└──────────────┬───────────────┘
               │
               ▼
Questions displayed to applicant

   │
   │ 2. POST /api/assessments/start
   ▼
┌──────────────────────────────┐
│  Assessment Service          │
│  • Create/update assessment  │
│  • Set startedAt timestamp   │
└──────────────┬───────────────┘
               │
               ▼
Timer starts (15 minutes)

   │
   │ 3. POST /api/assessments/submit
   │    { applicantId, jobId, answers: [0,2,1,3,0] }
   ▼
┌──────────────────────────────┐
│  Assessment Service          │
│  • scoreAssessment()         │
│  • Compare with correct      │
│  • Calculate percentage      │
└──────────────┬───────────────┘
               │
               │ { score: 80, correctCount: 4/5, passed: true }
               ▼
┌──────────────────────────────┐
│  Database (Prisma)           │
│  • Update assessment record  │
│  • Store answers & score     │
│  • Set finishedAt            │
└──────────────┬───────────────┘
               │
               ▼
Response: { score, percentage, passed }
```

---

## 🗄️ Database Schema Relationships

```
┌─────────────┐
│     Org     │
│  (Company)  │
└──────┬──────┘
       │
       ├──────────────────────────────────┐
       │                                   │
       │ 1:N                              │ 1:N
       ▼                                   ▼
┌─────────────┐                    ┌──────────────┐
│  Recruiter  │                    │     Job      │
│   (Users)   │                    │  (Postings)  │
└──────┬──────┘                    └──────┬───────┘
       │                                   │
       │                                   ├────────────────┐
       │                                   │                │
       │                                   │ 1:N            │ 1:1
       │                                   ▼                ▼
       │                            ┌─────────────┐  ┌──────────────┐
       │                            │  Applicant  │  │JobAssessment │
       │                            │(Anonymous)  │  │ (Questions)  │
       │                            └──────┬──────┘  └──────┬───────┘
       │                                   │                │
       │                                   ├────┐           │ N:1
       │                                   │    │           ▼
       │                                   │    │    ┌──────────────┐
       │                                   │ 1:N│    │QuestionPool  │
       │                                   ▼    │    │  (Library)   │
       │                            ┌─────────────┐  └──────────────┘
       │                            │ Assessment  │
       │                            │  (Tests)    │
       │                            └─────────────┘
       │                                   │
       │                                   │ 1:1
       │                                   ▼
       │                            ┌─────────────┐
       │                            │    Score    │
       │                            │  (Results)  │
       │                            └──────┬──────┘
       │                                   │
       │                                   │ 1:N
       │                                   ▼
       │                            ┌─────────────┐
       └────────────────────────────► Feedback    │
                1:N                 │ (Actions)   │
                                    └─────────────┘
```

---

## 🔐 Authentication Flow

```
┌──────────────┐
│   Client     │
│  (Frontend)  │
└──────┬───────┘
       │
       │ POST /api/auth/signup
       │ { email, password, name, orgName }
       ▼
┌────────────────────────────┐
│   Auth Router              │
│  • Validate input          │
│  • Check email unique      │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│   bcryptjs                 │
│  • Hash password (10 rounds)│
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│   Database                 │
│  • Create Org              │
│  • Create Recruiter        │
│    (Atomic transaction)    │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│   JWT Service              │
│  • Generate token          │
│  • Payload: { id, email,   │
│     orgId, role }          │
│  • Expires: 7 days         │
└────────┬───────────────────┘
         │
         ▼
Response: { token, user }

─── Subsequent Requests ───

┌──────────────┐
│   Client     │
│  Header:     │
│  Authorization: Bearer TOKEN │
└──────┬───────┘
       │
       ▼
┌────────────────────────────┐
│   Auth Middleware          │
│  • Verify JWT signature    │
│  • Check expiration        │
│  • Decode payload          │
└────────┬───────────────────┘
         │
         ▼
┌────────────────────────────┐
│   Database                 │
│  • Verify user exists      │
│  • Load user data          │
└────────┬───────────────────┘
         │
         ▼
req.user = { id, email, orgId, role }
         │
         ▼
    Route Handler
```

---

## 📊 Scoring Algorithm Visualization

```
Input Sources:
┌─────────────┐  ┌──────────────┐  ┌─────────────┐
│  CV/Resume  │  │  Assessment  │  │ Application │
│    (PDF)    │  │   Answers    │  │   Fields    │
└──────┬──────┘  └──────┬───────┘  └──────┬──────┘
       │                │                  │
       └────────────────┴──────────────────┘
                        │
                        ▼
              ┌───────────────────┐
              │  AI Analysis      │
              │  (Gemini API)     │
              └────────┬──────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
┌──────────────┐            ┌───────────────┐
│ Skills: 90   │            │ Experience: 85│
│ Education: 80│            │ Assessment: 75│
└──────┬───────┘            └───────┬───────┘
       │                            │
       └────────────┬───────────────┘
                    │
                    ▼
        ┌─────────────────────────┐
        │  Composite Score        │
        │                         │
        │  = 0.4 × 90  (skills)   │
        │  + 0.3 × 85  (exp)      │
        │  + 0.2 × 80  (edu)      │
        │  + 0.1 × 75  (assess)   │
        │                         │
        │  = 84.5                 │
        └────────┬────────────────┘
                 │
                 ▼
        ┌─────────────────────────┐
        │  AI Confidence Score    │
        │                         │
        │  = overallFit × confidence │
        │  = 82 × 0.85            │
        │  = 69.7                 │
        └────────┬────────────────┘
                 │
                 ▼
        ┌─────────────────────────┐
        │  Final Hybrid Score     │
        │                         │
        │  = 0.7 × composite      │
        │  + 0.3 × AI             │
        │                         │
        │  = 0.7 × 84.5           │
        │  + 0.3 × 69.7           │
        │                         │
        │  = 80.1                 │
        └────────┬────────────────┘
                 │
                 ▼
        ┌─────────────────────────┐
        │  Ranking                │
        │  • Sort by finalScore   │
        │  • Assign ranks (1,2,3..)│
        │  • Calculate percentiles│
        └─────────────────────────┘
```

---

## 🔌 API Request/Response Cycle

```
┌──────────────────────────────────────────────────────────────┐
│                       REQUEST CYCLE                          │
└──────────────────────────────────────────────────────────────┘

Client Request
    │
    │ HTTP POST /api/jobs
    │ Headers: { Authorization: Bearer xxx }
    │ Body: { title, description }
    ▼
┌─────────────────────────────────────────┐
│  1. CORS Middleware                     │
│     • Check origin                      │
│     • Add CORS headers                  │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  2. Helmet Middleware                   │
│     • Security headers                  │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  3. Body Parser                         │
│     • Parse JSON                        │
│     • Parse URL-encoded                 │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  4. Morgan Logger                       │
│     • Log request                       │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  5. Router Match                        │
│     • Match route pattern               │
│     • Extract params                    │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  6. Auth Middleware (if protected)      │
│     • Verify JWT token                  │
│     • Load user data                    │
│     • Attach to req.user                │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  7. Validation Middleware               │
│     • express-validator                 │
│     • Check required fields             │
│     • Sanitize input                    │
└──────────────┬──────────────────────────┘
               ▼
┌─────────────────────────────────────────┐
│  8. Route Handler                       │
│     • Business logic                    │
│     • Call services                     │
│     • Database operations               │
└──────────────┬──────────────────────────┘
               │
               │ Success
               ▼
┌─────────────────────────────────────────┐
│  9. Response                            │
│     • Status: 200/201                   │
│     • JSON body                         │
│     • Headers                           │
└──────────────┬──────────────────────────┘
               │
               ▼
            Client
               
               │ Error
               ▼
┌─────────────────────────────────────────┐
│  Error Handler Middleware               │
│     • Format error                      │
│     • Log error                         │
│     • Send error response               │
└─────────────────────────────────────────┘
               │
               ▼
            Client
```

---

## 🚀 Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────────┐
│                      PRODUCTION SETUP                        │
└─────────────────────────────────────────────────────────────┘

Frontend (Vercel/Netlify)
    │
    │ HTTPS
    ▼
┌──────────────────────┐
│  Load Balancer       │
│  (nginx/CloudFlare)  │
└──────────┬───────────┘
           │
           ├─────────────────────────────┐
           │                             │
           ▼                             ▼
┌─────────────────┐           ┌─────────────────┐
│  API Server 1   │           │  API Server 2   │
│  (Node.js)      │           │  (Node.js)      │
└────────┬────────┘           └────────┬────────┘
         │                             │
         └──────────────┬──────────────┘
                        │
         ┌──────────────┴───────────────┐
         │                              │
         ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│  PostgreSQL      │          │  Redis Cluster   │
│  (Managed)       │          │  (Upstash)       │
│  - Primary       │          │  - Job Queue     │
│  - Replica       │          │  - Cache         │
└──────────────────┘          └──────────────────┘

         │                              │
         ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│  Worker Pool     │          │  Firebase        │
│  - 5-10 workers  │          │  - Storage       │
│  - Auto-scale    │          │  - CDN           │
└──────────────────┘          └──────────────────┘
```

This completes the architecture documentation!



