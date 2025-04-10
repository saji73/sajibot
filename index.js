const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const https = require("https");
const { Telegraf } = require("telegraf");

const bot = new Telegraf("7704392957:AAE0-vIrLNMxAk5bS725eSglcSFBCedLWrk");
const app = express();
app.use(express.json());

bot.start((ctx) => {
  ctx.reply("سلام! لطفاً فایل خود را بفرستید.");
});

bot.on("document", async (ctx) => {
  const fileId = ctx.message.document.file_id;
  const fileName = ctx.message.document.file_name;
  const chatId = ctx.chat.id;

  try {
    const fileInfo = await ctx.telegram.getFile(fileId);
    const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;

    ctx.reply("✅ در حال آپلود فایل روی سرور...");

    const file = await axios.get(fileUrl, {
      responseType: "stream",
    });

    const form = new FormData();
    form.append("file", file.data, fileName);

    const uploadRes = await axios.post(
      "https://kala4me.ir/wp-content/BOT/upload.php",
      form,
      { headers: form.getHeaders() }
    );

    if (uploadRes.data && uploadRes.data.url) {
      ctx.reply(`✅ فایل آپلود شد: ${uploadRes.data.url}`);
    } else {
      ctx.reply("❌ خطا در آپلود فایل روی هاست.");
    }
  } catch (err) {
    console.error(err);
    ctx.reply("❌ خطا در دریافت یا آپلود فایل.");
  }
});

bot.launch();

app.get("/", (req, res) => {
  res.send("Bot is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bot server running on port ${PORT}`);
});
