module.exports = {
  name: "bilgi",

  execute(message, client) {

    message.reply(`
📊 Sunucu Bilgisi

👥 Üye: ${message.guild.memberCount}
🏓 Ping: ${client.ws.ping}ms
🌐 IP: mc.skyforgenw.com.tr
`);
  }
};
