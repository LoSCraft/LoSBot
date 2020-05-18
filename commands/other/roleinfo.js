const Utils = require("../../modules/utils.js");
const Embed = Utils.Embed;
const Discord = Utils.Discord;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'roleinfo',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Permissions.User_Commands.Roleinfo, message.guild);
        let infoRole = message.mentions.roles.first() || message.guild.roles.find(r => r.name == args.join(" "));
        let members = "";
        let i = 0;

        if (!role) return message.channel.send(Embed({ preset: 'console' }))
        if (!Utils.hasPermission(message.member, config.Permissions.User_Commands.Roleinfo)) return message.channel.send(Embed({ preset: 'nopermission' }));
        if (!infoRole) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));

        infoRole.members.forEach(m => {
            i++
            if (i >= 12) return;
            if (i == 11) return members += '...';
            members += ' <@' + m.user.id + '>'
        })

        message.channel.send(Embed({
            color: infoRole.hexColor,
            title: lang.Other.OtherCommands.Roleinfo.Title,
            description: `<@&${infoRole.id}>`,
            fields: [
                { name: lang.Other.OtherCommands.Roleinfo.Fields[0], value: infoRole.createdAt.toLocaleString(), inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
                { name: lang.Other.OtherCommands.Roleinfo.Fields[1], value: infoRole.calculatedPosition, inline: true },
                { name: lang.Other.OtherCommands.Roleinfo.Fields[2], value: infoRole.permissions, inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
                { name: lang.Other.OtherCommands.Roleinfo.Fields[3].replace(/{amt}/g, infoRole.members.size ? infoRole.members.size : 0), value: members ? members : lang.Other.OtherCommands.Roleinfo.NoMembers, inline: true }
            ],
            footer: { text: lang.Other.OtherCommands.Roleinfo.Footer.replace(/{id}/g, infoRole.id), icon: bot.user.displayAvatarURL }
        }));
    },
    description: lang.Help.CommandDescriptions.Roleinfo,
    usage: 'roleinfo <@role>',
    aliases: []
}