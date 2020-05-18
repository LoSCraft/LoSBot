const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");

module.exports = {
  name: 'blacklist',
  run: async (bot, message, args) => {
    const role = Utils.findRole(config.Permissions.Staff_Commands.Blacklist, message.guild);
    const blacklistRole = Utils.findRole(config.Punishment_System.Blacklist_Role, message.guild)
    const user = Utils.ResolveUser(message);
    const reason = args.slice(1).join(" ");

    if (!role) return message.channel.send(Embed({ preset: 'console' }));
    let logs = Utils.findChannel(config.Logs.Punishments.Channel, message.guild, type = 'text');
    if (config.Logs.Punishments.Enabled == true && !logs) return message.channel.send(Embed({ preset: 'console' }));
    if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Blacklist)) return message.channel.send(Embed({ preset: 'nopermission' }));

    if (args.length == 0) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }))
    if (!user) return message.channel.send(Embed({ preset: 'error', description: lang.GlobalErrors.InvalidUser, usage: module.exports.usage }))
    if (user.roles.get(blacklistRole.id)) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.UserAlreadyPunished }));
    if (config.Punishment_System.Punish_Staff === true) {
      if (user.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition) return message.channel.send(Embed({
        preset: 'error', description: lang.ModerationModule.Errors.CantPunishStaffHigher
      }))
    } else {
      let toBlacklistPermissions = user.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
      if (toBlacklistPermissions) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishStaff }))
    }
    if (user.user.bot == true || user.id == message.author.id) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishUser }));
    if (!reason) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }))
    if (message.guild.members.find(m => m.id === bot.user.id).highestRole.calculatedPosition <= user.highestRole.calculatedPosition) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.BotCantPunishUser }))

    user.addRole(blacklistRole.id)
    await Utils.variables.db.update.punishments.addPunishment({
      type: module.exports.name,
      user: user.id,
      tag: user.user.tag,
      reason: reason,
      time: message.createdAt.getTime(),
      executor: message.author.id
    })
    if (config.Logs.Punishments.Enabled == true) {
      logs.send(Embed({
        title: lang.ModerationModule.LogEmbed.Title,
        fields: [
          { name: lang.ModerationModule.LogEmbed.Fields[0], value: `${user} (${user.id})`, inline: true },
          { name: lang.ModerationModule.LogEmbed.Fields[1], value: `<@${message.author.id}>`, inline: true },
          { name: lang.ModerationModule.LogEmbed.Fields[2], value: module.exports.name, inline: true },
          { name: lang.ModerationModule.LogEmbed.Fields[3], value: reason, inline: true }
        ],
        footer: lang.ModerationModule.LogEmbed.Footer.replace(/{id}/g, await Utils.variables.db.get.getPunishmentID()),
        thumbnail: lang.ModerationModule.Commands.Blacklist.Thumbnail,
        timestamp: new Date()
      }))
    }
    message.channel.send(Embed({ title: lang.ModerationModule.Commands.Blacklist.Title, description: lang.ModerationModule.Commands.Blacklist.Description.replace(/{user}/g, user).replace(/{userid}/g, user.id), color: config.Success_Color }));
  },
  description: lang.Help.CommandDescriptions.Blacklist,
  usage: 'blacklist <@user> <reason>',
  aliases: [

  ]
}