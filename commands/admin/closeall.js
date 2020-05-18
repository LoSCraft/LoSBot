const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");

module.exports = {
    name: 'closeall',
    run: async (bot, message, args) => {
        const tickets = await Utils.variables.db.get.getTickets();

        async function closeAllTickets() {
            let channels = message.guild.channels.filter(c => /ticket-\d+/.exec(c.name.toLowerCase()));

            channels.forEach(async ch => {
                let id = ch.name.split("-")[1];
                const ticket = await Utils.variables.db.get.getTickets(ch.id);

                if (!ticket) return ch.send(Embed({ preset: 'error', description: lang.TicketModule.Errors.TicketNotExist }));

                ch.delete();
                require('../../modules/transcript.js')(ch.id);

                if (config.Logs.Tickets.Enabled == true) {
                    let channel = Utils.findChannel(config.Logs.Tickets.Channel, message.guild);
                    channel.send(Embed({
                        thumbnail: lang.TicketModule.Thumbnail,
                        title: lang.TicketModule.Commands.Close.Embeds.Log.Title,
                        color: config.Theme_Color,
                        fields: [{ name: lang.TicketModule.Commands.Close.Embeds.Log.Fields[0], value: ticket.channel_id }, { name: lang.TicketModule.Commands.Close.Embeds.Log.Fields[1], value: '<@' + message.author.id + '>' }, { name: lang.TicketModule.Commands.Close.Embeds.Log.Fields[2], value: `<@${ticket.creator}>` }, { name: lang.TicketModule.Commands.Close.Embeds.Log.Fields[3], value: (await Utils.variables.db.get.getAddedUsers(ticket.channel_id)).map(u => `<@${u.user}>`).join(', ') || lang.TicketModule.Commands.Close.NoAddedUsers }, { name: lang.TicketModule.Commands.Close.Embeds.Log.Fields[4], value: (args[0]) ? args.join(' ') : lang.TicketModule.Commands.Close.NoReason }],
                    }));
                }
            })

            await message.channel.send(Embed({ title: lang.TicketModule.Commands.Closeall.Complete, color: config.Success_Color }));
        }

        let role = Utils.findRole(config.Permissions.Ticket_Commands.Closeall, message.guild);

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        if (config.Logs.Tickets.Enabled == true) {
            let channel = Utils.findChannel(config.Logs.Tickets.Channel, message.guild)
            if (!channel) return message.channel.send(Embed({ preset: 'console' }));
        }
        if (!Utils.hasPermission(message.member, config.Permissions.Ticket_Commands.Closeall)) return message.channel.send(Embed({ preset: 'nopermission' }));

        if (config.Ticket_System.Close_All_Confirmation) {
            let msg = await message.channel.send(Embed({ title: lang.TicketModule.Commands.Closeall.Confirmation }));
            await msg.react('✅');
            await msg.react('❌');
            Utils.waitForReaction(['✅', '❌'], message.author.id, msg).then(reaction => {
                (reaction.emoji.name == '✅') ? closeAllTickets() : message.channel.send(Embed({ title: lang.TicketModule.Commands.Closeall.Canceled }));
            })
        } else {
            closeAllTickets();
        }
    },
    description: lang.Help.CommandDescriptions.Closeall,
    usage: 'closeall',
    aliases: []
}
