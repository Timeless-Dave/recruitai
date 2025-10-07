import { GoogleGenerativeAI } from '@google/generative-ai';

class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro' 
    });
  }

  /**
   * Analyze applicant CV against job requirements
   */
  async analyzeApplicant(cvText, jobRequirements, customFields = {}) {
    const prompt = `
Analyze this job applicant for a ${jobRequirements.title} position.

JOB REQUIREMENTS:
Title: ${jobRequirements.title}
Description: ${jobRequirements.description}

${jobRequirements.criteriaJson ? `
Required Skills: ${jobRequirements.criteriaJson.skills?.join(', ') || 'Not specified'}
Experience Level: ${jobRequirements.criteriaJson.experience || 'Not specified'}
Education: ${jobRequirements.criteriaJson.education || 'Not specified'}
` : ''}

APPLICANT CV:
${cvText || 'No CV provided'}

ADDITIONAL INFO:
${JSON.stringify(customFields, null, 2)}

Please analyze and return ONLY a valid JSON response (no markdown, no explanation) with this exact structure:
{
  "skillsMatch": {
    "score": 85,
    "matchedSkills": ["JavaScript", "React", "Node.js"],
    "missingSkills": ["Python", "AWS"]
  },
  "experienceMatch": {
    "score": 78,
    "yearsRelevant": 3,
    "relevance": "high"
  },
  "educationMatch": {
    "score": 90,
    "level": "bachelor",
    "relevant": true
  },
  "overallFit": {
    "score": 82,
    "confidence": 0.85,
    "recommendation": "strong"
  },
  "insights": {
    "strengths": ["Strong technical background", "Relevant project experience"],
    "concerns": ["Limited cloud experience"],
    "summary": "Good fit with some gaps"
  }
}

Rules:
- All scores are 0-100
- confidence is 0-1
- relevance: "high", "medium", or "low"
- recommendation: "strong", "moderate", or "weak"
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean and parse JSON response
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.validateAndNormalizeAnalysis(parsed);
      }
      
      throw new Error('Invalid JSON response from AI');
    } catch (error) {
      console.error('AI analysis error:', error.message);
      return this.getFallbackScores();
    }
  }

  /**
   * Generate assessment questions for a job
   */
  async generateQuestions(jobDescription, questionCount = 5, difficulty = 'medium') {
    const prompt = `
Generate ${questionCount} relevant assessment questions for this job position:

JOB DESCRIPTION:
${jobDescription}

Requirements:
- Create ${questionCount} multiple-choice questions
- Difficulty level: ${difficulty}
- Mix of technical and behavioral questions
- Each question should have 4 options
- Mark the correct answer index (0-3)

Return ONLY valid JSON (no markdown) in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "category": "technical",
      "difficulty": "medium",
      "question": "What is React primarily used for?",
      "options": [
        "Building user interfaces",
        "Database management",
        "Server-side rendering only",
        "Mobile app development only"
      ],
      "correctAnswer": 0,
      "explanation": "React is a JavaScript library for building user interfaces"
    }
  ]
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.questions || [];
      }
      
      throw new Error('Invalid JSON response from AI');
    } catch (error) {
      console.error('Question generation error:', error.message);
      return this.getFallbackQuestions(questionCount);
    }
  }

  /**
   * Suggest job requirements based on title and description
   */
  async suggestJobRequirements(title, description) {
    const prompt = `
Based on this job posting, suggest relevant requirements:

TITLE: ${title}
DESCRIPTION: ${description}

Return ONLY valid JSON (no markdown) with this structure:
{
  "skills": ["JavaScript", "React", "Node.js", "REST APIs"],
  "experience": "2-4 years",
  "education": "Bachelor's degree in Computer Science or related field",
  "responsibilities": ["Build user interfaces", "Write clean code", "Collaborate with team"],
  "weights": {
    "skills": 0.4,
    "experience": 0.3,
    "education": 0.2,
    "assessment": 0.1
  }
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid JSON response from AI');
    } catch (error) {
      console.error('Requirements suggestion error:', error.message);
      return this.getDefaultRequirements();
    }
  }

  /**
   * Validate and normalize AI analysis response
   */
  validateAndNormalizeAnalysis(analysis) {
    return {
      skillsMatch: {
        score: Math.min(100, Math.max(0, analysis.skillsMatch?.score || 50)),
        matchedSkills: analysis.skillsMatch?.matchedSkills || [],
        missingSkills: analysis.skillsMatch?.missingSkills || []
      },
      experienceMatch: {
        score: Math.min(100, Math.max(0, analysis.experienceMatch?.score || 50)),
        yearsRelevant: analysis.experienceMatch?.yearsRelevant || 0,
        relevance: analysis.experienceMatch?.relevance || 'unknown'
      },
      educationMatch: {
        score: Math.min(100, Math.max(0, analysis.educationMatch?.score || 50)),
        level: analysis.educationMatch?.level || 'unknown',
        relevant: analysis.educationMatch?.relevant || false
      },
      overallFit: {
        score: Math.min(100, Math.max(0, analysis.overallFit?.score || 50)),
        confidence: Math.min(1, Math.max(0, analysis.overallFit?.confidence || 0.5)),
        recommendation: analysis.overallFit?.recommendation || 'weak'
      },
      insights: {
        strengths: analysis.insights?.strengths || [],
        concerns: analysis.insights?.concerns || [],
        summary: analysis.insights?.summary || 'Analysis completed'
      }
    };
  }

  /**
   * Fallback scores when AI fails
   */
  getFallbackScores() {
    return {
      skillsMatch: { score: 50, matchedSkills: [], missingSkills: [] },
      experienceMatch: { score: 50, yearsRelevant: 0, relevance: 'unknown' },
      educationMatch: { score: 50, level: 'unknown', relevant: false },
      overallFit: { score: 50, confidence: 0.5, recommendation: 'weak' },
      insights: { strengths: [], concerns: ['AI analysis unavailable'], summary: 'Manual review recommended' }
    };
  }

  /**
   * Fallback questions when generation fails
   */
  getFallbackQuestions(count) {
    const fallback = [
      {
        id: 'q1',
        type: 'multiple_choice',
        category: 'general',
        difficulty: 'easy',
        question: 'Why are you interested in this position?',
        options: [
          'Career growth opportunity',
          'Company reputation',
          'Skills match',
          'All of the above'
        ],
        correctAnswer: 3,
        explanation: 'Multiple factors contribute to job interest'
      }
    ];
    
    return fallback.slice(0, count);
  }

  /**
   * Default requirements when suggestion fails
   */
  getDefaultRequirements() {
    return {
      skills: ['Communication', 'Problem solving', 'Teamwork'],
      experience: '1-3 years',
      education: 'Bachelor\'s degree or equivalent experience',
      responsibilities: ['Complete assigned tasks', 'Collaborate with team', 'Continuous learning'],
      weights: {
        skills: 0.4,
        experience: 0.3,
        education: 0.2,
        assessment: 0.1
      }
    };
  }
}

export default new AIService();



