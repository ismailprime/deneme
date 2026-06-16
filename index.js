const {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField
} = require("discord.js");

const TOKEN = process.env.TOKEN;

const LOG_CHANNEL_ID = "1512629605830716257";
const WELCOME_CHANNEL_ID = "1506386634357211187";

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

// 🚀 READY
client.once("ready", async () => {
  console.log(`${client.user.tag} aktif`);

  client.guilds.cache.forEach(async (guild) => {
    const inv = await guild.invites.fetch().catch(() => {});
    invites.set(guild.id, inv);
  });
});

// 👋 WELCOME
client.on("guildMemberAdd", (member) => {
  const ch = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
  if (ch) ch.send(`👋 Hoşgeldin <@${member.id}>`);
});

// 📨 INVITE TRACK
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

// 💬 MESSAGE SYSTEM
client.on("messageCreate", async (message) => {

  if (message.author.bot || !message.guild) return;

  const msg = message.content.toLowerCase().trim();

  // SELAM
  if (["sa", "selam", "selamün aleyküm"].includes(msg)) {
    return message.channel.send(`Aleyküm selam <@${message.author.id}> 👋`);
  }

  // IP
  if (message.content === "!ip") {
    return message.channel.send(`
Java: mc.skyforgenw.com.tr
Sürüm: 1.9 - 1.21.x
    `);
  }

  // -i
  if (message.content === "-i") {
    const c = userInvites.get(message.author.id) || 0;
    return message.channel.send(`📨 Davet: **${c}**`);
  }

  // TICKET PANEL
  if (message.content === "!ticket") {

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("ticket_open")
        .setLabel("🎟 Ticket Aç")
        .setStyle(ButtonStyle.Success)
    );

    message.channel.send({
      content: "Ticket sistemi",
      components: [row]
    });
  }

  // ÇEKİLİŞ
  if (message.content.startsWith("!cekilis")) {

    const args = message.content.split(" ");
    const time = args[1];
    const prize = args.slice(2).join(" ");

    let ms = 60000;
    if (time?.endsWith("m")) ms = parseInt(time) * 60000;
    if (time?.endsWith("h")) ms = parseInt(time) * 3600000;

    const users = [];

    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

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

      if (users.length === 0)
        return msg.edit("Katılım yok");

      const winner = users[Math.floor(Math.random() * users.length)];

      msg.edit(`🏆 Kazanan: <@${winner}>`);
    });
  }
});

client.login(TOKEN);
