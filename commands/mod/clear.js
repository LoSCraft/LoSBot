const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
  name: 'clear',
  run: async (bot, message, args) => {
    let role = Utils.findRole(config.Permissions.Staff_Commands.Clear, message.guild);
    let error = false;

    if (!role) return message.channel.send(Embed({ preset: 'console' }));
    if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Clear)) return message.channel.send(Embed({ preset: 'nopermission' }));
    if (args.length == 0) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
    if (isNaN(args[0])) return message.channel.send(Embed({ preset: 'error', description: `Invalid Integer`, usage: module.exports.usage }));

    await message.channel.bulkDelete(parseInt(args[0]) + 1, false).catch(async err => {
      error = true;
      if (err.code == 50013) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Commands.Clear.Errors.BotNoPerms }));
      if (err.code == 50034) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Commands.Clear.Errors.OlderThan14Days }));
      if (err.code == 50035) return message.channel.send(Embed({ preset: 'error', description: lang.ModerationModule.Commands.Clear.Errors.DeleteMoreThan99 }))
    });
    if (!error) return message.channel.send(Embed({ title: lang.ModerationModule.Commands.Clear.Cleared.replace(/{amt}/g, args[0]), color: config.Success_Color })).then(msg => msg.delete(5000));
  },
  description: lang.Help.CommandDescriptions.Clear,
  usage: 'clear <amount>',
  aliases: [
    'purge'
  ]
}