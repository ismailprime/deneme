module.exports = {
  name: "bilgi",

  execute(message, client) {

    const guild = message.guild;

    message.channel.send({
      embeds: [
        {
          title: "📊 Sunucu Bilgisi",
          color: 0x00ff99,
          fields: [
            {
              name: "👥 Üye Sayısı",
              value: `${guild.memberCount}`,
              inline: true
            },
            {
              name: "🏓 Bot Ping",
              value: `${client.ws.ping} ms`,
              inline: true
            },
            {
              name: "📡 Sunucu Adı",
              value: guild.name,
              inline: false
            }
          ]
        }
      ]
    });
  }
};
