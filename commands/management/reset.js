const Utils = require('../../modules/utils');
const db = Utils.variables.db;
const Embed = Utils.Embed;
const lang = Utils.variables.lang;
const config = Utils.variables.config;

module.exports = {
    name: "reset",
    run: async (bot, message, args, { prefixUsed, commandUsed }) => {
        let users = [];

        if (!Utils.hasPermission(message.member, config.Permissions.Bot_Management_Commands.Reset)) return message.channel.send(Embed({ preset: 'nopermission' }))
        if (args.length < 2) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));


        if (['all', 'everyone'].includes(args[1].toLowerCase())) users = message.guild.members.map(m => {
            return { id: m.id, guild: m.guild, bot: m.user.bot }
        });
        if (message.mentions.users.first()) message.mentions.members.forEach(u => {
            users.push({ id: u.id, guild: u.guild, bot: u.user.bot });
        });
        if (message.mentions.roles.first()) message.mentions.roles.forEach(r => {
            r.members.forEach(m => {
                users.push({ id: m.id, guild: m.guild, bot: m.user.bot })
            });
        });
        users = users.filter(u => !u.bot);

        if (users.length < 1) return message.channel.send(Embed({ preset: 'invalidargs', usage: usage }));

        if (args[0].toLowerCase() == 'coins') {
            Utils.asyncForEach(users, async user => {
                await db.update.coins.updateCoins(user, 0, 'set')
            });
        } else if (args[0].toLowerCase() == 'exp') {
            Utils.asyncForEach(users, async user => {
                await db.update.experience.updateExperience(user, 1, 0, 'set')
            });
        } else return message.channel.send(Embed({ preset: 'invalidargs', usage: usage }));

        return message.channel.send(Embed({ title: lang.ManagementModule.Commands.Reset.Title.replace(/{type}/g, args[0].toLowerCase() == 'coins' ? 'Coins' : 'Experience'), description: args[0].toLowerCase() == 'coins' ? lang.ManagementModule.Commands.Reset.Descriptions[0] : lang.ManagementModule.Commands.Reset.Descriptions[1] }));
    },
    description: lang.Help.CommandDescriptions.Reset,
    usage: "reset <coins/exp> <user/role/all>",
    aliases: []
}