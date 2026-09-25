import { Router } from 'express';
import config from '../config/index.js';
import logger from '../config/logger.js';

const router = Router();

const LANG_NAMES = {
  hi: 'Hindi (हिन्दी)',
  bn: 'Bengali (বাংলা)',
  mr: 'Marathi (मराठी)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  gu: 'Gujarati (ગુજરાતી)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
};

const translationMemory = new Map();

router.post('/', async (req, res) => {
  const { text, targetLang, fromLang = 'en' } = req.body;

  if (!text || !targetLang || targetLang === 'en' || targetLang === fromLang) {
    return res.json({ translatedText: text || '' });
  }

  const cleanText = text
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u202F/g, ' ')
    .replace(/\u00A0/g, ' ');

  const cacheKey = `${fromLang}:${targetLang}:${cleanText}`;
  if (translationMemory.has(cacheKey)) {
    return res.json({ translatedText: translationMemory.get(cacheKey) });
  }

  const langName = LANG_NAMES[targetLang] || targetLang;

  try {
    const groqKey = config.GROQ_API_KEY || process.env.GROQ_API_KEY;
    if (!groqKey) {
      return res.json({ translatedText: text });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        temperature: 0.1,
        max_tokens: 8192,
        messages: [
          {
            role: 'system',
            content: `You are an expert multilingual legal and Ayurvedic patent translator for Ayur-IP.
Translate the input into ${langName}.
CRITICAL RULES:
1. Preserve 100% of all Markdown formatting (tables, pipes |, headers #, ##, lists *, numbers 1., blockquotes >, citations [Doc 1], [Section 3(p)]).
2. Keep botanical names in Latin/English or alongside standard regional names in parentheses (e.g., Withania somnifera (অশ্বগন্ধা)).
3. Return ONLY the translated text without introductory phrases, commentary, or quotes.`,
          },
          {
            role: 'user',
            content: cleanText,
          },
        ],
      }),
    });


    if (!response.ok) {
      logger.warn(`Groq translation HTTP ${response.status}`);
      return res.json({ translatedText: text });
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim() || text;

    translationMemory.set(cacheKey, translatedText);
    return res.json({ translatedText });
  } catch (err) {
    logger.error('Translate endpoint error:', err);
    return res.json({ translatedText: text });
  }
});

export default router;
