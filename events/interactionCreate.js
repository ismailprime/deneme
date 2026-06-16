const {
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} = require("discord.js");

module.exports = {
  name: "interactionCreate",

  async execute(i) {

    if (!i.isButton() && !i.isStringSelectMenu()) return;

    const roles = [
      "1506367703810707456",
      "1506368461964705924"
    ];

    const rolePing = roles.map(r => `<@&${r}>`).join(" ");

    // OPEN
    if (i.customId === "ticket_open") {

      const menu = new StringSelectMenuBuilder()
        .setCustomId("ticket_category")
        .setPlaceholder("Kategori seç")
        .addOptions(
          { label: "Bug", value: "bug" },
          { label: "Destek", value: "destek" },
          { label: "Şikayet", value: "sikayet" },
          { label: "Diğer", value: "diger" }
        );

      return i.reply({
        content: "Kategori seç",
        components: [new ActionRowBuilder().addComponents(menu)],
        ephemeral: true
      });
    }

    // CREATE
    if (i.customId === "ticket_category") {

      const cat = i.values[0];

      const ch = await i.guild.channels.create({
        name: `ticket-${cat}-${i.user.username}`,
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: i.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: i.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages
            ]
          }
        ]
      });

      await ch.send(`🎟 Ticket açıldı\n${rolePing}\n<@${i.user.id}>`);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_close")
          .setLabel("Kapat")
          .setStyle(ButtonStyle.Danger)
      );

      await ch.send({ components: [row] });

      return i.reply({ content: "Ticket açıldı", ephemeral: true });
    }

    // CLOSE + DM TRANSCRIPT
    if (i.customId === "ticket_close") {

      const msgs = await i.channel.messages.fetch({ limit: 50 });

      const transcript = msgs
        .map(m => `${m.author.tag}: ${m.content}`)
        .reverse()
        .join("\n");

      const ownerId = i.channel.name.split("-").pop();
      const user = await i.guild.members.fetch(ownerId).catch(() => null);

      if (user) {
        user.send(`🎟 Ticket kapatıldı:\n\n${transcript}`).catch(() => {});
      }

      i.reply("Kapatılıyor...");
      setTimeout(() => i.channel.delete(), 2000);
    }

    // GIVEAWAY BUTTON
    if (i.customId === "giveaway_join") {
      return i.reply({ content: "Katıldın", ephemeral: true });
    }
  }
};
