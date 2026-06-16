const { ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const supportRoles = [
  "1506368461964705924",
  "1506367703810707456"
];

module.exports = {
  name: "interactionCreate",

  async execute(interaction) {

    if (!interaction.isButton()) return;

    // 🎟 TICKET AÇ
    if (interaction.customId === "ticket_open") {

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username.toLowerCase()}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages
            ]
          }
        ]
      });

      const rolesPing = supportRoles.map(r => `<@&${r}>`).join(" ");

      await channel.send(`🎟 Ticket açıldı\n${rolesPing}\n<@${interaction.user.id}>`);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_close")
          .setLabel("Kapat")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({ components: [row] });

      return interaction.reply({ content: "Ticket açıldı!", ephemeral: true });
    }

    // ❌ KAPAT
    if (interaction.customId === "ticket_close") {
      await interaction.channel.delete();
    }
  }
};
