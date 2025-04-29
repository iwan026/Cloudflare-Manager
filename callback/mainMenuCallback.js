const { mainMenu } = require('../handlers/mainMenu');

const mainMenuCallback = (bot) => {
bot.on('callback_query', async (callbackQuery) => {
const { data, message } = callbackQuery;
const chatId = message.chat.id;
const messageId = message.message_id;

if (data === 'back_to_main') {
await mainMenu(bot, chatId, messageId);
}
});
};

module.exports = mainMenuCallback;