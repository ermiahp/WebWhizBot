const TelegramBot = require('node-telegram-bot-api');

// replace YOUR_TELEGRAM_BOT_TOKEN with your bot's token
const bot = new TelegramBot('YOUR_TELEGRAM_BOT_TOKEN', {polling: true});

bot.onText(/\/option1/, (msg) => {
  option1(msg.chat.id);
});

bot.onText(/\/option2/, (msg) => {
  option2(msg.chat.id);
});

bot.onText(/\/option3/, (msg) => {
  option3(msg.chat.id);
});

function option1(chatId) {
  bot.sendMessage(chatId, 'Option 1 selected');
  // Your code for option 1
}

function option2(chatId) {
  bot.sendMessage(chatId, 'Option 2 selected');
  // Your code for option 2
}

function option3(chatId) {
  bot.sendMessage(chatId, 'Option 3 selected');
  // Your code for option 3
}
