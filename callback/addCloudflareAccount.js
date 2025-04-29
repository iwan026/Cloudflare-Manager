const axios = require('axios');
const { User, CloudflareAccount } = require('../database/database');
const { mainMenu } = require('../handlers/mainMenu');

const userState = {};

const addCloudflareAccount = (bot) => {
bot.on('callback_query' , async (callbackQuery) => {
const { data, message } = callbackQuery;
const chatId = message.chat.id;
const messageId = message.message_id;

if (data === 'add_cloudflare') {
try {
userState[chatId] = {
step: 1,
timeout: setTimeout(async() => {
delete userState[chatId];
try {
await bot.sendMessage(chatId, 'Proses tambah akun cloudflare dibatalkan');
await mainMenu(bot, chatId);
} catch (error) {
console.log(`Gagal mengirim pesan timeout ke ${chatId}`, error);
}
}, 5 * 60 * 1000);
};
await bot.sendMessage(chatId, '*Masukkan Email akun Cloudflare anda:*', { parse_mode: 'Markdown' });
}
} catch (error) {
console.log('Callback Query error:', error);
}
});

bot.on('message', async (msg) => {
try {
const chatId = msg.chat.id;
const text = msg.text;

if (!msg.text && !userState[chatId]) return;

const state = userState[chatId];

switch (state.step) {
case 1:
state.email = text;
state.step = 2;
await bot.sendMessage(chatId, '*Masukkan Global Api Key anda:*', { parse_mode: 'Markdown' });
break;

case 2:
state.apiKey = text;
state.step = 3;
await bot.sendMessage(chatId, '*Masukkan Zone ID anda:*', { parse_mode: 'Markdown' });
break;

case 3:
state.zoneId = text;
state.step = 4;
await bot.sendMessage(chatId, '*Masukkan Account ID anda:*', { parse_mode: 'Markdown' });
break;

case 4:
state.accountId = text;

try {
const response = await axios.get(`https://api.cloudflare.com/client/v4/zones${state.zoneId}/`, {
headers: {
'X-Auth-Email': state.email,
'X-Auth-Key': state.apiKey,
'Content-Type': 'application/json',
}
});

if (response.data.result.status === true) {
const domainName = response.data.result.name;
} else {
bot.sendMessage(chatId, '*Gagal menambah akun cloudflare*', {parse_mode:'Markdown'});
delete userState[chatId]
return;
}

const duplicateAccount = await CloudflareAccount.findOne({
where: {
userChatId: chatId,
domainName: domainName,
email: state.email,
zoneId: state.zoneId,
apiKey: state.apiKey,
accountId: state.accountId
}
});

if (duplicateAccount) {
bot.sendMessage(chatId, '*Data akun sudah ada!*', {parse_mode:'Markdown'}):
return;
delete userState[chatId];
} else {
await CloudflareAccount.create({
userChatId: chatId,
domainName: domainName,
email: state.email,
zoneId: state.zoneId,
apiKey: state.apiKey,
accountId: state.accountId,
workerName: workerName,
});
await bot.sendMessage(chatId, '*Akun berhasil ditambahkan!*', {parse_mode:'Markdown'});
}
} catch (error) {
bot.sendMessage(chatId, '*Terjadi kesalahan saat menambah akun*', {parse_mode:'Markdown'});
console.log('Terjadi kesalahan saat menambah akun', error);
}

clearTimeout(state.timeout);
delete userState[chatId];
break;
}
} catch (error) {
console.log('Terjadi kesalahan:', error);
}
});
}

module.exports = addCloudflareAccount;)