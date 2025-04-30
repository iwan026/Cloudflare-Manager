const { mainMenu } = require('../handlers/mainMenu');
const userState = {};

const deleteRecordCallback = (bot) => {
bot.on('callback_query', async (callbackQuery) => {
const { data, message } = callbackQuery;
const chatId = message.chat.id;
const messageId = message.message_id;

try {
if (data.startsWith('delete_record_')) {
const id = data.split('_')[2];
userState[chatId] = {
step: 1,
id: id,
timeout: setTimeout(() => {
delete userState[chatId];
bot.sendMessage(chatId, '⏳ Proses tambah record dibatalkan (timeout)');
mainMenu(bot, chatId);
}, 5 * 60 * 1000);
};

await bot.sendMessage(chatId, '*Masukkan ID Record yang ingin di hapus:*', { parse_mode: 'Markdown' });
}
} catch (error) {
console.error('Callback error:', error);
await bot.sendMessage(chatId, '❌ Proses gagal. Coba lagi /start')
}
});

bot.on('message', async (msg) => {
if (userState[msg.chat.id] && ! [1, 2].includes(userState[msg.chat.id].step)) {
deleteRecordHandler(bot, msg, userState);
}
});
};

module.exports = deleteRecordCallback;