# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### Sign Up
**POST** `/api/auth/signup`

Create a new recruiter account and organization.

**Request Body:**
```json
{
  "email": "recruiter@company.com",
  "password": "securepassword123",
  "name": "John Doe",
  "orgName": "Acme Corporation"
}
```

**Response:** `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "recruiter@company.com",
    "name": "John Doe",
    "orgId": "org-uuid",
    "role": "admin"
  }
}
```

### Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "recruiter@company.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "recruiter@company.com",
    "name": "John Doe",
    "orgId": "org-uuid",
    "role": "admin"
  }
}
```

---

## 💼 Job Endpoints

### Create Job
**POST** `/api/jobs`

Create a new job posting with AI-suggested requirements.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Senior Software Engineer",
  "description": "We're looking for an experienced software engineer...",
  "assessmentType": "ai-generated",
  "passMark": 70
}
```

**Assessment Types:**
- `ai-generated` - AI creates questions from job description
- `question-pool` - Use pre-built question sets
- `custom` - Provide your own questions
- `none` - No assessment

**Response:** `201 Created`
```json
{
  "job": {
    "id": "job-uuid",
    "title": "Senior Software Engineer",
    "description": "...",
    "shareableUrl": "http://localhost:3000/apply/abc123xyz",
    "status": "active",
    "criteriaJson": {
      "skills": ["JavaScript", "React", "Node.js"],
      "experience": "3-5 years",
      "education": "Bachelor's degree"
    }
  },
  "shareableUrl": "http://localhost:3000/apply/abc123xyz",
  "message": "Job created successfully"
}
```

### List Jobs
**GET** `/api/jobs?page=1&limit=20&status=active`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "job-uuid",
      "title": "Senior Software Engineer",
      "status": "active",
      "_count": {
        "applicants": 15,
        "scores": 12
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### Get Ranked Applicants
**GET** `/api/jobs/:jobId/ranked?limit=100`

Get all applicants ranked by AI score.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "jobId": "job-uuid",
  "totalApplicants": 15,
  "applicants": [
    {
      "rank": 1,
      "applicant": {
        "id": "applicant-uuid",
        "name": "Jane Smith",
        "email": "jane@email.com",
        "cvUrl": "https://..."
      },
      "finalScore": 87.5,
      "percentile": 95,
      "breakdown": {
        "skillsMatch": { "score": 90 },
        "experienceMatch": { "score": 85 },
        "overallFit": { "recommendation": "strong" }
      }
    }
  ]
}
```

---

## 👥 Applicant Endpoints

### Submit Application (Public - No Auth)
**POST** `/api/applicants/apply/:shareableId`

Submit a job application without creating an account.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `name` (string, required)
- `email` (string, required)
- `phone` (string, optional)
- `answers` (JSON string, optional)
- `cv` (file, optional)

**Response:** `201 Created`
```json
{
  "message": "Application submitted successfully",
  "applicantId": "applicant-uuid",
  "hasAssessment": true,
  "assessmentRequired": false
}
```

### Get Job Details (Public - No Auth)
**GET** `/api/applicants/job/:shareableId`

Get public job information for application.

**Response:** `200 OK`
```json
{
  "id": "job-uuid",
  "title": "Senior Software Engineer",
  "description": "...",
  "company": "Acme Corporation",
  "status": "active",
  "hasAssessment": true,
  "assessmentInfo": {
    "isRequired": false,
    "timeLimit": 15,
    "passMark": 60
  }
}
```

### Get Applicant Details
**GET** `/api/applicants/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": "applicant-uuid",
  "name": "Jane Smith",
  "email": "jane@email.com",
  "phone": "+1234567890",
  "cvUrl": "https://...",
  "status": "scored",
  "scores": [...],
  "assessments": [...]
}
```

---

## 📝 Assessment Endpoints

### Get Assessment Questions (Public - No Auth)
**GET** `/api/assessments/job/:shareableId`

Get questions for job assessment (without correct answers).

**Response:** `200 OK`
```json
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "category": "technical",
      "question": "What is React?",
      "options": ["A library", "A framework", "A language", "A database"]
    }
  ],
  "timeLimit": 15,
  "totalQuestions": 5
}
```

### Start Assessment (Public - No Auth)
**POST** `/api/assessments/start`

Start the assessment timer.

**Request Body:**
```json
{
  "applicantId": "applicant-uuid",
  "jobId": "job-uuid"
}
```

**Response:** `200 OK`
```json
{
  "assessmentId": "assessment-uuid",
  "status": "started",
  "startedAt": "2024-01-15T10:00:00Z",
  "timeRemaining": 15,
  "timeLimit": 15
}
```

### Submit Assessment (Public - No Auth)
**POST** `/api/assessments/submit`

Submit assessment answers for automatic scoring.

**Request Body:**
```json
{
  "applicantId": "applicant-uuid",
  "jobId": "job-uuid",
  "answers": [0, 2, 1, 3, 0]
}
```

**Response:** `200 OK`
```json
{
  "message": "Assessment submitted successfully",
  "assessment": {
    "id": "assessment-uuid",
    "score": 80,
    "percentage": 80,
    "correctCount": 4,
    "totalQuestions": 5,
    "passed": true,
    "passMark": 60
  }
}
```

---

## 💬 Feedback Endpoints

### Add Feedback
**POST** `/api/feedback`

Add recruiter feedback or override score.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "scoreId": "score-uuid",
  "action": "approve",
  "note": "Great candidate, strong technical skills",
  "newScore": 95
}
```

**Actions:** `approve`, `reject`, `shortlist`, `override`

**Response:** `201 Created`
```json
{
  "feedback": {
    "id": "feedback-uuid",
    "action": "approve",
    "note": "..."
  },
  "updatedScore": {
    "finalScore": 87.5,
    "status": "approved"
  }
}
```

### Bulk Action
**POST** `/api/feedback/bulk-action`

Apply action to multiple applicants at once.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "scoreIds": ["score-1", "score-2", "score-3"],
  "action": "shortlist",
  "note": "Moving to next round"
}
```

**Response:** `200 OK`
```json
{
  "message": "Bulk action applied to 3 applicants",
  "action": "shortlist",
  "count": 3
}
```

---

## Error Responses

All errors follow this format:

**4xx/5xx Error**
```json
{
  "error": "Error message here",
  "details": {} // Optional, only in development
}
```

**Common Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate record)
- `413` - Payload Too Large (file size)
- `500` - Internal Server Error

---

## Rate Limiting

- Assessment scoring: 10 jobs per second
- CV uploads: 10MB max file size
- API requests: No limits currently (implement as needed)

---

## WebSocket Events

Connect to WebSocket at `ws://localhost:5000`

### Events:
- `rank_update` - Emitted when applicant rankings change

```javascript
{
  "jobId": "job-uuid",
  "applicantId": "applicant-uuid",
  "score": 87.5,
  "rank": 3,
  "timestamp": "2024-01-15T10:00:00Z"
}
```



