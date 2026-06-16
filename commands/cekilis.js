const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const ms = require("ms");

module.exports = {
  name: "cekilis",

  async execute(message, client, args) {

    const mode = args[0]; // 1m veya drop
    const prize = args.slice(1).join(" ");

    if (!mode || !prize) {
      return message.reply("Kullanım: !cekilis 1m ödül | !cekilis drop ödül");
    }

    // ⚡ DROP MODE (FIRST CLICK WINS)
    if (mode.toLowerCase() === "drop") {

      let winner = null;

      const button = new ButtonBuilder()
        .setCustomId("drop_win")
        .setLabel("⚡ Kap!")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(button);

      const msg = await message.channel.send({
        content: `⚡ DROP BAŞLADI!\n🎁 Ödül: **${prize}**\n🔥 İlk tıklayan kazanır!`,
        components: [row]
      });

      const collector = msg.createMessageComponentCollector({
        time: 30000
      });

      collector.on("collect", async (i) => {

        if (winner) {
          return i.reply({
            content: `❌ Geç kaldın! Kazanan: <@${winner}>`,
            ephemeral: true
          });
        }

        winner = i.user.id;

        await i.reply(`🏆 <@${i.user.id}> dropu kazandı!\n🎁 Ödül: **${prize}**`);

        msg.edit({
          content: `🏆 Kazanan: <@${i.user.id}>\n🎁 ${prize}`,
          components: []
        });

        collector.stop();
      });

      collector.on("end", () => {
        if (!winner) {
          msg.edit({
            content: "❌ Drop bitti, kimse kazanamadı.",
            components: []
          });
        }
      });

      return;
    }

    // 🎉 NORMAL GIVEAWAY (RANDOM)
    const time = ms(mode);

    if (!time) {
      return message.reply("Süre hatalı! örnek: 1m / 10m / 1h");
    }

    const participants = [];

    const button = new ButtonBuilder()
      .setCustomId("giveaway_join")
      .setLabel("🎉 Katıl")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    const msg = await message.channel.send({
      content: `🎉 ÇEKİLİŞ\n🎁 ${prize}\n⏰ ${mode}`,
      components: [row]
    });

    const collector = msg.createMessageComponentCollector({
      time
    });

    collector.on("collect", (i) => {

      if (!participants.includes(i.user.id)) {
        participants.push(i.user.id);
        i.reply({ content: "Katıldın!", ephemeral: true });
      }

    });

    collector.on("end", () => {

      if (participants.length === 0) {
        return msg.edit("❌ Katılım olmadı");
      }

      const winner =
        participants[Math.floor(Math.random() * participants.length)];

      msg.edit(`🏆 Kazanan: <@${winner}>`);
    });
  }
};
