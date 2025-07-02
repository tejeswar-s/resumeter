const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { extractTextFromPDF, extractTextFromDOCX } = require('../services/textExtraction');
const { cleanText } = require('../services/textUtils');
const { scoreResume } = require('../services/scoring');
const Analysis = require('../models/Analysis');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('./auth');
const { Configuration, OpenAIApi } = require('openai');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
let openai = null;
if (OPENAI_API_KEY) {
  openai = new OpenAIApi(new Configuration({ apiKey: OPENAI_API_KEY }));
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Upload resume (PDF/DOCX)
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    let text = '';
    if (file.mimetype === 'application/pdf') {
      text = await extractTextFromPDF(file.path);
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await extractTextFromDOCX(file.path);
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: 'Failed to extract text' });
  }
});

// Upload job description (PDF/DOCX)
router.post('/upload-jd', upload.single('jobDescription'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    let text = '';
    if (file.mimetype === 'application/pdf') {
      text = await extractTextFromPDF(file.path);
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      text = await extractTextFromDOCX(file.path);
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: 'Failed to extract text' });
  }
});

// Paste job description (text)
router.post('/paste-jd', (req, res) => {
  // Placeholder: handle pasted text
  res.json({ text: req.body.text });
});

// Score resume against job description
router.post('/score', requireAuth, async (req, res) => {
  try {
    const { resumeText, jdText } = req.body;
    if (!resumeText || !jdText) {
      return res.status(400).json({ error: 'Missing resume or job description text' });
    }
    const cleanResume = cleanText(resumeText);
    const cleanJD = cleanText(jdText);
    const result = scoreResume(cleanResume, cleanJD);
    // Save analysis to DB
    await Analysis.create({ user: req.user.userId, resumeText, jdText, result });
    res.json(result);
  } catch (err) {
    console.error('Error in /score:', err);
    res.status(500).json({ error: 'Failed to score resume' });
  }
});

// Get user analysis history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const history = await Analysis.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Delete individual analysis
router.delete('/history/:id', requireAuth, async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    
    // Check if the analysis belongs to the current user
    if (analysis.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this analysis' });
    }
    
    await Analysis.findByIdAndDelete(req.params.id);
    res.json({ message: 'Analysis deleted successfully' });
  } catch (err) {
    console.error('Error deleting analysis:', err);
    res.status(500).json({ error: 'Failed to delete analysis' });
  }
});

// Admin dashboard: get all users and all analyses
router.get('/admin/overview', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    const analyses = await Analysis.find().populate('user', 'email');
    res.json({ users, analyses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin data' });
  }
});

// AI Feedback Generator
router.post('/feedback', requireAuth, async (req, res) => {
  const { resumeText, jdText } = req.body;
  if (!resumeText || !jdText) return res.status(400).json({ error: 'Missing resume or job description text' });
  try {
    if (openai) {
      const prompt = `You are an ATS resume expert. Given the following resume and job description, provide at least 3 actionable feedback points to improve the resume for this job.\n\nResume:\n${resumeText}\n\nJob Description:\n${jdText}\n\nFeedback (as bullet points):`;
      const completion = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      });
      let feedback = completion.data.choices[0].message.content.trim();
      // Split into at least 3 points
      let points = feedback.split(/\n|\r|\d+\.|•|\-/).map(s => s.trim()).filter(Boolean);
      if (points.length < 3) {
        points = points.concat([
          'Add more relevant keywords from the job description.',
          'Highlight your experience with required skills.',
          'Tailor your summary to the job description.'
        ].slice(0, 3 - points.length));
      }
      return res.json({ feedback: points.slice(0, 5) });
    } else {
      // Fallback: always return at least 3 feedback points
      const feedbacks = [
        'Add more relevant keywords from the job description.',
        'Highlight your experience with required skills.',
        'Ensure your job titles match the target role.',
        'Quantify your achievements with numbers.',
        'Tailor your summary to the job description.',
        'Showcase leadership and teamwork skills.',
        'Emphasize technical certifications if any.',
        'Use action verbs to describe your experience.',
        'Keep formatting clean and consistent.',
        'Mention relevant projects and outcomes.'
      ];
      // Pick 3 random, unique feedbacks
      let shuffled = feedbacks.sort(() => 0.5 - Math.random());
      return res.json({ feedback: shuffled.slice(0, 3) });
    }
  } catch (err) {
    console.error('Error in /feedback:', err);
    res.status(500).json({ error: 'Failed to generate feedback' });
  }
});

module.exports = router; 