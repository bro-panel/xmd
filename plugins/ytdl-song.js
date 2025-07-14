/* const config = require('../settings');
const { lite } = require('../lite');
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();

function replaceYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

lite({
    pattern: "song",
    alias: ["s","play"],
    react: "🎵",
    desc: "Download Ytmp3",
    category: "download",
    use: ".song <Text or YT URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a Query or Youtube URL!");

        let id = q.startsWith("https://") ? replaceYouTubeID(q) : null;

        if (!id) {
            const searchResults = await dy_scrap.ytsearch(q);
            if (!searchResults?.results?.length) return await reply("❌ No results found!");
            id = searchResults.results[0].videoId;
        }

        const data = await dy_scrap.ytsearch(`https://youtube.com/watch?v=${id}`);
        if (!data?.results?.length) return await reply("❌ Failed to fetch video!");

        const { url, title, image, timestamp, ago, views, author } = data.results[0];

        let info = `🍄 *𝐒ʜᴀɢᴇᴇ 𝐌ᴅ 𝐒ᴏɴɢ 𝐕ɪꜱɪᴛ* 🍄\n\n` +
            `🎵 *𝐓ɪᴛᴇʟ:* ${title || "Unknown"}\n` +
            `⏳ *𝐓ɪᴍᴇꜱᴛᴀᴍᴘ:* ${timestamp || "Unknown"}\n` +
            `👀 *𝐕ɪᴡᴇꜱ:* ${views || "Unknown"}\n` +
            `🌏 *𝐀ɢᴏ:* ${ago || "Unknown"}\n` +
            `👤 *𝐎ᴡɴᴇʀ:* ${author?.name || "Unknown"}\n` +
            `🖇 *𝐔ʀʟ:* ${url || "Unknown"}\n\n` +
            `🔽 *Reply with your choice:*\n` +
            `> 1 *Audio Type* 🎵\n` +
            `> 2 *Document Type* 📁\n\n` +
            `${config.FOOTER || "❝𝐓ʜᴇ 𝐏ʀɪᴍɪᴜᴍ 𝐁ᴏᴛ 𝐁ʏ 𝐒ʜᴀɢᴇᴇ▕🔰❞"}`;

        const sentMsg = await conn.sendMessage(from, { image: { url: image }, caption: info }, { quoted: mek });
        const messageID = sentMsg.key.id;
        await conn.sendMessage(from, { react: { text: '🎶', key: sentMsg.key } });

        // Listen for user reply only once!
        conn.ev.on('messages.upsert', async (messageUpdate) => { 
            try {
                const mekInfo = messageUpdate?.messages[0];
                if (!mekInfo?.message) return;

                const messageType = mekInfo?.message?.conversation || mekInfo?.message?.extendedTextMessage?.text;
                const isReplyToSentMsg = mekInfo?.message?.extendedTextMessage?.contextInfo?.stanzaId === messageID;

                if (!isReplyToSentMsg) return;

                let userReply = messageType.trim();
                let msg;
                let type;
                let response;
                
                if (userReply === "1") {
                    msg = await conn.sendMessage(from, { text: "⏳ Processing..." }, { quoted: mek });
                    response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
                    let downloadUrl = response?.result?.download?.url;
                    if (!downloadUrl) return await reply("❌ Download link not found!");
                    type = { audio: { url: downloadUrl }, mimetype: "audio/mpeg" };
                    
                } else if (userReply === "2") {
                    msg = await conn.sendMessage(from, { text: "⏳ Processing..." }, { quoted: mek });
                    const response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
                    let downloadUrl = response?.result?.download?.url;
                    if (!downloadUrl) return await reply("❌ Download link not found!");
                    type = { document: { url: downloadUrl }, fileName: `${title}.mp3`, mimetype: "audio/mpeg", caption: title };
                    
                } else { 
                    return await reply("❌ Invalid choice! Reply with 1 or 2.");
                }

                await conn.sendMessage(from, type, { quoted: mek });
                await conn.sendMessage(from, { text: '✅ Media Upload Successful ✅', edit: msg.key });

            } catch (error) {
                console.error(error);
                await reply(`❌ *An error occurred while processing:* ${error.message || "Error!"}`);
            }
        });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *An error occurred:* ${error.message || "Error!"}`);
    }
});
                               



//////////////===========

/*const config = require('../settings');
const { cmd, commands } = require('../command');
const axios = require('axios');

cmd({
  pattern: 'fb',
  alias: ['fbdl', 'facebook'],
  desc: 'Download Facebook videos and reels by providing the video URL.',
  category: 'utility',
  use: '.fbdl <facebook_url>',
  filename: __filename,
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    const fbUrl = args.join(" ");
    if (!fbUrl) {
      return reply('*𝐏ℓєαʂє 𝐏ɼ๏νιɖє 𝐀 fb҇ 𝐕ιɖє๏ ๏ɼ ɼєєℓ 𝐔ɼℓ..*');
    }

    // Fetch video download links from the API
    const apiKey = 'e276311658d835109c'; // Replace with your API key if required
    const apiUrl = `https://api.nexoracle.com/downloader/facebook?apikey=${apiKey}&url=${encodeURIComponent(fbUrl)}`;
    const response = await axios.get(apiUrl);

    if (!response.data || !response.data.result || !response.data.result.sd) {
      return reply('*𝐏ℓєαʂє 𝐏ɼ๏νιɖє 𝐀 fb҇ 𝐕ιɖє๏ ๏ɼ ɼєєℓ 𝐔ɼℓ..*');
    }

    const { thumb, title, desc, sd } = response.data.result;

    // Send the video as an attachment
    await conn.sendMessage(from, {
      video: { url: sd }, // Attach the video
      caption: `*❒ 𝐒𝙷𝙰𝙶𝙴𝙴 𝐌𝙳 ❒*\n\n🔖 *Title*: ${title}\n📑 *Description*: ${desc}\n🖇️ *Url*: ${fbUrl}`,
    });
  } catch (error) {
    console.error('Error downloading Facebook video:', error);
    reply('❌ Unable to download the Facebook video. Please try again later.f');
  }
});
*/
*/
    
