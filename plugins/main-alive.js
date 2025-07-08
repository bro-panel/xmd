const { lite } = require('../lite');
const os = require('os');
const { runtime } = require('../lib/functions');
const config = require('../settings');

lite({
    pattern: "alive",
    alias: ["status", "online", "a"],
    desc: "Check if bot is alive and running",
    category: "main",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
    try {
        const heapUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
        const uptime = runtime(process.uptime());

        const caption = `
╭━━〔 🤖 *𝐒𝙷𝙰𝙶𝙴𝙴 𝐌𝙳 𝐒𝚃𝙰𝚃𝚄𝚂* 〕━━⬣
┃  🟢 *𝐇𝙴𝚈 𝐁𝙰𝙱𝚈 𝐈'𝚖 𝐀𝚕𝚒𝚟𝚎!*
┃
┃ ◯✕👑 *Owner:* 𝐃ɪɴᴇᴛʜ 𝐖ɪꜱʜᴍɪᴛʜᴀ
┃ ◯✕ 🔖 *Vᴇʀꜱɪᴏɴ:* 𝐕 1.0.1
┃ ◯✕ 🛠️ *Pʀᴇꜰɪx:* [ ${config.PREFIX} ]
┃ ◯✕ ⚙️ *Mᴏᴅᴇ:* [ ${config.MODE} ]
┃ ◯✕ 💾 *Rᴀᴍ:* ${heapUsed}MB / ${totalMem}MB
┃ ◯✕ 🖥️ *Hᴏꜱᴛ:* ${os.hostname()}
┃ ◯✕ ⏱️ *Uᴘᴛɪᴍᴇ:* ${uptime}
╰━━━━━━━━━━━━━━⬣*

> © 𝐏ᴏᴡᴇʀᴅ 𝐁ʏ 𝐒ʜᴀɢᴇᴇ 𝐌ᴅ ᴠ1
        `.trim();

        await conn.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL },
            caption,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 1000,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363421350428668@newsletter',
                    newsletterName: '❝𝐓ʜᴇ 𝐏ʀɪᴍɪᴜᴍ 𝐁ᴏᴛ 𝐁ʏ 𝐒ʜᴀɢᴇᴇ▕🔰❞',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Alive Error:", e);
        reply(`❌ *Error:* ${e.message}`);
    }
});
