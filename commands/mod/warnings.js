const Utils = require("../../modules/utils.js");
const lang = Utils.variables.lang;
const config = Utils.variables.config;
const Embed = Utils.Embed;

module.exports = {
    name: 'warnings',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Permissions.Staff_Commands.Warn, message.guild);
        let user = Utils.ResolveUser(message) || message.member;

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Warn)) return message.channel.send(Embed({ preset: 'nopermission' }));
        if (!user) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));

        const warnings = await Utils.variables.db.get.getWarnings(user);

        if (!warnings || warnings.length == 0) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Commands.Warnings.Errors.NoHistory.replace(/{user}/g, user.user.tag) }))

        message.channel.send(Embed({
            title: lang.ModerationModule.Commands.Warnings.Embed.Title.replace(/{user}/g, user.user.username),
            footer: { text: user.user ? user.user.tag : user.tag, icon: user.user.displayAvatarURL },
            description: warnings.map(warning => `${lang.ModerationModule.Commands.Warnings.Embed.Fields[0]}${warning.id}\n${lang.ModerationModule.Commands.Warnings.Embed.Fields[1]}${warning.reason}\n${lang.ModerationModule.Commands.Warnings.Embed.Fields[2]}${new Date(warning.time).toLocaleString()}`).join("\n\n"),
            timestamp: new Date()
        }));
    },
    description: lang.Help.CommandDescriptions.Warnings,
    usage: 'warnings [@user]',
    aliases: []
}