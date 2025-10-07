# Complete Setup Guide

## 📋 Prerequisites Checklist

Before you begin, make sure you have:

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed and running
- [ ] Redis 7+ installed and running
- [ ] Google Gemini API key
- [ ] Firebase project (optional, for CV storage)

---

## 🚀 Step-by-Step Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

This installs all required packages including:
- Express, Prisma, Firebase
- Google Generative AI (Gemini)
- BullMQ for background jobs
- And more...

---

### 2. Get API Keys

#### Google Gemini API Key:
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API Key"
3. Create a new API key
4. Copy the key

#### Firebase (Optional - for CV storage):
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Extract these values:
   - `project_id`
   - `client_email`
   - `private_key`
   - Storage bucket name (format: `your-project.appspot.com`)

---

### 3. Configure Environment Variables

```bash
cp env.example.txt .env
```

Edit `.env` file:

```bash
# Server
PORT=5000
NODE_ENV=development

# Database - Update with your PostgreSQL credentials
DATABASE_URL=postgresql://username:password@localhost:5432/recruit_ai

# JWT Secret - Generate a random string
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Redis - Default local settings
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Google Gemini API - REQUIRED
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-pro

# Firebase - OPTIONAL (for CV storage)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nKey\nHere\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# CORS
CORS_ORIGIN=http://localhost:3000

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

---

### 4. Setup PostgreSQL Database

#### Option A: Local PostgreSQL

```bash
# Create database
createdb recruit_ai

# Or using psql
psql -U postgres
CREATE DATABASE recruit_ai;
\q
```

#### Option B: Use Cloud PostgreSQL

Services like:
- [Neon](https://neon.tech) - Free tier available
- [Supabase](https://supabase.com) - Free tier
- [Railway](https://railway.app) - Pay as you go

Update `DATABASE_URL` in `.env` with the connection string.

---

### 5. Setup Redis

#### Option A: Local Redis

**Mac:**
```bash
brew install redis
brew services start redis
```

**Ubuntu:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

**Windows:**
Download from [Redis Windows](https://github.com/microsoftarchive/redis/releases)

#### Option B: Cloud Redis

Services like:
- [Upstash](https://upstash.com) - Free tier
- [Redis Cloud](https://redis.com/cloud) - Free tier
- [Railway](https://railway.app)

Update `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` in `.env`.

---

### 6. Run Database Migrations

```bash
# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed default question pools
npm run db:seed

# Or do all at once
npm run db:setup
```

You should see:
```
✅ Seeded 3 question pools
✅ Database seeding completed successfully
```

---

### 7. Start the Server

**Terminal 1 - Main Server:**
```bash
npm run dev
```

You should see:
```
==================================================
🚀 Recruit AI Backend Server Started
📡 Server running on port 5000
🌍 Environment: development
🔗 CORS Origin: http://localhost:3000
🔌 WebSocket: Enabled
💾 Database: Connected
🔥 Firebase: Configured
🤖 AI Service: Gemini API Ready
==================================================
```

**Terminal 2 - Background Worker:**
```bash
npm run worker
```

You should see:
```
[Worker] Scoring worker started
```

---

### 8. Test the API

**Health Check:**
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

**Create Account:**
```bash
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

## 🐛 Troubleshooting

### Database Connection Error

**Error:** `Can't reach database server at localhost:5432`

**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify credentials in `DATABASE_URL`
3. Check firewall settings

### Redis Connection Error

**Error:** `ECONNREFUSED 127.0.0.1:6379`

**Solution:**
1. Check Redis is running: `redis-cli ping` (should return "PONG")
2. Start Redis: `redis-server`
3. Verify `REDIS_HOST` and `REDIS_PORT` in `.env`

### Gemini API Error

**Error:** `Invalid API key`

**Solution:**
1. Verify API key in `.env`
2. Check API key at [Google AI Studio](https://aistudio.google.com/)
3. Ensure no extra spaces or quotes in `.env`

### Firebase Error

**Error:** `Firebase initialization error`

**Solution:**
1. Firebase is **optional** - system works without it
2. If you want CV storage, verify all Firebase credentials
3. Ensure `FIREBASE_PRIVATE_KEY` includes newlines: `\\n`

### Port Already in Use

**Error:** `Port 5000 is already in use`

**Solution:**
1. Change `PORT` in `.env` to `5001` or another free port
2. Or kill the process: `lsof -ti:5000 | xargs kill -9`

---

## 📁 Project Structure After Setup

```
backend/
├── logs/                    # Auto-created log files
│   ├── combined.log
│   └── error.log
├── node_modules/           # Dependencies
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── config/
│   │   ├── database.js     # ✅ Prisma connection
│   │   └── firebase.js     # ✅ Firebase setup
│   ├── db/
│   │   └── seed.js         # ✅ Database seeding
│   ├── middleware/
│   │   ├── auth.js         # ✅ JWT authentication
│   │   └── errorHandler.js # ✅ Error handling
│   ├── routes/
│   │   ├── auth.js         # ✅ Auth endpoints
│   │   ├── jobs.js         # ✅ Job management
│   │   ├── applicants.js   # ✅ Applications
│   │   ├── assessments.js  # ✅ Assessments
│   │   ├── feedback.js     # ✅ Recruiter feedback
│   │   └── webhooks.js     # ✅ Webhooks
│   ├── services/
│   │   ├── aiService.js    # ✅ Gemini AI
│   │   ├── assessmentService.js # ✅ Questions & scoring
│   │   └── scoringService.js    # ✅ Hybrid scoring
│   ├── utils/
│   │   ├── logger.js       # ✅ Winston logger
│   │   └── helpers.js      # ✅ Utility functions
│   ├── workers/
│   │   └── index.js        # ✅ Background jobs
│   └── server.js           # ✅ Main server
├── .env                    # Your configuration
├── package.json
└── README.md
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Server starts without errors
- [ ] Health check returns `200 OK`
- [ ] Can create an account
- [ ] Can login and get JWT token
- [ ] Worker process is running
- [ ] Logs are being created in `logs/` directory
- [ ] Database has tables (check with Prisma Studio: `npx prisma studio`)

---

## 🎉 Next Steps

1. **Frontend Integration:** Connect your frontend to these APIs
2. **Create a Job:** Use POST `/api/jobs` to create your first job
3. **Test Application:** Use the shareable link to submit a test application
4. **Monitor Logs:** Check `logs/combined.log` for activity
5. **Review Documentation:** See `API.md` for complete API reference

---

## 📚 Additional Resources

- [Prisma Docs](https://www.prisma.io/docs/)
- [Google Gemini API](https://ai.google.dev/docs)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

## 🆘 Need Help?

If you encounter issues not covered here:

1. Check the logs: `tail -f logs/combined.log`
2. Enable debug logging: Set `LOG_LEVEL=debug` in `.env`
3. Review error messages carefully
4. Ensure all environment variables are set correctly

---

**🎊 Congratulations! Your backend is now ready to use!**



