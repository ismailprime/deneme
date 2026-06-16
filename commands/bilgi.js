const { status } = require("minecraft-server-util");

module.exports = {
  name: "bilgi",

  async execute(message) {

    const ip = "mc.skyforgenw.com.tr";

    try {

      const data = await status(ip);

      const online = data?.players?.online ?? 0;
      const max = data?.players?.max ?? "?";
      const ping = data?.latency ?? "?"

      return message.channel.send({
        embeds: [
          {
            title: "📊 Sunucu Durumu",
            color: 0x00ff99,
            fields: [
              {
                name: "👥 Oyuncular",
                value: `${online} / ${max}`,
                inline: true
              },
              {
                name: "🏓 Ping",
                value: `${ping} ms`,
                inline: true
              },
              {
                name: "🌐 IP",
                value: ip,
                inline: false
              }
            ]
          }
        ]
      });

    } catch (err) {

      console.log("MC ERROR:", err);

      return message.channel.send({
        embeds: [
          {
            title: "📊 Sunucu Durumu",
            color: 0xff0000,
            description: "🔴 Sunucuya ulaşılamıyor (offline / plugin / firewall)"
          }
        ]
      });

    }
  }
};
