const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");

module.exports = {
    name: 'ping',
    run: async (bot, message, args) => {
        let embed = Embed({
            title: lang.Other.OtherCommands.Ping.Title,
            thumbnail: lang.Other.OtherCommands.Ping.Thumbnail,
            fields: [{ name: lang.Other.OtherCommands.Ping.Fields[0], value: Math.round(1000 * bot.ping) / 1000 + ' ms', inline: true }],
            timestamp: new Date()
        });
        let msg = await message.channel.send(embed);
        await embed.embed.fields.push({ name: lang.Other.OtherCommands.Ping.Fields[1], value: msg.createdTimestamp - message.createdTimestamp + ' ms', inline: true });

        msg.edit(embed);
    },
    description: lang.Help.CommandDescriptions.Ping,
    usage: 'ping',
    aliases: [
        'latency'
    ]
}