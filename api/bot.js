const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const MINI_APP_URL = process.env.MINI_APP_URL;
const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_URL;
const ADMIN_ID = process.env.ADMIN_ID;

export default async function handler(req, res) {

  if (req.method === 'POST' && req.query.action === 'register') {
    try {
      const data = req.body;
      console.log('Register data:', JSON.stringify(data));

      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(data)
      });

      const chatId = String(data.telegram_id);

      if (chatId && chatId !== '' && chatId !== 'undefined') {
        await sendMessage(chatId,
          `✅ Регистрация подтверждена!\n\n` +
          `👤 Игрок: ${data.name}\n` +
          `🎾 Уровень: ${data.level}\n` +
          `📍 Сторона: ${data.side}\n\n` +
          `🏆 Турнир: Padel NOK, Москва\n` +
          `📆 Дата: 2 мая, 16:00-18:00\n` +
          `📍 Место: ТЦ Рублево, ул. Василия Ботылева, 14А\n` +
          `🤝 Формат: Парный американо\n\n` +
          `💰 Взнос: 5 500 руб.\n\n` +
          `💳 Реквизиты для оплаты:\n` +
          `Банк: Сбербанк\n` +
          `Номер: +7 985 147-45-28\n` +
          `Комментарий: Падел турнир 2 мая\n\n` +
          `После оплаты пришлите скриншот чека сюда в бот — мы подтвердим бронь!`
        );

        await sendMessage(ADMIN_ID,
          `🔔 Новая регистрация!\n\n` +
          `👤 ${data.name}\n` +
          `📱 ${data.phone}\n` +
          `🎾 Уровень: ${data.level}\n` +
          `📍 Сторона: ${data.side}\n` +
          `💬 @${data.telegram_username}\n` +
          `🆔 ${data.telegram_id}`
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

  // Пересылаем фото чека администратору
  if (message.photo) {
    const photo = message.photo[message.photo.length - 1];
    const userName = message.from.first_name + (message.from.last_name ? ' ' + message.from.last_name : '');
    const username = message.from.username ? '@' + message.from.username : '';

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/forwardMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        from_chat_id: chatId,
        message_id: message.message_id
      })
    });

    await sendMessage(ADMIN_ID,
      `💳 Чек от: ${userName} ${username}\n` +
      `🆔 ID: ${chatId}`
    );

    await sendMessage(String(chatId),
      `✅ Скриншот получен! Проверяем оплату и подтвердим бронь в течение нескольких минут.`
    );
  }

  if (text === '/start') {
    await sendMessage(String(chatId),
      `👋 Привет, ${message.from.first_name}!\n\n` +
      `Добро пожаловать в Hit & Hang Padel Community 🎾\n\n` +
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
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...extra
    })
  });
  const result = await response.json();
  return result;
}
