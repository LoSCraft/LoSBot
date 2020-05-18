const Utils = require("../../modules/utils.js");
const Embed = Utils.Embed;
const Discord = Utils.Discord;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'serverinfo',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Permissions.User_Commands.Serverinfo, message.guild);
        let region;

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.User_Commands.Serverinfo)) return message.channel.send(Embed({ preset: 'nopermission' }));

        if (message.guild.region.includes('-')) region = message.guild.region.split('-')[0].charAt(0).toUpperCase() + message.guild.region.split('-')[0].substring(1) + ' ' + message.guild.region.split('-')[1].charAt(0).toUpperCase() + message.guild.region.split('-')[1].substring(1)
        else region = message.guild.region.charAt(0).toUpperCase() + message.guild.region.substring(1);

        let channels = message.guild.channels.filter(c => c.type == 'text').map(c => ' <#' + c.id + '>').toString();
        if (channels.length > 1024) {
            while (channels.length > 1024) {
                channels = channels.substring(0, channels.length - 22) + lang.Other.OtherCommands.Serverinfo.More
                channels = channels.replace(/<#\s|\s>/gm, '');
            }
        }

        let roles = message.guild.roles.map(r => ` <@&${r.id}>`).toString().replace(`<@&${message.guild.id}>,`, '');
        if (roles.length > 1024) {
            while (roles.length > 1024) {
                roles = roles.substring(0, roles.length - 22) + lang.Other.OtherCommands.Serverinfo.More
                roles = roles.replace(/<@\s|\s>/gm, '');
            }
        }

        message.channel.send(Embed({
            title: message.guild.name,
            thumbnail: message.guild.iconURL,
            fields: [
                { name: lang.Other.OtherCommands.Serverinfo.Fields[0], value: '<@' + message.guild.owner.id + '>' },
                { name: lang.Other.OtherCommands.Serverinfo.Fields[1], value: message.guild.createdAt.toLocaleString() },
                { name: lang.Other.OtherCommands.Serverinfo.Fields[2].Name, value: lang.Other.OtherCommands.Serverinfo.Fields[2].Value.replace(/{humans}/g, message.guild.members.filter(m => m.user.bot == false).size).replace(/{bots}/g, message.guild.members.filter(m => m.user.bot == true).size).replace(/{total}/g, message.guild.memberCount) },
                { name: lang.Other.OtherCommands.Serverinfo.Fields[3], value: region },
                { name: lang.Other.OtherCommands.Serverinfo.Fields[4].replace(/{amt}/g, message.guild.channels.size), value: channels },
                { name: lang.Other.OtherCommands.Serverinfo.Fields[5].replace(/{amt}/g, message.guild.roles.size), value: roles }
            ]
        }));
    },
    description: lang.Help.CommandDescriptions.Serverinfo,
    usage: 'serverinfo',
    aliases: []
}