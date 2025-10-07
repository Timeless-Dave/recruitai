import prisma from '../config/database.js';
import aiService from './aiService.js';

class AssessmentService {
  /**
   * Generate questions for a job using AI
   */
  async generateQuestionsForJob(jobId, questionCount = 5, difficulty = 'medium') {
    try {
      const job = await prisma.job.findUnique({ where: { id: jobId } });
      if (!job) throw new Error('Job not found');

      const jobDescription = `${job.title}\n\n${job.description}`;
      const questions = await aiService.generateQuestions(jobDescription, questionCount, difficulty);

      return questions;
    } catch (error) {
      console.error('Question generation error:', error);
      throw error;
    }
  }

  /**
   * Get question pool by category and role
   */
  async getQuestionPool(category, role = null) {
    try {
      const pools = await prisma.questionPool.findMany({
        where: {
          isDefault: true,
          OR: [
            { category },
            { role }
          ]
        }
      });

      return pools[0] || null;
    } catch (error) {
      console.error('Question pool retrieval error:', error);
      return null;
    }
  }

  /**
   * Get assessment questions for a job
   */
  async getJobAssessmentQuestions(jobId) {
    try {
      const jobAssessment = await prisma.jobAssessment.findFirst({
        where: { jobId },
        include: { questionPool: true }
      });

      if (!jobAssessment) {
        return null;
      }

      // Return custom questions if available
      if (jobAssessment.customQuestions) {
        return {
          questions: jobAssessment.customQuestions,
          timeLimit: jobAssessment.timeLimit,
          passMark: jobAssessment.passMark,
          isRequired: jobAssessment.isRequired
        };
      }

      // Return question pool questions
      if (jobAssessment.questionPool) {
        return {
          questions: jobAssessment.questionPool.questionsJson,
          timeLimit: jobAssessment.timeLimit,
          passMark: jobAssessment.passMark,
          isRequired: jobAssessment.isRequired
        };
      }

      return null;
    } catch (error) {
      console.error('Assessment questions retrieval error:', error);
      return null;
    }
  }

  /**
   * Score assessment answers
   */
  async scoreAssessment(answers, questions) {
    try {
      if (!Array.isArray(answers) || !Array.isArray(questions)) {
        throw new Error('Invalid answers or questions format');
      }

      let correctCount = 0;
      const totalQuestions = questions.length;
      const breakdown = [];

      answers.forEach((answer, index) => {
        if (index >= questions.length) return;

        const question = questions[index];
        const isCorrect = answer === question.correctAnswer;

        if (isCorrect) {
          correctCount++;
        }

        breakdown.push({
          questionId: question.id,
          question: question.question,
          userAnswer: answer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          category: question.category
        });
      });

      const score = (correctCount / totalQuestions) * 100;

      return {
        score: Math.round(score * 100) / 100,
        correctCount,
        totalQuestions,
        percentage: Math.round(score),
        breakdown
      };
    } catch (error) {
      console.error('Assessment scoring error:', error);
      throw error;
    }
  }

  /**
   * Create assessment for applicant
   */
  async createAssessment(applicantId, jobId) {
    try {
      const assessment = await prisma.assessment.create({
        data: {
          applicantId,
          jobId,
          type: 'mcq',
          status: 'pending'
        }
      });

      return assessment;
    } catch (error) {
      console.error('Assessment creation error:', error);
      throw error;
    }
  }

