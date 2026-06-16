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

// 📊 READY
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

// 📊 INVITE TRACK REAL
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
    const count = userInvites.get(used.inviter.id) || 0;
    userInvites.set(used.inviter.id, count + 1);
  }

  invites.set(member.guild.id, fresh);
});

// 💬 MESSAGE SYSTEM
client.on("messageCreate", async (message) => {

  if (message.author.bot || !message.guild) return;

  const msg = message.content.toLowerCase().trim();

  // SELAM
  if (["sa","selam","selamün aleyküm","selamun aleyküm"].includes(msg)) {
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
});

// 📊 LOG SYSTEM
function sendLog(guild, text) {
  const ch = guild.channels.cache.get(LOG_CHANNEL_ID);
  if (!ch) return;

  ch.send(`📊 LOG\n${text}`).catch(() => {});
}

client.on("messageDelete", (m) => {
  if (!m.guild) return;
  sendLog(m.guild, `🗑️ Silindi: ${m.content || "boş"}`);
});

client.on("messageUpdate", (o, n) => {
  if (!o.guild) return;
  if (o.content === n.content) return;

  sendLog(o.guild, `✏️ Edit\nÖnce: ${o.content}\nSonra: ${n.content}`);
});

client.login(TOKEN);
