const {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder
} = require("discord.js");

// ⚠️ ENV
const TOKEN = process.env.TOKEN;
const MEMBER_ROLE = process.env.MEMBER_ROLE;
const LOG_CHANNEL_ID = process.env.LOG_CHANNEL_ID; // 🔥 FIX BURASI

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

// ================= COMMAND SYSTEM =================
client.commands = new Map();

const fs = require("fs");
const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of files) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.name, cmd);
}

// ================= MESSAGE =================
client.on("messageCreate", (message) => {

  if (message.author.bot) return;

  if (!message.content.startsWith("!")) return;

  const args = message.content.slice(1).split(" ");
  const cmdName = args.shift();

  const cmd = client.commands.get(cmdName);
  if (!cmd) return;

  cmd.execute(message, client, args);
});

// ================= INTERACTIONS =================
client.on("interactionCreate", (i) => {
  require("./events/interactionCreate").execute(i, client);
});

// ================= READY =================
client.once("ready", () => {
  console.log(`${client.user.tag} aktif`);
});

// ================= SAFE LOG EXAMPLE =================
client.on("messageDelete", async (message) => {
  if (!LOG_CHANNEL_ID) return;
  if (!message.guild) return;

  const log = message.guild.channels.cache.get(LOG_CHANNEL_ID);
  if (!log) return;

  log.send(`🗑️ Mesaj silindi: ${message.content || "boş"}`);
});

client.login(TOKEN);
