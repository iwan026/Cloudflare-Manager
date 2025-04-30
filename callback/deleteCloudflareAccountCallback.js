const { deleteCloudflareAccountHandler, confirmDeleteCloudflareAccount } = require('../handlers/deleteCloudflareAccountHandler');

const deleteCloudflareAccountCallback = (bot) => {
bot.on('callback_query', async (callbackQuery) => {
const { data, message } = callbackQuery;
const chatId = message.chat.id;
const messageId = message.message_id;

if (data.startsWith('delete_account_')) {
const id = data.split('_')[2];
await confirmDeleteCloudflareAccount(bot, chatId, messageId, id);
} else if (data.startsWith('confirm_delete_account_')) {
const id = data.split('_')[3];
await deleteCloudflareAccountHandler(bot, chatId, messageId, id)
} else if (data === 'cancel_delete_account') {
await bot.sendMessage(chatId, '❌ Proses dibatalkan!');
return;
}
});
};

module.exports = deleteCloudflareAccountCallback;