const { lite } = require('../lite');
const config = require('../settings');
const DY_SCRAP = require('@dark-yasiya/scrap');
const dy_scrap = new DY_SCRAP();

function replaceYouTubeID(url) {
    const regex = /(?:youtube\.com\/(?:.*v=|.*\/)|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

lite({
    pattern: "song",
    alias: ["s", "play"],
    react: "🎵",
    desc: "Download YouTube mp3 with buttons",
    category: "download",
    use: ".song <Text or YT URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a YouTube query or URL!");

        let id = q.startsWith("https://") ? replaceYouTubeID(q) : null;

        if (!id) {
            const searchResults = await dy_scrap.ytsearch(q);
            if (!searchResults?.results?.length) return await reply("❌ No results found!");
            id = searchResults.results[0].videoId;
        }

        const data = await dy_scrap.ytsearch(`https://youtube.com/watch?v=${id}`);
        if (!data?.results?.length) return await reply("❌ Failed to fetch video!");

        const { url, title, image, timestamp, ago, views, author } = data.results[0];

        let info = `🎶 *Song Info* 🎶\n\n` +
            `🎵 *Title:* ${title || "Unknown"}\n` +
            `⏳ *Duration:* ${timestamp || "Unknown"}\n` +
            `👀 *Views:* ${views || "Unknown"}\n` +
            `🌍 *Uploaded:* ${ago || "Unknown"}\n` +
            `👤 *Channel:* ${author?.name || "Unknown"}\n` +
            `🔗 *URL:* ${url || "Unknown"}\n\n` +
            `💾 *Choose format:*`;

        const buttons = [
            { buttonId: `audio_${id}`, buttonText: { displayText: "🎵 Audio" }, type: 1 },
            { buttonId: `doc_${id}`, buttonText: { displayText: "📁 Document" }, type: 1 }
        ];

        await conn.sendMessage(from, {
            image: { url: image },
            caption: info,
            buttons,
            footer: config.FOOTER || "𝐒𝙷𝙰𝙶𝙴𝙴 𝐌𝙳",
            headerType: 4
        }, { quoted: mek });

    } catch (err) {
        console.error(err);
        await reply(`❌ Error: ${err.message}`);
    }
});

// Button actions handler
lite({
    on: "callback", // Handle all button press events
    filename: __filename
}, async (conn, m, mek, { body, from }) => {
    try {
        if (!body?.startsWith("audio_") && !body?.startsWith("doc_")) return;
        const id = body.split("_")[1];
        if (!id) return;

        await conn.sendMessage(from, { text: "⏳ Downloading..." }, { quoted: mek });

        const response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
        const downloadUrl = response?.result?.download?.url;
        const title = response?.result?.title || "song.mp3";

        if (!downloadUrl) return await conn.sendMessage(from, { text: "❌ Download link not found!" }, { quoted: mek });

        if (body.startsWith("audio_")) {
            await conn.sendMessage(from, {
                audio: { url: downloadUrl },
                mimetype: "audio/mpeg"
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, {
                document: { url: downloadUrl },
                fileName: `${title}.mp3`,
                mimetype: "audio/mpeg",
                caption: title
            }, { quoted: mek });
        }

        await conn.sendMessage(from, { text: "✅ Done!" }, { quoted: mek });

    } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { text: `❌ Error occurred: ${err.message}` }, { quoted: mek });
    }
});
