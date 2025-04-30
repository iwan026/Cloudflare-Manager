const axios = require('axios');
const { CloudflareAccount } = require('../database/database');

const deleteRecordHandler = async (bot, msg, userState) => {
const chatId = msg.chat.id;
const text = msg.text;
const state = userState[chatId];

if (!text) return;

try {
switch (state.step) {
case 1:
// Ambil akun Cloudflare dari database
const account = await CloudflareAccount.findOne({ where: { id: state.id } });
if (!account) {
await bot.sendMessage(chatId, '❌ Akun Cloudflare tidak ditemukan');
delete userState[chatId];
return;
}

// Cek detail record dari Cloudflare
const response = await axios.get(
`https://api.cloudflare.com/client/v4/zones/${account.zoneId}/dns_records/${text}`,
{
headers: {
'Content-Type': 'application/json',
'X-Auth-Email': account.email,
'X-Auth-Key': account.apiKey
}
}
);

const record = response.data.result;
state.recordId = text;
state.zoneId = account.zoneId;
state.account = account;
state.step = 2;

await bot.sendMessage(chatId, `
📋 Detail DNS Record:

𝗜𝗗: ${record.id}
𝗡𝗮𝗺𝗲: ${record.name}
𝗧𝗶𝗽𝗲: ${record.type}
𝗖𝗼𝗻𝘁𝗲𝗻𝘁: ${record.content}
𝗧𝗧𝗟: ${record.ttl}
𝗣𝗿𝗼𝘅𝗶𝗲𝗱: ${record.proxied ? '✅' : '❌'}

Anda yakin ingin menghapus record ini?`, {
parse_mode: 'Markdown',
reply_markup: {
inline_keyboard: [
[
{ text: '❌ Batal', callback_data: 'delete_record_cancel' }, 
{ text: '✅ Hapus', callback_data: 'delete_record_confirm' }
]
]
}
});
break;
}
} catch (error) {
console.error('Error dalam deleteRecordHandler:', error);

if (error.response?.status === 404) {
await bot.sendMessage(chatId, '❌ Record tidak ditemukan. Pastikan ID record benar.');
} else {
const errorMessage = error.response?.data?.errors?.[0]?.message || error.message;
await bot.sendMessage(chatId, `❌ Gagal memproses:\n${errorMessage}`);
}

delete userState[chatId];
}
};

const processDeleteRecord = async (bot, chatId, state) => {
try {
await bot.sendMessage(chatId, '⏳ Menghapus record dari Cloudflare...');

await axios.delete(
`https://api.cloudflare.com/client/v4/zones/${state.zoneId}/dns_records/${state.recordId}`,
{
headers: {
'Content-Type': 'application/json',
'X-Auth-Email': state.account.email,
'X-Auth-Key': state.account.apiKey
}
}
);

await bot.sendMessage(chatId, '✅ Record berhasil dihapus!');

} catch (error) {
console.error('Error dalam processDeleteRecord:', error);
const errorMessage = error.response?.data?.errors?.[0]?.message || error.message;
await bot.sendMessage(chatId, `❌ Gagal menghapus record:\n${errorMessage}`);
} finally {
delete userState[chatId];
}
};

module.exports = { deleteRecordHandler, processDeleteRecord };