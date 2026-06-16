const ms = require("ms");

module.exports = {
  name: "cekilis",

  async execute(message, client, args) {
    const time = ms(args[0]);
    const prize = args.slice(1).join(" ");

    const msg = await message.channel.send(`🎉 ÇEKİLİŞ: **${prize}**`);

    setTimeout(() => {
      const winner = message.guild.members.cache.random();
      message.channel.send(`🏆 Kazanan: <@${winner.id}> 🎉`);
    }, time);
  }
};
