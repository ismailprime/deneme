module.exports = {
  name: "ticket",

  async execute(message) {
    const channel = await message.guild.channels.create({
      name: `ticket-${message.author.username}`,
      type: 0
    });

    channel.send(`🎟 Ticket açıldı <@${message.author.id}>`);
  }
};
