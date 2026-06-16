const { ChannelType, PermissionsBitField } = require("discord.js");
const config = require("../config/config");

module.exports = {
  name: "interactionCreate",

  async execute(interaction) {
    if (!interaction.isButton()) return;

    if (interaction.customId === "ticket_open") {
      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel]
          }
        ]
      });

      const roles = config.supportRoles.map(r => `<@&${r}>`).join(" ");

      channel.send(`🎟 Ticket açıldı\n${roles}\n<@${interaction.user.id}>`);

      return interaction.reply({ content: "Ticket açıldı!", ephemeral: true });
    }

    if (interaction.customId === "ticket_close") {
      interaction.channel.delete();
    }
  }
};
