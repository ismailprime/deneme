const config = require("../config/config");

module.exports = {
  name: "guildMemberAdd",

  execute(member) {
    const channel = member.guild.systemChannel;
    if (!channel) return;

    channel.send(`👋 <@${member.id}> aramıza hoşgeldin!`);

    const role = member.guild.roles.cache.get(config.autoRole);
    if (role) member.roles.add(role);
  }
};
