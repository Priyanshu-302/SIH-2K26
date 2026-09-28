import { Router } from 'express';
import config from '../config/index.js';
import logger from '../config/logger.js';

const router = Router();

const LANG_NAMES = {
  en: 'English',
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

export function sanitizeMarkdownStructure(text) {
  if (!text || typeof text !== 'string') return text;
  let sanitized = text;
  // Ensure space after markdown headers (e.g. ###Heading -> ### Heading)
  sanitized = sanitized.replace(/^(#{1,6})([^\s#])/gm, '$1 $2');
  // Ensure blank line before markdown headers if preceded by non-blank line
  sanitized = sanitized.replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2');
  // Ensure blank line before markdown tables if preceded by non-table line
  sanitized = sanitized.replace(/([^\n|])\n(\|[^\n]+\|)/g, '$1\n\n$2');
  // Ensure blank line after markdown tables if followed by non-table line
  sanitized = sanitized.replace(/(\|[^\n]+\|)\n([^\n|])/g, '$1\n\n$2');
  // Clean up excessive empty lines
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
  return sanitized.trim();
}

async function translateWithGroq(text, targetLang, langName, groqKey) {
  const models = ['qwen/qwen3.8-27b', 'allam-2-7b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
  for (const model of models) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          max_tokens: 4096,
          messages: [
            {
              role: 'system',
              content: `You are an expert multilingual legal and Ayurvedic patent translator for Ayur-IP.
Translate the input text into ${langName}.
CRITICAL RULES:
1. Preserve 100% of all Markdown formatting (tables, table headers |---|---|, pipes |, headings #, ##, ###, bullet lists *, numbers 1., blockquotes >, citations [Doc 1], [Section 3(p)]).
2. Keep botanical names in Latin/English or alongside standard regional names in parentheses (e.g., Withania somnifera (अश्वगंधा)).
3. Return ONLY the translated markdown text without any introductory phrases, explanations, or quotes.`,
            },
            {
              role: 'user',
              content: text,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content && content !== text) {
          return sanitizeMarkdownStructure(content);
        }
      } else {
        logger.warn(`Groq translate model ${model} HTTP ${response.status}`);
      }
    } catch (err) {
      logger.warn(`Groq translate model ${model} error:`, err?.message || err);
    }
  }
  return null;
}

async function translateWithFallback(text, fromLang, targetLang) {
  try {
    const tagMap = [];
    const protectedText = text.replace(/(\[[^\]]+\]|`[^`]+`|\||---|\*\*|###|##|#)/g, (match) => {
      const idx = tagMap.length;
      tagMap.push(match);
      return `⟦${idx}⟧`;
    });

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(protectedText.slice(0, 1500))}&langpair=${fromLang}|${targetLang}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      let trans = data.responseData?.translatedText;
      if (trans && trans !== protectedText) {
        tagMap.forEach((tag, idx) => {
          trans = trans.replace(new RegExp(`⟦\\s*${idx}\\s*⟧`, 'g'), tag);
        });
        return sanitizeMarkdownStructure(trans);
      }
    }
  } catch (e) {
    logger.warn('Fallback translator error:', e?.message || e);
  }
  return null;
}

router.post('/', async (req, res) => {
  const { text, targetLang, fromLang = 'en' } = req.body;

  if (!text || !targetLang || targetLang === fromLang) {
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
    if (groqKey) {
      const groqResult = await translateWithGroq(cleanText, targetLang, langName, groqKey);
      if (groqResult) {
        translationMemory.set(cacheKey, groqResult);
        return res.json({ translatedText: groqResult });
      }
    }

    const fallbackResult = await translateWithFallback(cleanText, fromLang, targetLang);
    if (fallbackResult) {
      translationMemory.set(cacheKey, fallbackResult);
      return res.json({ translatedText: fallbackResult });
    }

    return res.json({ translatedText: sanitizeMarkdownStructure(text) });
  } catch (err) {
    logger.error('Translate endpoint error:', err);
    return res.json({ translatedText: sanitizeMarkdownStructure(text) });
  }
});

export default router;
