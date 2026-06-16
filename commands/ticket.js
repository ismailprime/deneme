const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "ticket",

  execute(message) {
    const btn = new ButtonBuilder()
      .setCustomId("ticket_open")
      .setLabel("Ticket Aç")
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(btn);

    message.channel.send({ content: "🎟 Ticket panel", components: [row] });
  }
};
