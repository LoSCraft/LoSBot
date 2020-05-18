const Utils = require('../../modules/utils');
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const Embed = Utils.Embed;

module.exports = {
    name: "gstop",
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Giveaway_System.GStop_Required_Rank, message.guild);
        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Giveaway_System.GStop_Required_Rank)) return message.channel.send(Embed({ preset: 'nopermission' }));

        const giveaway = args.length > 0 ? await Utils.variables.db.get.getGiveawayFromID(args.join(" ")) || await Utils.variables.db.get.getGiveawayFromName(args.join(" ")) : await Utils.variables.db.get.getLatestGiveaway();
        if (args.length > 0 && !giveaway) {
            return message.channel.send(Embed({ preset: 'error', description: lang.GiveawaySystem.Commands.Gdelete.Errors.InvalidGiveaway.replace(/{name}/g, args.join(" ")) }));
        } else if (!giveaway) {
            return message.channel.send(Embed({ preset: 'error', description: lang.GiveawaySystem.Commands.Gdelete.Errors.NoGiveaways }));
        } else {
            const guild = bot.guilds.get(giveaway.guild);
            const channel = guild.channels.get(giveaway.channel);

            if (guild && channel) {
                channel.fetchMessage(giveaway.messageID).then(async msg => {
                    const winners = [];
                    const reactions = await Utils.variables.db.get.getGiveawayReactions(giveaway.messageID);
                    if (reactions.length == 0) return channel.send(Utils.Embed({ preset: 'error', description: lang.GiveawaySystem.Errors.NoOneEntered }));
                    for (let i = 0; i < giveaway.winners; i++) {
                        let user = reactions[~~(Math.random() * reactions.length)];
                        winners.push(user);
                        reactions.splice(reactions.indexOf(user), 1);
                        await Utils.variables.db.update.giveaways.reactions.removeReaction(giveaway.messageID, user)
                    }

                    await Utils.variables.db.update.giveaways.setWinners(JSON.stringify(winners), giveaway.messageID)
                    msg.edit(lang.GiveawaySystem.GiveawayEndedEmbed.Content, Utils.Embed({
                        title: lang.GiveawaySystem.GiveawayEndedEmbed.Title.replace(/{giveawaytitle}/g, msg.embeds[0].title),
                        description: lang.GiveawaySystem.GiveawayEndedEmbed.Description.replace(/{winners}/g, winners.filter(u => u).map(u => "<@" + u + "> ").join("\n")),
                        footer: lang.GiveawaySystem.GiveawayEndedEmbed.Footer,
                        timestamp: new Date()
                    }))
                    channel.send(Utils.Embed({
                        title: lang.GiveawaySystem.GiveawayWinnerEmbed.Title,
                        description: lang.GiveawaySystem.GiveawayWinnerEmbed.Description.replace(/{winners}/g, winners.filter(u => u).map(u => "<@" + u + "> ").join(", ")).replace(/{prize}/g, giveaway.name),
                    }));
                    channel.send(winners.filter(u => u).map(u => "<@" + u + ">").join(",")).then(m => m.delete(2500));
                    await Utils.variables.db.update.giveaways.setToEnded(giveaway.messageID);
                    message.channel.send(Embed({ title: lang.GiveawaySystem.Commands.Gstop.Stopped, color: config.Success_Color }));
                })
            }
        }
    },
    description: lang.Help.CommandDescriptions.Gstop,
    usage: "gstop [giveaway name]",
    aliases: [
        'gend',
        'giveawayend',
        'giveawaystop',
        'gforcestop',
        'giveawayforcestop'
    ]
}