const Utils = require("../../modules/utils.js");
const Discord = Utils.Discord;
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'avatar',
    run: async (bot, message, args) => {
        let user = Utils.ResolveUser(message) || message.member;
        let avatar = user.user.displayAvatarURL;
        if (!avatar.endsWith('?size=2048')) avatar += "?size=2048";
        message.channel.send(Embed({
            title: lang.Other.OtherCommands.Avatar.Title.replace(/{user}/g, user.user.username),
            image: avatar,
            footer: {
                text: lang.Other.OtherCommands.Avatar.Footer,
                icon: bot.user.displayAvatarURL
            }
        }))
    },
    description: lang.Help.CommandDescriptions.Avatar,
    usage: 'avatar [@user]',
    aliases: [

    ]
}