const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "ticket",

  execute(message) {

    if (!message.member.permissions.has("Administrator")) return;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_open")
        .setLabel("🎟 Ticket Aç")
        .setStyle(ButtonStyle.Success)
    );

    message.channel.send({
      content: "🎟 Ticket sistemi aktif",
      components: [row]
    });
  }
};
