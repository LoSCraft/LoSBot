const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

function increase(string) {
    const num = parseInt(string) + 1;
    return ('0'.repeat(4 - num.toString().length)) + num;
}
module.exports = {
    name: 'new',
    run: async (bot, message, args) => {
        const userTickets = message.guild.channels.filter(c => /.+\-[0-9]{4}/.test(c.name)).filter(c => c.permissionOverwrites.find(o => o.type == 'member' && o.id == message.author.id)).size;
        const ticketLimit = config.Ticket_System.Ticket_Limit;
        if (userTickets >= ticketLimit) return message.channel.send(Embed({ color: config.Error_Color, title: lang.TicketModule.Commands.New.Errors.MaxTickets.replace(/{ticketlimit}/g, ticketLimit) }));
        const tickets = await Utils.variables.db.get.getTickets();
        const newestTicket = tickets.sort((a, b) => parseInt(b.channel_name.match(/\d+/)[0]) - parseInt(a.channel_name.match(/\d+/)[0]))[0];

        const next_ticket_number = newestTicket ? (increase(newestTicket.channel_name.match(/\d+/)[0])) : '0000';

        let role = Utils.findRole(config.Permissions.Ticket_Commands.New, message.guild);
        let support = Utils.findRole(config.Ticket_System.Support_Role, message.guild)
        let category = Utils.findChannel(config.Ticket_System.Category, message.guild, 'category');

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        if (config.Logs.Tickets.Enabled == true) {
            let channel = Utils.findChannel(config.Logs.Tickets.Channel, message.guild);
            if (!channel) return message.channel.send(Embed({ preset: 'console' }));
        }
        if (!support) return message.channel.send(Embed({ preset: 'console' }));
        if (!category) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.Ticket_Commands.New)) return message.channel.send(Embed({ preset: 'nopermission' }));
        if (config.Ticket_System.Require_Reason == true && args.length == 0) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));

        message.guild.createChannel(`ticket-${next_ticket_number}`, {
            type: 'text',
            permissionOverwrites: [{
                id: message.guild.id,
                deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            }, {
                id: support.id,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            }, {
                id: message.author.id,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            }, {
                id: bot.user.id,
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            }],
            parent: category,
            topic: (args.length > 0) ? config.Ticket_System.Topic.replace(/{user}/g, `<@${message.author.id}>`).replace(/{time}/g, message.createdAt.toLocaleString()).replace(/{id}/g, next_ticket_number).replace(/{reason}/g, args.join(" ")) : config.Ticket_System.Topic.replace(/{user}/g, `<@${message.author.id}>`).replace(/{time}/g, message.createdAt.toLocaleString()).replace(/{id}/g, next_ticket_number).replace(/{reason}/g, 'N/A')
        }).then(async ch => {
            message.channel.send(Embed({ title: lang.TicketModule.Commands.New.Embeds.Created.Title, description: lang.TicketModule.Commands.New.Embeds.Created.Description.replace(/{channel}/g, `<#${ch.id}>`), timestamp: new Date() }))

            ch.send(`<@&${support.id}>`)
            ch.send(Utils.setupEmbed({
                configPath: config.Ticket_System.Embed_Settings,
                variables: [
                    { searchFor: /{user}/g, replaceWith: message.member },
                    { searchFor: /{reason}/g, replaceWith: args.join(" ") },
                    { searchFor: /{botPFP}/g, replaceWith: bot.user.displayAvatarURL },
                    { searchFor: /{userPFP}/g, replaceWith: message.author.displayAvatarURL }
                ]
            }))
            if (config.Logs.Tickets.Enabled == true) {
                let channel = Utils.findChannel(config.Logs.Tickets.Channel, message.guild);
                channel.send(Embed({
                    thumbnail: lang.TicketModule.Thumbnail,
                    title: lang.TicketModule.Commands.New.Embeds.Log.Title,
                    fields: [
                        { name: lang.TicketModule.Commands.New.Embeds.Log.Fields[0], value: `${message.author} (${message.author.id})` },
                        { name: lang.TicketModule.Commands.New.Embeds.Log.Fields[1], value: next_ticket_number },
                        { name: lang.TicketModule.Commands.New.Embeds.Log.Fields[2], value: '<#' + ch.id + '>' }
                    ]
                }))
            }

            Utils.variables.db.update.tickets.createTicket({
                guild: message.guild.id,
                channel_id: ch.id,
                channel_name: ch.name,
                creator: message.author.id,
                reason: args.join(" ") || 'None'
            })
        })
    },
    description: lang.Help.CommandDescriptions.New,
    usage: 'new [reason]',
    aliases: [
        'ticket'
    ]
}
