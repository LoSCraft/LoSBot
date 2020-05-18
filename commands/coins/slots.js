const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config2 = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");

module.exports = {
    name: 'slots',
    run: async (bot, message, args) => {
        const coins = await Utils.variables.db.get.getCoins(message.member);

        if (args.length == 0) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));

        const gamble = parseInt(args[0]);
        if (!gamble) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Slots.Errors.InvalidAmount, usage: module.exports.usage }));
        if (gamble < 10) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Slots.Errors.AtLeast10Coins, usage: module.exports.usage }));
        if (gamble >= 100000000) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Slots.Errors.GreaterThan100M }))
        if (gamble > coins) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Errors.NotEnoughCoins, usage: module.exports.usage }));

        const config = Utils.variables.config.Slots_System.Emojis;
        const emojis = Object.keys(config);

        const emojiChances = {};
        emojis.forEach((emoji, i) => {
            const current = Object.values(emojiChances);
            const previousNumber = current[i - 1] || 0;
            const chance = config[emoji].Chance;
            emojiChances[emoji] = previousNumber + chance;
        })

        const emojiChanceKeys = Object.keys(emojiChances);
        const emojiChanceValues = Object.values(emojiChances);
        if(Object.values(config).map(e => e.Chance).reduce((acc, curr) => acc + curr) !== 100) return  message.channel.send(Embed({ preset: 'error', description: 'All chance values must add up to 100'}));
        const final = [];
        for (let i = 0; i < 9; i++) {
            const rand = ~~(Math.random() * 100) + 1;
            const emojiPicked = emojiChanceKeys[emojiChanceValues.indexOf(emojiChanceValues.find(v => v >= rand))];
            final.push({
                emoji: emojiPicked,
                data: config[emojiPicked]
            })
        }
        const add = ~~final.map(f => f.data.Coins * gamble).reduce((acc, curr) => acc + curr);
        const embed = Utils.Embed({
            title: lang.CoinModule.Commands.Slots.Embed.Title,
            description: final.map(f => f.emoji).map((emoji, index) => emoji + ((index + 1) % 3 == 0 && index !== 0 ? '\n' : ' | ')).join('') + lang.CoinModule.Commands.Slots.Embed.Description.replace(/{user}/g, message.member).replace(/{recieved}/g, add).replace(/{gambled}/g, gamble)
        })
        message.channel.send(embed);
        await Utils.variables.db.update.coins.updateCoins(message.member, gamble, 'remove');
        await Utils.variables.db.update.coins.updateCoins(message.member, add, 'add');

    },
    description: lang.Help.CommandDescriptions.Slots,
    usage: 'slots <coins>',
    aliases: [
        'slot',
        'gamble'
    ]
}
