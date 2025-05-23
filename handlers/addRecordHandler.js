const axios = require('axios');
const { CloudflareAccount } = require('../database/database');

const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

const addRecordHandler = async (bot, msg, userState) => {
const chatId = msg.chat.id;
const text = msg.text;
const state = userState[chatId];

if (!text) return;

try {
switch (state.step) {
case 2:
state.name = text;
state.step = 3;
await bot.sendMessage(chatId, '*Masukkan content/tujuan:*', {
parse_mode: 'Markdown'
});
break;

case 3:
state.content = text;
state.step = 4;
await bot.sendMessage(chatId, '*Pilih mode proxy:*', {
parse_mode: 'Markdown',
reply_markup: {
inline_keyboard: [
[{ text: 'Proxied', callback_data: 'proxy_mode_true' }, 
{ text: 'DNS Only', callback_data: 'proxy_mode_false' }]
]
}
});
break;
}
} catch (error) {
console.error('Handle error:', error);
await bot.sendMessage(chatId, '❌ Gagal memproses data');
}
};

const processAddRecord = async (bot, chatId, state, id) => {
try {
const account = await CloudflareAccount.findOne({ where: { id } });
if (!account) {
await bot.sendMessage(chatId, '❌ Akun Cloudflare tidak ditemukan');
return;
}

const workerHostname = `${state.name}.${account.domainName}`;
// 1. Tambahkan domain ke worker
await bot.sendMessage(chatId, '⏳ Menambahkan domain ke worker...');
const workerResponse = await axios.put(
`https://api.cloudflare.com/client/v4/accounts/${account.accountId}/workers/domains`, 
{
environment: 'production',
hostname: workerHostname,
service: account.workerName,
zone_id: account.zoneId
},
{
headers: createHeaders(account)
}
);

const domainId = workerResponse.data.result?.id;
if (!domainId) throw new Error('Gagal mendapatkan ID domain');

// 2. Tunggu 10 detik
await bot.sendMessage(chatId, '⏳ Menunggu 10 detik...');
await sleep(10);

// 3. Hapus domain dari worker
await bot.sendMessage(chatId, '⏳ Menghapus domain dari worker...');
await axios.delete(
`https://api.cloudflare.com/client/v4/accounts/${account.accountId}/workers/domains/${domainId}`,
{ headers: createHeaders(account) }
);

// 4. Tambahkan DNS record
await bot.sendMessage(chatId, '⏳ Menambahkan DNS record...');
await axios.post(
`https://api.cloudflare.com/client/v4/zones/${account.zoneId}/dns_records`,
createDNSRecord(state),
{ headers: createHeaders(account) }
);

await bot.sendMessage(chatId, createSuccessMessage(state));

} catch (error) {
console.error('Process error:', error);
await handleError(bot, chatId, error);
}
};

// Fungsi pembantu untuk optimasi
const createHeaders = (account) => ({
'Content-Type': 'application/json',
'X-Auth-Email': account.email,
'X-Auth-Key': account.apiKey
});

const createDNSRecord = (state) => ({
type: state.tipe,
name: state.name,
content: state.content,
proxied: state.proxy === 'true',
ttl: 1,
comment: 'Added by Xentrovt Bot'
});

const createSuccessMessage = (state) => (
`✅ Record DNS berhasil ditambahkan!\n\n` +
`• Tipe: ${state.tipe}\n` +
`• Domain: ${state.name}\n` +
`• Content: ${state.content}\n` +
`• Proxy: ${state.proxy === 'true' ? 'Aktif' : 'Nonaktif'}`
);

const handleError = async (bot, chatId, error) => {
const errorMessage = error.response?.data?.errors?.[0]?.message || error.message;
await bot.sendMessage(chatId, `❌ Gagal memproses:\n${errorMessage}`);
};

module.exports = { addRecordHandler, processAddRecord };