const { User, CloudflareAccount } = require('../database/database');

const mainMenu = async (bot, chatId = null, messageId = null) => {
try {
const message = `
*Selamat datang di Bot Manager Cloudflare!*
Bot ini siap membantumu mengelola akun Cloudflare dengan mudah dan cepat langsung dari Telegram!
`;

const buttons = [
[{ text: 'Add Cloudflare', callback_data: 'add_cloudflare' }]
];

const option = {
parse_mode: 'Markdown',
reply_markup: {
inline_keyboard: buttons,
}
};

if (chatId && messageId) {
await bot.editMessageText(message, {
chat_id: chatId,
message_id: messageId,
...option
});
} else {
await bot.sendMessage(chatId, message, option);
}
} catch (error) {
console.log(`Gagal menampilkan menu utama ke ${chatId}`, error);
}
};

const mainMenuCommand = (bot) => {
bot.onText(/\/menu/, async (msg) => {
const chatId = msg.chat.id;
try {
await mainMenu(bot, chatId);
} catch (error) {
console.log(`Gagal mengirim menu utama ke ${chatId}`, error);
}
});
};

module.exports = { mainMenu, mainMenuCommand };