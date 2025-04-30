const manageRecordHandler = require('../handlers/manageRecordHandler');

const manageRecordCallback = (bot) => {
bot.on('callback_query', async (callbackQuery) => {
const { data, message } = callbackQuery;
const chatId = message.chat.id;
const messageId = message.message_id;

try {
if (data.startsWith('account_')) {
const accountId = data.split('_')[1];
await manageRecordHandler(bot, chatId, messageId, accountId, 1); 
} else if (data.startsWith('list_record_')) {
const [_, __, accountId, page] = data.split('_');
await manageRecordHandler(bot, chatId, messageId, accountId, parseInt(page));
}
} catch (error) {
console.error('Callback error:', error);
await bot.sendMessage(chatId, '❌ Terjadi kesalahan. Silakan coba lagi.');
mainMenu(bot, chatId, messageId);
}
});
};

module.exports = manageRecordCallback;