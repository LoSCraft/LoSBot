const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'links',
    run: async (bot, message, args) => {
        let link = Object.values(config.Link.Links)
        let fields = []

        link.forEach((l, i) => {
            fields.push({ name: Object.keys(config.Link.Links)[i], value: l });
        });

        await message.channel.send(Embed({
            title: lang.Other.OtherCommands.Links.Title,
            description: lang.Other.OtherCommands.Links.Description,
            thumbnail: lang.Other.OtherCommands.Links.Thumbnail,
            fields: fields
        }))
    },
    description: lang.Help.CommandDescriptions.Links,
    usage: 'links',
    aliases: [],
}