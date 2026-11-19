import dotenv from 'dotenv';
import { generateFallbackQuestions, evaluateAnswerFallback } from '../utils/fallbackBank.js';

dotenv.config();

/**
 * Utility to extract JSON object or array from LLM responses even if wrapped in markdown fences
 */
function cleanAndParseJSON(text) {
  if (!text) throw new Error('Empty AI response');

  // Strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Find first { or [ and last } or ]
  const firstBrace = cleaned.search(/[\{\[]/);
  const lastBrace = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

/**
 * Call Google Gemini API (Free tier)
 */
async function callGemini(prompt, systemInstruction = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  try {
    // Dynamically import @google/genai to prevent startup crash if package varies
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || 'You are an expert technical interviewer and educator.',
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.warn(`[AI Service] Gemini call failed: ${error.message}. Attempting alternative or fallback.`);
    throw error;
  }
}

/**
 * Call Groq API (Free high-speed alternative)
 */
async function callGroq(prompt, systemInstruction = '') {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  try {
    const { default: Groq } = await import('groq-sdk');
    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemInstruction || 'You are an expert technical interviewer and educator. Always respond in valid JSON.' },
        { role: 'user', content: prompt }
      ],
      model,
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.warn(`[AI Service] Groq call failed: ${error.message}.`);
    throw error;
  }
}

/**
 * Execute AI call across available providers with fallback
 */
async function executeWithProviders(prompt, systemInstruction = '') {
  // 1. Try Gemini first if key exists
  if (process.env.GEMINI_API_KEY) {
    try {
      return await callGemini(prompt, systemInstruction);
    } catch (err) {
      console.warn('[AI Service] Gemini failed, trying Groq fallback...');
    }
  }

  // 2. Try Groq if Gemini failed or no key
  if (process.env.GROQ_API_KEY) {
    try {
      return await callGroq(prompt, systemInstruction);
    } catch (err) {
      console.warn('[AI Service] Groq failed, relying on built-in curated engine...');
    }
  }

  throw new Error('No functional AI provider available (offline / missing API keys)');
}

/**
 * Generate interview questions dynamically
 */
export async function generateInterviewQuestions({
  category,
  difficulty = 'medium',
  totalQuestions = 5,
  selectedTopics = [],
  jobDescription = '',
  resumeText = '',
  extractedSkills = [],
}) {
  const prompt = `
Generate ${totalQuestions} realistic, distinct, and high-quality interview questions for a college student or fresher candidate.

Interview Configuration:
- Category: ${category}
- Difficulty: ${difficulty}
- Selected Topics: ${selectedTopics.join(', ') || 'General'}
${jobDescription ? `- Job Description:\n${jobDescription.slice(0, 1500)}` : ''}
${resumeText ? `- Candidate Resume Text:\n${resumeText.slice(0, 1500)}` : ''}
${extractedSkills.length > 0 ? `- Candidate Extracted Skills: ${extractedSkills.join(', ')}` : ''}

CRITICAL RULES:
1. Questions must be appropriate for ${difficulty} level.
2. If Resume is provided, ask specifically about projects, tools, and technical architectures mentioned in the resume. Do NOT fabricate experience not present in the resume.
3. If Job Description is provided, align questions with required responsibilities and technologies.
4. Output MUST be a valid JSON object matching this schema:
{
  "questions": [
    {
      "question": "Question text here?",
      "topic": "Specific Topic",
      "difficulty": "Easy|Medium|Hard",
      "expectedConcepts": ["Key concept 1", "Key concept 2", "Key concept 3"]
    }
  ]
}
`.trim();

  try {
    const rawResult = await executeWithProviders(
      prompt,
      'You are a senior hiring manager and tech interviewer crafting balanced interview questions in strict JSON format.'
    );
    const parsed = cleanAndParseJSON(rawResult);

    if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed.questions.slice(0, totalQuestions);
    }
    throw new Error('Invalid JSON questions array structure');
  } catch (error) {
    console.info(`ℹ️ Using curated fallback question generator: ${error.message}`);
    return generateFallbackQuestions(
      category,
      selectedTopics,
      totalQuestions,
      { extractedSkills },
      jobDescription
    );
  }
}

