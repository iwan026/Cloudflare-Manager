const { addRecordHandler, processAddRecord } = require('../handlers/addRecordHandler');
const { mainMenu } = require('../handlers/mainMenu');
const userState = {};

const addRecordCallback = (bot) => {
bot.on('callback_query', async (callbackQuery) => {
const { data, message } = callbackQuery;
const chatId = message.chat.id;
const msgId = message.message_id;

try {
if (data.startsWith('add_record_')) {
// Handle awal memulai proses
const id = data.split('_')[2];
userState[chatId] = {
step: 1,
id: id,
timeout: setTimeout(() => {
delete userState[chatId];
bot.sendMessage(chatId, '⏳ Proses tambah record dibatalkan (timeout)');
mainMenu(bot, chatId);
}, 5 * 60 * 1000)
};

await bot.sendMessage(chatId, '*Pilih tipe record:*', {
parse_mode: 'Markdown',
reply_markup: {
inline_keyboard: [
[{ text: 'A', callback_data: 'record_type_A' }, 
{ text: 'CNAME', callback_data: 'record_type_CNAME' }]
]
}
});
} 
else if (data.startsWith('record_type_')) {
// Handle tipe record
if (!userState[chatId]) return;

const type = data.split('_')[2];
userState[chatId].tipe = type;
userState[chatId].step = 2;

await bot.editMessageText(
`Tipe record dipilih: ${type}`,
{ chat_id: chatId, message_id: msgId }
);

await bot.sendMessage(chatId, '*Masukkan nama domain/subdomain:*', { 
parse_mode: 'Markdown' 
});
}
else if (data.startsWith('proxy_mode_')) {
// Handle pilihan proxy mode
if (!userState[chatId] || userState[chatId].step !== 4) return;

const proxyMode = data.split('_')[2];
userState[chatId].proxy = proxyMode;

await bot.editMessageText(
`Proxy mode dipilih: ${proxyMode === 'true' ? 'Proxied' : 'DNS Only'}`,
{ chat_id: chatId, message_id: msgId }
);

// Lanjutkan proses add record
await addRecordHandler.processAddRecord(bot, chatId, userState[chatId], userState[chatId].id);
clearTimeout(userState[chatId].timeout);
delete userState[chatId];
}
} catch (error) {
console.error('Callback error:', error);
await bot.sendMessage(chatId, '❌ Gagal memproses pilihan. Coba lagi /start');
}
});

bot.on('message', (msg) => {
if (userState[msg.chat.id] && ![1, 4].includes(userState[msg.chat.id].step)) {
addRecordHandler(bot, msg, userState);
}
});
};

module.exports = addRecordCallback;