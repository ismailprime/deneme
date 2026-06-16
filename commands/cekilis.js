const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "cekilis",

  async execute(message, client, args) {

    const time = args[0];
    const prize = args.slice(1).join(" ");

    let ms = 60000;
    if (time?.endsWith("m")) ms = parseInt(time) * 60000;
    if (time?.endsWith("h")) ms = parseInt(time) * 3600000;

    const users = [];

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("giveaway_join")
        .setLabel("Katıl")
        .setStyle(ButtonStyle.Success)
    );

    const msg = await message.channel.send({
      content: `🎉 ${prize}`,
      components: [row]
    });

    const collector = msg.createMessageComponentCollector({ time: ms });

    collector.on("collect", (i) => {
      if (!users.includes(i.user.id)) {
        users.push(i.user.id);
        i.reply({ content: "Katıldın", ephemeral: true });
      }
    });

    collector.on("end", () => {

      if (users.length === 0)
        return msg.edit("Katılım yok");

      const winner = users[Math.floor(Math.random() * users.length)];

      msg.edit(`🏆 Kazanan: <@${winner}>`);
    });
  }
};
