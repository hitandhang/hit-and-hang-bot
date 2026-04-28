const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const MINI_APP_URL = process.env.MINI_APP_URL;
const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_URL;

export default async function handler(req, res) {
  // Сохранение в таблицу
  if (req.method === 'POST' && req.query.action === 'register') {
    try {
      const data = req.body;
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data)
      });
      const text = await response.text();
      console.log('Sheets response:', text);
      return res.status(200).json({ success: true });
    } catch(err) {
      console.log('Sheets error:', err.message);
      return res.status(200).json({ success: true });
    }
  }

  // Обработка сообщений от Telegram
  if (req.method !== 'POST') return res.status(200).json({ ok: true });

  const { message } = req.body;
  if (!message) return res.status(200).json({ ok: true });

  const chatId = message.chat.id;
  const text = message.text || '';

  if (text === '/start') {
    await sendMessage(chatId,
      `👋 Привет, ${message.from.first_name}!\n\n` +
      `Добро пожаловать в *Hit & Hang Padel Community* 🎾\n\n` +
      `Здесь ты можешь:\n` +
      `• Записаться на турнир\n` +
      `• Посмотреть своё расписание\n` +
      `• Следить за результатами\n\n` +
      `Нажми кнопку ниже 👇`,
      {
        reply_markup: {
          inline_keyboard: [[
            {
              text: '🎾 Открыть турниры',
              web_app: { url: MINI_APP_URL }
            }
          ]]
        }
      }
    );
  }

  return res.status(200).json({ ok: true });
}

async function sendMessage(chatId, text, extra = {}) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      ...extra
    })
  });
}
