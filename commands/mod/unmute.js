const Utils = require("../../modules/utils.js");
const lang = Utils.variables.lang;
const config = Utils.variables.config;
const Embed = Utils.Embed;

module.exports = {
  name: 'unmute',
  run: async (bot, message, args) => {
    let role = Utils.findRole(config.Permissions.Staff_Commands.Unmute, message.guild);
    let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    let muteRole = Utils.findRole(config.Punishment_System.Mute_Role, message.guild);

    if (!role) return message.channel.send(Embed({ preset: 'console' }));
    let logs = Utils.findChannel(config.Logs.Punishments.Channel, message.guild, type = 'text');
    if (config.Logs.Punishments.Enabled == true && !logs) return message.channel.send(Embed({ preset: 'console' }));
    if (!muteRole) return message.channel.send(Embed({ preset: 'console' }));
    if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Unmute)) return message.channel.send(Embed({ preset: 'nopermission' }));

    if (!args[0]) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }))
    if (!user) return message.channel.send(Embed({ preset: 'error', description: lang.GlobalErrors.InvalidUser, usage: module.exports.usage }))
    if (config.Punishment_System.Punish_Staff === true) {
      if (user.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishStaffHigher }))
    } else {
      let toMutePermissions = user.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
      if (toMutePermissions) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishStaff }))
    }
    if (user.user.bot == true || user.id == message.author.id) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishUser }));
    if (message.guild.members.find(m => m.id === bot.user.id).highestRole.calculatedPosition <= user.highestRole.calculatedPosition) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.BotCantPunishUser }))
    if (!user.roles.get(muteRole.id)) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Commands.Unmute.Errors.UserNotMuted }));

    user.removeRole(muteRole.id);

    if (config.Logs.Punishments.Enabled == true) {
      logs.send(Embed({
        title: lang.ModerationModule.Commands.Unmute.Embeds.Log.Title,
        fields: [{ name: lang.ModerationModule.Commands.Unmute.Embeds.Log.Fields[0], value: `${user} (${user.id})`, inline: true }, { name: lang.ModerationModule.Commands.Unmute.Embeds.Log.Fields[1], value: message.author, inline: true }],
        timestamp: new Date()
      }))
    }

    message.channel.send(Embed({ title: lang.ModerationModule.Commands.Unmute.Embeds.Unmuted.Title, description: lang.ModerationModule.Commands.Unmute.Embeds.Unmuted.Description.replace(/{user}/g, user).replace(/{userid}/g, user.id), color: config.Success_Color }));
  },
  description: lang.Help.CommandDescriptions.Unmute,
  usage: 'unmute <@user> [reason]',
  aliases: []
}