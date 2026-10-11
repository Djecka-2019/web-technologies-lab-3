const config = require('./config');

const SYSTEM_PROMPT = 'You are an assistant inside a Telegram bot. '
  + 'Answer clearly and concisely in the language of the question. '
  + 'Do not use tables.';

async function askAI(prompt) {
  const url = `${config.GEMINI_API_URL}/models/${config.GEMINI_MODEL}:generateContent`;
  const response = await fetch(url, {
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
    signal: AbortSignal.timeout(30000)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || `AI API responded with status ${response.status}`);
  }

  const candidate = data.candidates?.[0];
  const answer = (candidate?.content?.parts || [])
    .filter(part => part.text && !part.thought)
    .map(part => part.text)
    .join('')
    .trim();
  if (!answer) {
    const reason = data.promptFeedback?.blockReason || candidate?.finishReason || 'unknown';
    throw new Error(`AI API returned an empty answer (reason: ${reason})`);
  }
  return answer;
}

module.exports = { askAI };
