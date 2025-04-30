const { deleteRecordHandler, processDeleteRecord } = require('../handlers/deleteRecordHandler');
const { mainMenu } = require('../handlers/mainMenu.js');
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
bot.sendMessage(chatId, '⏳ Proses hapus record dibatalkan (timeout)');
mainMenu(bot, chatId);
}, 5 * 60 * 1000)
};

await bot.sendMessage(chatId, '*Masukkan ID Record yang ingin dihapus:*', {parse_mode:'Markdown'});
} else if (data === 'delete_record_confirm') {
await processDeleteRecord(bot, chatId, state);
clearTimeout(userState[chatId].timeout);
delete userState[chatId];
} else if (data === 'delete_record_cancel') {
clearTimeout(userState[chatId].timeout);
await bot.sendMessage(chatId, '❌ Proses penghapusan dibatalkan');
delete userState[chatId];
return;
}
} catch (error) {
console.log('Callback error:', error);
await bot.sendMessage(chatId, '❌ Terjadi kesalahan, silakan coba lagi nanti');
}
});

bot.on('message', async (msg) => {
if (userState[msg.chat.id] && userState[msg.chat.id].step === 1) {
await deleteRecordHandler(bot, msg, userState);
}
});
};

module.exports = deleteRecordCallback;