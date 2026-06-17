const {
Client,
GatewayIntentBits,
Partials,
PermissionsBitField,
ActionRowBuilder,
ButtonBuilder,
ButtonStyle,
StringSelectMenuBuilder,
EmbedBuilder,
} = require("discord.js");

// ================= CLIENT =================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember
  ]
});

// ================= CONFIG =================

const TOKEN = process.env.TOKEN;
const MEMBER_ROLE = process.env.MEMBER_ROLE;

const OWNER_ID = "1003708560728920165";
const ADMIN_ROLE_ID = "1506368461964705924";
const SUGGESTION_CHANNEL = "1516546289515368608";
const suggestionVotes = {};

// ================= DATA =================

const giveaways = {};
const activeTickets = new Map();
const userInvites = new Map();
const inviteData = new Map();
const inviterCache = new Map();
const leaveCache = new Map();
const guildInvitesCache = new Map();

// ================= READY =================

client.once("ready", async () => {

  console.log(`${client.user.tag} aktif!`);

  client.guilds.cache.forEach(async (guild) => {

    const invites = await guild.invites.fetch().catch(() => null);
    if (!invites) return;

    guildInvitesCache.set(
      guild.id,
      new Map(invites.map(i => [i.code, i.uses]))
    );

    await guild.members.fetch().catch(() => {});
  });

});

// ================= MEMBER JOIN =================

client.on("guildMemberAdd", async (member) => {

member.roles.add(MEMBER_ROLE).catch(() => {});

// INVITE (EĞER ÇALIŞIYORSA)
const newInvites = await member.guild.invites.fetch().catch(() => null);
if (!newInvites) return;

const old = guildInvitesCache.get(member.guild.id);
if (!old) return;

let usedInvite = null;

newInvites.forEach(inv => {
  const oldUses = old.get(inv.code) || 0;
  if (inv.uses > oldUses) usedInvite = inv;
});

guildInvitesCache.set(
  member.guild.id,
  new Map(newInvites.map(i => [i.code, i.uses]))
);

if (usedInvite?.inviter) {
  const inviter = usedInvite.inviter.id;

  inviterCache.set(member.id, inviter);

  if (!inviteData.has(inviter)) {
    inviteData.set(inviter, {
      joins: 0,
      left: 0,
      fake: 0,
      rejoin: 0
    });
  }

  inviteData.get(inviter).joins++;
});

// OWNER ROLE
if (member.id === OWNER_ID) {
  member.roles.add(ADMIN_ROLE_ID).catch(() => {});
}

// WELCOME
const channel = member.guild.channels.cache.find(
  c => c.name === "💬│genel-sohbet"
);

if (channel) {
  channel.send(`👋 Hoşgeldin <@${member.id}>`);
}

});

// ================= MESSAGE =================

