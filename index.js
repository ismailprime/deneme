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

// ================= CONFIG =================
const TOKEN = process.env.TOKEN;

const OWNER_ID = "1003708560728920165";
const ADMIN_ROLE_ID = "1506368461964705924";

const LOG_CHANNEL_ID = "1512629605830716257";
const WELCOME_CHANNEL_ID = "1506386634357211187";

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

// ================= WELCOME + OWNER =================
client.on("guildMemberAdd", async (member) => {

  const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (ch) ch.send(`👋 Hoşgeldin <@${member.id}>`);

  // 👑 OWNER AUTO ADMIN
  if (member.id === OWNER_ID) {
    const role = member.guild.roles.cache.get(ADMIN_ROLE_ID);
    if (role) await member.roles.add(role).catch(() => {});
  }
});

// ================= LOG SYSTEM =================
client.on("messageDelete", (message) => {
  if (!message.guild) return;

  const ch = message.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (ch) ch.send(`🗑️ Silindi: ${message.content || "boş"}`);
});

client.on("messageUpdate", (oldMsg, newMsg) => {
  if (!oldMsg.guild) return;
  if (oldMsg.content === newMsg.content) return;

  const ch = oldMsg.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (ch) {
    ch.send(`✏️ Edit\nÖnce: ${oldMsg.content}\nSonra: ${newMsg.content}`);
  }
});

// ================= MESSAGE CREATE =================
client.on("messageCreate", async (message) => {

  if (message.author.bot || !message.guild) return;

  const msg = message.content.toLowerCase().trim();
  const isOwner = message.author.id === OWNER_ID;

  // 👋 SELAM
  if (["sa", "selam", "selamün aleyküm"].includes(msg)) {
    return message.reply("Aleyküm selam 👋");
  }

  // 📡 IP
  if (message.content === "!ip") {
    return message.channel.send("mc.skyforgenw.com.tr");
  }

  // 📨 -i
  if (message.content === "-i") {
    return message.channel.send("📨 Davet sistemi aktif değil");
  }

  // 🎟 TICKET PANEL
  if (message.content === "!ticket") {

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_open")
        .setLabel("🎟 Ticket Aç")
        .setStyle(ButtonStyle.Success)
    );

    return message.channel.send({
      content: "🎟 Ticket sistemi aktif",
      components: [row]
    });
  }

  // 🎉 ÇEKİLİŞ
  if (message.content.startsWith("!cekilis")) {

    const args = message.content.split(" ");
    const time = args[1];
    const prize = args.slice(2).join(" ");

    if (!time || !prize) {
      return message.channel.send("Kullanım: !cekilis 1m ödül");
    }

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
      content:
`🎉 ÇEKİLİŞ
🎁 ${prize}
⏰ ${time}`
,
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
        return msgGiveaway.edit("❌ Katılım olmadı");
      }

      const winner = users[Math.floor(Math.random() * users.length)];

      msgGiveaway.edit(
`🎉 ÇEKİLİŞ BİTTİ
🎁 ${prize}
⏰ ${time}

🏆 Kazanan: <@${winner}>

tebrikler çekilişi kazandınız <@${winner}> ticket açarak ödülünüzü talep ediniz`
      );
    });
  }

  // 🔥 OWNER SHUTDOWN
  if (message.content === "!shutdown") {
    if (!isOwner) return;

    await message.channel.send("Bot kapanıyor...");
    process.exit(0);
  }
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (i) => {

  if (!i.isButton() && !i.isStringSelectMenu()) return;

  const roles = `<@&${ADMIN_ROLE_ID}>`;

  // 🎟 OPEN
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

  // 🎟 CREATE
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
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        }
      ]
    });

    await ch.send(`🎟 Ticket Açıldı\n${roles}\n<@${i.user.id}>`);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Kapat")
        .setStyle(ButtonStyle.Danger)
    );

    await ch.send({ components: [row] });

    return i.reply({ content: "Ticket açıldı", ephemeral: true });
  }

  // ❌ CLOSE
  if (i.customId === "ticket_close") {
    await i.reply("Kapatılıyor...");
    setTimeout(() => i.channel.delete().catch(() => {}), 2000);
  }

  // 🎉 JOIN GIVEAWAY
  if (i.customId === "giveaway_join") {
    return i.reply({ content: "Katıldın 🎉", ephemeral: true });
  }
});

// ================= LOGIN =================
client.login(TOKEN);
