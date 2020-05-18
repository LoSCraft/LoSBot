const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'cointop',
    run: async (bot, message, args) => {
        let coins = (await Utils.variables.db.get.getCoins()).filter(c => c.guild == message.guild.id && c.user.toLowerCase() !== 'unknown');
        let result = [];
        let leaderboard = "";

        for (let i in coins)
            result.push({
                coins: coins[i].coins,
                id: coins[i].user
            });
        result = result.filter(r => r.coins >= 0 && !!r.id);
        result = result.sort((a, b) => b.coins - a.coins);

        for (let i = 0; i < 15; i++) {
            if (args.length > 0 && parseInt(args[0])) i = ((parseInt(args[0]) - 1) * 10) + i;
            if (result[i]) {
                let member = message.guild.member(result[i].id);
                if (~~result[i].coins == 0 && !member) continue;
                leaderboard += `**#${i + 1}** \`\`${result[i].coins.toLocaleString()}\`\`- ${member ? `<@${member.id}>` : lang.CoinModule.CointopUnknownUser}\n`;
            }
        }
        let total = result.map(r => (!!r.coins) ? r.coins : 0).reduce((acc, cv) => acc + cv);

        message.channel.send(Utils.setupEmbed({
            configPath: config.Coin_System.Embeds.Coin_Top,
            description: leaderboard,
            variables: [
                { searchFor: /{page}/g, replaceWith: args.length > 0 ? parseInt(args[0]) : 1 },
                { searchFor: /{totalcoins}/g, replaceWith: total.toLocaleString() }
            ]
        }));
    },
    description: lang.Help.CommandDescriptions.Cointop,
    usage: 'cointop [page]',
    aliases: [
        'coinlb'
    ]
}