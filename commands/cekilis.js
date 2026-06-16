const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const ms = require("ms");

module.exports = {
  name: "cekilis",

  async execute(message, client, args) {

    const time = ms(args[0]);
    const prize = args.slice(1).join(" ");

    const participants = [];

    const button = new ButtonBuilder()
      .setCustomId("join")
      .setLabel("Katıl")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    const msg = await message.channel.send({
      content: `🎉 ${prize}`,
      components: [row]
    });

    const collector = msg.createMessageComponentCollector({ time });

    collector.on("collect", i => {
      if (!participants.includes(i.user.id)) {
        participants.push(i.user.id);
        i.reply({ content: "Katıldın", ephemeral: true });
      }
    });

    collector.on("end", () => {
      const winner = participants[Math.floor(Math.random() * participants.length)];
      msg.edit(`🏆 Kazanan: <@${winner}>`);
    });
  }
};
