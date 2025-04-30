const axios = require('axios');
const { CloudflareAccount } = require('../database/database');
const { mainMenu } = require('./mainMenu');

const RECORDS_PER_PAGE = 20;

const manageRecordHandler = async (bot, chatId, messageId, accountId, page = 1) => {
try {
// 1. Ambil data akun
const account = await CloudflareAccount.findOne({ 
where: { id: accountId, userChatId: chatId } 
});

if (!account) {
await bot.sendMessage(chatId, '❌ Akun tidak ditemukan!');
return mainMenu(bot, chatId, messageId);
}

// 2. Fetch DNS records
const response = await axios.get(
`https://api.cloudflare.com/client/v4/zones/${account.zoneId}/dns_records`,
{
headers: {
'X-Auth-Email': account.email,
'X-Auth-Key': account.apiKey,
},
params: {
per_page: RECORDS_PER_PAGE,
page: page
}
}
);

const { result: records, result_info } = response.data;
const { page: currentPage, total_pages: totalPages } = result_info;

// 3. Format pesan dengan blok kode (```)
let message = `📋 *DNS Records untuk ${account.domainName}*\n` +
`Halaman ${currentPage}/${totalPages}\n` +
"```\n";

records.forEach(record => {
message += `𝗜𝗗: ${record.id}\n` +
`𝗡𝗮𝗺𝗲: ${record.name}\n` +
`𝗧𝗶𝗽𝗲: ${record.type}\n` +
`𝗖𝗼𝗻𝘁𝗲𝗻𝘁: ${record.content}\n` +
`𝗧𝗧𝗟: ${record.ttl}\n` +
`𝗣𝗿𝗼𝘅𝗶𝗲𝗱: ${record.proxied ? '✅' : '❌'}\n\n`;
});

message += "```";

// 4. Tombol paginasi (tetap sama)
const paginationButtons = [];
if (currentPage > 1) {
paginationButtons.push({
text: '⬅️ Previous',
callback_data: `list_record_${accountId}_${currentPage - 1}`
});
}
if (currentPage < totalPages) {
paginationButtons.push({
text: 'Next ➡️',
callback_data: `list_record_${accountId}_${currentPage + 1}`
});
}

// 5. Susun tombol
const buttons = [
...(paginationButtons.length ? [paginationButtons] : []),
[{ text: '➕ Add Record', callback_data: `add_record_${accountId}` }, { text: '❌ Delete Record', callback_data: `delete_record_${accountId}` }],
[{ text: '🗑️ Delete Account', callback_data: `delete_account_${accountId}`}],
[{ text: '🔙 Kembali', callback_data: 'back_to_main' }]
];

// 6. Kirim pesan
await bot.editMessageText(message, {
chat_id: chatId,
message_id: messageId,
parse_mode: 'Markdown',
reply_markup: { inline_keyboard: buttons }
});

} catch (error) {
console.error('Error:', error.response?.data || error.message);
await bot.sendMessage(
chatId,
`❌ Gagal mengambil records: ${error.response?.data?.errors?.[0]?.message || 'Server error'}`,
{ parse_mode: 'Markdown' }
);
mainMenu(bot, chatId, messageId);
}
};

module.exports = manageRecordHandler;