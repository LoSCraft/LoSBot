const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
module.exports = {
  name: 'shop',
  run: async (bot, message, args) => {
    if (config.Coin_System.Shop_System.Enabled == true) {
      let embed = Embed({
        title: config.Coin_System.Shop_System.Embed_Title,
        thumbnail: bot.user.displayAvatarURL,
        fields: []
      })

      let items = config.Coin_System.Shop_System.Items;
      Object.keys(items).forEach(itemname => {
        let item = items[itemname]
        embed.embed.fields.push({ name: `**${itemname}**`, value: item.description });
      })

      await message.channel.send(embed);
    }
  },
  description: lang.Help.CommandDescriptions.Shop,
  usage: 'shop',
  aliases: [
    'store'
  ]
}