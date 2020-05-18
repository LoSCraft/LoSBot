const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'msg',
    run: async (bot, message, args, { prefixUsed, commandUsed }) => {
        let role = Utils.findRole(config.Permissions.Staff_Commands.Msg, message.guild);
        let content = message.content.replace(prefixUsed + commandUsed, '').replace(/\s(<(@|@&|@!)[0-9]{18}>|users|tickets|[0-8]{18})\s/mi, '');

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Msg)) return message.channel.send(Embed({ preset: 'nopermission' }));
        if (!args[0]) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));

        // USER
        let user = Utils.ResolveUser(message)
        if (user) {
            user.send(content).catch(err => {
                if (err) return message.channel.send(Embed({ preset: 'error', description: lang.AdminModule.Commands.Msg.CouldntSend }));
            })
            await message.channel.send(Embed({ color: config.Success_Color, title: lang.AdminModule.Commands.Msg.Sent }));
            return;
        }
        // ROLE
        let msgRole = message.mentions.roles.first() || message.guild.roles.get(args[0]);
        if (msgRole) {
            let members = message.guild.members.filter(u => u.roles.has(msgRole.id));
            members.forEach(m => {
                m.send(content).catch(err => { });
            })
            await message.channel.send(Embed({ color: config.Success_Color, title: lang.AdminModule.Commands.Msg.Sent }));
            return;
        }
        // ALL USERS
        if (args[0].toLowerCase() == 'users') {
            if (!args[1]) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
            message.guild.members.forEach(u => u.send(content).catch(err => { }));
            await message.channel.send(Embed({ color: config.Success_Color, title: lang.AdminModule.Commands.Msg.Sent }));
            return;
        }
        // TICKETS
        else if (args[0].toLowerCase() == 'tickets') {
            if (!args[1]) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
            let tickets = message.guild.channels.filter(c => /ticket-\d+/.exec(c.name.toLowerCase()));
            tickets.forEach(ch => ch.send(content));
            await message.channel.send(Embed({ color: config.Success_Color, title: lang.AdminModule.Commands.Msg.Sent }))
        } else return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
    },
    description: lang.Help.CommandDescriptions.Msg,
    usage: 'msg <@user/@role/users/tickets> <message>',
    aliases: []
}