const axios = require('axios');
const { User, CloudflareAccount } = require('../database/database');

// Fungsi untuk delay
const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

const addRecordHandler = async (bot, msg, userState) => {
const chatId = msg.chat.id;
const text = msg.text;
const state = userState[chatId];

if (!text) return;

try {
switch (state.step) {
case 1:
state.tipe = text;
state.step = 2;
await bot.sendMessage(chatId, '*Masukkan nama domain / subdomain:*', {parse_mode:'Markdown'});
break;

case 2:
state.name = text;
state.step = 3;
await bot.sendMessage(chatId, '*Masukkan content / tujuan:*', {parse_mode:'Markdown'});
break;

case 3:
state.content = text;
state.step = 4;
await bot.sendMessage(chatId, '*Pilih mode proxy:*', {
parse_mode: 'Markdown',
reply_markup: {
inline_keyboard: [
[{ text: 'Proxied', callback_data: 'true' }, { text: 'DNS Only', callback_data: 'false' }]
]
}
});
break;

case 4:
state.proxy = text;
await processAddRecord(bot, chatId, state, state.id);
clearTimeout(state.timeout);
delete userState[chatId];
break;
}
} catch (error) {
console.error('Handle error:', error);
await bot.sendMessage(chatId, '❌ Gagal memproses data');
}
}

const processAddRecord = async (bot, chatId, state, id) => {
try {
const account = await CloudflareAccount.findOne({ where: { id: id } });
if (!account) {
await bot.sendMessage(chatId, '❌ Akun Cloudflare tidak ditemukan');
return;
}

// Tambahkan domain ke worker
const workerData = {
'environment': 'production',
'hostname': state.name,
'service': account.workerName,
'zone_id': account.zoneId,
};

await bot.sendMessage(chatId, '⏳ Menambahkan domain ke worker...');
const addResponse = await axios.put(
`https://api.cloudflare.com/client/v4/accounts/${account.accountId}/workers/domains`, 
workerData,
{
headers: {
'Content-Type': 'application/json',
'X-Auth-Email': account.email,
'X-Auth-Key': account.apiKey,
}
}
);

const domainId = addResponse.data.result?.id;
if (!domainId) {
throw new Error('Gagal mendapatkan ID domain');
}

// Tunggu 10 detik
await bot.sendMessage(chatId, '⏳ Menunggu 10 detik...');
await sleep(10);

// Ambil list domain worker
await bot.sendMessage(chatId, '⏳ Mengambil list domain worker...');
const listResponse = await axios.get(
`https://api.cloudflare.com/client/v4/accounts/${account.accountId}/workers/domains`,
{
headers: {
'X-Auth-Email': account.email,
'X-Auth-Key': account.apiKey,
}
}
);

// Hapus domain yang baru ditambahkan
await bot.sendMessage(chatId, '⏳ Menghapus domain dari worker...');
await axios.delete(
`https://api.cloudflare.com/client/v4/accounts/${account.accountId}/workers/domains/${domainId}`,
{
headers: {
'X-Auth-Email': account.email,
'X-Auth-Key': account.apiKey,
}
}
);

// Lanjutkan proses add record
await bot.sendMessage(chatId, '✅ Domain berhasil dihapus dari worker. Melanjutkan proses add record...');

const dnsRecord = {
comment: 'Added by Xentrovt Bot',
type: state.tipe,
name: state.name,
content: state.content,
proxied: state.proxy === 'true',
ttl: 1
};

const dnsResponse = await axios.post(
`https://api.cloudflare.com/client/v4/zones/${account.zoneId}/dns_records`,
dnsRecord,
{
headers: {
'Content-Type': 'application/json',
'X-Auth-Email': account.email,
'X-Auth-Key': account.apiKey,
}
}
);

await bot.sendMessage(chatId, `✅ Record DNS berhasil ditambahkan!\n\nDetail:\nTipe: ${state.tipe}\nDomain: ${state.name}\nContent: ${state.content}\nProxy: ${state.proxy === 'true' ? 'Aktif' : 'Nonaktif'}`);

} catch (error) {
console.error('Process error:', error);
await bot.sendMessage(chatId, `❌ Gagal memproses: ${error.response?.data?.errors?.[0]?.message || error.message}`);
}
}

module.exports = addRecordHandler;