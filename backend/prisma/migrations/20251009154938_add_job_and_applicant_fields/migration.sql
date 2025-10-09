-- AlterTable
ALTER TABLE "Applicant" ADD COLUMN     "coverLetter" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "resumeUrl" TEXT;

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "department" TEXT,
ADD COLUMN     "experienceLevel" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "qualifications" TEXT,
ADD COLUMN     "requiredSkills" JSONB,
ADD COLUMN     "responsibilities" TEXT,
ADD COLUMN     "salary" JSONB,
ADD COLUMN     "type" TEXT;
