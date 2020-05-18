const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
  name: 'ip',
  run: async (bot, message, args) => {
    message.channel.send(Utils.setupEmbed({
      configPath: config.IP.Embed,
      description: config.IP.Server_IP
    }));
  },
  description: lang.Help.CommandDescriptions.Ip,
  usage: 'ip',
  aliases: [
    'serverip'
  ]
}
