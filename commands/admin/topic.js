const Utils = require("../../modules/utils.js");
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'topic',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Permissions.Staff_Commands.Topic, message.guild)
        let channel = message.mentions.channels.first() || message.channel;
        let newTopic;

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Topic)) return message.channel.send(Embed({ preset: 'nopermission' }));
        if (message.mentions.channels.first()) {
            if (!args[1]) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
            else newTopic = args.slice(1).join(" ");
        } else {
            if (!args[0]) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
            else newTopic = args.join(" ");
        }

        channel.setTopic(newTopic)
        message.channel.send(Embed({ title: lang.AdminModule.Commands.Topic.Title, description: lang.AdminModule.Commands.Topic.Description.replace(/{newtopic}/g, newTopic), color: config.Success_Color }));
    },
    description: lang.Help.CommandDescriptions.Topic,
    usage: 'topic [#channel] (new topic)',
    aliases: []
}