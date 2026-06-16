module.exports = {
  name: "drop",

  async execute(message, client, args) {
    const prize = args.join(" ");

    const msg = await message.channel.send(`⚡ DROP BAŞLADI: **${prize}** (ilk tıklayan kazanır)`);

    const filter = i => !i.user.bot;

    const collector = msg.channel.createMessageComponentCollector({ filter, max: 1 });

    collector.on("collect", i => {
      msg.edit(`🏆 ${i.user} kazandı! Ödül: ${prize} (ticket aç)`);
    });
  }
};
