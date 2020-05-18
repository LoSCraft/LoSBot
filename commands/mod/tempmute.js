const Utils = require("../../modules/utils.js");
const Discord = require("discord.js");
const ms = require("ms");
const lang = Utils.variables.lang;
const config = Utils.variables.config;
const Embed = Utils.Embed;

module.exports = {
  name: 'tempmute',
  run: async (bot, message, args) => {
    let role = Utils.findRole(config.Permissions.Staff_Commands.Tempmute, message.guild);
    let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    let length = args[1];
    let reason = args.slice(2).join(" ");
    let muteRole = Utils.findRole(config.Punishment_System.Mute_Role, message.guild);

    if (!role) return message.channel.send(Embed({ preset: 'console' }));
    let logs = Utils.findChannel(config.Logs.Punishments.Channel, message.guild, type = 'text');
    if (config.Logs.Punishments.Enabled == true && !logs) return message.channel.send(Embed({ preset: 'console' }));
    if (!muteRole) return message.channel.send(Embed({ preset: 'console' }));
    if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Tempmute)) return message.channel.send(Embed({ preset: 'nopermission' }));

    if (!args[0]) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
    if (!user) return message.channel.send(Embed({ preset: 'error', description: lang.GlobalErrors.InvalidUser, usage: module.exports.usage }));
    if (config.Punishment_System.Punish_Staff === true) {
      if (user.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishStaffHigher }));
    } else {
      let toMutePermissions = user.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
      if (toMutePermissions) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishStaff }));
    }
    if (user.user.bot == true || user.id == message.author.id) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishUser }));
    if (!args[1] || !ms(args[1] || !reason)) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
    if (message.guild.members.find(m => m.id === bot.user.id).highestRole.calculatedPosition <= user.highestRole.calculatedPosition) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.BotCantPunishUser }));

    user.addRole(muteRole.id);
    await Utils.variables.db.update.punishments.addPunishment({
      type: module.exports.name,
      user: user.id,
      tag: user.user.tag,
      reason: reason,
      time: message.createdAt.getTime(),
      executor: message.author.id,
      length: ms(args[1])
    })

    if (config.Logs.Punishments.Enabled == true) {
      logs.send(Embed({
        title: lang.ModerationModule.LogEmbed.Title,
        fields: [
          { name: lang.ModerationModule.LogEmbed.Fields[0], value: `${user} (${user.id})`, inline: true },
          { name: lang.ModerationModule.LogEmbed.Fields[1], value: `<@${message.author.id}>`, inline: true },
          { name: lang.ModerationModule.LogEmbed.Fields[2], value: module.exports.name, inline: true },
          { name: lang.ModerationModule.LogEmbed.Fields[3], value: reason, inline: true },
          { name: lang.ModerationModule.LogEmbed.Fields[5], value: length, inline: true }
        ],
        footer: lang.ModerationModule.LogEmbed.Footer.replace(/{id}/g, await Utils.variables.db.get.getPunishmentID()),
        thumbnail: lang.ModerationModule.Commands.Tempmute.Thumbnail,
        timestamp: new Date()
      }))
    }
    message.channel.send(Embed({ title: lang.ModerationModule.Commands.Tempmute.Embeds.Muted.Title, description: lang.ModerationModule.Commands.Tempmute.Embeds.Muted.Description.replace(/{user}/g, user).replace(/{userid}/g, user.id), color: config.Success_Color }));

    setTimeout(function () {
      user.removeRole(muteRole.id);
      message.channel.send('<@' + user.id + '>').then(msg => msg.delete(2000));
      message.channel.send(Embed({ title: lang.ModerationModule.Commands.Tempmute.Embeds.Unmuted.Title, description: lang.ModerationModule.Commands.Tempmute.Embeds.Unmuted.Description.replace(/{user}/g, user) }));
    }, ms(args[1]));
  },
  description: lang.Help.CommandDescriptions.Tempmute,
  usage: 'tempmute <@user> <length> <reason>',
  aliases: []
}