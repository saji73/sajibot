const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const TOKEN = '7704392957:AAE0-vIrLNMxAk5bS725eSglcSFBCedLWrk';
const BASE_URL = `https://api.telegram.org/bot${TOKEN}`;
const FILE_URL = `https://api.telegram.org/file/bot${TOKEN}`;
const SAVE_PATH = '/home2/kalameir/public_html/wp-content/BOT'; // مسیر دقیق هاست

// هندل دریافت پیام
app.post('/webhook', async (req, res) => {
  const message = req.body.message;
  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;

  if (message.text && message.text.toLowerCase() === '/start') {
    await sendMessage(chatId, 'سلام! لطفا فایل‌تان را ارسال کنید.');
    return res.sendStatus(200);
  }

  if (message.document) {
    const fileId = message.document.file_id;
    const fileName = message.document.file_name;

    try {
      // گرفتن مسیر فایل
      const fileData = await axios.get(`${BASE_URL}/getFile?file_id=${fileId}`);
      const filePath = fileData.data.result.file_path;

      // دانلود فایل
      const fileUrl = `${FILE_URL}/${filePath}`;
      const localPath = path.join(SAVE_PATH, fileName);
      const writer = fs.createWriteStream(localPath);

      const response = await axios({
        url: fileUrl,
        method: 'GET',
        responseType: 'stream'
      });

      response.data.pipe(writer);

      writer.on('finish', async () => {
        const directLink = `https://kala4me.ir/wp-content/BOT/${encodeURIComponent(fileName)}`;
        await sendMessage(chatId, `✅ فایل ذخیره شد:\n${directLink}`);
      });

      writer.on('error', async () => {
        await sendMessage(chatId, '❌ خطا در ذخیره فایل.');
      });

    } catch (err) {
      console.error(err);
      await sendMessage(chatId, '❌ خطا در دریافت فایل.');
    }
  }

  res.sendStatus(200);
});

// تابع ارسال پیام
async function sendMessage(chatId, text) {
  await axios.post(`${BASE_URL}/sendMessage`, {
    chat_id: chatId,
    text,
  });
}

app.get('/', (req, res) => {
  res.send('ربات فعاله 😎');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot is running on port ${PORT}`);
});
