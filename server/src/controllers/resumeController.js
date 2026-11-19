import fs from 'fs';
import path from 'path';
import pool from '../config/db.js';
import { parseResumeFile } from '../services/resumeParser.js';

/**
 * Handle resume file upload & extraction
 */
export const uploadResumeHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No resume file uploaded.', statusCode: 400 },
      });
    }

    const userId = req.user.id;
    const { originalname, filename, path: filePath, size, mimetype } = req.file;

    // Parse resume content
    let parsedData = { text: '', extractedSkills: [] };
    try {
      parsedData = await parseResumeFile(filePath, mimetype);
    } catch (parseErr) {
      console.warn('Resume parsing non-fatal warning:', parseErr.message);
      parsedData.text = 'Resume text could not be fully extracted.';
    }

    // Save to database
    const [result] = await pool.query(
      `INSERT INTO resumes (user_id, original_name, file_name, file_path, file_size, file_type, parsed_text, extracted_skills)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        originalname,
        filename,
        filePath,
        size,
        mimetype,
        parsedData.text,
        JSON.stringify(parsedData.extractedSkills),
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully.',
      data: {
        resume: {
          id: result.insertId,
          original_name: originalname,
          file_name: filename,
          file_size: size,
          file_type: mimetype,
          extracted_skills: parsedData.extractedSkills,
          preview_text: parsedData.text.slice(0, 300) + '...',
          created_at: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    // If error occurs, remove the uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    next(error);
  }
};

/**
 * Get all resumes for the current authenticated user
 */
export const getResumes = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT id, original_name, file_name, file_size, file_type, extracted_skills, created_at 
       FROM resumes 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [userId]
    );

    const resumes = rows.map((r) => ({
      ...r,
      extracted_skills: typeof r.extracted_skills === 'string' 
        ? JSON.parse(r.extracted_skills || '[]') 
        : r.extracted_skills || [],
    }));

    return res.status(200).json({
      success: true,
      data: { resumes },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific resume by ID (with full parsed text)
 */
export const getResumeById = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const resumeId = req.params.id;

    const [rows] = await pool.query(
      `SELECT * FROM resumes WHERE id = ? AND user_id = ?`,
      [resumeId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Resume not found or unauthorized access.', statusCode: 404 },
      });
    }

    const resume = rows[0];
    resume.extracted_skills = typeof resume.extracted_skills === 'string'
      ? JSON.parse(resume.extracted_skills || '[]')
      : resume.extracted_skills || [];

    return res.status(200).json({
      success: true,
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a resume by ID
 */
export const deleteResume = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const resumeId = req.params.id;

    const [rows] = await pool.query(
      `SELECT id, file_path FROM resumes WHERE id = ? AND user_id = ?`,
      [resumeId, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Resume not found or unauthorized access.', statusCode: 404 },
      });
    }

    const { file_path } = rows[0];

    // Delete record from DB
    await pool.query('DELETE FROM resumes WHERE id = ? AND user_id = ?', [resumeId, userId]);

    // Delete physical file
    if (file_path && fs.existsSync(file_path)) {
      try {
        fs.unlinkSync(file_path);
      } catch (err) {
        console.warn('Could not remove file from disk:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Resume deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
