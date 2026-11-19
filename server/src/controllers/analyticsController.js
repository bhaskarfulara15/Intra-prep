import pool from '../config/db.js';

/**
 * Get aggregated analytics for user dashboard
 */
export const getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Core summary stats
    const [summaryRows] = await pool.query(
      `SELECT 
         COUNT(*) as total_interviews,
         COALESCE(AVG(overall_score), 0) as average_score,
         COALESCE(MAX(overall_score), 0) as best_score,
         COALESCE(SUM(total_questions), 0) as total_questions
       FROM interviews
       WHERE user_id = ? AND status = 'completed'`,
      [userId]
    );

    // 2. Count attempted questions (from answers table)
    const [answerRows] = await pool.query(
      `SELECT COUNT(*) as answered_count 
       FROM answers 
       WHERE user_id = ? AND TRIM(answer_text) != ''`,
      [userId]
    );

    // 3. Category breakdown
    const [categoryRows] = await pool.query(
      `SELECT 
         category,
         COUNT(*) as count,
         COALESCE(AVG(overall_score), 0) as avg_score
       FROM interviews
       WHERE user_id = ? AND status = 'completed'
       GROUP BY category`,
      [userId]
    );

    // 4. Performance trends over time (last 10 completed interviews)
    const [trendRows] = await pool.query(
      `SELECT id, category, overall_score, completed_at
       FROM interviews
       WHERE user_id = ? AND status = 'completed'
       ORDER BY completed_at ASC
       LIMIT 10`,
      [userId]
    );

    // 5. Recent interviews (last 5 of any status)
    const [recentRows] = await pool.query(
      `SELECT id, category, difficulty, total_questions, status, overall_score, created_at, completed_at
       FROM interviews
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 5`,
      [userId]
    );

    // 6. Resume count
    const [resumeRows] = await pool.query(
      `SELECT COUNT(*) as resume_count FROM resumes WHERE user_id = ?`,
      [userId]
    );

    const summary = summaryRows[0] || {};
    const formattedCategories = categoryRows.map((c) => ({
      category: c.category,
      label: formatCategoryLabel(c.category),
      count: Number(c.count),
      avgScore: Number(Number(c.avg_score).toFixed(2)),
    }));

    const scoreTrends = trendRows.map((t, idx) => ({
      index: idx + 1,
      interviewId: t.id,
      score: Number(t.overall_score),
      date: new Date(t.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      category: formatCategoryLabel(t.category),
    }));

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalInterviews: Number(summary.total_interviews) || 0,
          averageScore: Number(Number(summary.average_score).toFixed(2)) || 0,
          bestScore: Number(Number(summary.best_score).toFixed(2)) || 0,
          totalQuestionsAttempted: Number(answerRows[0]?.answered_count) || 0,
          totalResumes: Number(resumeRows[0]?.resume_count) || 0,
        },
        categoryBreakdown: formattedCategories,
        scoreTrends,
        recentInterviews: recentRows,
      },
    });
  } catch (error) {
    next(error);
  }
};

function formatCategoryLabel(cat) {
  switch (cat) {
    case 'quantitative_aptitude': return 'Aptitude';
    case 'technical': return 'Technical';
    case 'hr': return 'HR & Behavioral';
    case 'job_description': return 'Job Description';
    case 'resume_based': return 'Resume-Based';
    default: return cat;
  }
}
