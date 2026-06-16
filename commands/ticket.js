const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "ticket",

  execute(message) {

    if (!message.member.permissions.has("Administrator")) return;

    const embed = new EmbedBuilder()
      .setTitle("🎟 Ticket Sistemi")
      .setDescription("Butona basarak ticket aç")
      .setColor("Blue");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_open")
        .setLabel("Ticket Aç")
        .setStyle(ButtonStyle.Primary)
    );

    message.channel.send({ embeds: [embed], components: [row] });
  }
};
