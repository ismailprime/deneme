const fs = require("fs");

module.exports = (client) => {
  const files = fs.readdirSync("./events");

  for (const file of files) {
    const event = require(`../events/${file}`);

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
};
