const { User, CloudflareAccount } = require('../database/database');
const globalMessage = require('../utils/globalMessage');

const mainMenu = async (bot, chatId = null, messageId = null) => {
try {
const accounts = await CloudflareAccount.findAll({
where: { userChatId: chatId },
attributes: ['domainName', 'id'],
limit: 4,
order: [['createdAt', 'DESC']]
});

const accountButtons = accounts.map(account => [
{ 
text: `🌐 ${account.domainName}`, 
callback_data: `account_${account.id}` 
}
]);

const addButton = accounts.length < 4 
? [[{ text: '➕ Add Cloudflare', callback_data: 'add_cloudflare' }]] 
: [];

const buttons = [
...accountButtons,
...addButton
];

const finalButtons = buttons.length > 0 
? buttons 
: [[{ text: '➕ Add Cloudflare', callback_data: 'add_cloudflare' }]];

const option = {
parse_mode: 'Markdown',
reply_markup: {
inline_keyboard: finalButtons,
}
};

if (chatId && messageId) {
await bot.editMessageText(globalMessage, {
chat_id: chatId,
message_id: messageId,
...option
});
} else {
await bot.sendMessage(chatId, globalMessage, option);
}
} catch (error) {
console.log(`Gagal menampilkan menu utama ke ${chatId}`, error);
await bot.sendMessage(chatId, 'Terjadi kesalahan saat memuat menu. Silakan coba lagi.');
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