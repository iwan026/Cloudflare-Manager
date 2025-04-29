const { CloudflareAccount } = require('../database/database');
const { mainMenu } = require('../handlers/mainMenu');
const globalMessage = require('../utils/globalMessage');

const manageRecordHandler = async (bot, chatId, messageId, id) => {
try {
const account = CloudflareAccount.findOne({ where: { id } });
if (!account) {
await bot.sendMessage(chatId, '❌ Akun tidak ditemukan!');
return mainMenu(bot, chatId);
}

const options = {
chat_id: chatId,
message_id: messageId,
parse_mode: 'Markdown',
reply_markup: {
inline_keyboard: [
[{ text: 'Add Record', callback_data: `add_record_${account.id}` }, { text: 'List Record', callback_data: `list_record_${account.id}` }],
[{ text: 'Back to main', callback_data: 'back_to_main' }]
]
}
};

await bot.editMessageText(globalMessage, options);
} catch (error) {
await bot.sendMessage(chatId, '❌ Terjadi kesalahan, silahkan coba lagi nanti.');
console.log(`❌ Gagal menampilkan menu record ke ${chatId}`, error);
}
};

module.exports = manageRecordHandler;