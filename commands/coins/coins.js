const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'coins',
    run: async (bot, message, args) => {
        if (args.length == 0) return message.channel.send(Embed({ title: lang.CoinModule.Commands.Coins.Embeds.YourCoins.Title, description: lang.CoinModule.Commands.Coins.Embeds.YourCoins.Description.replace(/{coins}/g, await Utils.variables.db.get.getCoins(message.member)) }));
        else {
            let user = Utils.ResolveUser(message);
            if (!user) return message.channel.send(Embed({ preset: 'error', description: lang.GlobalErrors.InvalidUser, usage: usage }));
            const coins = await Utils.variables.db.get.getCoins(user);
            message.channel.send(Embed({ title: lang.CoinModule.Commands.Coins.Embeds.UserCoins.Title, description: lang.CoinModule.Commands.Coins.Embeds.UserCoins.Description.replace(/{user}/g, user).replace(/{coins}/g, coins >= 0 ? coins : 'unknown') }));
        }
    },
    description: lang.Help.CommandDescriptions.Coins,
    usage: 'coins [@user]',
    aliases: [
        'bal',
        'balance'
    ]
}

