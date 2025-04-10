const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = '7704392957:AAE0-vIrLNMxAk5bS725eSglcSFBCedLWrk';
const HOST_UPLOAD_URL = 'https://kala4me.ir/wp-json/telegram/v1/upload'; // آدرس API روی هاست داخلی

app.post('/upload', async (req, res) => {
  try {
    const { file_id, file_name } = req.body;

    // مرحله 1: گرفتن file_path از تلگرام
    const fileInfo = await axios.get(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${file_id}`);
    const filePath = fileInfo.data.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${filePath}`;

    // مرحله 2: دانلود فایل از تلگرام
    const fileResponse = await axios.get(fileUrl, { responseType: 'stream' });

    // مرحله 3: ارسال به هاست داخلی
    const form = new FormData();
    form.append('file', fileResponse.data, file_name);

    const uploadResponse = await axios.post(HOST_UPLOAD_URL, form, {
      headers: form.getHeaders(),
    });

    res.json({ success: true, data: uploadResponse.data });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
