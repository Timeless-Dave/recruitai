# 🚀 Quick Start Guide - Recruit AI Platform

## What You Have Now

A complete **AI-powered recruitment platform backend** with:
- ✅ Google Gemini AI for CV analysis
- ✅ Auto-generated assessment questions
- ✅ Anonymous applicant applications (no signup needed)
- ✅ Hybrid scoring algorithm (rule-based + AI)
- ✅ Real-time rankings via WebSocket
- ✅ Firebase + PostgreSQL integration

---

## 🏃 Get Running in 5 Minutes

### 1. Prerequisites
```bash
# Check you have these:
node --version  # Should be 18+
postgres --version  # Should be 14+
redis-cli ping  # Should return PONG
```

### 2. Install & Configure
```bash
# Install dependencies
cd backend
npm install

# Copy environment template
cp env.example.txt .env

# Edit .env - MINIMUM REQUIRED:
# DATABASE_URL=postgresql://user:pass@localhost:5432/recruit_ai
# GEMINI_API_KEY=your-key-here
# JWT_SECRET=your-secret-here
```

### 3. Setup Database
```bash
# One command does it all:
npm run db:setup

# Or step by step:
npm run db:migrate   # Create tables
npm run db:generate  # Generate Prisma client
npm run db:seed      # Add default question pools
```

### 4. Run the Server
```bash
# Terminal 1 - API Server
npm run dev

# Terminal 2 - Background Worker (CV processing)
npm run worker
```

### 5. Test It
```bash
# Health check
curl http://localhost:5000/health

# Create test account
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "orgName": "Test Company"
  }'
```

---

## 📖 Documentation

| File | Description |
|------|-------------|
| `backend/README.md` | Complete architecture overview |
| `backend/SETUP.md` | Detailed setup with troubleshooting |
| `backend/API.md` | Full API reference with examples |
| `backend/IMPLEMENTATION_SUMMARY.md` | What was built and how it works |

---

## 🎯 How It Works

### Employer Journey:
1. **Sign up** → Creates company account
2. **Post job** → AI suggests requirements automatically
3. **Choose assessment** → AI generates questions OR use pre-built
4. **Share link** → Candidates apply without creating accounts
5. **Review** → See AI-ranked candidates with scores

### Applicant Journey:
1. **Click link** → No signup required
2. **Upload CV** → AI analyzes automatically
3. **Answer 2-3 questions** → Role-specific
4. **Take assessment** → Optional 5-10 questions
5. **Done** → Get confirmation instantly

### Behind the Scenes:
```
Application → Queue → Worker → AI Analysis → Scoring → Ranking
                ↓
            Gemini API
         (CV + Questions)
```

---

## 🔑 Get Your API Keys

### Google Gemini (Required):
1. Go to https://aistudio.google.com/
2. Click "Get API Key"
3. Copy to `.env` as `GEMINI_API_KEY`

### Firebase (Optional - for CV storage):
1. Go to https://console.firebase.google.com/
2. Create project → Project Settings → Service Accounts
3. Generate new private key
4. Add credentials to `.env`

---

## 🐛 Common Issues

**"Can't connect to database"**
```bash
# Create database first:
createdb recruit_ai
```

**"Redis connection refused"**
```bash
# Start Redis:
redis-server
# Or: brew services start redis
```

**"Port 5000 already in use"**
```bash
# Change PORT in .env to 5001
```

---

## 📝 Example API Calls

### Create a Job:
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Developer",
    "description": "Looking for experienced developer...",
    "assessmentType": "ai-generated"
  }'
```

### Submit Application (Public):
```bash
curl -X POST http://localhost:5000/api/applicants/apply/SHAREABLE_ID \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "cv=@resume.pdf"
```

### Get Ranked Applicants:
```bash
curl http://localhost:5000/api/jobs/JOB_ID/ranked \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🌟 Key Features

✅ **AI-Powered**: Gemini analyzes CVs and generates questions
✅ **No Applicant Signup**: Frictionless application process
✅ **Smart Scoring**: Hybrid algorithm combines rules + AI
✅ **Real-time**: WebSocket updates for instant rankings
✅ **Flexible**: Pre-built, AI-generated, or custom assessments
✅ **Fast**: Setup in minutes, not hours

---

## 🚀 Next Steps

1. ✅ Backend is complete and working
2. 🎨 Build your frontend (React/Next.js)
3. 🔗 Connect to these APIs
4. 🎉 Start recruiting!

---

## 📚 Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL + Prisma ORM
- **Storage**: Firebase Storage (optional)
- **AI**: Google Gemini API
- **Queue**: BullMQ + Redis
- **Real-time**: Socket.io

---

## 💡 Pro Tips

- Use `npx prisma studio` to view database visually
- Check logs in `backend/logs/combined.log`
- Set `LOG_LEVEL=debug` in `.env` for verbose logging
- Workers process 5 applications concurrently
- Assessment questions cached in database

---

**Questions?** Check the documentation files above or review the code - it's well-commented!

**Ready to build something amazing! 🚀**



