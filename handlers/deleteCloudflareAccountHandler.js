const { CloudflareAccount } = require('../database/database');

const confirmDeleteCloudflareAccount = async (bot, chatId, messageId, id) => {
try {
const account = CloudflareAccount.findOne({ where: { id: id } });
if (!account) {
await bot.sendMessage(chatId, '❌ *Akun Cloudflare tidak ditemukan!*', {parse_mode:'Markdown'});
return;
}

await bot.editMessageText(`
📋 *Detail Akun Cloudflare:*
\`\`\`
Domain : ${account.domainName}
Email : ${account.email}
Account ID : ${account.accountId}
Zone ID : ${account.zoneId}
Global Api Key : ${account.apiKey}
\'\'\'
*Apakah anda yakin ingin menghapus akun ini?*
`, {
chat_id: chatId,
message_id: messageId,
parse_mode: 'Markdown',
reply_markup: {
inline_keyboard: [
[{ text: '❌ Cancel', callback_data: 'cancel_delete_account' }, { text: '✅ Confirm', callback_data: `confirm_delete_account_${id}` }]
]
}
});
} catch (error) {
console.error('Handler error:', error);
bot.sendMessage(chatId, '❌ Terjadi kesalahan');
}
};

const deleteCloudflareAccountHandler = async (bot, chatId, messageId, id) => {
try {
const account = await CloudflareAccount.findOne({ where: { id: id } });
if (!account) {
await bot.sendMessage(chatId, '*Akun Cloudflare tidak ditemukan!*', {parse_mode:'Markdown'});
return;
}

await CloudflareAccount.destroy({ where: { id: id } });
await bot.sendMessage(chatId, '✅ *Akun Cloudflare berhasil dihapus!*', {parse_mode:'Markdown'});
} catch (error) {
console.error('Handler error:', error);
bot.sendMessage(chatId, '❌ Terjadi kesalahan');
}
};

module.exports = { deleteCloudflareAccountHandler, confirmDeleteCloudflareAccount };