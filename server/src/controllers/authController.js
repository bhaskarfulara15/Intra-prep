import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import pool from '../config/db.js';

// Validation Schemas
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').max(100),
    target_role: z.string().max(100).optional(),
    college_or_company: z.string().max(150).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Helper to generate JWT token
const generateToken = (userId, email) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_mode';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ userId, email }, secret, { expiresIn });
};

/**
 * Register a new user
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, target_role, college_or_company } = req.body;

    // Check if email already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'An account with this email address already exists.',
          statusCode: 409,
        },
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, target_role, college_or_company) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email.toLowerCase(), passwordHash, target_role || null, college_or_company || null]
    );

    const userId = result.insertId;
    const token = generateToken(userId, email.toLowerCase());

    const user = {
      id: userId,
      name,
      email: email.toLowerCase(),
      target_role: target_role || null,
      college_or_company: college_or_company || null,
    };

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login existing user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [users] = await pool.query(
      `SELECT id, name, email, password_hash, target_role, college_or_company 
       FROM users WHERE email = ?`,
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password.',
          statusCode: 401,
        },
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password.',
          statusCode: 401,
        },
      });
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    // Remove password hash from response
    delete user.password_hash;

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user details
 */
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};
