const { statusBedrock } = require("minecraft-server-util");

module.exports = {
  name: "bilgi",

  async execute(message, client) {

    const ip = "mc.skyforgenw.com.tr";
    const port = 19132;

    try {

      const data = await statusBedrock(ip, port);

      const embed = {
        title: "📊 SkyForge Network (Bedrock)",
        color: 0x00ff99,
        fields: [
          {
            name: "👥 Oyuncular",
            value: `${data.players.online} / ${data.players.max}`,
            inline: true
          },
          {
            name: "🏓 Ping",
            value: `${data.roundTripLatency} ms`,
            inline: true
          },
          {
            name: "🌐 IP",
            value: `${ip}:${port}`,
            inline: false
          }
        ]
      };

      message.channel.send({ embeds: [embed] });

    } catch (err) {

      console.log("BEDROCK ERROR:", err);

      message.channel.send("⚠️ Sunucu kapalı veya Bedrock query kapalı!");

    }
  }
};
