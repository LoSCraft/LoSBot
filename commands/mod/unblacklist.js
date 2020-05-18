const Utils = require("../../modules/utils.js");
const lang = Utils.variables.lang;
const config = Utils.variables.config;
const Embed = Utils.Embed;

module.exports = {
    name: 'unblacklist',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Permissions.Staff_Commands.Unblacklist, message.guild);
        let user = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        let blacklistRole = Utils.findRole(config.Punishment_System.Blacklist_Role, message.guild);

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        let logs = Utils.findChannel(config.Logs.Punishments.Channel, message.guild, type = 'text');
        if (config.Logs.Punishments.Enabled == true && !logs) return message.channel.send(Embed({ preset: 'console' }));
        if (!blacklistRole) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Unblacklist)) return message.channel.send(Embed({ preset: 'nopermission' }));

        if (!args[0]) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }))
        if (!user) return message.channel.send(Embed({ preset: 'error', description: lang.GlobalErrors.InvalidUser, usage: module.exports.usage }))
        if (config.Punishment_System.Punish_Staff === true) {
            if (user.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishStaffHigher }))
        } else {
            let toBlacklistPermissions = user.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
            if (toBlacklistPermissions) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishStaff }))
        }
        if (user.user.bot == true || user.id == message.author.id) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishUser }));
        if (message.guild.members.find(m => m.id === bot.user.id).highestRole.calculatedPosition <= user.highestRole.calculatedPosition) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.BotCantPunishUser }))
        if (!user.roles.get(blacklistRole.id)) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Commands.Unblacklist.Errors.UserNotBlacklisted }));

        user.removeRole(blacklistRole.id);

        if (config.Logs.Punishments.Enabled == true) {
            logs.send(Embed({
                title: lang.ModerationModule.Commands.Unblacklist.Embeds.Log.Title,
                fields: [{ name: lang.ModerationModule.Commands.Unblacklist.Embeds.Log.Fields[0], value: `<@${user.id}> (${user.id})`, inline: true }, { name: lang.ModerationModule.Commands.Unblacklist.Embeds.Log.Fields[1], value: `<@${message.author.id}>`, inline: true }],
                timestamp: new Date()
            }))
        }

        message.channel.send(Embed({ title: lang.ModerationModule.Commands.Unblacklist.Embeds.Unblacklisted.Title, description: lang.ModerationModule.Commands.Unblacklist.Embeds.Unblacklisted.Description.replace(/{user}/g, user).replace(/{userid}/g, user.id), color: config.Success_Color }))
    },
    description: lang.Help.CommandDescriptions.Unblacklist,
    usage: 'unblacklist <@user> [reason]',
    aliases: []
}