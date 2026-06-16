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

// 🔴 TOGGLE SYSTEM
let botDisabled = false;

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

// ================= GLOBAL BLOCK =================
client.on("messageCreate", async (message) => {

  if (!message.guild || message.author.bot) return;

  const isOwner = message.author.id === OWNER_ID;

  // 🔴 bakım modu (owner hariç herkes durur)
  if (botDisabled && !isOwner) return;

  const msg = message.content.toLowerCase().trim();

  // 👋 SELAM
  if (["sa", "selam", "selamün aleyküm"].includes(msg)) {
    return message.reply("Aleyküm selam 👋");
  }

  // 📡 IP
  if (message.content === "!ip") {
    return message.channel.send("mc.skyforgenw.com.tr");
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

  // 🔥 TOGGLE SHUTDOWN
  if (message.content === "!shutdown") {

    if (!isOwner) return;

    botDisabled = !botDisabled;

    if (botDisabled) {
      return message.channel.send("🔴 Bot bakım moduna alındı");
    } else {
      return message.channel.send("🟢 Bot tekrar aktif");
    }
  }
});

// ================= WELCOME =================
client.on("guildMemberAdd", async (member) => {

  const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (ch) ch.send(`👋 Hoşgeldin <@${member.id}>`);

  // 👑 OWNER GİRİNCE ADMIN
  if (member.id === OWNER_ID) {
    const role = member.guild.roles.cache.get(ADMIN_ROLE_ID);
    if (role) await member.roles.add(role).catch(() => {});
  }
});

// ================= LOG =================
client.on("messageDelete", (message) => {
  if (!message.guild) return;
  const ch = message.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (ch) ch.send(`🗑️ Silindi: ${message.content || "boş"}`);
});

client.on("messageUpdate", (o, n) => {
  if (!o.guild) return;
  if (o.content === n.content) return;

  const ch = o.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (ch) ch.send(`✏️ Edit\nÖnce: ${o.content}\nSonra: ${n.content}`);
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (i) => {

  if (!i.isButton() && !i.isStringSelectMenu()) return;

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

    await ch.send(`🎟 Ticket Açıldı <@${i.user.id}>`);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Kapat")
        .setStyle(ButtonStyle.Danger)
    );

    await ch.send({ components: [row] });

    return i.reply({ content: "Ticket açıldı", ephemeral: true });
  }

  if (i.customId === "ticket_close") {
    await i.reply("Kapatılıyor...");
    setTimeout(() => i.channel.delete().catch(() => {}), 2000);
  }

  if (i.customId === "giveaway_join") {
    return i.reply({ content: "Katıldın 🎉", ephemeral: true });
  }
});

// ================= LOGIN =================
client.login(TOKEN);
