const { deleteRecordHandler, processDeleteRecord } = require('../handlers/deleteRecordHandler');
const { mainMenu } = require('../handlers/mainMenu');
const userState = {};

const deleteRecordCallback = (bot) => {
bot.on('callback_query', async (callbackQuery) => {
const { data, message } = callbackQuery;
const chatId = message.chat.id;
const messageId = message.message_id;

try {
if (data.startsWith('delete_record_')) {
const action = data.split('_')[2];

if (action === 'cancel') {
clearTimeout(userState[chatId]?.timeout);
delete userState[chatId];
await bot.sendMessage(chatId, '❌ Proses penghapusan dibatalkan');
await mainMenu(bot, chatId);
} else if (action === 'confirm' && userState[chatId]) {
await processDeleteRecord(bot, chatId, userState[chatId]);
await mainMenu(bot, chatId);
}
}
} catch (error) {
console.error('Callback error:', error);
await bot.sendMessage(chatId, '❌ Proses gagal. Coba lagi /start');
}
});

bot.on('message', async (msg) => {
if (userState[msg.chat.id] && userState[msg.chat.id].step === 1) {
await deleteRecordHandler(bot, msg, userState);
}
});
};

module.exports = deleteRecordCallback;