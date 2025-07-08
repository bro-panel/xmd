


const { isJidGroup } = require('@whiskeysockets/baileys');
const config = require('../settings');

const getContextInfo = (m) => {
    return {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: '120363421350428668@newsletter',
            newsletterName: '𝐒𝙷𝙰𝙶𝙴𝙴 𝐌𝙳',
            serverMessageId: 143,
        },
    };
};

const ppUrls = [
    'https://i.ibb.co/39kWRqJs/320.jpg',
    'https://i.ibb.co/39kWRqJs/320.jpg',
    'https://i.ibb.co/39kWRqJs/320.jpg',
];

const GroupEvents = async (conn, update) => {
    try {
        const isGroup = isJidGroup(update.id);
        if (!isGroup) return;

        const metadata = await conn.groupMetadata(update.id);
        const participants = update.participants;
        const desc = metadata.desc || "No Description";
        const groupMembersCount = metadata.participants.length;

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(update.id, 'image');
        } catch {
            ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)];
        }

        for (const num of participants) {
            const userName = num.split("@")[0];
            const timestamp = new Date().toLocaleString();

            if (update.action === "add" && config.WELCOME === "true") {
                const WelcomeText = `✨ Hey @${userName}!

Welcome to *${metadata.subject}* 🏡  
You’re member #${groupMembersCount} — glad you joined!  

🕒 *Joined at:* ${timestamp}  
📌 *Group Info:*  
${desc}

Make yourself at home and follow the rules to keep the vibe cool!  
🔧 *© 𝐏ᴏᴡᴇʀᴅ 𝐁ʏ 𝐒ʜᴀɢᴇᴇ 𝐌ᴅ ᴠ1*`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: WelcomeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "remove" && config.WELCOME === "true") {
                const GoodbyeText = `😔 @${userName} has left the group.

🕒 *Left at:* ${timestamp}  
👥 *Remaining members:* ${groupMembersCount}  

We wish you all the best!  
👋 *𝐒𝙷𝙰𝙶𝙴𝙴 𝐌𝙳 says goodbye.*`;

                await conn.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: GoodbyeText,
                    mentions: [num],
                    contextInfo: getContextInfo({ sender: num }),
                });

            } else if (update.action === "demote" && config.ADMIN_EVENTS === "true") {
                const demoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `⚠️ *Admin Notice*

@${demoter} has removed @${userName} from admin status 🔻  

🕒 *Time:* ${timestamp}  
📢 *Group:* ${metadata.subject}`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });

            } else if (update.action === "promote" && config.ADMIN_EVENTS === "true") {
                const promoter = update.author.split("@")[0];
                await conn.sendMessage(update.id, {
                    text: `🎉 *Admin Notice*

@${promoter} has promoted @${userName} to admin! 🛡️  

🕒 *Time:* ${timestamp}  
📢 *Group:* ${metadata.subject}  

Give a warm welcome to our new leader!`,
                    mentions: [update.author, num],
                    contextInfo: getContextInfo({ sender: update.author }),
                });
            }
        }
    } catch (err) {
        console.error('Group event error:', err);
    }
};

module.exports = GroupEvents;
