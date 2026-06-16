const { 
  ChannelType, 
  PermissionsBitField, 
  ActionRowBuilder, 
  StringSelectMenuBuilder 
} = require("discord.js");

module.exports = {
  name: "interactionCreate",

  async execute(interaction) {
    try {

      if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

      // 🎫 PANEL -> KATEGORİ SEÇİM
      if (interaction.customId === "ticket_open") {

        const existing = interaction.guild.channels.cache.find(
          c => c.name.includes(`ticket`) && c.name.includes(interaction.user.username.toLowerCase())
        );

        if (existing) {
          return interaction.reply({
            content: "❌ Zaten açık ticketin var!",
            ephemeral: true
          });
        }

        const menu = new StringSelectMenuBuilder()
          .setCustomId("ticket_category")
          .setPlaceholder("Kategori seç")
          .addOptions([
            { label: "Bug Report", value: "bug" },
            { label: "Ödeme / Muhasebe", value: "odeme" },
            { label: "Hile / Report", value: "hile" },
            { label: "Partnerlik", value: "partner" },
            { label: "Diğer", value: "diger" }
          ]);

        const row = new ActionRowBuilder().addComponents(menu);

        return interaction.reply({
          content: "📌 Kategori seç:",
          components: [row],
          ephemeral: true
        });
      }

      // 📂 KATEGORİ SEÇİLDİ -> TICKET AÇ
      if (interaction.isStringSelectMenu() && interaction.customId === "ticket_category") {

        const type = interaction.values[0];

        const names = {
          bug: "bug-report",
          odeme: "odeme",
          hile: "hile-report",
          partner: "partnerlik",
          diger: "diger"
        };

        const channel = await interaction.guild.channels.create({
          name: `ticket-${names[type]}-${interaction.user.username.toLowerCase()}`,
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
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
              ]
            }
          ]
        });

        await channel.send(`🎟 **${type.toUpperCase()} TICKET**\n<@${interaction.user.id}>`);

        return interaction.reply({
          content: `✅ Ticket açıldı: ${channel}`,
          ephemeral: true
        });
      }

      // ❌ KAPAT
      if (interaction.customId === "ticket_close") {
        await interaction.channel.delete();
      }

    } catch (err) {
      console.log("TICKET HATA:", err);
    }
  }
};
