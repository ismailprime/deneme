const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

// 📦 COMMAND LOAD
client.commands = new Map();

const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.name, cmd);
}

// 💬 MESSAGE COMMAND HANDLER
client.on("messageCreate", message => {
  if (!message.content.startsWith("!")) return;

  const args = message.content.slice(1).split(" ");
  const name = args.shift();

  const command = client.commands.get(name);
  if (!command) return;

  command.execute(message, client, args);
});

// 🎯 INTERACTION HANDLER
client.on("interactionCreate", interaction => {
  require("./events/interactionCreate").execute(interaction, client);
});

client.login("TOKEN_BURAYA");
