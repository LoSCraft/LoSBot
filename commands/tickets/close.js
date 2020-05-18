const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");

module.exports = {
    name: 'close',
    run: async (bot, message, args) => {
        const ticket = await Utils.variables.db.get.getTickets(message.channel.id);

        if (!ticket) return message.channel.send(Embed({ preset: 'error', description: lang.TicketModule.Errors.TicketNotExist }));

        async function closeTicket() {
            if (config.Logs.Tickets.Enabled == true) {
                let channel = Utils.findChannel(config.Logs.Tickets.Channel, message.channel.guild);
                channel.send(Embed({
                    thumbnail: lang.TicketModule.Thumbnail,
                    title: lang.TicketModule.Commands.Close.Embeds.Log.Title,
                    color: config.Theme_Color,
                    fields: [{ name: lang.TicketModule.Commands.Close.Embeds.Log.Fields[0], value: ticket.channel_id }, { name: lang.TicketModule.Commands.Close.Embeds.Log.Fields[1], value: '<@' + message.author.id + '>' }, { name: lang.TicketModule.Commands.Close.Embeds.Log.Fields[2], value: `<@${ticket.creator}>` }, { name: lang.TicketModule.Commands.Close.Embeds.Log.Fields[3], value: (await Utils.variables.db.get.getAddedUsers(ticket.channel_id)).map(u => `<@${u.user}>`).join(', ') || lang.TicketModule.Commands.Close.NoAddedUsers }, { name: lang.TicketModule.Commands.Close.Embeds.Log.Fields[4], value: (args[0]) ? args.join(' ') : lang.TicketModule.Commands.Close.NoReason }],
                }));

                if (config.Ticket_System.DM_Closure_Reason) {
                    (message.guild.members.get(ticket.creator)) ? message.guild.members.get(ticket.creator).send(Embed({
                        title: lang.TicketModule.Commands.Close.Embeds.DM.Title,
                        description: lang.TicketModule.Commands.Close.Embeds.DM.Description.replace(/{ticket}/g, ticket.channel_name.split('-')[1]).replace(/{reason}/g, (args[0]) ? args.join(' ') : lang.TicketModule.Commands.Close.NoReason)
                    })) : 'None'
                }
            }

            message.channel.delete();
            require('../../modules/transcript.js')(message.channel.id);
        };

        let role = Utils.findRole(config.Permissions.Ticket_Commands.Close, message.guild);
        if (!role) return message.channel.send(Embed({ preset: 'console' }));

        if (config.Logs.Tickets.Enabled == true) {
            let channel = Utils.findChannel(config.Logs.Tickets.Channel, message.channel.guild)
            if (!channel) return message.channel.send(Embed({ preset: 'console' }));
        }

        if (!Utils.hasPermission(message.member, config.Permissions.Ticket_Commands.Close)) return message.channel.send(Embed({ preset: 'nopermission' }));

        if (config.Ticket_System.Close_Confirmation) {
            let msg = await message.channel.send(Embed({ title: lang.TicketModule.Commands.Close.Confirmation }));
            await msg.react('✅');
            await msg.react('❌');
            Utils.waitForReaction(['✅', '❌'], message.author.id, msg).then(reaction => {
                (reaction.emoji.name == '✅') ? closeTicket() : message.channel.send(Embed({ title: lang.TicketModule.Commands.Close.Canceled }));
            })
        } else closeTicket();
    },
    description: lang.Help.CommandDescriptions.Close,
    usage: 'close [reason]',
    aliases: [
        'ticketclose',
        'closeticket'
    ]
}