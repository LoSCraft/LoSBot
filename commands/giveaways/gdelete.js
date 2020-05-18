const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");

module.exports = {
    name: 'gdelete',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Giveaway_System.GDelete_Required_Rank, message.guild);

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Giveaway_System.GDelete_Required_Rank)) return message.channel.send(Embed({ preset: 'nopermission' }));

        const giveaway = args.length > 0 ? await Utils.variables.db.get.getGiveawayFromName(args.join(" ")) : await Utils.variables.db.get.getLatestGiveaway();
        if (args.length > 0 && !giveaway) {
            return message.channel.send(Embed({ preset: 'error', description: lang.GiveawaySystem.Commands.Gdelete.Errors.InvalidGiveaway.replace(/{name}/g, args.join(" ")) }));
        } else if (!giveaway) {
            return message.channel.send(Embed({ preset: 'error', description: lang.GiveawaySystem.Commands.Gdelete.Errors.NoGiveaways }));
        } else {
            bot.guilds.get(giveaway.guild)
                .channels.get(giveaway.channel)
                .fetchMessage(giveaway.messageID)
                .then(msg => msg.delete()).catch(err => { });
            await Utils.variables.db.update.giveaways.deleteGiveaway(giveaway.messageID);
            message.channel.send(Embed({ title: lang.GiveawaySystem.Commands.Gdelete.Deleted, color: config.Success_Color }));
        }
    },
    description: lang.Help.CommandDescriptions.Gdelete,
    usage: 'gdelete [giveaway name]',
    aliases: [
        'giveawaydelete',
        'deletegiveaway'
    ]
}