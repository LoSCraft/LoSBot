const Utils = require("../../modules/utils.js");
const Embed = Utils.Embed;
const Discord = Utils.Discord;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");

module.exports = {
    name: 'removewarn',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Permissions.Staff_Commands.Removewarn, message.guild);
        let user = Utils.ResolveUser(message);
        let reason = args.slice(2).join(" ");

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        let logs = Utils.findChannel(config.Logs.Punishments.Channel, message.guild, type = 'text');
        if (config.Logs.Punishments.Enabled == true && !logs) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Removewarn)) return message.channel.send(Embed({ preset: 'nopermission' }));
        if (!user || args.length < 2) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
        if (!reason) reason = 'N/A';

        const warnings = await Utils.variables.db.get.getWarnings(user.id);

        if (!warnings || warnings.length == 0) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Commands.Removewarn.Errors.NoHistory, usage: module.exports.usage }));

        const warning = await Utils.variables.db.get.getWarning(args[1]);

        if (!warning) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Commands.Removewarn.Errors.InvalidID, usage: module.exports.usage }));
        await Utils.variables.db.update.punishments.removeWarning(warning.id);

        message.channel.send(Embed({ title: lang.ModerationModule.Commands.Removewarn.Embeds.Removed.Title, description: lang.ModerationModule.Commands.Removewarn.Embeds.Removed.Description.replace(/{id}/g, warning.id), color: config.Success_Color }));
        (user.send(Embed({ title: lang.ModerationModule.Commands.Removewarn.Embeds.Notification.Title, description: lang.ModerationModule.Commands.Removewarn.Embeds.Notification.Description.replace(/{id}/g, warning.id).replace(/{reason}/g, reason), color: config.Success_Color }))).catch(err => { });

        if (config.Logs.Punishments.Enabled == true) {
            logs.send(Embed({
                title: lang.ModerationModule.Commands.Removewarn.Embeds.Log.Title,
                fields: [
                    { name: lang.ModerationModule.Commands.Removewarn.Embeds.Log.Fields[0], value: `${user} (${user.id})`, inline: true },
                    { name: lang.ModerationModule.Commands.Removewarn.Embeds.Log.Fields[1], value: '<@' + message.author.id + '>', inline: true },
                    { name: lang.ModerationModule.Commands.Removewarn.Embeds.Log.Fields[2], value: reason, inline: true }
                ],
                footer: lang.ModerationModule.Commands.Removewarn.Embeds.Log.Footer.replace(/{id}/g, warning.id),
                thumbnail: lang.ModerationModule.Commands.Removewarn.Embeds.Log.Thumbnail,
                timestamp: new Date()
            }));
        }
    },
    description: lang.Help.CommandDescriptions.Removewarn,
    usage: 'remwarn <@user> <id> [reason]',
    aliases: ['remwarn', 'deletewarn', 'delwarn']
}