const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'leveltop',
    run: async (bot, message, args) => {
        let experience = (await Utils.variables.db.get.getExperience()).filter(e => e.guild == message.guild.id);
        let leaderboard = "";
        let result = [];

        for (let i in experience)
            result.push({
                level: experience[i].level,
                xp: experience[i].xp,
                id: experience[i].user
            });
        result = result.filter(r => r.xp >= 0 && r.id && r.level >= 1);
        result = result.sort((a, b) => b.xp - a.xp);

        for (let i = 0; i < 15; i++) {
            if (args.length > 0 && parseInt(args[0])) i = ((parseInt(args[0]) - 1) * 10) + i;
            if (result[i]) {
                let member = message.guild.member(result[i].id);
                if (!result[i].xp && !result[i].level && !member) continue;
                leaderboard += `**#${i + 1}** Level: \`\`${result[i].level}\`\` XP: \`\`${result[i].xp}\`\`- ${member ? `<@${member.id}>` : lang.XPModule.LeveltopUnknownUser}\n`;
            }
        }

        let total = result.map(r => (!!r.xp) ? r.xp : 0).reduce((acc, cv) => acc + cv);

        message.channel.send(Utils.setupEmbed({
            configPath: config.Level_System.Embeds.Level_Top,
            description: leaderboard,
            variables: [
                { searchFor: /{page}/g, replaceWith: args.length > 0 ? parseInt(args[0]) : 1 },
                { searchFor: /{totalxp}/g, replaceWith: ~~total }
            ]
        }));
    },
    description: lang.Help.CommandDescriptions.Leveltop,
    usage: 'leveltop [page]',
    aliases: [
        'levellb'
    ]
}
