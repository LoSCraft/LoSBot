const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");

module.exports = {
    name: 'report',
    run: async (bot, message, args) => {
        let user = Utils.ResolveUser(message);
        let channel = Utils.findChannel(config.Channels.Reports, message.guild)
        let reason = args.slice(1).join(" ")

        if (!channel) return message.channel.send(Embed({ preset: 'console' }))
        if (!args[0]) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
        if (!user) return message.channel.send(Embed({ preset: 'error', description: lang.GlobalErrors.InvalidUser, usage: module.exports.usage }));
        if (user.bot) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Commands.Report.Errors.ReportBot }));
        if (user.id === message.author.id) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Commands.Report.Errors.ReportSelf }));
        if (!args[1]) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Commands.Report.Errors.InvalidReason, usage: module.exports.usage }));

        channel.send(Embed({
            title: lang.ModerationModule.Commands.Report.Embeds.Report.Title,
            fields: [
                { name: lang.ModerationModule.Commands.Report.Embeds.Report.Fields[0], value: '<@' + user.id + '>' },
                { name: lang.ModerationModule.Commands.Report.Embeds.Report.Fields[1], value: '<@' + message.author.id + '>' },
                { name: lang.ModerationModule.Commands.Report.Embeds.Report.Fields[2], value: reason },
            ],
            timestamp: new Date()
        }))
        message.channel.send(Embed({ title: lang.ModerationModule.Commands.Report.Embeds.Reported.Title, description: lang.ModerationModule.Commands.Report.Embeds.Reported.Description }));
    },
    description: lang.Help.CommandDescriptions.Report,
    usage: 'report <@user> <reason>',
    aliases: []
}