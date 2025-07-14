
const { addCommand } = require('../lib/commands'); // Adjust if needed
const axios = require('axios');

addCommand(
  {
    pattern: 'fb',
    fromMe: false,
    desc: 'Download Facebook video using Supun-MD API',
    type: 'downloader',
  },
  async (message, match) => {
    const url = match || message.reply_message?.text;

    if (!url || !url.includes('facebook.com')) {
      return await message.send('📎 කරුණාකර වලංගු Facebook video link එකක් යවන්න.');
    }

    await message.send('📥 Facebook video එක download කිරීමට උත්සාහ වෙමින්...');

    try {
      const api = `https://supun-md-api-xmjh.vercel.app/api/fb-dl?url=${encodeURIComponent(url)}`;
      const res = await axios.get(api);
      const result = res.data;

      if (!result?.sd && !result?.hd) {
        return await message.send('😕 Video එක ලබාගැනීමට බැරි වුණා.');
      }

      const videoUrl = result.hd || result.sd;
      const quality = result.hd ? "HD" : "SD";
      const caption = `🎬 Facebook Video (${quality})\n📥 Downloaded by shagee`;

      await message.sendFromUrl(videoUrl, {
        caption,
        mimetype: 'video/mp4',
      });

    } catch (err) {
      console.error(err);
      return await message.send('❌ දෝෂයක් ඇතිවුණා. නැවත උත්සාහ කරන්න.');
    }
  }
);
