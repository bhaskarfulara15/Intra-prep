import { z } from 'zod';
import pool from '../config/db.js';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    target_role: z.string().max(100).optional(),
    college_or_company: z.string().max(150).optional(),
  }),
});

/**
 * Get profile details including user interview stats
 */
export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      `SELECT id, name, email, target_role, college_or_company, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', statusCode: 404 },
      });
    }

    // Aggregate user metrics
    const [stats] = await pool.query(
      `SELECT 
         COUNT(*) as total_interviews,
         COALESCE(AVG(overall_score), 0) as average_score,
         COALESCE(MAX(overall_score), 0) as best_score,
         COALESCE(SUM(total_questions), 0) as total_questions_attempted
       FROM interviews 
       WHERE user_id = ? AND status = 'completed'`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: {
        profile: users[0],
        statistics: {
          totalInterviews: Number(stats[0].total_interviews) || 0,
          averageScore: Number(Number(stats[0].average_score).toFixed(2)) || 0,
          bestScore: Number(Number(stats[0].best_score).toFixed(2)) || 0,
          totalQuestionsAttempted: Number(stats[0].total_questions_attempted) || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile details
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, target_role, college_or_company } = req.body;

    await pool.query(
      `UPDATE users 
       SET name = COALESCE(?, name),
           target_role = COALESCE(?, target_role),
           college_or_company = COALESCE(?, college_or_company)
       WHERE id = ?`,
      [name, target_role, college_or_company, userId]
    );

    const [updated] = await pool.query(
      `SELECT id, name, email, target_role, college_or_company, created_at 
       FROM users WHERE id = ?`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: updated[0],
      },
    });
  } catch (error) {
    next(error);
  }
};
