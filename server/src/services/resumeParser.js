import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'PHP', 'Ruby', 'Go', 'Rust', 'Kotlin', 'Swift',
  'React', 'React.js', 'Next.js', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'FastAPI',
  'HTML', 'HTML5', 'CSS', 'CSS3', 'Tailwind CSS', 'Bootstrap', 'Sass',
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'Cassandra',
  'Git', 'GitHub', 'Docker', 'Kubernetes', 'Linux', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins',
  'Data Structures', 'Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks', 'OOP', 'System Design',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'NLP', 'Computer Vision',
  'REST API', 'GraphQL', 'Microservices', 'Unit Testing', 'Jest', 'Postman'
];

/**
 * Extract text content from PDF or DOCX file
 */
export async function parseResumeFile(filePath, fileType) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    let rawText = '';

    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      rawText = pdfData.text || '';
    } else if (ext === '.docx') {
      const docxResult = await mammoth.extractRawText({ path: filePath });
      rawText = docxResult.value || '';
    } else {
      throw new Error(`Unsupported resume extension: ${ext}`);
    }

    // Clean up text
    const cleanText = rawText
      .replace(/[\r\n]+/g, '\n')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Extract detected skills
    const extractedSkills = extractSkillsFromText(cleanText);

    return {
      text: cleanText,
      extractedSkills,
    };
  } catch (error) {
    console.error(`Error parsing resume file (${filePath}):`, error);
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
}

/**
 * Search text for known technical skills and keywords
 */
export function extractSkillsFromText(text) {
  if (!text) return [];

  const foundSkills = new Set();
  const lowerText = ` ${text.toLowerCase()} `;

  for (const skill of COMMON_SKILLS) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<=[^a-zA-Z0-9#+])${escaped}(?=[^a-zA-Z0-9#+])`, 'i');
    if (regex.test(lowerText)) {
      foundSkills.add(skill);
    }
  }

  return Array.from(foundSkills);
}
