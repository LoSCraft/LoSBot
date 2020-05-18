const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'prefix',
    run: async (bot, message, args) => {
        const prefix = await Utils.variables.db.get.getPrefixes(message.guild.id) || config.Bot_Prefix;
        message.channel.send(Embed({
            title: lang.Other.OtherCommands.Prefix.Title,
            description: lang.Other.OtherCommands.Prefix.Description.replace(/{prefix}/g, prefix)
        }))
    },
    description: lang.Help.CommandDescriptions.Prefix,
    usage: 'prefix',
    aliases: [

    ]
}