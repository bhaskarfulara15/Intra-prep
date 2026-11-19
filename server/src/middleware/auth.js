import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access denied. No authentication token provided.',
          statusCode: 401,
        },
      });
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_mode';
    const decoded = jwt.verify(token, secret);

    // Verify user still exists in database
    const [rows] = await pool.query(
      'SELECT id, name, email, target_role, college_or_company FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'The user associated with this token no longer exists.',
          statusCode: 401,
        },
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication token has expired. Please log in again.',
          statusCode: 401,
        },
      });
    }

    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid authentication token.',
        statusCode: 403,
      },
    });
  }
};
