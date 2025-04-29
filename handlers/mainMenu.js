const { User, CloudflareAccount } = require('../database/database');

const mainMenu = async (bot, chatId = null, messageId = null) => {
try {
const message = `
*Selamat datang di Bot Manager Cloudflare!*
Bot ini siap membantumu mengelola akun Cloudflare dengan mudah dan cepat langsung dari Telegram!
`;

// Ambil maksimal 4 akun Cloudflare user dari database
const accounts = await CloudflareAccount.findAll({
where: { userChatId: chatId },
attributes: ['domainName', 'id'],
limit: 4,
order: [['createdAt', 'DESC']] // Urutkan dari yang terbaru
});

// Buat tombol untuk setiap akun yang tersimpan
const accountButtons = accounts.map(account => [
{ 
text: `🌐 ${account.domainName}`, 
callback_data: `account_${account.id}` 
}
]);

// Siapkan tombol Add Cloudflare hanya jika belum mencapai 4 akun
const addButton = accounts.length < 4 
? [[{ text: '➕ Add Cloudflare', callback_data: 'add_cloudflare' }]] 
: [];

// Gabungkan semua tombol
const buttons = [
...accountButtons,
...addButton
];

// Jika tidak ada akun sama sekali, tetap tampilkan tombol Add
const finalButtons = buttons.length > 0 
? buttons 
: [[{ text: '➕ Add Cloudflare', callback_data: 'add_cloudflare' }]];

const option = {
parse_mode: 'Markdown',
reply_markup: {
inline_keyboard: finalButtons,
}
};

if (chatId && messageId) {
await bot.editMessageText(message, {
chat_id: chatId,
message_id: messageId,
...option
});
} else {
await bot.sendMessage(chatId, message, option);
}
} catch (error) {
console.log(`Gagal menampilkan menu utama ke ${chatId}`, error);
// Fallback jika error
await bot.sendMessage(chatId, 'Terjadi kesalahan saat memuat menu. Silakan coba lagi.');
}
};

const mainMenuCommand = (bot) => {
bot.onText(/\/menu/, async (msg) => {
const chatId = msg.chat.id;
try {
await mainMenu(bot, chatId);
} catch (error) {
console.log(`Gagal mengirim menu utama ke ${chatId}`, error);
}
});
};

module.exports = { mainMenu, mainMenuCommand };