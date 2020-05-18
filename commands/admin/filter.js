const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");

module.exports = {
    name: 'filter',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Permissions.Staff_Commands.Filter, message.guild);
        let filter = await Utils.variables.db.get.getFilter();

        if (!role) return message.channel.send(Embed({ preset: 'console' }))
        if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Filter)) return message.channel.send(Embed({ preset: 'nopermission' }));

        if (!args[0] || args[0].toLowerCase() == 'help') return message.channel.send(Embed({
            title: lang.FilterSystem.Commands.Filter.Help.Title,
            description: lang.FilterSystem.Commands.Filter.Help.Description
        }));

        else if (args[0].toLowerCase() == 'list') {
            message.channel.send(Embed({
                title: lang.FilterSystem.Commands.Filter.List.Title,
                timestamp: new Date(message.createdTimestamp),
                thumbnail: bot.user.displayAvatarURL,
                description: filter.join("\n").length == 0 ? lang.FilterSystem.Commands.Filter.NoWordsInFilter : filter.join("\n")
            }))
        }

        else if (args[0].toLowerCase() == 'add') {
            if (!args[1]) return message.channel.send(Embed({ preset: 'invalidargs', usage: 'filter add <word>' }))
            for (let i = 0; i < filter.length; i++) if (filter[i].toLowerCase() == args[1].toLowerCase()) return message.channel.send(Embed({ preset: 'error', description: lang.FilterSystem.Commands.Filter.Add.WordAlreadyInFilter }));
            filter.push(args[1]);
            message.channel.send(Embed({ title: lang.FilterSystem.Commands.Filter.Add.Title, description: lang.FilterSystem.Commands.Filter.Add.Description.replace(/{word}/g, args[1]) }))
            await Utils.variables.db.update.filter.addWord(args[1]);
        }

        else if (args[0].toLowerCase() == "remove") {
            if (!args[1]) return message.channel.send(Embed({ preset: 'invalidargs', usage: 'filter remove <word>' }));
            for (let i = 0; i < filter.length; i++) if (filter[i].toLowerCase() == args[1].toLowerCase()) var found = true;
            if (!found) return message.channel.send(Embed({ preset: 'error', description: lang.FilterSystem.Commands.Filter.Remove.InvalidWord.replace(/{words}/g, filter.join(",").length == 0 ? lang.FilterSystem.Commands.Filter.NoWordsInFilter : filter.join(",")) }))
            for (let i = 0; i < filter.length; i++) if (filter[i].toLowerCase() == args[1].toLowerCase()) filter[i] = "";
            message.channel.send(Embed({ title: lang.FilterSystem.Commands.Filter.Remove.Title, description: lang.FilterSystem.Commands.Filter.Remove.Description.replace(/{word}/g, args[1]) }));
            await Utils.variables.db.update.filter.removeWord(args[1]);
        }
    },
    description: lang.Help.CommandDescriptions.Filter,
    usage: 'filter <add/delete/list> <word>',
    aliases: []
}