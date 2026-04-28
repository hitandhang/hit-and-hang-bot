process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const MINI_APP_URL = process.env.MINI_APP_URL;
const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_URL;

export default async function handler(req, res) {
  if (req.method === 'POST' && req.query.action === 'register') {
    try {
      const data = req.body;
      console.log('Register data:', JSON.stringify(data));

      // Сохраняем в таблицу
      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data)
      });

      // Отправляем подтверждение игроку
      if (data.telegram_id || data.telegram_id === 0) {
    const chatId = String(data.telegram_id);
        await sendMessage(data.telegram_id,
          `✅ *Регистрация подтверждена!*\n\n` +
          `👤 *Игрок:* ${data.name}\n` +
          `🎾 *Уровень:* ${data.level}\n` +
          `📍 *Сторона:* ${data.side}\n\n` +
          `🏆 *Турнир:* ${data.tournament}\n` +
          `📆 *Дата:* 2 мая · 16:00–18:00\n` +
          `📍 *Место:* PADEL NOK, ТЦ Рублево\n` +
          `ул. Василия Ботылева, 14А, Москва\n\n` +
          `💰 *Взнос:* 5 500 руб.\n\n` +
          `💳 *Оплата переводом на карту:*\n` +
          `Номер карты и получатель придут отдельным сообщением\n\n` +
          `⚠️ Место бронируется только после подтверждения оплаты!\n\n` +
          `По вопросам: @hitandhang_admin`
        );
      }

      return res.status(200).json({ success: true });
    } catch(err) {
      console.log('Error:', err.message);
      return res.status(200).json({ success: true });
    }
  }

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