/**
 * Evaluate submitted candidate answer
 */
export async function evaluateCandidateAnswer({
  questionText,
  topic,
  difficulty = 'medium',
  expectedConcepts = [],
  answerText,
  category,
}) {
  const prompt = `
Evaluate the candidate's interview answer fairly and objectively.

Question Details:
- Category: ${category}
- Topic: ${topic}
- Difficulty: ${difficulty}
- Question: "${questionText}"
- Expected Key Concepts: ${JSON.stringify(expectedConcepts)}

Candidate's Submitted Answer:
"${answerText || '(No answer provided)'}"

EVALUATION CRITERIA:
1. Technical Accuracy (0-10): Are the facts, formulas, or code correct?
2. Conceptual Understanding (0-10): Did the student understand underlying mechanics?
3. Relevance (0-10): Did they answer the actual question asked?
4. Completeness (0-10): Are necessary details, edge cases, or proofs included?
5. Clarity (0-10): Is communication structured and clear?

RULES:
- Do NOT reward unnecessarily long fluff.
- Accept technically equivalent phrasing without penalizing different wording.
- Clearly distinguish partial correctness from incorrect answers.
- For aptitude questions, verify numerical accuracy.

Output MUST be a valid JSON object matching this exact schema:
{
  "score": 8.5,
  "technicalAccuracy": 8.0,
  "conceptualUnderstanding": 9.0,
  "relevance": 9.0,
  "completeness": 8.0,
  "clarity": 8.5,
  "verdict": "correct" | "partially_correct" | "incorrect",
  "whatWentWell": "Detailed sentence on strong points...",
  "whatWasMissing": "Detailed sentence on what was missing or incomplete...",
  "improvementAreas": "Actionable advice for improvement...",
  "idealAnswer": "Comprehensive ideal sample response...",
  "studyConcepts": ["Concept 1", "Concept 2"]
}
`.trim();

  try {
    const rawResult = await executeWithProviders(
      prompt,
      'You are a fair, pedagogical interviewer evaluating answers objectively with constructive feedback in strict JSON format.'
    );
    const parsed = cleanAndParseJSON(rawResult);

    if (typeof parsed.score === 'number') {
      return {
        score: Math.min(10, Math.max(0, Number(parsed.score.toFixed(1)))),
        technicalAccuracy: Number(parsed.technicalAccuracy) || Number(parsed.score),
        conceptualUnderstanding: Number(parsed.conceptualUnderstanding) || Number(parsed.score),
        relevance: Number(parsed.relevance) || Number(parsed.score),
        completeness: Number(parsed.completeness) || Number(parsed.score),
        clarity: Number(parsed.clarity) || Number(parsed.score),
        verdict: ['correct', 'partially_correct', 'incorrect'].includes(parsed.verdict)
          ? parsed.verdict
          : parsed.score >= 7.5 ? 'correct' : parsed.score >= 4.5 ? 'partially_correct' : 'incorrect',
        whatWentWell: parsed.whatWentWell || 'Covered relevant points.',
        whatWasMissing: parsed.whatWasMissing || 'Could add more specific depth.',
        improvementAreas: parsed.improvementAreas || 'Continue practicing structured explanations.',
        idealAnswer: parsed.idealAnswer || 'An ideal answer clearly defines concepts and shows examples.',
        studyConcepts: Array.isArray(parsed.studyConcepts) ? parsed.studyConcepts : [topic],
      };
    }
    throw new Error('Invalid JSON evaluation structure');
  } catch (error) {
    console.info(`ℹ️ Using fallback evaluation engine: ${error.message}`);
    return evaluateAnswerFallback(
      { questionText, topic, difficulty, expectedConcepts },
      answerText
    );
  }
}
