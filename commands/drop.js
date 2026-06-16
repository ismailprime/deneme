const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "drop",

  async execute(message, client, args) {

    const prize = args.join(" ");
    let claimed = false;

    const button = new ButtonBuilder()
      .setCustomId("drop")
      .setLabel("Kap!")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(button);

    const msg = await message.channel.send({
      content: `⚡ ${prize}`,
      components: [row]
    });

    const collector = msg.createMessageComponentCollector({ max: 1 });

    collector.on("collect", i => {

      if (claimed) return;
      claimed = true;

      i.reply(`🏆 ${i.user} kazandı! ticket aç`);

      msg.edit({
        content: `🏆 Kazanan: <@${i.user.id}>`,
        components: []
      });
    });
  }
};
