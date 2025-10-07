# Recruit AI Backend

AI-powered applicant selection platform backend built with Node.js, Express, PostgreSQL, Firebase, and BullMQ.

**✨ Features:**
- 🤖 AI-powered CV analysis using Google Gemini
- 📊 Hybrid scoring algorithm (rule-based + AI)
- 📝 Auto-generated or pre-built assessment questions
- 🔥 Firebase integration (Storage, Auth optional)
- 🚀 Anonymous applicant applications (no signup required)
- ⚡ Real-time updates via WebSocket
- 📈 Automated ranking and scoring

## 🏗️ Architecture

```
backend/
├── src/
│   ├── server.js              # Main Express server + Socket.io
│   ├── config/
│   │   └── database.js        # Prisma client setup
│   ├── routes/
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── jobs.js            # Job CRUD
│   │   ├── applicants.js      # Applicant submission & retrieval
│   │   ├── assessments.js     # Assessment management
│   │   ├── feedback.js        # Recruiter feedback & overrides
│   │   └── webhooks.js        # Webhook registration
│   ├── controllers/           # Business logic
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── errorHandler.js   # Centralized error handling
│   ├── workers/
│   │   ├── index.js           # BullMQ worker initialization
│   │   ├── cvParser.js        # CV parsing jobs
│   │   └── scoringWorker.js   # Scoring & ranking jobs
│   ├── services/
│   │   ├── scoring.js         # Composite + ML scoring logic
│   │   ├── s3.js              # AWS S3 file operations
│   │   └── aiService.js       # AI microservice integration
│   └── utils/
│       ├── logger.js          # Winston logger
│       └── helpers.js         # Utility functions
├── prisma/
│   └── schema.prisma          # Database schema
├── package.json
└── env.example.txt            # Environment variables template
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or use Firebase Firestore)
- Redis 7+ (for background jobs)
- Google Gemini API key
- Firebase project (optional, for storage)

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment:**
```bash
cp env.example.txt .env
```

Edit `.env` with your credentials:
```bash
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/recruit_ai
GEMINI_API_KEY=your-gemini-api-key-here
JWT_SECRET=your-secret-key-here

# Optional (for Firebase Storage)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
```

3. **Setup database:**
```bash
npx prisma migrate dev --name init
npx prisma generate
node src/db/seed.js  # Seed default question pools
```

4. **Run the server:**
```bash
npm run dev
```

5. **Run workers (separate terminal):**
```bash
npm run worker
```

6. **Access the API:**
- Server: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create recruiter account
- `POST /api/auth/login` - Login and get JWT

### Jobs
- `POST /api/jobs` - Create job opening
- `GET /api/jobs` - List jobs
- `GET /api/jobs/:id` - Get job details
- `GET /api/jobs/:id/ranked` - Get ranked applicants
- `GET /api/jobs/:id/export` - Export as CSV

### Applicants
- `POST /api/jobs/:job_id/apply` - Submit application
- `GET /api/applicants/:id` - Get applicant details

### Assessments
- `POST /api/assessments/start` - Start assessment
- `POST /api/assessments/submit` - Submit answers

### Feedback
- `POST /api/feedback` - Add recruiter feedback/override

### Webhooks
- `POST /api/webhooks/register` - Register webhook

## 🧮 Scoring Algorithm

### Composite Score (Rule-Based)
```javascript
composite = (
  weights.skills * skillsMatchScore +
  weights.experience * experienceScore +
  weights.assessment * assessmentScore +
  weights.education * educationScore
)
```

### ML Score (Optional)
External Python microservice returns probability (0-1)

### Final Score
```javascript
finalScore = alpha * composite + (1 - alpha) * (mlProb * 100)
```
Default alpha = 0.7

## 🔄 Complete Processing Flow

### Employer Flow:
1. **Sign up** → Create company account
2. **Post job** → AI suggests requirements based on description
3. **Choose assessment** → AI-generated, pre-built pool, or custom questions
4. **Get shareable link** → Public URL for applications (no applicant signup needed)
5. **Receive applications** → Automatic background processing
6. **Review ranked candidates** → AI-powered scoring and ranking
7. **Provide feedback** → Approve, reject, or override scores

### Applicant Flow (Anonymous - No Account Required):
1. **Click job link** → Access public application form
2. **Fill form** → Name, email, upload CV
3. **Answer questions** → 2-3 role-specific questions
4. **Take assessment** → Optional 5-10 question test (15 min)
5. **Submit** → Get confirmation, no account needed
6. **Processing** → Background AI analysis and scoring

### Background Processing:
1. **Applicant submits** → API stores metadata
2. **Enqueue job** → `processApplicant` added to BullMQ queue
3. **Worker downloads CV** → Parses PDF with `pdf-parse`
4. **AI analysis** → Gemini analyzes CV against job requirements
5. **Compute scores** → Hybrid algorithm (rule-based + AI confidence)
6. **Update rankings** → Sort all applicants by final score
7. **Emit event** → WebSocket `rank_update` to recruiter dashboard

## 📊 Database Schema

Key tables:
- `Org` - Organizations
- `Recruiter` - Users with access
- `Job` - Job openings
- `Applicant` - Application submissions
- `Assessment` - Test results
- `Score` - Final scores & rankings
- `Feedback` - Recruiter overrides
- `WebhookEvent` - Integration events

## 🔐 Security

- JWT authentication (7-day expiry)
- Password hashing with bcryptjs
- CORS configuration
- Helmet.js for HTTP headers
- Pre-signed S3 URLs (10-min TTL)
- Role-based access control (RBAC)

## 🧪 Testing

```bash
npm test
```

## 📈 Monitoring

- Winston for logging
- Morgan for HTTP request logs
- Prisma query logging
- Error tracking with Sentry (optional)

## 🚢 Deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["node", "src/server.js"]
```

### Environment
- **Dev:** Local Node.js + PostgreSQL
- **Staging:** Railway / Render
- **Production:** AWS ECS / Kubernetes

## 📝 License

MIT


