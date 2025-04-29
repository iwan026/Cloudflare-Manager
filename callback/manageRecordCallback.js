const manageRecordHandler = require('../handlers/manageRecordHandler');

const manageRecordCallback = (bot) => {
bot.on('callback_query', async (callbackQuery) => {
const { data, message } = callbackQuery;
const chatId = message.chat.id;
const messageId = message.message_id;

if (data.startsWith('account_')) {
const id = data.split('_')[1];
await manageRecordHandler(bot, chatId, messageId, id);
}
});
};

module.exports = manageRecordCallback;