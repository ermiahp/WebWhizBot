import TelegramBot from 'node-telegram-bot-api';
import { getSummary } from './utils.js';

// replace YOUR_TELEGRAM_BOT_TOKEN with your bot's token
const TELEGRAM_BOT_TOKEN = env.process.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const whitelist = [108315414];

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  console.log(msg.chat);
  if (!whitelist.includes(chatId)) {
    bot.sendMessage(chatId, 'You are not authorized to use this bot.');
    return;
  }
  bot.sendMessage(chatId, `Welcome ${msg.chat.username ?? ''} 😊`);
  bot.sendAnimation(chatId, 'https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif');
  bot.sendMessage(chatId, 'Choose an option:', {
    reply_markup: {
      keyboard: [['خلاصه کن!']],
      resize_keyboard: true
    }
  });
});

bot.onText(/خلاصه کن/, (msg) => {
  summaries(msg.chat.id);
});

bot.onText(/\/option2/, (msg) => {
  option2(msg.chat.id);
});

bot.onText(/\/option3/, (msg) => {
  option3(msg.chat.id);
});

function summaries(chatId) {
  bot.sendMessage(chatId, 'Option 1 selected');
  // get url from user
  bot.sendMessage(chatId, 'Enter a URL to summarize:');
  bot.on('message', async (msg) => {
    const url = msg.text;
    bot.sendMessage(chatId, 'Summarizing...');
    const summary = await getSummary(url);
    bot.sendMessage(chatId, 'Summary:');
    bot.sendMessage(chatId, summary);
  });
}

function option2(chatId) {
  bot.sendMessage(chatId, 'Option 2 selected');
  // Your code for option 2
}

function option3(chatId) {
  bot.sendMessage(chatId, 'Option 3 selected');
  // Your code for option 3
}
