const Utils = require("../../modules/utils.js");
const Embed = Utils.Embed;
const Discord = Utils.Discord;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'coinflip',
    run: async (bot, message, args) => {
        let coin = { 'Head': lang.Other.OtherCommands.Coinflip.HeadIcon, 'Tail': lang.Other.OtherCommands.Coinflip.TailIcon }
        let side = Object.keys(coin)[Math.floor(Math.random() * 2)];

        if (!args[0]) return message.channel.send(Embed({ title: lang.Other.OtherCommands.Coinflip.Embeds.Normal.Title, description: lang.Other.OtherCommands.Coinflip.Embeds.Normal.Description.replace(/{result}/g, side), image: Object.values(coin)[Object.keys(coin).indexOf(side)], footer: { text: lang.Other.OtherCommands.Coinflip.Embeds.Normal.Footer.replace(/{user}/g, message.author.tag), icon: message.author.displayAvatarURL } }))
        else {
            args[0] = args[0].toLowerCase().replace('s', '');
            if (!args[1] || !['head', 'tail'].includes(args[0]) || isNaN(args[1])) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
            if (args[1] > await Utils.variables.db.get.getCoins(message.member)) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Errors.NotEnoughCoins }));
            if (side.toLowerCase() == args[0]) await Utils.variables.db.update.coins.updateCoins(message.member, parseInt(args[1] * 2), 'add');
            else await Utils.variables.db.update.coins.updateCoins(message.member, parseInt(args[1]), 'remove');
            return message.channel.send(Embed({ title: lang.Other.OtherCommands.Coinflip.Embeds.Gamble.Title, description: (side.toLowerCase() === args[0]) ? lang.Other.OtherCommands.Coinflip.Embeds.Gamble.Won.replace(/{result}/g, side).replace(/{coins}/g, (side.toLowerCase() === args[0]) ? parseInt(args[1]) * 2 : args[1]) : lang.Other.OtherCommands.Coinflip.Embeds.Gamble.Lost.replace(/{result}/g, side).replace(/{coins}/g, (side.toLowerCase() === args[0]) ? parseInt(args[1]) * 2 : args[1]), image: Object.values(coin)[Object.keys(coin).indexOf(side)], footer: { text: lang.Other.OtherCommands.Coinflip.Embeds.Gamble.Footer.replace(/{user}/g, message.author.tag), icon: message.author.displayAvatarURL } }));
        }
    },
    description: lang.Help.CommandDescriptions.Coinflip,
    usage: 'coinflip [heads/tails] [coins]',
    aliases: [
        'flipcoin'
    ]
}