const config = require('../settings');
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

        const buttons = [
            {
                buttonId: `audio_${id}`,
                buttonText: { displayText: '🎵 Audio Type' },
                type: 1
            },
            {
                buttonId: `doc_${id}`,
                buttonText: { displayText: '📁 Document Type' },
                type: 1
            }
        ];

        let info = `🍄 *𝐒ʜᴀɢᴇᴇ 𝐌ᴅ 𝐒ᴏɴɢ 𝐕ɪꜱɪᴛ* 🍄\n\n` +
            `🎵 *𝐓ɪᴛᴇʟ:* ${title || "Unknown"}\n` +
            `⏳ *𝐓ɪᴍᴇꜱᴛᴀᴍᴘ:* ${timestamp || "Unknown"}\n` +
            `👀 *𝐕ɪᴡᴇꜱ:* ${views || "Unknown"}\n` +
            `🌏 *𝐀ɢᴏ:* ${ago || "Unknown"}\n` +
            `👤 *𝐎ᴡɴᴇʀ:* ${author?.name || "Unknown"}\n` +
            `🖇 *𝐔ʀʟ:* ${url || "Unknown"}\n\n` +
            `${config.FOOTER || "❝𝐓ʜᴇ 𝐏ʀɪᴍɪᴜᴍ 𝐁ᴏᴛ 𝐁ʏ 𝐒ʜᴀɢᴇᴇ▕🔰❞"}`;

        await conn.sendMessage(from, {
            image: { url: image },
            caption: info,
            buttons: buttons,
            headerType: 4
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *An error occurred:* ${error.message || "Error!"}`);
    }
});

// BUTTON LISTENER
conn.ev.on("messages.upsert", async (msgUpdate) => {
    const msg = msgUpdate.messages?.[0];
    if (!msg?.message?.buttonsResponseMessage) return;

    const btnId = msg.message.buttonsResponseMessage.selectedButtonId;
    const from = msg.key.remoteJid;
    const mek = msg;

    if (!btnId.startsWith("audio_") && !btnId.startsWith("doc_")) return;

    const id = btnId.replace(/^(audio_|doc_)/, "");

    try {
        const response = await dy_scrap.ytmp3(`https://youtube.com/watch?v=${id}`);
        let downloadUrl = response?.result?.download?.url;
        if (!downloadUrl) return await conn.sendMessage(from, { text: "❌ Download link not found!" }, { quoted: mek });

        if (btnId.startsWith("audio_")) {
            await conn.sendMessage(from, {
                audio: { url: downloadUrl },
                mimetype: "audio/mpeg"
            }, { quoted: mek });
        } else {
            const data = await dy_scrap.ytsearch(`https://youtube.com/watch?v=${id}`);
            const title = data?.results?.[0]?.title || "yt_audio";
            await conn.sendMessage(from, {
                document: { url: downloadUrl },
                fileName: `${title}.mp3`,
                mimetype: "audio/mpeg",
                caption: title
            }, { quoted: mek });
        }

        await conn.sendMessage(from, { text: '✅ Media Upload Successful ✅' }, { quoted: mek });

    } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { text: `❌ Error: ${err.message || "Something went wrong!"}` }, { quoted: mek });
    }
});
