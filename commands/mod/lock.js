const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");

module.exports = {
  name: 'lock',
  run: async (bot, message, args) => {
    let role = Utils.findRole(config.Permissions.Staff_Commands.Lock, message.guild);

    if (!role) return message.channel.send(Embed({ preset: 'console' }));
    let logs = Utils.findChannel(config.Logs.Punishments.Channel, message.guild, type = 'text');
    if (config.Logs.Punishments.Enabled == true && !logs) return message.channel.send(Embed({ preset: 'console' }));
    if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Lock)) return message.channel.send(Embed({ preset: 'nopermission' }));

    await Utils.asyncForEach(message.guild.roles.array(), async (r, i) => {
      let overwrites;
      if (Object.values(config.Lock_Unlock.Ignore).find(i => i.toLowerCase() == r.name.toLowerCase())) return;
      if (Object.values(config.Lock_Unlock.Whitelisted).find(w => w.toLowerCase() == r.name.toLowerCase())) overwrites = { SEND_MESSAGES: true }
      else overwrites = { SEND_MESSAGES: false };
      await message.channel.overwritePermissions(r.id, overwrites).catch(err => {
        throw err;
      });
    });

    message.channel.send(Embed({
      color: config.Success_Color,
      title: lang.ModerationModule.Commands.Lock.Locked
    }))

    if (config.Logs.Punishments.Enabled == true) {
      logs.send(Embed({
        title: lang.ModerationModule.Commands.Lock.Log.Title,
        fields: [{ name: lang.ModerationModule.Commands.Lock.Log.Fields[0], value: '<#' + message.channel.id + '>' }, { name: lang.ModerationModule.Commands.Lock.Log.Fields[1], value: '<@' + message.member.id + '>' }],
        timestamp: new Date(),
        thumbnail: lang.ModerationModule.Commands.Lock.Log.Thumbnail
      }))
    }
  },
  description: lang.Help.CommandDescriptions.Lock,
  usage: 'lock',
  aliases: []
}