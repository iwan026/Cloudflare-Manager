require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const bodyParser = require('body-parser');
const { User } = require('./database/database');
const { mainMenuCommand } = require('./handlers/mainMenu');
const mainMenuCallback = require('./callback/mainMenuCallback');
const addCloudflareAccountCallback = require('./callback/addCloudflareAccountCallback');
const manageRecordCallback = require('./callback/manageRecordCallback');
const addRecordCallback = require('./callback/addRecordCallback');

const app = express();
app.use(bodyParser.json());

const botToken = process.env.BOT_TOKEN;
const webhookUrl = process.env.WEBHOOK_URL;
const port = process.env.PORT;

const bot = new TelegramBot(botToken, { webhook: true });
bot.setWebHook(webhookUrl);

app.post('/webhook', (req, res) => {
bot.processUpdate(req.body);
res.sendStatus(200);
});

bot.onText(/\/start/, async (msg) => {
const chatId = msg.chat.id;
const username = msg.from.username;
const firstName = msg.from.first_name || 'Unknown';

if (!username) {
bot.sendMessage(chatId, 'Anda harus memiliki username untuk memggunakan bot ini, silahkan atur username terlebih dahulu di pengaturan telegram.');
console.log('User tanpa username berusaha mengakses bot.');
return;
}

try {
const [user, created] = await User.findOrCreate({
where: { chatId: chatId },
defaults: {
username: username,
role: 'Basic',
},
});

if (!created) {
if (user.username !== username) {
await user.update({
username: username,
});
console.log(`User: ${chatId} diperbarui: ${JSON.stringify(user.toJSON())}`);
} else {
console.log('User baru dibuat', JSON.stringify(user.toJSON()));
}
}

const welcomeMessage = `
Halo ${firstName}!

Selamat datang di bot kami. 🎉
Gunakan perintah /menu untuk menampilkan menu utama.
`;
await bot.sendMessage(chatId, welcomeMessage);
} catch (error) {
console.log('Error sending message: ', error);
}
});

mainMenuCommand(bot);
mainMenuCallback(bot);
addCloudflareAccountCallback(bot);
manageRecordCallback(bot);
addRecordCallback(bot);

app.listen(port, () => {
console.log(`Bot is running on port ${port} with webhook ${webhookUrl}`);
});