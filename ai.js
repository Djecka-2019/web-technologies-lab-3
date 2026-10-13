const config = require('./config');

const SYSTEM_PROMPT = 'You are an assistant inside a Telegram bot. '
  + 'Answer clearly and concisely in the language of the question. '
  + 'Do not use tables.';

const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

class AIError extends Error {
  constructor(message, status, retryable) {
    super(message);
    this.status = status;
    this.retryable = retryable;
  }
}

async function requestModel(model, prompt) {
  let response;
  try {
    response = await fetch(`${config.GEMINI_API_URL}/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': config.GEMINI_API_KEY
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      }),
      signal: AbortSignal.timeout(25000)
    });
  } catch (err) {
    throw new AIError(`Request to AI API failed: ${err.message}`, 0, true);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.error?.message || `AI API responded with status ${response.status}`;
    throw new AIError(message, response.status, RETRYABLE_STATUSES.has(response.status));
  }

  const candidate = data.candidates?.[0];
  const answer = (candidate?.content?.parts || [])
    .filter(part => part.text && !part.thought)
    .map(part => part.text)
    .join('')
    .trim();
  if (!answer) {
    const reason = data.promptFeedback?.blockReason || candidate?.finishReason || 'unknown';
    throw new AIError(`AI API returned an empty answer (reason: ${reason})`, response.status, false);
  }
  return answer;
}

async function askAI(prompt) {
  let lastError;
  for (const model of config.GEMINI_MODELS) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        return await requestModel(model, prompt);
      } catch (err) {
        lastError = err;
        console.warn(`Model ${model}, attempt ${attempt}/${MAX_ATTEMPTS}: ${err.message}`);
        if (!err.retryable) {
          if (err.status === 404) break;
          throw err;
        }
        if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
      }
    }
  }
  throw lastError;
}

module.exports = { askAI };
