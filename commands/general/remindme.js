const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");
const ms = require("ms");

module.exports = {
  name: 'remindme',
  run: async (bot, message, args) => {
    let role = Utils.findRole(config.Permissions.User_Commands.Remindme, message.guild);
    let toRemind = args.slice(1).join(" ")

    if (!role) return message.channel.send(Embed({ preset: 'console' }));
    if (!Utils.hasPermission(message.member, config.Permissions.User_Commands.Remindme)) return message.channel.send(Embed({ preset: 'nopermission' }));
    if (!args[0]) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
    if (!/\d+.+/.exec(args[0])) return message.channel.send(Embed({ preset: 'error', description: lang.Other.OtherCommands.Remindme.Errors.InvalidTime, usage: module.exports.usage }));
    if (!args[1]) return message.channel.send(Embed({ preset: 'error', description: lang.Other.OtherCommands.Remindme.Errors.InvalidReminder, usage: module.exports.usage }));

    message.channel.send(Embed({ title: lang.Other.OtherCommands.Remindme.Embeds.ReminderSet.Title, description: lang.Other.OtherCommands.Remindme.Embeds.ReminderSet.Description.replace(/{reminder}/g, toRemind).replace(/{time}/g, args[0]), color: config.Success_Color }))
    setTimeout(() => {
      message.author.send(Embed({ title: lang.Other.OtherCommands.Remindme.Embeds.Reminder.Title, description: lang.Other.OtherCommands.Remindme.Embeds.Reminder.Description.replace(/{reminder}/g, toRemind) })).catch(err => {
        if (err) {
          message.channel.send('<@' + message.author.id + '>').then(msg => msg.delete(2500));
          return message.channel.send(Embed({ title: lang.Other.OtherCommands.Remindme.Embeds.Reminder.Title, description: message.author + lang.Other.OtherCommands.Remindme.Embeds.Reminder.Description.replace(/{reminder}/g, toRemind) }));
        }
      });
    }, ms(args[0]));
  },
  description: lang.Help.CommandDescriptions.Remindme,
  usage: 'remindme <time> <reminder>',
  aliases: []
}