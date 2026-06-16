module.exports = {
  name: "drop",

  async execute(message, client, args) {
    const prize = args.join(" ");
    if (!prize) return message.reply("Ödül yaz!");

    const msg = await message.channel.send(`⚡ DROP! İlk tıklayan kazanır: **${prize}**`);

    const filter = i => !i.user.bot;

    const collector = msg.channel.createMessageComponentCollector({ filter, max: 1 });

    collector.on("collect", i => {
      msg.edit(`🏆 ${i.user} ödülü kazandı! Ticket açarak alabilirsin.`);
    });
  }
};
