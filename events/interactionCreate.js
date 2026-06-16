const { ChannelType, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "interactionCreate",

  async execute(interaction) {
    try {

      if (!interaction.isButton()) return;

      // 🎟 TICKET AÇ
      if (interaction.customId === "ticket_open") {

        // 🔒 1 KİŞİ 1 TICKET KONTROL
        const existing = interaction.guild.channels.cache.find(
          c => c.name === `ticket-${interaction.user.username.toLowerCase()}`
        );

        if (existing) {
          return interaction.reply({
            content: "❌ Zaten açık bir ticketin var!",
            ephemeral: true
          });
        }

        // 📁 KANAL OLUŞTUR
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
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
              ]
            }
          ]
        });

        // 💬 MESAJ
        await channel.send(`🎟 Ticket açıldı: <@${interaction.user.id}>\nYetkililer en kısa sürede ilgilenecek.`);

        return interaction.reply({
          content: `✅ Ticket açıldı: ${channel}`,
          ephemeral: true
        });
      }

      // ❌ TICKET KAPAT
      if (interaction.customId === "ticket_close") {
        await interaction.reply({ content: "🔒 Ticket kapatılıyor..." });
        setTimeout(() => interaction.channel.delete(), 1500);
      }

    } catch (err) {
      console.log("TICKET HATA:", err);
    }
  }
};
