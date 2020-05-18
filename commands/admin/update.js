const Utils = require("../../modules/utils.js");
const lang = Utils.variables.lang;
const config = Utils.variables.config;
const Embed = Utils.Embed;

module.exports = {
  name: 'update',
  run: async (bot, message, args, { prefixUsed, commandUsed }) => {
    let role = Utils.findRole(config.Permissions.Staff_Commands.Update, message.guild);
    let questions = [lang.AdminModule.Commands.Update.Questions[0], lang.AdminModule.Commands.Update.Questions[1], lang.AdminModule.Commands.Update.Questions[2]]
    let channel;
    let title;
    let update;
    let toTag = [];
    let msgIDs = [];

    if (!role) return message.channel.send(Embed({ preset: 'console' }));
    if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Update)) return message.channel.send(Embed({ preset: 'nopermission' }))

    const askQuestion = async (i, ask = true) => {
      const question = questions[i];
      if (ask) await message.channel.send(Embed({ title: lang.AdminModule.Commands.Update.UpdateSetup.replace(/{pos}/g, (i + 1) + '/3'), description: question })).then(msg => msgIDs.push(msg.id));

      await Utils.waitForResponse(message.author.id, message.channel)
        .then(response => {
          msgIDs.push(response.id);
          if (response.content.toLowerCase() === "cancel") return message.channel.send(Embed({ description: lang.AdminModule.Commands.Update.SetupCanceled }))
          if (i == 0) update = response.content;
          if (i == 1 && response.mentions.channels.first()) channel = response.mentions.channels.first();
          if (i == 1 && !response.mentions.channels.first()) {
            message.channel.send(Embed({ color: config.Error_Color, title: 'Invalid Channel', description: 'Please mention a channel' })).then(msg => msg.delete(2500));
            return askQuestion(i, false);
          }
          if (i == 2) {
            if (response.content.toLowerCase() == 'everyone') toTag = '@everyone';
            if (!!response.mentions.roles.first()) toTag = response.mentions.roles.map(r => r.id);
            if (response.content.toLowerCase().replace(/\s+/g, '').split(',').some(rolename => !!response.guild.roles.find(r => r.name.toLowerCase() == rolename))) response.content.toLowerCase().replace(/\s+/g, '').split(',').forEach(c => {
              if (response.guild.roles.find(r => r.name.toLowerCase() == c)) {
                toTag.push((response.guild.roles.find(r => r.name.toLowerCase() == c)).id)
              }
            })
            if (typeof toTag == 'object' && toTag.length < 1) toTag == undefined
          }

          if (i >= questions.length - 1) finishUpdate();
          else askQuestion(++i);
        })
    }

    askQuestion(0)

    const finishUpdate = () => {
      if (toTag && typeof toTag == 'string') channel.send(toTag);
      if (toTag && typeof toTag == 'object') channel.send(toTag.map(id => '<@&' + id + '>').join(', '));

      channel.send(Embed({
        color: config.Theme_Color,
        title: lang.AdminModule.Commands.Update.Embeds.Update.Title,
        description: update,
        footer: lang.AdminModule.Commands.Update.Embeds.Update.Footer.replace(/{tag}/g, message.author.tag)
      }));
      msgIDs.forEach(async id => (await message.channel.fetchMessage(id)).delete());
      message.channel.send(Embed({ title: lang.AdminModule.Commands.Update.Embeds.Posted.Title, description: lang.AdminModule.Commands.Update.Embeds.Posted.Description }))
    }


  },
  description: lang.Help.CommandDescriptions.Update,
  usage: 'update <message>',
  aliases: []
}