const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "cekilis",

  async execute(message, client, args) {

    const time = args[0];
    const prize = args.slice(1).join(" ");

    if (!time || !prize) {
      return message.reply("!cekilis 1m ödül");
    }

    const participants = [];

    const button = new ButtonBuilder()
      .setCustomId("join_giveaway")
      .setLabel("Katıl")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    const msg = await message.channel.send({
      content: `🎉 ${prize}`,
      components: [row]
    });

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", (i) => {
      if (!participants.includes(i.user.id)) {
        participants.push(i.user.id);
        i.reply({ content: "Katıldın", ephemeral: true });
      }
    });

    collector.on("end", () => {

      if (participants.length === 0)
        return msg.edit("Katılım yok");

      const winner = participants[Math.floor(Math.random() * participants.length)];

      msg.edit(`🏆 Kazanan: <@${winner}>`);
    });
  }
};
