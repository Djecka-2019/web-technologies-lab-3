try {
  process.loadEnvFile();
} catch (err) {
  if (err.code !== 'ENOENT') throw err;
}

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Environment variable ${name} is not set`);
    process.exit(1);
  }
  return value;
}

module.exports = {
  BOT_TOKEN: required('BOT_TOKEN'),
  GEMINI_API_KEY: required('GEMINI_API_KEY'),
  GEMINI_API_URL: process.env.GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
  GEMINI_MODELS: [
    process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    ...(process.env.GEMINI_FALLBACK_MODELS || 'gemini-3.5-flash-lite')
      .split(',')
      .map(model => model.trim())
      .filter(Boolean)
  ],
  WEBHOOK_DOMAIN: process.env.WEBHOOK_DOMAIN || process.env.RENDER_EXTERNAL_URL || '',
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
  PORT: Number(process.env.PORT) || 3000,
  STUDENT: {
    surname: 'Sviachenyi',
    fullName: 'Sviachenyi Yevhenii Olehovych',
    group: 'IP-33',
    variant: 4
  },
  TECHNOLOGIES: {
    'Front-end': ['HTML', 'CSS', 'JavaScript'],
    'Back-end': ['Java', 'Spring Boot', 'Node.js', 'Express'],
    'Databases': ['PostgreSQL', 'MongoDB'],
    'Tools': ['Docker', 'Git', 'Telegram Bot API']
  },
  CONTACTS: {
    phone: process.env.CONTACT_PHONE || 'not specified',
    email: process.env.CONTACT_EMAIL || 'not specified',
    github: 'https://github.com/Djecka-2019'
  }
};
