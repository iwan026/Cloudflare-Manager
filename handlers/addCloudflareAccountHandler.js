const axios = require('axios');
const { User, CloudflareAccount } = require('../database/database');
const workerContent = require('../utils/workerContent');

// Generate random worker name
const generateRandomWorkerName = () => {
const randomNum = Math.floor(1000 + Math.random() * 9000);
return `xentrovt-${randomNum}`;
};

// Handler utama
const addCloudflareAccountHandler = async (bot, msg, userState) => {
const chatId = msg.chat.id;
const text = msg.text;
const state = userState[chatId];

if (!text) return;

try {
switch (state.step) {
case 1:
state.email = text;
state.step = 2;
await bot.sendMessage(
chatId, 
'🔑 *Masukkan Global API Key:*', 
{ parse_mode: 'Markdown' }
);
break;

case 2:
state.apiKey = text;
state.step = 3;
await bot.sendMessage(
chatId, 
'🌐 *Masukkan Zone ID:*', 
{ parse_mode: 'Markdown' }
);
break;

case 3:
state.zoneId = text;
state.step = 4;
await bot.sendMessage(
chatId, 
'🆔 *Masukkan Account ID:*', 
{ parse_mode: 'Markdown' }
);
break;

case 4:
state.accountId = text;
await processCloudflareAccount(bot, chatId, state);
clearTimeout(state.timeout);
delete userState[chatId];
break;
}
} catch (error) {
console.error('Handler error:', error);
await bot.sendMessage(chatId, '❌ Gagal memproses data');
}
};

// Proses utama Cloudflare
const processCloudflareAccount = async (bot, chatId, state) => {
try {
// 1. Verifikasi Zone ID
const zoneInfo = await axios.get(
`https://api.cloudflare.com/client/v4/zones/${state.zoneId}`,
{
headers: {
'X-Auth-Email': state.email,
'X-Auth-Key': state.apiKey,
}
}
);

if (!zoneInfo.data.success) {
throw new Error('Zone ID tidak valid');
}

// 2. Deploy Worker
const workerName = generateRandomWorkerName();
await axios.put(
`https://api.cloudflare.com/client/v4/accounts/${state.accountId}/workers/scripts/${workerName}`,
workerContent,
{
headers: {
'X-Auth-Email': state.email,
'X-Auth-Key': state.apiKey,
'Content-Type': 'application/javascript'
}
}
);

// 3. Simpan ke database
await CloudflareAccount.create({
userChatId: chatId,
domainName: zoneInfo.data.result.name,
email: state.email,
zoneId: state.zoneId,
apiKey: state.apiKey,
accountId: state.accountId,
workerName: workerName
});

// 4. Beri feedback ke user
await bot.sendMessage(
chatId,
`✅ *Akun Cloudflare berhasil ditambahkan!*\n\n` +
`Worker: \`${workerName}\`\n` +
`Domain: ${zoneInfo.data.result.name}`,
{ parse_mode: 'Markdown' }
);

} catch (error) {
console.error('Cloudflare process error:', error);
throw new Error(
error.response?.data?.errors?.[0]?.message || 
'Gagal menambahkan akun Cloudflare'
);
}
};

module.exports = addCloudflareAccountHandler;