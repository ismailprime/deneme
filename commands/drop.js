const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "drop",

  async execute(message, client, args) {

    const prize = args.join(" ");
    if (!prize) return message.reply("Ödül yazmalısın!");

    let claimed = false;

    const button = new ButtonBuilder()
      .setCustomId("drop_claim")
      .setLabel("⚡ Kap!")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(button);

    const msg = await message.channel.send({
      content: `⚡ DROP BAŞLADI: **${prize}**`,
      components: [row]
    });

    const collector = msg.createMessageComponentCollector({
      time: 30000 // 30 saniye
    });

    collector.on("collect", async (i) => {

      if (claimed) {
        return i.reply({ content: "Zaten biri kazandı ❌", ephemeral: true });
      }

      claimed = true;

      await i.reply(`🏆 <@${i.user.id}> dropu kaptın! Ödül: **${prize}**\nLütfen ticket aç.`);

      msg.edit({
        content: `🏆 Kazanan: <@${i.user.id}>`,
        components: []
      });

      collector.stop();
    });

    collector.on("end", () => {
      if (!claimed) {
        msg.edit({
          content: `❌ Drop bitti, kimse kazanamadı.`,
          components: []
        });
      }
    });
  }
};
