const Utils = require("../../modules/utils.js");
const Discord = require("discord.js");
const lang = Utils.variables.lang;
const config = Utils.variables.config;
const Embed = Utils.Embed;

module.exports = {
  name: 'suggest',
  run: async (bot, message, args) => {
    if (config.Suggestions.Type.toLowerCase() === 'normal') {
      let role = Utils.findRole(config.Permissions.User_Commands.Suggest, message.guild);
      let channel = Utils.findChannel(config.Suggestions.Channel, message.guild);

      if (!role) return message.channel.send(Embed({ preset: 'console' }));
      if (!channel) return message.channel.send(Embed({ preset: 'console' }));
      if (!Utils.hasPermission(message.member, config.Permissions.User_Commands.Suggest)) return message.channel.send(Embed({ preset: 'nopermission' }));
      if (args.length == 0) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));

      channel.send(Utils.setupEmbed({
        configPath: config.Suggestions.Embed_Settings,
        description: args.join(" "),
        variables: [
          { searchFor: /{tag}/g, replaceWith: message.author.tag },
          { searchFor: /{userPFP}/g, replaceWith: message.author.displayAvatarURL },
          { searchFor: /{botPFP}/g, replaceWith: bot.user.displayAvatarURL }
        ]
      })).then(async msg => {
        await msg.react("✅");
        await msg.react("❌");
      })
      message.channel.send(Embed({ title: lang.Other.OtherCommands.Suggest.Embed.Title, description: lang.Other.OtherCommands.Suggest.Embed.Description, color: config.Success_Color }));
    }
  },
  description: lang.Help.CommandDescriptions.Suggest,
  usage: 'suggest <idea>',
  aliases: []
}