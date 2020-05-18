const Utils = require("../../modules/utils.js");
const lang = Utils.variables.lang;
const config = Utils.variables.config;
const Embed = Utils.Embed;

module.exports = {
  name: 'unlock',
  run: async (bot, message, args) => {
    let role = Utils.findRole(config.Permissions.Staff_Commands.Unlock, message.guild);

    if (!role) return message.channel.send(Embed({ preset: 'console' }));
    let logs = Utils.findChannel(config.Logs.Punishments.Channel, message.guild, type = 'text');
    if (config.Logs.Punishments.Enabled == true && !logs) return message.channel.send(Embed({ preset: 'console' }));
    if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Unlock)) return message.channel.send(Embed({ preset: 'nopermission' }));

    await Utils.asyncForEach(message.guild.roles.array(), async (r, i) => {
      if (Object.values(config.Lock_Unlock.Ignore).find(i => i == r.name)) return;
      else message.channel.overwritePermissions(r.id, { SEND_MESSAGES: null }).catch(err => {
        throw err;
      });
    });

    await message.channel.send(Embed({
      color: config.Error_Color,
      title: lang.ModerationModule.Commands.Unlock.Unlocked
    }))

    if (config.Logs.Punishments.Enabled == true) {
      logs.send(Embed({
        title: lang.ModerationModule.Commands.Unlock.Log.Title,
        fields: [{ name: lang.ModerationModule.Commands.Unlock.Log.Fields[0], value: '<#' + message.channel.id + '>' }, { name: lang.ModerationModule.Commands.Unlock.Log.Fields[1], value: '<@' + message.member.id + '>' }],
        timestamp: new Date(),
        thumbnail: lang.ModerationModule.Commands.Unlock.Log.Thumbnail
      }));
    }
  },
  description: lang.Help.CommandDescriptions.Unlock,
  usage: 'unlock',
  aliases: []
}