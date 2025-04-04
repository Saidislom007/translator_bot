const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const userState = {};


const langMenu = {
  reply_markup: {
    keyboard: [
      ['🇺🇿 Uzbek ➡️ 🇬🇧 English'],
      ['🇬🇧 English ➡️ 🇺🇿 Uzbek']
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  }
};

async function translateText(text, sourceLang, targetLang) {
  try {
    const options = {
      method: 'POST',
      url: 'https://translateai.p.rapidapi.com/google/translate/json',
      headers: {
        'x-rapidapi-key': process.env.RAPIDAPI_KEY,
        'x-rapidapi-host': 'translateai.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      data: {
        origin_language: sourceLang,
        target_language: targetLang,
        json_content: {
          product: {
            productDesc: text
          }
        }
      }
    };

    const res = await axios.request(options);
    console.log("✅ Tarjima natijasi:", res.data);

    if (res.data?.translated_json?.product?.productDesc) {
      return res.data.translated_json.product.productDesc;
    } else {
      return "❌ Tarjima topilmadi.";
    }
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    return "❌ Xatolik yuz berdi.";
  }
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userState[chatId] = null;
  bot.sendMessage(chatId, "👋 Salom! Iltimos, tarjima yo‘nalishini tanlang:", langMenu);
});


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;


  if (text.startsWith("/") && text !== "/start") return;


  if (text === '🇺🇿 Uzbek ➡️ 🇬🇧 English') {
    userState[chatId] = { source: 'uz', target: 'en' };
    bot.sendMessage(chatId, "✍️ Endi o‘zbekcha matn kiriting:");
    return;
  } else if (text === '🇬🇧 English ➡️ 🇺🇿 Uzbek') {
    userState[chatId] = { source: 'en', target: 'uz' };
    bot.sendMessage(chatId, "✍️ Endi inglizcha matn kiriting:");
    return;
  }

  const state = userState[chatId];
  if (!state) {
    bot.sendMessage(chatId, "❗️ Iltimos, dastlab til yo‘nalishini tanlang:", langMenu);
    return;
  }

  const translated = await translateText(text, state.source, state.target);
  bot.sendMessage(chatId, `🔄 Tarjima:\n${translated}`);
});

console.log("✅ Bot ishga tushdi!");
