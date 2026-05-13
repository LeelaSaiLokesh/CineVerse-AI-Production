const router = require('express').Router();
const axios  = require('axios');

const TMDB_BASE = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_KEY  = process.env.TMDB_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

/* ── Gemini 1.5 Flash ─────────────────────────────────────────── */
async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.8, maxOutputTokens: 1024, topP: 0.9 },
  };
  const res = await axios.post(url, body, { timeout: 30000 });
  return res.data.candidates[0].content.parts[0].text;
}

/* ── TMDB movie search ────────────────────────────────────────── */
async function searchTMDB(title) {
  try {
    const res = await axios.get(`${TMDB_BASE}/search/movie`, {
      params: { api_key: TMDB_KEY, query: title, include_adult: false },
      timeout: 8000,
    });
    return res.data.results[0] || null;
  } catch {
    return null;
  }
}

/* ── POST /api/ai/chat ───────────────────────────────────────── */
router.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  if (!GEMINI_KEY) {
    return res.status(503).json({
      error: 'AI service not configured. Add GEMINI_API_KEY to backend .env',
    });
  }

  const prompt = `You are CineVerse AI, an expert movie recommendation assistant for global cinema — Telugu, Hindi, Tamil, Malayalam, Kannada, English, Korean, and Japanese films.

User request: "${message}"

Respond EXACTLY in this format — no other text:
REPLY: <2-3 sentence conversational response explaining your picks>
MOVIES: ["Exact Movie Title 1", "Exact Movie Title 2", "Exact Movie Title 3", "Exact Movie Title 4", "Exact Movie Title 5"]

Pick movies that best match the request. Use widely-known accurate titles.`;

  try {
    const raw = await callGemini(prompt);

    // Parse structured response
    const replyMatch  = raw.match(/REPLY:\s*(.+?)(?=MOVIES:|$)/s);
    const moviesMatch = raw.match(/MOVIES:\s*(\[[\s\S]+?\])/);

    const reply = replyMatch ? replyMatch[1].trim() : 'Here are my top picks for you!';

    let titles = [];
    if (moviesMatch) {
      try { titles = JSON.parse(moviesMatch[1]); } catch { /* fall through */ }
    }
    // Fallback: extract quoted strings
    if (!titles.length) {
      const quoted = raw.match(/"([^"]+)"/g);
      titles = quoted ? quoted.slice(0, 5).map(t => t.replace(/"/g, '')) : [];
    }

    // Parallel TMDB lookups
    const results = await Promise.all(titles.slice(0, 5).map(searchTMDB));
    const movies  = results.filter(Boolean);

    res.json({ reply, movies, titles });
  } catch (err) {
    console.error('[AI Chat]', err.message);
    res.status(500).json({ error: 'AI service temporarily unavailable. Please try again.' });
  }
});

module.exports = router;
