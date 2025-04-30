const deleteRecordHandler = (bot, msg, userState) => {
const chatId = msg.chat.id;
const text = msg.text;
const state = userState[chatId];

if (!text) return;

try {
switch (state.step) {
case 1:
state.recordId = text;
state.step = 2;
await bot.sendMessage(chatId, `
𝗜𝗗: ${state.recordId}
𝗡𝗮𝗺𝗲: ${record.name}
𝗧𝗶𝗽𝗲: ${record.type}
𝗖𝗼𝗻𝘁𝗲𝗻𝘁: ${record.content}
𝗧𝗧𝗟: ${record.ttl}
𝗣𝗿𝗼𝘅𝗶𝗲𝗱: ${record.proxied ? '✅' : '❌'}

Anda yakin ingin memghapus record ini?`, {
parse_mode: 'Markdown',
reply_markup: {
inline_keyboard: [
[{ text: 'Cancel', callback_data: 'delete_record_cancel' }, { text: 'Confirm', callback_data: 'delete_record_confirm' }]
]
}
});
}
}
}