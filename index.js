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

// 📌 ID’LER
const LOG_CHANNEL_ID = "1512629605830716257";
const WELCOME_CHANNEL_ID = "1506386634357211187";

// 📊 CLIENT
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

// 📊 INVITES
const invites = new Map();
const userInvites = new Map();

// ================= READY =================
client.once("ready", async () => {
  console.log(`${client.user.tag} aktif`);

  client.guilds.cache.forEach(async (guild) => {
    const inv = await guild.invites.fetch().catch(() => {});
    invites.set(guild.id, inv);
  });
});

// ================= WELCOME =================
client.on("guildMemberAdd", (member) => {
  const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (ch) ch.send(`👋 Hoşgeldin <@${member.id}>`);
});

// ================= INVITE TRACK =================
client.on("inviteCreate", async (invite) => {
  const g = invites.get(invite.guild.id) || new Map();
  g.set(invite.code, invite);
  invites.set(invite.guild.id, g);
});

client.on("guildMemberAdd", async (member) => {

  const cached = invites.get(member.guild.id);
  const fresh = await member.guild.invites.fetch().catch(() => {});

  const used = fresh.find(i =>
    (cached?.get(i.code)?.uses || 0) < i.uses
  );

  if (used?.inviter) {
    const c = userInvites.get(used.inviter.id) || 0;
    userInvites.set(used.inviter.id, c + 1);
  }

  invites.set(member.guild.id, fresh);
});

// ================= LOG =================
function log(guild, text) {
  const ch = guild.channels.cache.get(LOG_CHANNEL_ID);
  if (!ch) return;
  ch.send(`📊 LOG\n${text}`).catch(() => {});
}

client.on("messageDelete", (m) => {
  if (!m.guild) return;
  log(m.guild, `🗑️ Silindi: ${m.content || "boş"}`);
});

client.on("messageUpdate", (o, n) => {
  if (!o.guild) return;
  if (o.content === n.content) return;

  log(o.guild, `✏️ Edit\nÖnce: ${o.content}\nSonra: ${n.content}`);
});

// ================= MESSAGE =================
client.on("messageCreate", async (message) => {

  if (message.author.bot || !message.guild) return;

  const msg = message.content.toLowerCase().trim();

  // SELAM
  if (["sa","selam","selamün aleyküm"].includes(msg)) {
    return message.channel.send(`Aleyküm selam <@${message.author.id}> 👋`);
  }

  // IP
  if (message.content === "!ip") {
    return message.channel.send(`mc.skyforgenw.com.tr`);
  }

  // -i
  if (message.content === "-i") {
    const c = userInvites.get(message.author.id) || 0;
    return message.channel.send(`📨 Davet: **${c}**`);
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
      content: "Ticket sistemi",
      components: [row]
    });
  }

  // 🎉 ÇEKİLİŞ
  if (message.content.startsWith("!cekilis")) {

    const args = message.content.split(" ");
    const time = args[1];
    const prize = args.slice(2).join(" ");

    let ms = 60000;
    if (time?.endsWith("m")) ms = parseInt(time) * 60000;
    if (time?.endsWith("h")) ms = parseInt(time) * 3600000;

    const users = [];

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("giveaway_join")
        .setLabel("Katıl")
        .setStyle(ButtonStyle.Success)
    );

    const msg = await message.channel.send({
      content: `🎉 ${prize}`,
      components: [row]
    });

    const collector = msg.createMessageComponentCollector({ time: ms });

    collector.on("collect", (i) => {
      if (!users.includes(i.user.id)) {
        users.push(i.user.id);
        i.reply({ content: "Katıldın", ephemeral: true });
      }
    });

    collector.on("end", () => {
      if (users.length === 0) return msg.edit("Katılım yok");

      const winner = users[Math.floor(Math.random() * users.length)];

      msg.edit(`🏆 Kazanan: <@${winner}>`);
    });
  }
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (i) => {

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
            PermissionsBitField.Flags.SendMessages
          ]
        }
      ]
    });

    await ch.send(`🎟 Ticket Açıldı\n${rolePing}\n<@${i.user.id}>`);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_close")
        .setLabel("Kapat")
        .setStyle(ButtonStyle.Danger)
    );

    await ch.send({ components: [row] });

    return i.reply({ content: "Ticket açıldı", ephemeral: true });
  }

  // CLOSE
  if (i.customId === "ticket_close") {
    await i.reply("Kapatılıyor...");
    setTimeout(() => i.channel.delete().catch(() => {}), 2000);
  }

  // GIVEAWAY BUTTON
  if (i.customId === "giveaway_join") {
    return i.reply({ content: "Katıldın", ephemeral: true });
  }
});

client.login(TOKEN);
