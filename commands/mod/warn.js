const Utils = require("../../modules/utils.js");
const lang = Utils.variables.lang;
const config = Utils.variables.config;
const Embed = Utils.Embed;

module.exports = {
    name: 'warn',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Permissions.Staff_Commands.Warn, message.guild);
        let user = Utils.ResolveUser(message);
        let reason = args.slice(1).join(" ");

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        let logs = Utils.findChannel(config.Logs.Punishments.Channel, message.guild, type = 'text');
        if (config.Logs.Punishments.Enabled == true && !logs) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Warn)) return message.channel.send(Embed({ preset: 'nopermission' }));
        if (!user || !args[0] || !reason) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
        if (config.Punishment_System.Punish_Staff === true) {
            if (user.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishStaffHigher }))
        } else {
            let toWarnPermissions = user.roles.sort((a, b) => b.calculatedPosition - a.calculatedPosition).first().calculatedPosition >= role.calculatedPosition;
            if (toWarnPermissions) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishStaff }))
        }
        if (user.user.bot == true || user.id == message.author.id) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Errors.CantPunishUser }));

        await Utils.variables.db.update.punishments.addWarning({
            user: user.id,
            tag: user.user.tag,
            reason: reason,
            time: message.createdAt.getTime(),
            executor: message.author.id
        })

        let warns = await Utils.variables.db.get.getWarnings(user);

        user.send(Embed({ title: lang.ModerationModule.Commands.Warn.Embeds.DM.Title, fields: [{ name: lang.ModerationModule.Commands.Warn.Embeds.DM.Fields[0], value: message.guild.name }, { name: lang.ModerationModule.Commands.Warn.Embeds.DM.Fields[1], value: reason }, { name: lang.ModerationModule.Commands.Warn.Embeds.DM.Fields[2], value: warns.length }], color: config.Error_Color })).catch(err => { });

        if (config.Logs.Punishments.Enabled == true) {
            logs.send(Embed({
                title: lang.ModerationModule.LogEmbed.Title,
                fields: [
                    { name: lang.ModerationModule.LogEmbed.Fields[0], value: `${user} (${user.id})`, inline: true },
                    { name: lang.ModerationModule.LogEmbed.Fields[1], value: `<@${message.author.id}>`, inline: true },
                    { name: lang.ModerationModule.LogEmbed.Fields[2], value: module.exports.name, inline: true },
                    { name: lang.ModerationModule.LogEmbed.Fields[3], value: reason, inline: true },
                    { name: lang.ModerationModule.LogEmbed.Fields[4], value: warns.length, inline: true }
                ],
                footer: lang.ModerationModule.Commands.Warn.Embeds.Log.Footer.replace(/{id}/g, warns[warns.length - 1].id),
                thumbnail: lang.ModerationModule.Commands.Warn.Embeds.Log.Thumbnail,
                timestamp: new Date()
            }))
        }
        message.channel.send(Embed({ title: lang.ModerationModule.Commands.Warn.Embeds.Warned.Title, description: lang.ModerationModule.Commands.Warn.Embeds.Warned.Description.replace(/{user}/g, user).replace(/{userid}/g, user.id), color: config.Success_Color }));
    },
    description: lang.Help.CommandDescriptions.Warn,
    usage: 'warn <@user> <reason>',
    aliases: []
}