const addCloudflareAccountHandler = require('../handlers/addCloudflareAccountHandler');
const { mainMenu } = require('../handlers/mainMenu');

const userState = {};

const addCloudflareAccountCallback = (bot) => {
bot.on('callback_query', async (callbackQuery) => {
const { data, message } = callbackQuery;
const chatId = message.chat.id;

if (data === 'add_cloudflare') {n
try {
// Init state
userState[chatId] = { 
step: 1,
timeout: setTimeout(() => {
delete userState[chatId];
bot.sendMessage(chatId, '⏳ Proses tambah akun Cloudflare dibatalkan (timeout)');
mainMenu(bot, chatId);
}, 5 * 60 * 1000) // 5 menit timeout
};

// Mulai proses
await bot.sendMessage(
chatId, 
'📩 *Masukkan Email akun Cloudflare:*', 
{ parse_mode: 'Markdown' }
);

} catch (error) {
console.error('Callback error:', error);
await bot.sendMessage(
chatId, 
'❌ Gagal memulai proses. Coba lagi /start'
);
}
}
});

// Teruskan message ke handler
bot.on('message', (msg) => {
if (userState[msg.chat.id]) {
addCloudflareAccountHandler(bot, msg, userState);
}
});
};

module.exports = addCloudflareAccountCallback;