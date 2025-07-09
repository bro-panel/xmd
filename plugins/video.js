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
    pattern: "video",
    alias: ["v", "ytmp4"],
    react: "🎬",
    desc: "Download YouTube MP4",
    category: "download",
    use: ".video <Text or YT URL>",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a Query or YouTube URL!");

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
                buttonId: `vid_${id}`,
                buttonText: { displayText: '🎥 Video Type' },
                type: 1
            },
            {
                buttonId: `docvid_${id}`,
                buttonText: { displayText: '📁 Document Type' },
                type: 1
            }
        ];

        let caption = `🎬 *YT Video Info*\n\n` +
            `🎞 *Title:* ${title || "Unknown"}\n` +
            `⏳ *Duration:* ${timestamp || "Unknown"}\n` +
            `👀 *Views:* ${views || "Unknown"}\n` +
            `📅 *Published:* ${ago || "Unknown"}\n` +
            `👤 *Channel:* ${author?.name || "Unknown"}\n` +
            `🔗 *URL:* ${url || "Unknown"}\n\n` +
            `📥 Choose how to download the video below.\n\n` +
            `${config.FOOTER || "〄 Powered by SHAGEE BOT"}`;

        await conn.sendMessage(from, {
            image: { url: image },
            caption: caption,
            buttons: buttons,
            headerType: 4
        }, { quoted: mek });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        await reply(`❌ *Error:* ${error.message || "Something went wrong!"}`);
    }
});

conn.ev.on("messages.upsert", async (msgUpdate) => {
    const msg = msgUpdate.messages?.[0];
    if (!msg?.message?.buttonsResponseMessage) return;

    const btnId = msg.message.buttonsResponseMessage.selectedButtonId;
    const from = msg.key.remoteJid;
    const mek = msg;

    if (!btnId.startsWith("vid_") && !btnId.startsWith("docvid_")) return;

    const id = btnId.replace(/^(vid_|docvid_)/, "");

    try {
        const response = await dy_scrap.ytmp4(`https://youtube.com/watch?v=${id}`);
        let downloadUrl = response?.result?.download?.url;
        if (!downloadUrl) return await conn.sendMessage(from, { text: "❌ Video download link not found!" }, { quoted: mek });

        const data = await dy_scrap.ytsearch(`https://youtube.com/watch?v=${id}`);
        const title = data?.results?.[0]?.title || "yt_video";

        if (btnId.startsWith("vid_")) {
            await conn.sendMessage(from, {
                video: { url: downloadUrl },
                caption: title
            }, { quoted: mek });
        } else {
            await conn.sendMessage(from, {
                document: { url: downloadUrl },
                fileName: `${title}.mp4`,
                mimetype: "video/mp4",
                caption: title
            }, { quoted: mek });
        }

        await conn.sendMessage(from, { text: '✅ Video sent successfully!' }, { quoted: mek });

    } catch (err) {
        console.error(err);
        await conn.sendMessage(from, { text: `❌ Error: ${err.message || "Something went wrong!"}` }, { quoted: mek });
    }
});
