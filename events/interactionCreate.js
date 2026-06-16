client.on("interactionCreate", async (i) => {

  if (!i.isButton() && !i.isStringSelectMenu()) return;

  const roles = `<@&1506368461964705924>\n<@&1506367703810707456>\n<@&1506369036772966401>\n<@1003708560728920165>`;

  // ================= TICKET OPEN MENU =================
  if (i.customId === "ticket_open") {

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_category")
      .setPlaceholder("Kategori seç")
      .addOptions(
        { label: "Destek", value: "destek" },
        { label: "Bug", value: "bug" },
        { label: "Şikayet", value: "sikayet" },
        { label: "Diğer", value: "diger" }
      );

    return i.reply({
      content: "Kategori seç",
      components: [new ActionRowBuilder().addComponents(menu)],
      ephemeral: true
    });
  }

  // ================= TICKET CREATE =================
  if (i.customId === "ticket_category") {

    const ch = await i.guild.channels.create({
      name: `ticket-${i.values[0]}-${i.user.username}`,
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
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ReadMessageHistory
          ]
        }
      ]
    });

    // 📌 ticket owner kaydı
    ch.ticketOwner = i.user.id;

    await ch.send(
`🎟 **Ticket Açıldı**

👤 Açan: <@${i.user.id}>

📣 Yetkililer:
${roles}

📌 Yetkililer en kısa sürede ilgilenecek.`
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Kapat")
        .setStyle(ButtonStyle.Danger)
    );

    await ch.send({ components: [row] });

    return i.reply({
      content: `Ticket açıldı: ${ch}`,
      ephemeral: true
    });
  }

  // ================= TICKET CLOSE (PRO SYSTEM) =================
  if (i.customId === "ticket_close") {

    await i.reply("📦 Ticket kapatılıyor...");

    const channel = i.channel;

    const fs = require("fs");
    const path = require("path");

    // ================= TRANSCRIPT =================
    const messages = await channel.messages.fetch({ limit: 100 });

    const content = messages
      .map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`)
      .reverse()
      .join("\n");

    const filePath = path.join(__dirname, `transcript-${channel.id}.txt`);
    fs.writeFileSync(filePath, content);

    // ================= LOG KANALI =================
    const logChannel = i.guild.channels.cache.get("1512629605830496257");

    if (logChannel) {
      logChannel.send({
        content:
`📄 **TICKET KAPATILDI**

📌 Kanal: ${channel.name}
👤 Açan: <@${channel.ticketOwner || "Bilinmiyor"}>
🔒 Kapatan: ${i.user.tag}
📅 Tarih: ${new Date().toLocaleString()}`,
        files: [filePath]
      });
    }

    // ================= USER DM =================
    try {
      const userId = channel.ticketOwner;

      if (userId) {
        const user = await i.client.users.fetch(userId);

        user.send(
`🎟 **Ticket Kapatıldı**

📌 Kanal: ${channel.name}
🔒 Kapatan: ${i.user.tag}

📄 Transcript ekte.`
        ).catch(() => {});
      }
    } catch {}

    // ================= OWNER DM =================
    try {
      const owner = await i.client.users.fetch("1003708560728920165");

      owner.send(
`🛑 **Ticket Log**

📌 Kanal: ${channel.name}
👤 Açan: ${channel.ticketOwner || "Bilinmiyor"}
🔒 Kapatan: ${i.user.tag}

📄 Transcript gönderildi.`
      ).catch(() => {});
    } catch {}

    // ================= DELETE =================
    setTimeout(() => {
      channel.delete().catch(() => {});
    }, 2000);
  }

  // ================= GIVEAWAY JOIN =================
  if (i.customId === "giveaway_join") {
    return i.reply({ content: "🎉 Katıldın!", ephemeral: true });
  }
});
