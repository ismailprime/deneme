const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "drop",

  async execute(message, client, args) {

    const prize = args.join(" ");
    if (!prize) return message.reply("Ödül yazmalısın!");

    let winner = null;

    const button = new ButtonBuilder()
      .setCustomId("drop_claim")
      .setLabel("⚡ Kap!")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(button);

    const msg = await message.channel.send({
      content: `⚡ DROP: **${prize}**`,
      components: [row]
    });

    const collector = msg.createMessageComponentCollector({
      time: 30000
    });

    collector.on("collect", async (i) => {

      if (winner) {
        return i.reply({ content: "❌ Çok geç, biri kazandı!", ephemeral: true });
      }

      winner = i.user.id;

      await i.reply(`🏆 <@${i.user.id}> dropu kazandı!\n🎁 Ödül: **${prize}**\nTicket aç!`);

      msg.edit({
        content: `🏆 Kazanan: <@${i.user.id}>`,
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
  }
};
