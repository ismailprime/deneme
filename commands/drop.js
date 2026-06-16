module.exports = {
  name: "drop",

  async execute(message, client, args) {
    const prize = args.join(" ");

    const msg = await message.channel.send(`⚡ DROP: ${prize}`);

    const collector = msg.channel.createMessageComponentCollector({ max: 1 });

    collector.on("collect", i => {
      msg.edit(`🏆 ${i.user} kazandı!`);
    });
  }
};
