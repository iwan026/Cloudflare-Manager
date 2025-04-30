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
const account = await CloudflareAccount.findOne({ where: { id: state.id } });
if (!account) {
await bot.sendMessage(chatId, '❌ Akun Cloudflare tidak ditemukan!');
delete state;
return;
}

const response = await axios.get(`https://api.cloudflare.com/client/v4/zones/${account.zoneId}/dns_records/${text}`, {
headers: {
'Content-Type': 'application/json',
'X-Auth-Email': account.email,
'X-Auth-Key': account.apiKey
}
});

const record = response.data.result;
state.recordId = text;
await bot.sendMessage(chatId, `
📋 *Detail DNS Record:*
\`\`\`
𝗜𝗗: ${record.id}
𝗡𝗮𝗺𝗲: ${record.name}
𝗧𝗶𝗽𝗲: ${record.type}
𝗖𝗼𝗻𝘁𝗲𝗻𝘁: ${record.content}
𝗧𝗧𝗟: ${record.ttl}
𝗣𝗿𝗼𝘅𝗶𝗲𝗱: ${record.proxied ? '✅' : '❌'}
\`\`\`
*Anda yakin ingin menghapus record ini?*
`, {
parse_mode: 'Markdown',
reply_markup: {
inline_keyboard: [
[{ text: '❌ Cancel', callback_data: 'cancel_delete_record' }, { text: '✅ Confirm', callback_data: 'confirm_delete_record' }]
]
}
});
break;
}
} catch (error) {
console.error('Handler error:', error);
await bot.sendMessage(chatId, '❌ Gagal memproses data');
}
};

const processDeleteRecord = async (bot, chatId, state, id) => {
try {
const account = await CloudflareAccount.findOne({ where: { id: state.id } });
if (!account) {
await bot.sendMessage(chatId, '❌ Akun Cloudflare tidak ditemukan!');
delete state;
return;
}

await bot.sendMessage(chatId, '⏳ Menghapus record dari Cloudflare...');

await axios.delete(`https://api.cloudflare.com/client/v4/zones/${account.zoneId}/dns_records/${state.recordId}`, {
headers: {
'Content-Type': 'application/json',
'X-Auth-Email': account.email,
'X-Auth-Key': account.apiKey
}
});

await bot.sendMessage(chatId, '✅ *Record berhasil dihapus!*', {parse_mode:'Markdown'});
} catch (error) {
console.error('Proses hapus record gagal:', error);
await bot.sendMessage(chatId, '❌ *Gagal menghapus record!*', {parse_mode:'Markdown'});
}
};

module.exports = { deleteRecordHandler, processDeleteRecord };