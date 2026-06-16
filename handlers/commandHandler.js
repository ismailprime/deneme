const fs = require("fs");

module.exports = (client) => {
  const files = fs.readdirSync("./commands");

  for (const file of files) {
    const cmd = require(`../commands/${file}`);
    client.commands.set(cmd.name, cmd);
  }
};
