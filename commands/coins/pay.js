const Utils = require("../../modules/utils.js");
const Embed = Utils.Embed;
const Discord = Utils.Discord;
const config = Utils.variables.config;
const db = Utils.variables.db;
const lang = Utils.variables.lang;

module.exports = {
    name: 'pay',
    run: async (bot, message, args) => {
        let user = Utils.ResolveUser(message, 0);
        const senderCoins = await db.get.getCoins(message.member);

        if (!Utils.hasPermission(message.member, config.Permissions.User_Commands.Pay)) return message.channel.send(Embed({ preset: 'nopermission' }));
        if (args.length < 2) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
        if (!user) return message.channel.send(Embed({ preset: 'error', description: lang.GlobalErrors.InvalidUser, usage: module.exports.usage }));
        if (user.id == message.author.id) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Pay.Errors.PaySelf }));
        if (user.user.bot) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Pay.Errors.PayBot }))
        if (!parseInt(args[1])) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Pay.Errors.InvalidAmount, usage: module.exports.usage }));
        if (senderCoins < parseInt(args[1])) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Errors.NotEnoughCoins, usage: module.exports.usage }));
        const receiverCoins = await db.get.getCoins(user);

        await db.update.coins.updateCoins(message.member, parseInt(args[1]), 'remove');
        await db.update.coins.updateCoins(user, parseInt(args[1]), 'add');
        await message.channel.send(Embed({
            title: lang.CoinModule.Commands.Pay.Embed.Title,
            color: config.Success_Color,
            description: lang.CoinModule.Commands.Pay.Embed.Description.replace(/{amt}/g, args[1]).replace(/{user}/g, '<@' + user.user.id + '>'),
            fields: [
                { name: lang.CoinModule.Commands.Pay.Embed.Fields[0], value: `${senderCoins} **->** ${await db.get.getCoins(message.member)}` },
                { name: lang.CoinModule.Commands.Pay.Embed.Fields[1], value: `${receiverCoins ? receiverCoins : 0} **->** ${await db.get.getCoins(user)}` }
            ]
        }))
    },
    description: lang.Help.CommandDescriptions.Pay,
    usage: 'pay <@user> <amount>',
    aliases: []
}