client.on("messageCreate", async (message) => {

if (message.author.bot || !message.guild) return;

const isAdmin =
message.member.permissions.has(
PermissionsBitField.Flags.Administrator
);

// ================= ÖNERİ =================

if (message.content.startsWith("!öneri ")) {

  const text = message.content.slice(7);

  if (!text) {
    return message.reply("❌ Bir öneri yaz.");
  }

  const channel =
  message.guild.channels.cache.get(
    SUGGESTION_CHANNEL
  );

  if (!channel) {
    return message.reply(
      "❌ Öneri kanalı bulunamadı."
    );
  }

  const embed = new EmbedBuilder()
    .setColor("#2F9BFF")
    .setTitle("💡 Yeni Bir Öneri Var!")
    .setDescription(
`**Öneren:** <@${message.author.id}>

**Öneri:**
${text}

📊 **İstatistikler**

✅ Olumlu: 0 | ❌ Olumsuz: 0`
    )
    .setTimestamp();

  const row =
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("suggest_yes")
        .setLabel("✅ Olumlu")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("suggest_no")
        .setLabel("❌ Olumsuz")
        .setStyle(ButtonStyle.Danger)
    );

  const suggestionMsg =
    await channel.send({
      embeds: [embed],
      components: [row]
    });

  suggestionVotes[suggestionMsg.id] = {
  yes: [],
  no: []
};

  return message.reply(
    "✅ Önerin gönderildi."
  );
}

const msg = message.content.toLowerCase();

// ================= SELAM =================

if (
[
"sa",
"selam",
"selamün aleyküm",
"selamun aleyküm"
].includes(msg)
) {

return message.channel.send(  
  `Aleyküm selam <@${message.author.id}>, hoşgeldin 👋`  
);

}

// ================= IP =================

if (message.content === "!ip") {

return message.channel.send(

`Java
Sürüm: 1.9 - 1.21.x
mc.skyforgenw.com.tr

Bedrock
Port: 19132
mc.skyforgenw.com.tr`
);
}

  // ================= INVITE =================

if (
    message.content.startsWith("-i") ||
    message.content.startsWith("!invites")
) {

    const user =
        message.mentions.users.first() ||
        message.author;

    const stats = inviteData.get(user.id) || {
        joins: 0,
        left: 0,
        fake: 0,
        rejoin: 0
    };

    const embed = new EmbedBuilder()
        .setColor("#5865F2")
        .setAuthor({
            name: `${user.username} Invite İstatistikleri`,
            iconURL: user.displayAvatarURL()
        })
        .setThumbnail(user.displayAvatarURL())
        .setDescription(
`📨 **Toplam Davet:** **${stats.joins - stats.left}**

✅ **Joins:** ${stats.joins}
❌ **Left:** ${stats.left}
🤖 **Fake:** ${stats.fake}
🔄 **Rejoins:** ${stats.rejoin}`
        )
        .setFooter({
            text: `İsteyen: ${message.author.username}`
        })
        .setTimestamp();

    return message.channel.send({
        embeds: [embed]
    });

}

// ================= TICKET PANEL =================

if (message.content === "!ticketpanel") {

if (!isAdmin) return;  

const row =  
  new ActionRowBuilder().addComponents(  
    new ButtonBuilder()  
      .setCustomId("ticket_open_menu")  
      .setLabel("🎫 Ticket Aç")  
      .setStyle(ButtonStyle.Success)  
  );  

return message.channel.send({  
  content: "🎫 Ticket sistemi aktif",  
  components: [row]  
});

}

// ================= GIVEAWAY =================

if (message.content.startsWith("!cekilis")) {

if (!isAdmin) return;  

const args = message.content.split(" ");  

const time = args[1];  

const prize =  
  args.slice(2).join(" ");  

let ms = 0;  

if (time.endsWith("m"))  
  ms = parseInt(time) * 60000;  

if (time.endsWith("h"))  
  ms = parseInt(time) * 3600000;  

if (time.endsWith("d"))  
  ms = parseInt(time) * 86400000;  

if (!ms) {  

  return message.channel.send(  
    "❌ Geçerli süre gir"  
  );  
}  

const row =  
  new ActionRowBuilder().addComponents(  
    new ButtonBuilder()  
      .setCustomId("join_giveaway")  
      .setLabel("🎉 Katıl")  
      .setStyle(ButtonStyle.Success)  
  );  

const msgGiveaway =  
  await message.channel.send({  
    content:

`🎉 ÇEKİLİŞ

🎁 Ödül: ${prize}
⏰ Süre: ${time}`,
components: [row]
});

giveaways[msgGiveaway.id] = [];  

setTimeout(() => {  

  const users =  
    giveaways[msgGiveaway.id];  

  if (!users || users.length === 0) {  

    return message.channel.send(  
      "❌ Kimse katılmadı"  
    );  
  }  

  const winner =  
    users[  
      Math.floor(  
        Math.random() * users.length  
      )  
    ];  

  message.channel.send(  
    `🏆 Kazanan: <@${winner}>`  
  );  

  delete giveaways[msgGiveaway.id];  

}, ms);

}

// ================= DROP =================

if (message.content.startsWith("!drop ")) {

if (!isAdmin) return;  

const prize =  
  message.content.split(" ").slice(1).join(" ");  

if (!prize) {  

  return message.channel.send(  
    "❌ Ödül yaz"  
  );  
}  

const row =  
  new ActionRowBuilder().addComponents(  
    new ButtonBuilder()  
      .setCustomId("drop_join")  
      .setLabel("🎁 Kap")  
      .setStyle(ButtonStyle.Success)  
  );  

const dropMessage =  
  await message.channel.send({  
    content:

`🎁 DROP BAŞLADI!

🏆 Ödül: ${prize}
⚡ İlk butona basan kazanır!`,
components: [row]
});

giveaways[`drop_${dropMessage.id}`] = {  
  claimed: false  
};

}
});

