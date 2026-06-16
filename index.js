const {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ChannelType,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ================= CONFIG =================
const TOKEN = process.env.TOKEN;

const OWNER_ID = "1003708560728920165";

const LOG_CHANNEL_ID = "1512629605830496257";
const WELCOME_CHANNEL_ID = "1506386634357211187";

const ROLE_1 = "1506368461964705924";
const ROLE_2 = "1506367703810707456";
const ROLE_3 = "1506369036772966401";

// ================= CLIENT =================
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

  const msg = message.content.toLowerCase();

  // SA
  if (["sa", "selam"].includes(msg)) {
    return message.reply("Aleyküm selam 👋");
  }

  // IP
  if (message.content === "!ip") {
    return message.channel.send("mc.skyforgenw.com.tr");
  }

  // TICKET PANEL
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

  // ÇEKİLİŞ
  if (message.content.startsWith("!cekilis")) {

    const args = message.content.split(" ");
    const time = args[1];
    const prize = args.slice(2).join(" ");

    if (!time || !prize) return;

    let ms = 60000;
    if (time.endsWith("m")) ms = parseInt(time) * 60000;
    if (time.endsWith("h")) ms = parseInt(time) * 3600000;

    const users = [];

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("giveaway_join")
        .setLabel("🎉 Katıl")
        .setStyle(ButtonStyle.Success)
    );

    const msgGiveaway = await message.channel.send({
      content: `🎉 ÇEKİLİŞ\n🎁 ${prize}\n⏰ ${time}`,
      components: [row]
    });

    const collector = msgGiveaway.createMessageComponentCollector({ time: ms });

    collector.on("collect", (i) => {
      if (!users.includes(i.user.id)) {
        users.push(i.user.id);
        i.reply({ content: "Katıldın 🎉", ephemeral: true });
      }
    });

    collector.on("end", () => {

      if (users.length === 0) {
        return msgGiveaway.edit("❌ Katılım yok");
      }

      const winner = users[Math.floor(Math.random() * users.length)];

      msgGiveaway.edit(
`🎉 ÇEKİLİŞ BİTTİ
🎁 ${prize}

🏆 Kazanan: <@${winner}>

tebrikler çekilişi kazandınız <@${winner}> ticket açarak ödülünüzü talep ediniz`
      );
    });
  }
});

// ================= WELCOME =================
client.on("guildMemberAdd", async (member) => {

  const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (!ch) return;

  const embed = new EmbedBuilder()
    .setTitle("👋 Hoşgeldin!")
    .setDescription(`<@${member.id}> sunucuya katıldı!`)
    .setColor("Green");

  ch.send({ embeds: [embed] });
});

// ================= LOG =================
client.on("messageDelete", async (m) => {
  if (!m.guild) return;

  const ch = m.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (ch) ch.send(`🗑️ Silindi: ${m.content || "boş"}`);
});

// ================= INTERACTION =================
client.on("interactionCreate", async (i) => {

  if (!i.isButton() && !i.isStringSelectMenu()) return;

  // ================= TICKET OPEN =================
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
        { id: i.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: i.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });

    ch.ticketOwner = i.user.id;

    await ch.send({
      content:
`🎟 Ticket Açıldı

👤 Açan: <@${i.user.id}>

📣 Yetkililer:
<@&${ROLE_1}>
<@&${ROLE_2}>
<@&${ROLE_3}>

👑 Owner: <@${OWNER_ID}>`,
      allowedMentions: {
        roles: [ROLE_1, ROLE_2, ROLE_3],
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

  // ================= TICKET CLOSE =================
  if (i.customId === "ticket_close") {

    await i.reply("📦 Ticket kapatılıyor...");

    const channel = i.channel;

    const messages = await channel.messages.fetch({ limit: 100 });

    const content = messages
      .map(m => `${m.author.tag}: ${m.content}`)
      .reverse()
      .join("\n");

    const filePath = path.join(__dirname, `transcript-${channel.id}.txt`);
    fs.writeFileSync(filePath, content);

    const logChannel = i.guild.channels.cache.get(LOG_CHANNEL_ID);

    if (logChannel) {
      logChannel.send({
        content: `📄 Ticket kapatıldı\n📌 ${channel.name}\n🔒 ${i.user.tag}`,
        files: [filePath]
      });
    }

    try {
      const user = await i.client.users.fetch(channel.ticketOwner);
      user.send("🎟 Ticket kapatıldı").catch(() => {});
    } catch {}

    try {
      const owner = await i.client.users.fetch(OWNER_ID);
      owner.send(`🛑 Ticket kapandı: ${channel.name}`).catch(() => {});
    } catch {}

    setTimeout(() => channel.delete().catch(() => {}), 2000);
  }

  // ================= GIVEAWAY =================
  if (i.customId === "giveaway_join") {
    return i.reply({ content: "🎉 Katıldın!", ephemeral: true });
  }
});

// ================= LOGIN =================
client.login(TOKEN);