  /**
   * Start assessment (mark as started)
   */
  async startAssessment(assessmentId) {
    try {
      const assessment = await prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          status: 'started',
          startedAt: new Date()
        }
      });

      return assessment;
    } catch (error) {
      console.error('Assessment start error:', error);
      throw error;
    }
  }

  /**
   * Submit assessment answers
   */
  async submitAssessment(assessmentId, answers) {
    try {
      // Get assessment and job questions
      const assessment = await prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: { job: true }
      });

      if (!assessment) throw new Error('Assessment not found');

      // Get questions
      const assessmentData = await this.getJobAssessmentQuestions(assessment.jobId);
      if (!assessmentData) throw new Error('Assessment questions not found');

      // Score the answers
      const scoreResult = await this.scoreAssessment(answers, assessmentData.questions);

      // Update assessment
      const updatedAssessment = await prisma.assessment.update({
        where: { id: assessmentId },
        data: {
          answersJson: answers,
          score: scoreResult.score,
          status: 'completed',
          finishedAt: new Date()
        }
      });

      return {
        assessment: updatedAssessment,
        scoreResult
      };
    } catch (error) {
      console.error('Assessment submission error:', error);
      throw error;
    }
  }

  /**
   * Get default question pools for common roles
   */
  getDefaultQuestionPools() {
    return [
      {
        category: 'technical',
        role: 'developer',
        name: 'Software Developer - General',
        description: 'General software development questions',
        questionsJson: [
          {
            id: 'dev_q1',
            type: 'multiple_choice',
            category: 'technical',
            difficulty: 'medium',
            question: 'What is the main purpose of version control systems like Git?',
            options: [
              'To track changes in code and collaborate with others',
              'To compile code faster',
              'To automatically fix bugs',
              'To deploy applications'
            ],
            correctAnswer: 0,
            explanation: 'Version control systems track changes and enable collaboration'
          },
          {
            id: 'dev_q2',
            type: 'multiple_choice',
            category: 'technical',
            difficulty: 'medium',
            question: 'What does API stand for?',
            options: [
              'Automated Programming Interface',
              'Application Programming Interface',
              'Advanced Protocol Integration',
              'Application Process Integration'
            ],
            correctAnswer: 1,
            explanation: 'API stands for Application Programming Interface'
          },
          {
            id: 'dev_q3',
            type: 'multiple_choice',
            category: 'technical',
            difficulty: 'easy',
            question: 'Which of the following is NOT a programming language?',
            options: ['Python', 'JavaScript', 'HTML', 'Java'],
            correctAnswer: 2,
            explanation: 'HTML is a markup language, not a programming language'
          }
        ],
        isDefault: true
      },
      {
        category: 'behavioral',
        role: null,
        name: 'Behavioral Assessment - General',
        description: 'General behavioral and soft skills questions',
        questionsJson: [
          {
            id: 'beh_q1',
            type: 'multiple_choice',
            category: 'behavioral',
            difficulty: 'easy',
            question: 'How do you typically handle tight deadlines?',
            options: [
              'Prioritize tasks and communicate with stakeholders',
              'Work overtime without informing anyone',
              'Skip quality checks to meet deadlines',
              'Ignore the deadline'
            ],
            correctAnswer: 0,
            explanation: 'Effective communication and prioritization are key'
          },
          {
            id: 'beh_q2',
            type: 'multiple_choice',
            category: 'behavioral',
            difficulty: 'medium',
            question: 'What is the best approach when you disagree with a team member?',
            options: [
              'Avoid confrontation and do nothing',
              'Discuss concerns professionally and find common ground',
              'Escalate immediately to management',
              'Insist on your own way'
            ],
            correctAnswer: 1,
            explanation: 'Professional discussion and collaboration lead to better outcomes'
          }
        ],
        isDefault: true
      },
      {
        category: 'technical',
        role: 'sales',
        name: 'Sales Professional - General',
        description: 'Sales-specific scenario questions',
        questionsJson: [
          {
            id: 'sales_q1',
            type: 'multiple_choice',
            category: 'role-specific',
            difficulty: 'medium',
            question: 'A potential customer says your product is too expensive. What do you do?',
            options: [
              'Immediately offer a discount',
              'Focus on value and ROI, understand their budget constraints',
              'End the conversation',
              'Argue about the price'
            ],
            correctAnswer: 1,
            explanation: 'Understanding value and constraints helps address price objections'
          },
          {
            id: 'sales_q2',
            type: 'multiple_choice',
            category: 'role-specific',
            difficulty: 'easy',
            question: 'What is the most important skill in sales?',
            options: [
              'Aggressive persuasion',
              'Active listening and understanding customer needs',
              'Memorizing product features',
              'Making quick closes'
            ],
            correctAnswer: 1,
            explanation: 'Understanding customer needs is fundamental to successful sales'
          }
        ],
        isDefault: true
      }
    ];
  }
}

export default new AssessmentService();



