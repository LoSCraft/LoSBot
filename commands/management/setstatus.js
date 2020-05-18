const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");

module.exports = {
    name: 'setstatus',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Permissions.Bot_Management_Commands.Set_Status, message.guild);

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.Bot_Management_Commands.Set_Status)) return message.channel.send(Embed({ preset: 'nopermission' }));

        message.channel.send(Embed({
            title: lang.ManagementModule.Commands.Setstatus.Embeds.Setup.Title.replace(/{pos}/g, "1/2"),
            description: lang.ManagementModule.Commands.Setstatus.Embeds.Setup.Descriptions[0]
        })).then(async msg => {
            msg.react('🎮');
            await msg.react('📺');
            await msg.react('📹');
            await msg.react('👂');
            await msg.react('❌');

            Utils.waitForReaction(['🎮', '📺', '📹', '👂', '❌'], message.author.id, msg).then(async reaction => {
                msg.delete();
                let type;
                if (reaction.emoji.name == '🎮') {
                    type = 'PLAYING'
                } else if (reaction.emoji.name == '📺') {
                    type = 'WATCHING'
                } else if (reaction.emoji.name == '📹') {
                    type = 'STREAMING'
                } else if (reaction.emoji.name == '👂') {
                    type = 'LISTENING'
                } else if (reaction.emoji.name == '❌') {
                    message.channel.send(Embed({ title: lang.ManagementModule.Commands.Setstatus.Embeds.Updated.Title, description: lang.ManagementModule.Commands.Setstatus.Embeds.Updated.Descriptions[0], color: config.Success_Color }))
                    return await Utils.variables.db.update.status.setStatus('', '')
                };

                message.channel.send(Embed({
                    title: lang.ManagementModule.Commands.Setstatus.Embeds.Setup.Title.replace(/{pos}/g, "2/2"),
                    description: lang.ManagementModule.Commands.Setstatus.Embeds.Setup.Descriptions[1]
                })).then(ms => {
                    message.channel.awaitMessages(msg => msg.author.id == message.author.id, { max: 1, time: 60000 }).then(async m => {
                        ms.delete();
                        m.first().delete();

                        await Utils.variables.db.update.status.setStatus(type, m.first().content);
                        message.channel.send(Embed({
                            title: lang.ManagementModule.Commands.Setstatus.Embeds.Updated.Title,
                            description: lang.ManagementModule.Commands.Setstatus.Embeds.Updated.Descriptions[1].replace(/{status}/g, type.charAt(0) + type.substring(1).toLowerCase() + ' **' + m.first().content + '**'),
                            color: config.Success_Color
                        }))
                    })
                });
            })
        });
    },
    description: lang.Help.CommandDescriptions.Setstatus,
    usage: 'setstatus',
    aliases: []
}