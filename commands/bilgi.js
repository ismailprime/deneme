const { status } = require("minecraft-server-util");

module.exports = {
  name: "bilgi",

  async execute(message, client) {

    const ip = "mc.skyforgenw.com.tr";
    const port = 25565;

    try {

      const data = await status(ip, port);

      const embed = {
        title: "📊 SkyForge Network",
        color: 0x00ff99,
        fields: [
          {
            name: "👥 Oyuncular",
            value: `${data.players.online} / ${data.players.max}`,
            inline: true
          },
          {
            name: "🏓 Ping",
            value: `${data.latency} ms`,
            inline: true
          },
          {
            name: "🌐 IP",
            value: `${ip}:${port}`,
            inline: false
          },
          {
            name: "📡 Durum",
            value: "🟢 Online",
            inline: true
          }
        ]
      };

      message.channel.send({ embeds: [embed] });

    } catch (err) {

      console.log("MC ERROR:", err);

      message.channel.send({
        embeds: [
          {
            title: "📊 SkyForge Network",
            color: 0xff0000,
            description: "🔴 Sunucuya ulaşılamıyor (kapalı veya bakımda)",
            fields: [
              {
                name: "🌐 IP",
                value: `${ip}:${port}`
              }
            ]
          }
        ]
      });

    }
  }
};
