const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");
const rp = require("request-promise");

module.exports = {
    name: 'status',
    run: async (bot, message, args) => {
        const servers = Object.keys(config.Status.Server_Status).map(servername => {
            const server = config.Status.Server_Status[servername];
            return { name: servername, queryURL: server.QueryURL, pingURL: server.PingURL }
        })
        let msg = await message.channel.send(Embed({ description: lang.Other.OtherCommands.Status.LoadingStatus }));
        if (args.length >= 1) {

            let players;
            let total;
            let requiredVersion;
            let max;

            const server = servers.find(s => s.name.toLowerCase() == args.join(" ").toLowerCase());
            if (!server) return message.channel.send(Embed({ preset: 'error', description: lang.Other.OtherCommands.Status.Errors.InvalidServer }));

            await rp(server.pingURL).then((html) => {
                let json = JSON.parse(html);

                if (json.error) {
                    max = "Error";
                    total = "Error";
                } else {
                    max = json.players.max;
                    total = json.players.online
                }
            })
            await rp(server.queryURL).then((html) => {
                let json = JSON.parse(html);
                if (json.error) {
                    players = lang.Other.OtherCommands.Status.Errors.CouldntFetchList;
                    requiredVersion = lang.Other.OtherCommands.Status.Errors.CouldntFetchVersion
                }
                else {
                    if (!json.Playerlist) players = lang.Other.OtherCommands.Status.Errors.CouldntFetchList
                    else {
                        if (json.Playerlist.length == 0) return players = "None";
                        else {
                            players = json.Playerlist.join(", ")
                        }
                    }
                    if (!json.Version) requiredVersion = lang.Other.OtherCommands.Status.Errors.CouldntFetchVersion
                    else requiredVersion = json.Version;
                }
            })

            let embed = new Discord.RichEmbed()
                .setColor(config.Theme_Color)
                .setTitle(lang.Other.OtherCommands.Status.Embeds.SpecificStatus.Title.replace(/{server}/g, server.name))
                .addField(lang.Other.OtherCommands.Status.Embeds.SpecificStatus.Fields[0], total + '/' + max, true)
                .addField(lang.Other.OtherCommands.Status.Embeds.SpecificStatus.Fields[1], players, true)
                .addField(lang.Other.OtherCommands.Status.Embeds.SpecificStatus.Fields[2], requiredVersion, true)

            await msg.edit(embed);
        } else {
            let description = "";

            for (let i = 0; i < servers.length; i++) {
                await rp(servers[i].pingURL).then(content => {
                    const json = JSON.parse(content);
                    if (json.error) description += lang.Other.OtherCommands.Status.Embeds.GlobalStatus.Offline.replace(/{server}/g, servers[i].name)
                    else {
                        const playerCount = json.players.online;
                        description += lang.Other.OtherCommands.Status.Embeds.GlobalStatus.Online.replace(/{server}/g, servers[i].name).replace(/{playercount}/g, playerCount);
                    }
                })
            }

            let embed = new Discord.RichEmbed()
                .setColor(config.Theme_Color)
                .setTitle(lang.Other.OtherCommands.Status.Embeds.GlobalStatus.Title.replace(/{name}/g, config.Status.Server_Name))
                .setDescription(description)

            msg.edit(embed);
        }
    },
    description: lang.Help.CommandDescriptions.Status,
    usage: 'status [server]',
    aliases: [
        'serverstatus'
    ]
}