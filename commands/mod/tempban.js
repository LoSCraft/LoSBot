const Utils = require("../../modules/utils.js");
const ms = require("ms");
const lang = Utils.variables.lang;
const config = Utils.variables.config;
const Embed = Utils.Embed;

module.exports = {
    name: 'tempban',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Permissions.Staff_Commands.Tempban, message.guild);
        let user = message.mentions.members.first() || message.guild.members.get(args[0]);
        let length = args[1];
        let reason = args.slice(2).join(" ");

        let muteRole = Utils.findRole(config.Punishment_System.Mute_Role, message.guild);

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        let logs = Utils.findChannel(config.Logs.Punishments.Channel, message.guild, type = 'text');
        if (config.Logs.Punishments.Enabled == true && !logs) return message.channel.send(Embed({ preset: 'console' }));
        if (!muteRole) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Tempban)) return message.channel.send(Embed({ preset: 'nopermission' }));

        if (!args[0]) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
        if (!user) return message.channel.send(Embed({ preset: 'error', description: lang.GlobalErrors.InvalidUser, usage: module.exports.usage }));
        if (config.Punishment_System.Punish_Staff === true) {
            if (user.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishStaffHigher }));
        } else {
            let toBanPermissions = user.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
            if (toBanPermissions) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishStaff }));
        }
        if (user.user.bot == true || user.id == message.author.id) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishUser }));
        if (!args[1] || !ms(args[1] || !reason)) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
        if (message.guild.members.find(m => m.id === bot.user.id).highestRole.calculatedPosition <= user.highestRole.calculatedPosition) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.BotCantPunishUser }));

        user.ban(reason);
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
                thumbnail: lang.ModerationModule.Commands.Tempban.Thumbnail,
                timestamp: new Date()
            }))
        }

        message.channel.send(Embed({ title: lang.ModerationModule.Commands.Tempban.Embeds.Banned.Title, description: lang.ModerationModule.Commands.Tempban.Embeds.Banned.Description.replace(/{user}/g, user).replace(/{userid}/g, user.id), color: config.Success_Color }));

        setTimeout(function () {
            message.guild.unban(user, 'Tempban complete - Length: ' + length + ' Punished By: ' + message.author.tag);
            message.channel.send(Embed({ title: lang.ModerationModule.Commands.Tempban.Embeds.Unbanned.Title, description: lang.ModerationModule.Commands.Tempban.Embeds.Unbanned.Description.replace(/{user}/g, user) }));
        }, ms(args[1]));
    },
    description: lang.Help.CommandDescriptions.Tempban,
    usage: 'tempban <@user> <length> <reason>',
    aliases: []
}
