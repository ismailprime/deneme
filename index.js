const {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ChannelType
} = require("discord.js");

const TOKEN = process.env.TOKEN;

const OWNER_ID = "1003708560728920165";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

// ================= READY =================
client.once("ready", () => {
  console.log(`${client.user.tag} aktif`);
});

// ================= MESSAGE =================
client.on("messageCreate", async (message) => {

  if (!message.guild || message.author.bot) return;

  if (message.content === "!ticket") {

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_open")
        .setLabel("🎟 Ticket Aç")
        .setStyle(ButtonStyle.Success)
    );

    return message.channel.send({
      content: "🎟 Ticket sistemi",
      components: [row]
    });
  }
});

// ================= INTERACTION =================
client.on("interactionCreate", async (i) => {

  if (!i.isButton() && !i.isStringSelectMenu()) return;

  // ================= OPEN MENU =================
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

  // ================= CREATE TICKET =================
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

    ch.ticketOwner = i.user.id;

    // 🔥 PING FIX (KESİN ÇALIŞIR)
    await ch.send({
      content:
`🎟 **Ticket Açıldı**

👤 Açan: <@${i.user.id}>

📣 Yetkililer:
<@&1506368461964705924>
<@&1506367703810707456>
<@&1506369036772966401>

👑 Owner: <@${OWNER_ID}>`,

      allowedMentions: {
        roles: [
          "1506368461964705924",
          "1506367703810707456",
          "1506369036772966401"
        ],
        users: [OWNER_ID, i.user.id]
      }
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Kapat")
        .setStyle(ButtonStyle.Danger)
    );

    await ch.send({ components: [row] });

    return i.reply({ content: "Ticket açıldı 🎟", ephemeral: true });
  }

  // ================= CLOSE =================
  if (i.customId === "ticket_close") {

    await i.reply("📦 Ticket kapatılıyor...");

    setTimeout(() => {
      i.channel.delete().catch(() => {});
    }, 2000);
  }
});

// ================= LOGIN =================
client.login(TOKEN);
