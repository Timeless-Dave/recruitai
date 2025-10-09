-- CreateTable
CREATE TABLE "Org" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subdomain" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Org_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruiter" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'recruiter',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recruiter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "criteriaJson" JSONB,
    "weightsJson" JSONB,
    "passMark" DOUBLE PRECISION NOT NULL DEFAULT 70.0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "shareableUrl" TEXT,
    "applicationForm" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicant" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "fieldsJson" JSONB,
    "cvUrl" TEXT,
    "cvFilename" TEXT,
    "status" TEXT NOT NULL DEFAULT 'received',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "answersJson" JSONB,
    "score" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "compositeScore" DOUBLE PRECISION NOT NULL,
    "mlProb" DOUBLE PRECISION,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "percentile" DOUBLE PRECISION,
    "rank" INTEGER,
    "breakdownJson" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "scoreId" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "type" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionPool" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "role" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "questionsJson" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "orgId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionPool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobAssessment" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "questionPoolId" TEXT,
    "customQuestions" JSONB,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "timeLimit" INTEGER,
    "passMark" DOUBLE PRECISION NOT NULL DEFAULT 60.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Org_subdomain_key" ON "Org"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "Recruiter_email_key" ON "Recruiter"("email");

-- CreateIndex
CREATE INDEX "Recruiter_orgId_idx" ON "Recruiter"("orgId");

-- CreateIndex
CREATE INDEX "Recruiter_email_idx" ON "Recruiter"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Job_shareableUrl_key" ON "Job"("shareableUrl");

-- CreateIndex
CREATE INDEX "Job_orgId_idx" ON "Job"("orgId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_shareableUrl_idx" ON "Job"("shareableUrl");

-- CreateIndex
CREATE INDEX "Applicant_jobId_idx" ON "Applicant"("jobId");

-- CreateIndex
CREATE INDEX "Applicant_email_idx" ON "Applicant"("email");

-- CreateIndex
CREATE INDEX "Assessment_applicantId_idx" ON "Assessment"("applicantId");

-- CreateIndex
CREATE INDEX "Assessment_jobId_idx" ON "Assessment"("jobId");

-- CreateIndex
CREATE INDEX "Score_jobId_idx" ON "Score"("jobId");

-- CreateIndex
CREATE INDEX "Score_finalScore_idx" ON "Score"("finalScore");

-- CreateIndex
CREATE UNIQUE INDEX "Score_applicantId_jobId_key" ON "Score"("applicantId", "jobId");

-- CreateIndex
CREATE INDEX "Feedback_scoreId_idx" ON "Feedback"("scoreId");

-- CreateIndex
CREATE INDEX "Feedback_recruiterId_idx" ON "Feedback"("recruiterId");

-- CreateIndex
CREATE INDEX "WebhookEvent_status_idx" ON "WebhookEvent"("status");

-- CreateIndex
CREATE INDEX "WebhookEvent_type_idx" ON "WebhookEvent"("type");

-- CreateIndex
CREATE INDEX "QuestionPool_category_idx" ON "QuestionPool"("category");

-- CreateIndex
CREATE INDEX "QuestionPool_role_idx" ON "QuestionPool"("role");

-- CreateIndex
CREATE INDEX "QuestionPool_orgId_idx" ON "QuestionPool"("orgId");

-- CreateIndex
CREATE INDEX "JobAssessment_jobId_idx" ON "JobAssessment"("jobId");

-- CreateIndex
CREATE INDEX "JobAssessment_questionPoolId_idx" ON "JobAssessment"("questionPoolId");

-- AddForeignKey
ALTER TABLE "Recruiter" ADD CONSTRAINT "Recruiter_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "Score"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "Recruiter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionPool" ADD CONSTRAINT "QuestionPool_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Org"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAssessment" ADD CONSTRAINT "JobAssessment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAssessment" ADD CONSTRAINT "JobAssessment_questionPoolId_fkey" FOREIGN KEY ("questionPoolId") REFERENCES "QuestionPool"("id") ON DELETE SET NULL ON UPDATE CASCADE;
