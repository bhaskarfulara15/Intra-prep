import { z } from 'zod';
import pool from '../config/db.js';
import { generateInterviewQuestions, evaluateCandidateAnswer } from '../services/aiService.js';

export const createInterviewSchema = z.object({
  body: z.object({
    category: z.enum(['quantitative_aptitude', 'technical', 'hr', 'job_description', 'resume_based']),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    total_questions: z.number().int().min(5).max(20).default(5),
    duration_minutes: z.number().int().min(5).max(120).default(15),
    selected_topics: z.array(z.string()).optional().default([]),
    job_description: z.string().optional().nullable(),
    resume_id: z.number().int().positive().optional().nullable(),
  }),
});

export const submitAnswerSchema = z.object({
  body: z.object({
    question_id: z.number().int().positive(),
    answer_text: z.string().max(10000),
  }),
});

/**
 * Create a new interview session and generate AI questions
 */
export const createInterview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      category,
      difficulty,
      total_questions,
      duration_minutes,
      selected_topics,
      job_description,
      resume_id,
    } = req.body;

    let resumeText = '';
    let extractedSkills = [];

    // If resume-based, verify ownership and fetch text
    if (category === 'resume_based' && resume_id) {
      const [resumes] = await pool.query(
        'SELECT parsed_text, extracted_skills FROM resumes WHERE id = ? AND user_id = ?',
        [resume_id, userId]
      );
      if (resumes.length > 0) {
        resumeText = resumes[0].parsed_text || '';
        extractedSkills = typeof resumes[0].extracted_skills === 'string'
          ? JSON.parse(resumes[0].extracted_skills || '[]')
          : resumes[0].extracted_skills || [];
      }
    }

    // Generate questions using AI Service
    const questions = await generateInterviewQuestions({
      category,
      difficulty,
      totalQuestions: total_questions,
      selectedTopics: selected_topics,
      jobDescription: job_description || '',
      resumeText,
      extractedSkills,
    });

    // Create interview record
    const [interviewResult] = await pool.query(
      `INSERT INTO interviews 
       (user_id, resume_id, category, difficulty, total_questions, duration_minutes, selected_topics, job_description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'in_progress')`,
      [
        userId,
        resume_id || null,
        category,
        difficulty,
        questions.length,
        duration_minutes,
        JSON.stringify(selected_topics || []),
        job_description || null,
      ]
    );

    const interviewId = interviewResult.insertId;

    // Save generated questions to database
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await pool.query(
        `INSERT INTO questions 
         (interview_id, question_number, question_text, topic, difficulty, expected_concepts)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          interviewId,
          i + 1,
          q.question,
          q.topic || 'General',
          q.difficulty || difficulty,
          JSON.stringify(q.expectedConcepts || []),
        ]
      );
    }

    // Retrieve saved interview and questions
    const [savedQuestions] = await pool.query(
      `SELECT id, question_number, question_text, topic, difficulty, expected_concepts 
       FROM questions WHERE interview_id = ? ORDER BY question_number ASC`,
      [interviewId]
    );

    const formattedQuestions = savedQuestions.map((q) => ({
      ...q,
      expected_concepts: typeof q.expected_concepts === 'string' 
        ? JSON.parse(q.expected_concepts || '[]') 
        : q.expected_concepts || [],
    }));

    return res.status(201).json({
      success: true,
      message: 'Interview created successfully.',
      data: {
        interview: {
          id: interviewId,
          category,
          difficulty,
          total_questions: questions.length,
          duration_minutes,
          status: 'in_progress',
          created_at: new Date().toISOString(),
        },
        questions: formattedQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List all interviews for current user
 */
export const getInterviews = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [interviews] = await pool.query(
      `SELECT id, category, difficulty, total_questions, duration_minutes, 
              status, overall_score, correct_count, partially_correct_count, 
              incorrect_count, created_at, completed_at
       FROM interviews
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: { interviews },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single interview session by ID
 */
export const getInterviewById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const interviewId = req.params.id;

    const [interviews] = await pool.query(
      `SELECT * FROM interviews WHERE id = ? AND user_id = ?`,
      [interviewId, userId]
    );

    if (interviews.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Interview not found or unauthorized access.', statusCode: 404 },
      });
    }

    const interview = interviews[0];
    interview.selected_topics = typeof interview.selected_topics === 'string'
      ? JSON.parse(interview.selected_topics || '[]')
      : interview.selected_topics || [];
    interview.report_summary = typeof interview.report_summary === 'string'
      ? JSON.parse(interview.report_summary || 'null')
      : interview.report_summary;

    // Fetch questions and answers
    const [questions] = await pool.query(
      `SELECT q.id, q.question_number, q.question_text, q.topic, q.difficulty, q.expected_concepts,
              a.id as answer_id, a.answer_text, a.submitted_at,
              e.score as eval_score, e.verdict
       FROM questions q
       LEFT JOIN answers a ON q.id = a.question_id AND a.interview_id = q.interview_id
       LEFT JOIN evaluations e ON a.id = e.answer_id
       WHERE q.interview_id = ?
       ORDER BY q.question_number ASC`,
      [interviewId]
    );

    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      question_number: q.question_number,
      question_text: q.question_text,
      topic: q.topic,
      difficulty: q.difficulty,
      expected_concepts: typeof q.expected_concepts === 'string'
        ? JSON.parse(q.expected_concepts || '[]')
        : q.expected_concepts || [],
      answer: q.answer_id ? {
        id: q.answer_id,
        answer_text: q.answer_text,
        submitted_at: q.submitted_at,
        score: q.eval_score,
        verdict: q.verdict,
      } : null,
    }));

    return res.status(200).json({
      success: true,
      data: {
        interview,
        questions: formattedQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit or update text answer for a question
 */
export const submitAnswer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const interviewId = req.params.id;
    const { question_id, answer_text } = req.body;

    // Verify interview belongs to user and is in progress
    const [interviews] = await pool.query(
      'SELECT id, status FROM interviews WHERE id = ? AND user_id = ?',
      [interviewId, userId]
    );

    if (interviews.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Interview not found or unauthorized access.', statusCode: 404 },
      });
    }

    if (interviews[0].status === 'completed') {
      return res.status(400).json({
        success: false,
        error: { message: 'This interview has already been completed.', statusCode: 400 },
      });
    }

    // Upsert answer
    await pool.query(
      `INSERT INTO answers (interview_id, question_id, user_id, answer_text)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE answer_text = VALUES(answer_text), updated_at = CURRENT_TIMESTAMP`,
      [interviewId, question_id, userId, answer_text]
    );

    const [savedAnswer] = await pool.query(
      'SELECT id, question_id, answer_text, submitted_at, updated_at FROM answers WHERE interview_id = ? AND question_id = ?',
      [interviewId, question_id]
    );

    return res.status(200).json({
      success: true,
      message: 'Answer saved successfully.',
      data: {
        answer: savedAnswer[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete interview session and trigger AI evaluations
 */
export const completeInterview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const interviewId = req.params.id;

    // Verify interview
    const [interviews] = await pool.query(
      'SELECT * FROM interviews WHERE id = ? AND user_id = ?',
      [interviewId, userId]
    );

    if (interviews.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Interview not found or unauthorized access.', statusCode: 404 },
      });
    }

    const interview = interviews[0];

    // Fetch all questions and submitted answers
    const [questions] = await pool.query(
      `SELECT q.id as question_id, q.question_number, q.question_text, q.topic, q.difficulty, q.expected_concepts,
              a.id as answer_id, a.answer_text
       FROM questions q
       LEFT JOIN answers a ON q.id = a.question_id AND a.interview_id = q.interview_id
       WHERE q.interview_id = ?
       ORDER BY q.question_number ASC`,
      [interviewId]
    );

    let totalScoreSum = 0;
    let correctCount = 0;
    let partiallyCorrectCount = 0;
    let incorrectCount = 0;
    const topicScores = {};

    // Evaluate each question
    for (const q of questions) {
      let answerId = q.answer_id;

      // If no answer record exists yet, create an empty one
      if (!answerId) {
        const [insertedAns] = await pool.query(
          `INSERT INTO answers (interview_id, question_id, user_id, answer_text)
           VALUES (?, ?, ?, '')`,
          [interviewId, q.question_id, userId]
        );
        answerId = insertedAns.insertId;
      }

      // Check if evaluation already exists
      const [existingEval] = await pool.query(
        'SELECT id, score, verdict FROM evaluations WHERE answer_id = ?',
        [answerId]
      );

      let evaluationResult;

      if (existingEval.length > 0) {
        evaluationResult = existingEval[0];
      } else {
        const expected = typeof q.expected_concepts === 'string'
          ? JSON.parse(q.expected_concepts || '[]')
          : q.expected_concepts || [];

        const evalData = await evaluateCandidateAnswer({
          questionText: q.question_text,
          topic: q.topic,
          difficulty: q.difficulty,
          expectedConcepts: expected,
          answerText: q.answer_text || '',
          category: interview.category,
        });

        await pool.query(
          `INSERT INTO evaluations 
           (answer_id, interview_id, score, technical_accuracy, conceptual_understanding, relevance, completeness, clarity, verdict, what_went_well, what_was_missing, improvement_areas, ideal_answer, study_concepts)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            answerId,
            interviewId,
            evalData.score,
            evalData.technicalAccuracy,
            evalData.conceptualUnderstanding,
            evalData.relevance,
            evalData.completeness,
            evalData.clarity,
            evalData.verdict,
            evalData.whatWentWell,
            evalData.whatWasMissing,
            evalData.improvementAreas,
            evalData.idealAnswer,
            JSON.stringify(evalData.studyConcepts || []),
          ]
        );

        evaluationResult = evalData;
      }

      const scoreNum = Number(evaluationResult.score) || 0;
      totalScoreSum += scoreNum;

      if (evaluationResult.verdict === 'correct') correctCount++;
      else if (evaluationResult.verdict === 'partially_correct') partiallyCorrectCount++;
      else incorrectCount++;

      // Track by topic
      if (!topicScores[q.topic]) {
        topicScores[q.topic] = { total: 0, count: 0 };
      }
      topicScores[q.topic].total += scoreNum;
      topicScores[q.topic].count += 1;
    }

    const totalQuestions = questions.length || 1;
    const overallScore = Number((totalScoreSum / totalQuestions).toFixed(2));

    // Identify strengths and weaknesses
    const strongAreas = [];
    const weakAreas = [];
    for (const [topic, data] of Object.entries(topicScores)) {
      const avg = data.total / data.count;
      if (avg >= 7.0) strongAreas.push(topic);
      else weakAreas.push(topic);
    }

    const reportSummary = {
      strongAreas: strongAreas.length > 0 ? strongAreas : ['Foundational understanding'],
      weakAreas: weakAreas.length > 0 ? weakAreas : ['Continue practicing advanced scenarios'],
      recommendations: overallScore >= 7.5
        ? 'Excellent preparation! Continue fine-tuning your communication conciseness.'
        : 'Good effort. Focus on practicing detailed step-by-step explanations and relevant code/mathematical proofs.',
    };

    // Update interview record
    await pool.query(
      `UPDATE interviews 
       SET status = 'completed',
           overall_score = ?,
           correct_count = ?,
           partially_correct_count = ?,
           incorrect_count = ?,
           report_summary = ?,
           completed_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        overallScore,
        correctCount,
        partiallyCorrectCount,
        incorrectCount,
        JSON.stringify(reportSummary),
        interviewId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Interview completed and evaluated successfully.',
      data: {
        interviewId,
        overallScore,
        correctCount,
        partiallyCorrectCount,
        incorrectCount,
        reportSummary,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed final interview report
 */
export const getInterviewReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const interviewId = req.params.id;

    const [interviews] = await pool.query(
      'SELECT * FROM interviews WHERE id = ? AND user_id = ?',
      [interviewId, userId]
    );

    if (interviews.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Interview not found or unauthorized access.', statusCode: 404 },
      });
    }

    const interview = interviews[0];
    interview.selected_topics = typeof interview.selected_topics === 'string'
      ? JSON.parse(interview.selected_topics || '[]')
      : interview.selected_topics || [];
    interview.report_summary = typeof interview.report_summary === 'string'
      ? JSON.parse(interview.report_summary || '{}')
      : interview.report_summary || {};

    // Get questions with evaluations
    const [evaluations] = await pool.query(
      `SELECT q.id as question_id, q.question_number, q.question_text, q.topic, q.difficulty, q.expected_concepts,
              a.id as answer_id, a.answer_text, a.submitted_at,
              e.id as evaluation_id, e.score, e.technical_accuracy, e.conceptual_understanding,
              e.relevance, e.completeness, e.clarity, e.verdict, e.what_went_well,
              e.what_was_missing, e.improvement_areas, e.ideal_answer, e.study_concepts
       FROM questions q
       LEFT JOIN answers a ON q.id = a.question_id AND a.interview_id = q.interview_id
       LEFT JOIN evaluations e ON a.id = e.answer_id
       WHERE q.interview_id = ?
       ORDER BY q.question_number ASC`,
      [interviewId]
    );

    const detailedQuestions = evaluations.map((item) => ({
      questionId: item.question_id,
      questionNumber: item.question_number,
      questionText: item.question_text,
      topic: item.topic,
      difficulty: item.difficulty,
      expectedConcepts: typeof item.expected_concepts === 'string'
        ? JSON.parse(item.expected_concepts || '[]')
        : item.expected_concepts || [],
      userAnswer: item.answer_text || '',
      evaluation: item.evaluation_id ? {
        score: Number(item.score),
        technicalAccuracy: Number(item.technical_accuracy),
        conceptualUnderstanding: Number(item.conceptual_understanding),
        relevance: Number(item.relevance),
        completeness: Number(item.completeness),
        clarity: Number(item.clarity),
        verdict: item.verdict,
        whatWentWell: item.what_went_well,
        whatWasMissing: item.what_was_missing,
        improvementAreas: item.improvement_areas,
        idealAnswer: item.ideal_answer,
        studyConcepts: typeof item.study_concepts === 'string'
          ? JSON.parse(item.study_concepts || '[]')
          : item.study_concepts || [],
      } : null,
    }));

    // Calculate parameter averages for radar / bar chart
    let avgAccuracy = 0, avgUnderstanding = 0, avgRelevance = 0, avgCompleteness = 0, avgClarity = 0;
    let evalCount = 0;

    for (const q of detailedQuestions) {
      if (q.evaluation) {
        avgAccuracy += q.evaluation.technicalAccuracy;
        avgUnderstanding += q.evaluation.conceptualUnderstanding;
        avgRelevance += q.evaluation.relevance;
        avgCompleteness += q.evaluation.completeness;
        avgClarity += q.evaluation.clarity;
        evalCount++;
      }
    }

    const parameterBreakdown = evalCount > 0 ? [
      { parameter: 'Technical Accuracy', score: Number((avgAccuracy / evalCount).toFixed(1)) },
      { parameter: 'Conceptual Understanding', score: Number((avgUnderstanding / evalCount).toFixed(1)) },
      { parameter: 'Relevance', score: Number((avgRelevance / evalCount).toFixed(1)) },
      { parameter: 'Completeness', score: Number((avgCompleteness / evalCount).toFixed(1)) },
      { parameter: 'Clarity', score: Number((avgClarity / evalCount).toFixed(1)) },
    ] : [];

    return res.status(200).json({
      success: true,
      data: {
        interview,
        parameterBreakdown,
        questions: detailedQuestions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete interview record
 */
export const deleteInterview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const interviewId = req.params.id;

    const [result] = await pool.query(
      'DELETE FROM interviews WHERE id = ? AND user_id = ?',
      [interviewId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Interview not found or unauthorized access.', statusCode: 404 },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Interview record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
