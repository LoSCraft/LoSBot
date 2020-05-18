const Utils = require("../../modules/utils.js");
const Embed = Utils.Embed;
const Discord = Utils.Discord;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'rolldice',
    run: async (bot, message, args) => {
        let diceSides = {
            1: lang.Other.OtherCommands.Rolldice.Sides[0],
            2: lang.Other.OtherCommands.Rolldice.Sides[1],
            3: lang.Other.OtherCommands.Rolldice.Sides[2],
            4: lang.Other.OtherCommands.Rolldice.Sides[3],
            5: lang.Other.OtherCommands.Rolldice.Sides[4],
            6: lang.Other.OtherCommands.Rolldice.Sides[5]
        };
        let dice = Object.keys(diceSides)[Math.floor(Math.random() * Object.keys(diceSides).length)];

        await message.channel.send(lang.Other.OtherCommands.Rolldice.RollingDice);
        await message.channel.send(Embed({
            title: lang.Other.OtherCommands.Rolldice.Embed.Title,
            description: lang.Other.OtherCommands.Rolldice.Embed.Description.replace(/{result}/g , dice),
            image: Object.values(diceSides)[Object.keys(diceSides).indexOf(dice)],
            footer: { text: lang.Other.OtherCommands.Rolldice.Embed.Footer.replace(/{user}/g, message.author.tag), icon: message.author.displayAvatarURL }
        }))
    },
    description: lang.Help.CommandDescriptions.Rolldice,
    usage: 'rolldice',
    aliases: [
        'roll',
        'dice'
    ]
}