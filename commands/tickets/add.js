const Utils = require("../../modules/utils.js");
const Discord = Utils.Discord;
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");

module.exports = {
    name: 'add',
    run: async (bot, message, args) => {
            const ticket = await Utils.variables.db.get.getTickets(message.channel.id);
            if (!ticket) return message.channel.send(Embed({ preset: 'error', description: lang.TicketModule.Errors.TicketNotExist }));

            const user = Utils.ResolveUser(message);
            const Support_Role = Utils.findRole(config.Ticket_System.Support_Role, message.guild);


            if (!Support_Role) return message.channel.send(Embed({ preset: 'console' }));

            if (!Utils.hasPermission(message.member, config.Permissions.Ticket_Commands.Add)) return message.channel.send(Embed({ preset: 'nopermission' }));
            if (args.length == 0 || !user) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
            if (user.id == message.author.id) return message.channel.send(Embed({ preset: 'error', description: lang.TicketModule.Commands.Add.Errors.AddSelf }));

            const AddedUsers = await Utils.variables.db.get.getAddedUsers(message.channel.id);
            if (AddedUsers.map(u => u.user).includes(user.id)) return message.channel.send(Embed({ preset: 'error', description: lang.TicketModule.Commands.Add.Errors.UserAlreadyHaveAccess }));

            await Utils.variables.db.update.tickets.addedUsers.add(message.channel.id, user.id);

            message.channel.overwritePermissions(user.id, {
                VIEW_CHANNEL: true, SEND_MESSAGES: true, READ_MESSAGES: true, ADD_REACTIONS: true, READ_MESSAGE_HISTORY: true
            })

            await message.channel.send(Embed({ title: lang.TicketModule.Commands.Add.Embeds.UserAdded.Title, description: lang.TicketModule.Commands.Add.Embeds.UserAdded.Description.replace(/{tag}/g, user.user.tag) }));
            if (config.Logs.Tickets.Enabled == true) {
                let channel = Utils.findChannel(config.Logs.Tickets.Channel, message.guild);
                if (!channel) return message.channel.send(Embed({ preset: 'console' }))
                channel.send(Embed({
                    thumbnail: lang.TicketModule.Thumbnail,
                    color: config.Theme_Color,
                    title: lang.TicketModule.Commands.Add.Embeds.Log.Title,
                    fields: [{ name: lang.TicketModule.Commands.Add.Embeds.Log.Fields[1], value: '<@' + user.id + '>' }, { name: lang.TicketModule.Commands.Add.Embeds.Log.Fields[1], value: '<@' + message.author.id + '>' }, { name: lang.TicketModule.Commands.Add.Embeds.Log.Fields[2], value: message.channel.name.split('-')[1] }, { name: lang.TicketModule.Commands.Add.Embeds.Log.Fields[3], value: '<#' + message.channel.id + '>' }],
                }));
            }
    },
    description: lang.Help.CommandDescriptions.Add,
    usage: 'add <@user>',
    aliases: [
        'adduser'
    ]
}