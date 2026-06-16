const ms = require("ms");

module.exports = {
  name: "cekilis",

  async execute(message, client, args) {
    if (!args[0]) return message.reply("Süre yaz!");

    const time = ms(args[0]);
    const prize = args.slice(1).join(" ");

    if (!prize) return message.reply("Ödül yaz!");

    const msg = await message.channel.send(`🎉 ÇEKİLİŞ BAŞLADI! Ödül: **${prize}**`);

    setTimeout(() => {
      const winner = message.guild.members.cache.random();
      msg.reply(`🏆 Kazanan: <@${winner.id}>`);
    }, time);
  }
};
