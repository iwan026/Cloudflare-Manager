const manageRecordHandler = require('../handlers/manageRecordHandler');

const manageRecordCallback = (bot) => {
bot.on('callback_query', async (callbackQuery) => {
const { data, message } = callbackQuery;
const chatId = message.chat.id;
const messageId = message.message_id;

try {
// Handle klik tombol akun (account_123)
if (data.startsWith('account_')) {
const accountId = data.split('_')[1];
await manageRecordHandler(bot, chatId, messageId, accountId, 1); // Mulai dari halaman 1
}

// Handle paginasi (list_record_123_2)
else if (data.startsWith('list_record_')) {
const [_, __, accountId, page] = data.split('_');
await manageRecordHandler(bot, chatId, messageId, accountId, parseInt(page));
}

// Handle pencarian (search_records_123)
else if (data.startsWith('search_records_')) {
const accountId = data.split('_')[2];
await bot.sendMessage(
chatId, 
'🔍 Masukkan nama record yang ingin dicari (contoh: `example.com`):',
{ parse_mode: 'Markdown' }
);
// Simpan state untuk handler pencarian (bisa dibuat terpisah)
// userState[chatId] = { mode: 'search', accountId };
}

} catch (error) {
console.error('Callback error:', error);
await bot.sendMessage(chatId, '❌ Terjadi kesalahan. Silakan coba lagi.');
mainMenu(bot, chatId, messageId);
}
});
};

module.exports = manageRecordCallback;