const config = require("../config/config");

module.exports = {
  name: "messageCreate",

  execute(message, client) {
    if (message.author.bot) return;

    const msg = message.content.toLowerCase();

    if (["sa", "selam", "selamün aleyküm"].includes(msg)) {
      return message.reply("Aleyküm selam ❤️");
    }

    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd);
    if (!command) return;

    command.execute(message, client, args);
  }
};
