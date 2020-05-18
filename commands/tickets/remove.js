const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");

module.exports = {
    name: 'remove',
    run: async (bot, message, args) => {
        const ticket = await Utils.variables.db.get.getTickets(message.channel.id);
        if (!ticket) return message.channel.send(Embed({ preset: 'error', description: lang.TicketModule.Errors.TicketNotExist }));
        const Support_Role = Utils.findRole(config.Ticket_System.Support_Role, message.guild);

        const user = Utils.ResolveUser(message);
        if (!Support_Role) return message.channel.send(Embed({ preset: 'console' }));

        if (!Utils.hasPermission(message.member, config.Permissions.Ticket_Commands.Remove)) return message.channel.send(Embed({ preset: 'nopermission' }));
        if (args.length == 0 || !user) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
        if (user.id == message.author.id) return message.channel.send(Embed({ preset: 'error', description: lang.TicketModule.Commands.Remove.Errors.RemoveOwnAccess }));

        const AddedUsers = await Utils.variables.db.get.getAddedUsers(message.channel.id);
        if (!AddedUsers.map(u => u.user).includes(user.id)) return message.channel.send(Embed({ preset: 'error', description: lang.TicketModule.Commands.Remove.Errors.NoAccess }));

        await Utils.variables.db.update.tickets.addedUsers.remove(message.channel.id, user.id);

        message.channel.overwritePermissions(user.id, {
            VIEW_CHANNEL: null, SEND_MESSAGES: null, READ_MESSAGES: null, ADD_REACTIONS: null, READ_MESSAGE_HISTORY: null
        })

        await message.channel.send(Embed({ title: lang.TicketModule.Commands.Remove.Embeds.Removed.Title, description: lang.TicketModule.Commands.Remove.Embeds.Removed.Description.replace(/{user}/g, user.user.tag) }));

        if (config.Logs.Tickets.Enabled == true) {
            let channel = Utils.findChannel(config.Logs.Tickets.Channel, message.guild);
            channel.send(Embed({
                thumbnail: lang.TicketModule.Thumbnail,
                title: lang.TicketModule.Commands.Remove.Embeds.Log.Title,
                fields: [{ name: lang.TicketModule.Commands.Remove.Embeds.Log.Fields[0], value: '<@' + user.id + '>' }, { name: lang.TicketModule.Commands.Remove.Embeds.Log.Fields[1], value: '<@' + message.author.id + '>' }, { name: lang.TicketModule.Commands.Remove.Embeds.Log.Fields[2], value: message.channel.name.split('-')[1] }, { name: lang.TicketModule.Commands.Remove.Embeds.Log.Fields[3], value: '<#' + message.channel.id + '>' }],
            }))
        }
    },
    description: lang.Help.CommandDescriptions.Remove,
    usage: 'remove <@user>',
    aliases: []
}