const {
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} = require("discord.js");

const activeTickets = new Map();

module.exports = {
  name: "interactionCreate",

  async execute(interaction) {

    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    // 🎟 OPEN
    if (interaction.customId === "ticket_open") {

      const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_category")
        .setPlaceholder("Kategori seç")
        .addOptions(
          { label: "Bug", value: "bug" },
          { label: "Destek", value: "destek" },
          { label: "Şikayet", value: "sikayet" },
          { label: "Diğer", value: "diger" }
        );

      return interaction.reply({
        content: "Kategori seç",
        components: [new ActionRowBuilder().addComponents(menu)],
        ephemeral: true
      });
    }

    // 🎫 CATEGORY
    if (interaction.customId === "ticket_category") {

      const category = interaction.values[0];

      if (activeTickets.has(interaction.user.id)) {
        return interaction.reply({ content: "Zaten ticket var", ephemeral: true });
      }

      const channel = await interaction.guild.channels.create({
        name: `ticket-${category}-${interaction.user.username}`,
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

      activeTickets.set(interaction.user.id, channel.id);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_close")
          .setLabel("Kapat")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({
        content: `🎟 Ticket açıldı: ${category}`,
        components: [row]
      });

      return interaction.reply({ content: `Ticket açıldı ${channel}`, ephemeral: true });
    }

    // ❌ CLOSE
    if (interaction.customId === "ticket_close") {

      const owner = [...activeTickets.entries()]
        .find(x => x[1] === interaction.channel.id);

      if (owner) activeTickets.delete(owner[0]);

      await interaction.reply("Kapatılıyor...");
      setTimeout(() => interaction.channel.delete(), 2000);
    }
  }
};
