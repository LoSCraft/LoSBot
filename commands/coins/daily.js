const Utils = require("../../modules/utils.js");
const Embed = Utils.Embed;
const Discord = Utils.Discord;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'daily',
    run: async (bot, message, args) => {
        if (!Utils.hasPermission(message.member, config.Permissions.User_Commands.Daily)) return message.channel.send(Embed({ preset: 'nopermission' }));
        let time = (new Date(Math.floor(await Utils.variables.db.get.getDailyCoinsCooldown(message.member)))).getTime();
        if (time > (new Date()).getTime()) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Daily.Cooldown.replace(/{time}/g, Utils.getTimeDifference(time, new Date())) }));

        let nextTime = new Date()
        nextTime.setHours(nextTime.getHours() + 24);

        await Utils.variables.db.update.coins.updateCoins(message.member, config.Coin_System.Daily_Coins, 'add');
        await Utils.variables.db.update.coins.setNextDailyCoinsTime(message.member, nextTime.getTime())
        await message.channel.send(Embed({ title: lang.CoinModule.Commands.Daily.Collected.replace(/{coins}/g, config.Coin_System.Daily_Coins), color: config.Success_Color }))
    },
    description: lang.Help.CommandDescriptions.Daily,
    usage: 'daily',
    aliases: ['dailycoins']
}