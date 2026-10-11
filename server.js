const config = require('./config');
const { createBot } = require('./bot');

const bot = createBot(config.BOT_TOKEN);

const commands = [
  { command: 'start', description: 'Start the bot' },
  { command: 'menu', description: 'Show the main menu' }
];

function healthCheck(req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Telegram bot is running');
}

async function start() {
  await bot.telegram.setMyCommands(commands);

  if (config.WEBHOOK_DOMAIN) {
    await bot.launch({
      webhook: {
        domain: config.WEBHOOK_DOMAIN,
        port: config.PORT,
        secretToken: config.WEBHOOK_SECRET,
        cb: healthCheck
      }
    });
    console.log(`Bot @${bot.botInfo.username} started in webhook mode on port ${config.PORT}`);
  } else {
    await bot.launch(() => {
      console.log(`Bot @${bot.botInfo.username} started in long polling mode`);
    });
  }
}

start().catch(err => {
  console.error('Failed to start the bot:', err);
  process.exit(1);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
