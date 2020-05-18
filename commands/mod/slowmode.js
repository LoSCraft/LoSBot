const Utils = require("../../modules/utils.js");
const Embed = Utils.Embed;
const Discord = Utils.Discord;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'slowmode',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Permissions.Staff_Commands.Slowmode, message.guild);
        let amount = config.Slowmode_Default_Amount;

        if (!role) return message.guild.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Slowmode)) return message.channel.send(Embed({ preset: 'nopermission' }));
        if (!args[0]) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));

        if (args[0].toLowerCase() == 'on') {
            if (!amount) amount = 5;
            message.channel.setRateLimitPerUser(amount, 'Slowmode enabled by ' + message.author.tag);
            message.channel.send(Embed({ title: lang.ModerationModule.Commands.Slowmode.Embeds.Enabled.Title, description: lang.ModerationModule.Commands.Slowmode.Embeds.Enabled.Descriptions[0], color: config.Success_Color }));

        } else if (args[0].toLowerCase() == 'off') {
            message.channel.setRateLimitPerUser(0, 'Slow mode disabled by ' + message.author.tag);
            message.channel.send(Embed({ title: lang.ModerationModule.Commands.Slowmode.Embeds.Disabled.Title, description: lang.ModerationModule.Commands.Slowmode.Embeds.Disabled.Description, color: config.Error_Color }));
        } else {
            amount = parseInt(args[0]);
            if (!amount) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Commands.Slowmode.Errors.InvalidTime, usage: module.exports.usage }));

            message.channel.setRateLimitPerUser(amount, 'Slowmode enabled by ' + message.author.tag);
            message.channel.send(Embed({ title: lang.ModerationModule.Commands.Slowmode.Embeds.Enabled.Title, description: lang.ModerationModule.Commands.Slowmode.Embeds.Enabled.Descriptions[1].replace(/{amount}/g, amount), color: config.Success_Color }));
        }
    },
    description: lang.Help.CommandDescriptions.Slowmode,
    usage: 'slowmode <seconds/on/off>',
    aliases: []
}