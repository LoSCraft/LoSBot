const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");

module.exports = {
    name: 'buy',
    run: async (bot, message, args) => {
        const { config } = Utils.variables;
        if (config.Coin_System.Shop_System.Enabled == true) {
            let items = Object.values(config.Coin_System.Shop_System.Items);

            if (args.length == 0) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));

            let item = items.find(i => i.name.toLowerCase() == args.join(" ").toLowerCase());

            if (!item) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Buy.Errors.InvalidItem.replace(/{validitems}/g, items.map(i => i.name).join(', ')) }));

            let userCoins = await Utils.variables.db.get.getCoins(message.member);
            let price = item.price;
            let role = Utils.findRole(item.role, message.guild);

            if (!role) return message.channel.send(Embed({ preset: 'console' }));
            if (userCoins < price) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Errors.NotEnoughCoins }));

            if (message.member.roles.has(role.id)) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Buy.Errors.AlreadyPurchased }));
            Utils.variables.db.update.coins.updateCoins(message.member, price, 'remove');
            message.member.addRole(role.id);
            message.channel.send(Embed({ title: lang.CoinModule.Commands.Buy.Embeds.ItemPurchased.Title, description: lang.CoinModule.Commands.Buy.Embeds.ItemPurchased.Description.replace(/{item}/g, item.name).replace(/{price}/g, item.price), color: config.Success_Color }));
        }
    },
    description: lang.Help.CommandDescriptions.Buy,
    usage: 'buy <item>',
    aliases: []
}