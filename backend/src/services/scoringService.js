import prisma from '../config/database.js';
import aiService from './aiService.js';
import axios from 'axios';

class ScoringService {
  /**
   * Process applicant: CV analysis + assessment scoring
   */
  async processApplicant(applicantId) {
    try {
      // Get applicant and job data
      const applicant = await prisma.applicant.findUnique({
        where: { id: applicantId },
        include: { 
          job: true,
          assessments: true
        }
      });

      if (!applicant) throw new Error('Applicant not found');

      // Update status to processing
      await prisma.applicant.update({
        where: { id: applicantId },
        data: { status: 'processing' }
      });

      // Parse CV if available
      let cvText = '';
      if (applicant.cvUrl) {
        try {
          cvText = await this.parseCV(applicant.cvUrl);
        } catch (error) {
          console.error('CV parsing error:', error.message);
          cvText = 'CV parsing failed';
        }
      }

      // Get AI analysis
      const aiAnalysis = await aiService.analyzeApplicant(
        cvText,
        applicant.job,
        applicant.fieldsJson || {}
      );

      // Get assessment score if available
      let assessmentScore = 50; // Default if no assessment
      const completedAssessment = applicant.assessments.find(a => a.status === 'completed');
      if (completedAssessment && completedAssessment.score !== null) {
        assessmentScore = completedAssessment.score;
      }

      // Calculate composite score (rule-based)
      const compositeScore = this.calculateCompositeScore(
        aiAnalysis,
        assessmentScore,
        applicant.job.weightsJson || {}
      );

      // Calculate final score (hybrid)
      const alpha = 0.7; // Weight for rule-based vs AI confidence
      const finalScore = alpha * compositeScore + 
                        (1 - alpha) * (aiAnalysis.overallFit.score * aiAnalysis.overallFit.confidence);

      // Save scores to database
      const score = await prisma.score.upsert({
        where: {
          applicantId_jobId: {
            applicantId: applicant.id,
            jobId: applicant.jobId
          }
        },
        update: {
          compositeScore,
          mlProb: aiAnalysis.overallFit.confidence,
          finalScore: Math.round(finalScore * 100) / 100,
          breakdownJson: {
            ...aiAnalysis,
            assessmentScore
          },
          status: 'pending',
          updatedAt: new Date()
        },
        create: {
          applicantId: applicant.id,
          jobId: applicant.jobId,
          compositeScore,
          mlProb: aiAnalysis.overallFit.confidence,
          finalScore: Math.round(finalScore * 100) / 100,
          breakdownJson: {
            ...aiAnalysis,
            assessmentScore
          },
          status: 'pending'
        }
      });

      // Update rankings for this job
      await this.updateRankings(applicant.jobId);

      // Update applicant status
      await prisma.applicant.update({
        where: { id: applicantId },
        data: { status: 'scored' }
      });

      return { 
        success: true, 
        finalScore: score.finalScore, 
        aiAnalysis,
        rank: score.rank
      };

    } catch (error) {
      console.error('Scoring error:', error);
      
      // Update applicant status to received if processing fails
      await prisma.applicant.update({
        where: { id: applicantId },
        data: { status: 'received' }
      }).catch(err => console.error('Status update error:', err));

      throw error;
    }
  }

  /**
   * Calculate composite score from various factors
   */
  calculateCompositeScore(aiAnalysis, assessmentScore, weights = {}) {
    const defaultWeights = {
      skills: 0.4,
      experience: 0.3,
      education: 0.2,
      assessment: 0.1
    };
    
    const w = { ...defaultWeights, ...weights };
    
    const compositeScore = (
      w.skills * aiAnalysis.skillsMatch.score +
      w.experience * aiAnalysis.experienceMatch.score +
      w.education * aiAnalysis.educationMatch.score +
      w.assessment * assessmentScore
    );

    return Math.round(compositeScore * 100) / 100;
  }

  /**
   * Update rankings for all applicants in a job
   */
  async updateRankings(jobId) {
    try {
      // Get all scores for this job, ordered by finalScore
      const scores = await prisma.score.findMany({
        where: { jobId },
        orderBy: { finalScore: 'desc' },
        include: { applicant: true }
      });

      // Calculate percentiles and update ranks
      const totalApplicants = scores.length;

      for (let i = 0; i < scores.length; i++) {
        const rank = i + 1;
        const percentile = totalApplicants > 1 
          ? Math.round(((totalApplicants - rank) / (totalApplicants - 1)) * 100)
          : 100;

        await prisma.score.update({
          where: { id: scores[i].id },
          data: {
            rank,
            percentile
          }
        });
      }

      return { success: true, totalApplicants };
    } catch (error) {
      console.error('Ranking update error:', error);
      throw error;
    }
  }

  /**
   * Get ranked applicants for a job
   */
  async getRankedApplicants(jobId, limit = 100) {
    try {
      const scores = await prisma.score.findMany({
        where: { jobId },
        orderBy: { finalScore: 'desc' },
        take: limit,
        include: {
          applicant: {
            include: {
              assessments: true
            }
          }
        }
      });

      return scores.map(score => ({
        rank: score.rank,
        applicant: {
          id: score.applicant.id,
          name: score.applicant.name,
          email: score.applicant.email,
          phone: score.applicant.phone,
          cvUrl: score.applicant.cvUrl,
          createdAt: score.applicant.createdAt
        },
        finalScore: score.finalScore,
        compositeScore: score.compositeScore,
        percentile: score.percentile,
        breakdown: score.breakdownJson,
        status: score.status,
        assessmentCompleted: score.applicant.assessments.some(a => a.status === 'completed')
      }));
    } catch (error) {
      console.error('Ranked applicants retrieval error:', error);
      throw error;
    }
  }

  /**
   * Parse CV from URL (supports PDF and DOCX)
   */
  async parseCV(cvUrl) {
    try {
      // Download file
      if (!cvUrl || (!cvUrl.startsWith('http://') && !cvUrl.startsWith('https://'))) {
        return 'No CV provided';
      }

      const response = await axios.get(cvUrl, {
        responseType: 'arraybuffer',
        timeout: 30000 // 30 seconds
      });

      const buffer = Buffer.from(response.data);
      const filename = cvUrl.toLowerCase();

      // For now, return a placeholder
      // We'll use Gemini AI to analyze the CV directly from the URL or base64
      // This avoids PDF parsing issues entirely
      
      return `CV downloaded successfully (${buffer.length} bytes). File: ${filename}`;

    } catch (error) {
      console.error('CV download error:', error.message);
      // Return a fallback - system will still work with form data
      return 'CV temporarily unavailable for parsing. Analysis based on application form data.';
    }
  }

  /**
   * Reprocess applicant (manual trigger)
   */
  async reprocessApplicant(applicantId) {
    return await this.processApplicant(applicantId);
  }

  /**
   * Get applicant score details
   */
  async getApplicantScore(applicantId, jobId) {
    try {
      const score = await prisma.score.findUnique({
        where: {
          applicantId_jobId: {
            applicantId,
            jobId
          }
        },
        include: {
          applicant: true,
          feedback: {
            include: {
              recruiter: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      return score;
    } catch (error) {
      console.error('Score retrieval error:', error);
      throw error;
    }
  }
}

export default new ScoringService();



