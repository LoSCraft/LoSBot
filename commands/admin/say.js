const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
  name: 'say',
  run: async (bot, message, args, { prefixUsed, commandUsed }) => {
    let role = Utils.findRole(config.Permissions.Staff_Commands.Say, message.guild);
    let action = args[0] ? args[0].toLowerCase() : undefined;
    if (!role) return message.channel.send(Embed({ preset: 'console' }))
    if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Say)) return message.channel.send(Embed({ preset: 'nopermission' }));
    if (action && args.length < 2 || !['embed', 'normal'].includes(action)) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
    message.delete();

    const msg = message.content.replace(new RegExp(prefixUsed + commandUsed + '\\s(normal|embed)\\s', 'gi'), '');
    if (action == 'normal') return message.channel.send(msg)
    else if (action == 'embed') return message.channel.send(Embed({ description: msg }));
  },
  description: lang.Help.CommandDescriptions.Say,
  usage: 'say <normal/embed> <message>',
  aliases: []
}