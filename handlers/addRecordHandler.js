const axios = require('axios');
const { User, CloudflareAccount } = require('../database/database');

const addRecordHandler = async (bot, msg, userState, id) => {
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
[{ text: 'Proxied', callback_data: 'true' }, { text: 'DNS Only', callback_data: 'fse' }]
]
}
});
break;

case 4:
state.proxy = text;
await processAddRecord(bot, chatId, state);
clearTimeout(state.timeout);
delete userState[chatId];
break;
}
} catch (error) {
console.error('Handle error:', error);
await bot.sendMessage(chatId, '❌ Gagal memproses data');
}
}

const processAddRecord = (bot, chatId, state, id) => {
try {
const account = await CloudflareAccount.findOne({ where: { id: id } });
if (!account) return;

const workerData = {
'environment': 'production',
'hostname': state.name,
'service': account.workerName,
'zone_id': account.zoneId,
};

const addDomainToWorker = await axios.put(`https://api.cloudflare.com/client/v4/accounts/${account.accountId}/workers/domains`, workerData, {
headers: {
'Content-Type': 'application/json',
'X-Auth-Email': account.email,
'X-Auth-Key': account.apiKey,
}
});

sleep(10);


}
}