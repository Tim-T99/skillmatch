"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processGeminiQuery = void 0;
const asyncHandler_1 = __importDefault(require("../middlewares/asyncHandler"));
const generative_ai_1 = require("@google/generative-ai");
const db_config_1 = __importDefault(require("../config/db.config"));
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your_gemini_api_key');
exports.processGeminiQuery = (0, asyncHandler_1.default)(async (req, res, next) => {
    const { prompt } = req.body;
    const userId = req.user?.id;
    const roleId = req.user?.role_id;
    if (!prompt || !userId || !roleId) {
        res.status(400).json({ message: 'Missing prompt or user data' });
        return;
    }
    // Define schema context based on role
    const schemaContext = `
    Tables:
    - employer (id, email, role_id, first_name, second_name)
    - seeker (id, email, role_id, first_name, second_name, ed_level, institution, cv, skills)
    - job (id, employer_id, company_id, title, description, status)
    - application (id, job_id, seeker_id, created_at)
    - seeker_skills (seeker_id, skill)
    - company (id, name)
  `;
    // Role-based prompt restrictions
    let rolePrompt = '';
    if (roleId === 1) { // Admin
        rolePrompt = 'You can query all tables for any data.';
    }
    else if (roleId === 2) { // Employer
        rolePrompt = `You can query jobs and applications for employer_id = ${userId}. For matching, compare job descriptions with seeker skills.`;
    }
    else if (roleId === 3) { // Seeker
        rolePrompt = `You can query jobs and your applications for seeker_id = ${userId}. For matching, compare your skills with job descriptions.`;
    }
    else {
        res.status(403).json({ message: 'Invalid role' });
        return;
    }
    // Gemini prompt
    const geminiPrompt = `
    ${schemaContext}
    ${rolePrompt}
    Convert this natural language prompt to a safe SQL query or job/applicant matching logic: "${prompt}"
    - Return only the SQL query or a JSON object with a "match" array of { id, title, score } for jobs or { id, name, score } for seekers.
    - Do not use DELETE, UPDATE, or INSERT.
    - For matching, score based on skill overlap (0-100).
  `;
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(geminiPrompt);
        const responseText = result.response.text();
        // Parse response (Gemini may return SQL or JSON)
        if (responseText.startsWith('SELECT')) {
            const queryResult = await db_config_1.default.query(responseText);
            res.status(200).json(queryResult.rows);
        }
        else {
            const matchData = JSON.parse(responseText);
            res.status(200).json(matchData);
        }
    }
    catch (error) {
        console.error('Gemini query error:', error);
        res.status(500).json({ message: 'Failed to process query' });
    }
});
