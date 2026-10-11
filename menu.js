const { Markup } = require('telegraf');
const config = require('./config');
const { escapeHtml } = require('./format');

const mainMenu = Markup.inlineKeyboard([
  [Markup.button.callback('Student', 'student')],
  [Markup.button.callback('IT technologies', 'technologies')],
  [Markup.button.callback('Contacts', 'contacts')],
  [Markup.button.callback('Prompt AI', 'prompt')]
]);

const backMenu = Markup.inlineKeyboard([
  [Markup.button.callback('Back', 'back')]
]);

const { STUDENT, TECHNOLOGIES, CONTACTS } = config;

const texts = {
  welcome: '<b>Welcome to the chat bot!</b>\nChoose one of the menu items below.',
  student: [
    '<b>Student</b>',
    `Surname: ${STUDENT.surname}`,
    `Full name: ${STUDENT.fullName}`,
    `Group: ${STUDENT.group}`,
    `Variant: ${STUDENT.variant}`
  ].join('\n'),
  technologies: [
    '<b>IT technologies</b>',
    ...Object.entries(TECHNOLOGIES).map(([area, list]) => `${area}: ${list.join(', ')}`)
  ].join('\n'),
  contacts: [
    '<b>Contacts</b>',
    `Phone: ${escapeHtml(CONTACTS.phone)}`,
    `E-mail: ${escapeHtml(CONTACTS.email)}`,
    `GitHub: ${CONTACTS.github}`
  ].join('\n'),
  prompt: [
    '<b>Prompt AI</b>',
    'Send me any question as a regular message and I will forward it to the AI.',
    `Model: <code>${escapeHtml(config.GEMINI_MODEL)}</code> (Google Gemini API)`
  ].join('\n')
};

module.exports = { mainMenu, backMenu, texts };
