const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const { askAI } = require('./ai');
const { markdownToHtml, splitMessage } = require('./format');
const { mainMenu, backMenu, texts } = require('./menu');

const SECTIONS = ['student', 'technologies', 'contacts', 'prompt'];

function createBot(token, options = {}) {
  const bot = new Telegraf(token, options);

  const showMenu = ctx => ctx.reply(texts.welcome, { parse_mode: 'HTML', ...mainMenu });

  const editScreen = async (ctx, text, keyboard) => {
    await ctx.answerCbQuery();
    try {
      await ctx.editMessageText(text, { parse_mode: 'HTML', ...keyboard });
    } catch (err) {
      if (!String(err.description).includes('message is not modified')) {
        await ctx.reply(text, { parse_mode: 'HTML', ...keyboard });
      }
    }
  };

  bot.start(showMenu);
  bot.command('menu', showMenu);

  bot.action(SECTIONS, ctx => editScreen(ctx, texts[ctx.match[0]], backMenu));
  bot.action('back', ctx => editScreen(ctx, texts.welcome, mainMenu));

  bot.hears(/^\//, ctx => ctx.reply('Unknown command. Use /menu to open the menu.'));

  bot.on(message('text'), async ctx => {
    await ctx.sendChatAction('typing');

    let answer;
    try {
      answer = await askAI(ctx.message.text);
    } catch (err) {
      console.error('AI request failed:', err.message);
      return ctx.reply('The AI service is not available right now. Please try again later.', mainMenu);
    }

    const parts = splitMessage(answer);
    for (const [index, part] of parts.entries()) {
      const keyboard = index === parts.length - 1 ? mainMenu : {};
      try {
        await ctx.reply(markdownToHtml(part), { parse_mode: 'HTML', ...keyboard });
      } catch (err) {
        await ctx.reply(part, keyboard);
      }
    }
  });

  bot.on('message', ctx => ctx.reply('I can only process text messages.', mainMenu));

  bot.catch((err, ctx) => {
    console.error(`Error while handling update ${ctx.update.update_id}:`, err);
  });

  return bot;
}

module.exports = { createBot };
