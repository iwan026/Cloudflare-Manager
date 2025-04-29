const addRecordHandler = require('../handlers/addRecordHandler');
const { mainMenu } = require('../handlers/mainMenu');
const userState = {};

const addRecordCallback = (bot) => {
bot.on('callback_query', async (callbackQuery) => {
const { data, message } = callbackQuery;
const chatId = message.message_id;

if (data.startsWith('add_record_')) {
const id = data.split('_')[2];
try {
userState[chatId] = {
step: 1,
id: id,
timeout = setTimeout(() => {
delete userState[chatId];
bot.sendMessage(chatId, '⏳ Proses tambah akun Cloudflare dibatalkan (timeout)');
mainMenu(bot, chatId);
}, 5 * 60 * 1000);
};

await bot.sendMessage(chatId, '*Pilih tipe record:*' {
parse_mode: 'Markdown',
reply_markup: {
inline_keyboard: [
[{ text: 'A', callback_data: 'A' } { text: 'CNAME', callback_data: 'CNAME' }]
]
}
});
} catch (error) {
console.error('Callback error:', error);
await bot.sendMessage(chatId, '❌ Gagal memulai proses. Coba lagi /start');
}
}
});

bot.on('message', (msg) => {
if (userState[msg.chat.id]) {
addRecordHandler(bot, msg, userState, id);
}
})
};

module.exports = addRecordCallback;