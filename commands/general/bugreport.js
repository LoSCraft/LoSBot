const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
  name: 'bugreport',
  run: async (bot, message, args) => {
    let channel = Utils.findChannel(config.Channels.Bug_Reports, message.guild);

    if (!channel) return message.channel.send(Embed({ preset: 'console' }));
    if (!args[0]) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));

    channel.send(Embed({
      title: lang.Other.OtherCommands.Bugreport.Embeds.BugReport.Title,
      description: args.join(" "),
      footer: { text: lang.Other.OtherCommands.Bugreport.Embeds.BugReport.Footer.replace(/{user}/g, message.author.tag), icon: message.author.displayAvatarURL },
      timestamp: new Date()
    }))
    message.channel.send(Embed({ title: lang.Other.OtherCommands.Bugreport.Embeds.BugReported.Title, description: lang.Other.OtherCommands.Bugreport.Embeds.BugReported.Description }));
  },
  description: lang.Help.CommandDescriptions.Bugreport,
  usage: 'bugreport <bug>',
  aliases: [
    'bug'
  ]
}