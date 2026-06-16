const { queryFull } = require("minecraft-server-util");

module.exports = {
  name: "bilgi",

  async execute(message, client) {

    const ip = "mc.skyforgenw.com.tr";
    const port = 25565;

    // 📊 ilk mesaj
    const msg = await message.channel.send("📡 Sunucu verileri yükleniyor...");

    // 🔄 LIVE UPDATE (her 10 saniye)
    const interval = setInterval(async () => {

      try {
        const data = await queryFull(ip, port);

        msg.edit({
          embeds: [
            {
              title: "📊 SkyForge Network LIVE",
              color: 0x00ff99,
              fields: [
                {
                  name: "👥 Oyuncular",
                  value: `${data.players.online} / ${data.players.max}`,
                  inline: true
                },
                {
                  name: "🏓 Ping",
                  value: `${data.ping} ms`,
                  inline: true
                },
                {
                  name: "🌐 IP",
                  value: ip,
                  inline: false
                },
                {
                  name: "📡 Durum",
                  value: "🟢 Online",
                  inline: true
                }
              ]
            }
          ]
        });

      } catch (err) {

        msg.edit({
          content: "",
          embeds: [
            {
              title: "📊 SkyForge Network LIVE",
              color: 0xff0000,
              fields: [
                {
                  name: "📡 Durum",
                  value: "🔴 Bakımda / Kapalı",
                  inline: true
                },
                {
                  name: "🌐 IP",
                  value: ip,
                  inline: true
                }
              ]
            }
          ]
        });

      }

    }, 10000); // ⬅ 10 saniye

  }
};