// ================= INTERACTIONS =================

client.on("interactionCreate", async (interaction) => {

if (
!interaction.isButton() &&
!interaction.isStringSelectMenu()
) return;

// ================= ÖNERİ OYLAMA =================

if (
  interaction.customId === "suggest_yes" ||
  interaction.customId === "suggest_no"
) {

  const data = suggestionVotes[interaction.message.id];

if (!data) {
  return interaction.reply({
    content: "❌ Bu öneri bulunamadı.",
    ephemeral: true
  });
}
  

  if (
    data.yes.includes(interaction.user.id) ||
    data.no.includes(interaction.user.id)
  ) {

    return interaction.reply({
      content:
        "❌ Bu öneriye zaten oy verdin.",
      ephemeral: true
    });
  }

  if (
    interaction.customId === "suggest_yes"
  ) {
    data.yes.push(interaction.user.id);
  } else {
    data.no.push(interaction.user.id);
  }

  const oldEmbed =
    interaction.message.embeds[0];

  const desc =
    oldEmbed.description
      .split("📊")[0];

  const embed = new EmbedBuilder()
    .setColor("#2F9BFF")
    .setTitle("💡 Yeni Bir Öneri Var!")
    .setDescription(
`${desc}

📊 **İstatistikler**

✅ Olumlu: ${data.yes.length} | ❌ Olumsuz: ${data.no.length}`
    )
    .setTimestamp();

  await interaction.message.edit({
    embeds: [embed]
  });

  return interaction.reply({
    content: "✅ Oyun kaydedildi.",
    ephemeral: true
  });
}

// ================= TICKET MENU =================

if (interaction.customId === "ticket_open_menu") {

const menu =  
  new StringSelectMenuBuilder()  
    .setCustomId("ticket_category")  
    .setPlaceholder("Kategori seç")  
    .addOptions(  
      {  
        label: "🐞 Bug Report",  
        value: "bug-report"  
      },  
      {  
        label: "💵 Ödeme ve Muhasebe",  
        value: "odeme-muhasebe"  
      },  
      {  
        label: "🤝 Partnerlik",  
        value: "partnerlik"  
      },  
      {  
        label: "🎁 Çekiliş Ödülü Talep",  
        value: "cekilis-odul"  
      },  
      {  
        label: "📌 Diğer",  
        value: "diger"  
      }  
    );  

return interaction.reply({  
  content: "📂 Kategori seç",  
  components: [  
    new ActionRowBuilder().addComponents(menu)  
  ],  
  ephemeral: true  
});

}

// ================= GIVEAWAY JOIN =================

if (interaction.customId === "join_giveaway") {

const users =  
  giveaways[interaction.message.id];  

if (!users) {  

  return interaction.reply({  
    content: "❌ Çekiliş bitti",  
    ephemeral: true  
  });  
}  

if (users.includes(interaction.user.id)) {  

  return interaction.reply({  
    content: "❌ Zaten katıldın",  
    ephemeral: true  
  });  
}  

users.push(interaction.user.id);  

return interaction.reply({  
  content: "🎉 Çekilişe katıldın",  
  ephemeral: true  
});

}

// ================= DROP BUTTON =================

if (interaction.customId === "drop_join") {

const data =  
  giveaways[`drop_${interaction.message.id}`];  

if (!data) {  

  return interaction.reply({  
    content: "❌ Drop bitti",  
    ephemeral: true  
  });  
}  

if (data.claimed) {  

  return interaction.reply({  
    content: "❌ Drop zaten alındı",  
    ephemeral: true  
  });  
}  

data.claimed = true;  

const disabledRow =  
  new ActionRowBuilder().addComponents(  
    new ButtonBuilder()  
      .setCustomId("drop_ended")  
      .setLabel("🎁 Alındı")  
      .setStyle(ButtonStyle.Secondary)  
      .setDisabled(true)  
  );  

await interaction.message.edit({  
  components: [disabledRow]  
});  

return interaction.reply({  
  content:

`🎉 <@${interaction.user.id}> dropu kaptın!

🎫 Ticket açarak ödülünüzü talep ediniz.`,
ephemeral: false
});
}

// ================= TICKET CREATE =================

if (interaction.customId === "ticket_category") {

const category =  
  interaction.values[0];  

const userId =  
  interaction.user.id;  

if (activeTickets.has(userId)) {  

  return interaction.reply({  
    content:  
      "❌ Zaten açık ticketin var",  
    ephemeral: true  
  });  
}  

const channel =  
  await interaction.guild.channels.create({  
    name: `ticket-${category}-${interaction.user.username}`,

type: 0,  

    permissionOverwrites: [  
      {  
        id: interaction.guild.id,  
        deny: [  
          PermissionsBitField.Flags.ViewChannel  
        ]  
      },  

      {  
        id: userId,  
        allow: [  
          PermissionsBitField.Flags.ViewChannel,  
          PermissionsBitField.Flags.SendMessages,  
          PermissionsBitField.Flags.ReadMessageHistory  
        ]  
      },  

      {  
        id: "1506368461964705924",  
        allow: [  
          PermissionsBitField.Flags.ViewChannel,  
          PermissionsBitField.Flags.SendMessages,  
          PermissionsBitField.Flags.ReadMessageHistory  
        ]  
      },  

      {  
        id: "1506367703810707456",  
        allow: [  
          PermissionsBitField.Flags.ViewChannel,  
          PermissionsBitField.Flags.SendMessages,  
          PermissionsBitField.Flags.ReadMessageHistory  
        ]  
      }  
    ]  
  });  

activeTickets.set(  
  userId,  
  channel.id  
);  

await channel.send({  
  content:

`🎫 Ticket Açıldı

👤 Açan: <@${interaction.user.id}>
📂 Kategori: ${category}

<@&1506368461964705924>
<@&1506367703810707456>`,

components: [  
    new ActionRowBuilder().addComponents(  
      new ButtonBuilder()  
        .setCustomId("ticket_close")  
        .setLabel("🔒 Kapat")  
        .setStyle(ButtonStyle.Danger)  
    )  
  ]  
});  

return interaction.reply({  
  content:  
    `✅ Ticket açıldı: ${channel}`,  
  ephemeral: true  
});

}

// ================= CLOSE =================

if (interaction.customId === "ticket_close") {

const owner =  
  [...activeTickets.entries()]  
  .find(  
    x => x[1] === interaction.channel.id  
  );  

if (owner) {  

  activeTickets.delete(owner[0]);  
}  

await interaction.reply(  
  "🔒 Ticket kapatılıyor..."  
);  

setTimeout(() => {  

  interaction.channel  
    .delete()  
    .catch(() => {});  

}, 2000);

}
});

// ================= MEMBER LEAVE =================

client.on("guildMemberRemove", async (member) => {

    leaveCache.set(member.id, Date.now());

    const inviter = inviterCache.get(member.id);

    if (!inviter) return;

    const data = inviteData.get(inviter);

    if (!data) return;

    data.left++;

});

// ================= LOGIN =================

client.login(TOKEN);
