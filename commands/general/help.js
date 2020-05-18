const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");
const Commands = require('../../modules/handlers/CommandHandler').commands;
let general = "";
let coins = "";
let exp = "";
let tickets = "";
let other = "";

async function setUpHelp() {
  general = "";
  tickets = "";
  other = "";
  coins = "";
  exp = "";
  Commands.forEach(async command => {
    if (await Utils.variables.db.get.getCommands(command.command) && (await Utils.variables.db.get.getCommands(command.command)).enabled == false) return;
    if (command.type == "general") {
      general += `**{prefix}${command.command}** - ${command.description}\n`
    } else if (command.type == "other") {
      other += `**{prefix}${command.command}** - ${command.description}\n`
    } else if (command.type == "coins") {
      coins += `**{prefix}${command.command}** - ${command.description}\n`
    } else if (command.type == "tickets") {
      tickets += `**{prefix}${command.command}** - ${command.description}\n`
    } else if (command.type == "exp") {
      exp += `**{prefix}${command.command}** - ${command.description}\n`
    }
  })
}
module.exports = {
  name: 'help',
  run: async (bot, message, args) => {
    await setUpHelp()
    const prefix = await Utils.variables.db.get.getPrefixes(message.guild.id);
    let modules = {
      general: await Utils.variables.db.get.getModules('general'),
      tickets: await Utils.variables.db.get.getModules('tickets'),
      coins: await Utils.variables.db.get.getModules('coins'),
      exp: await Utils.variables.db.get.getModules('exp'),
      other: await Utils.variables.db.get.getModules('other')
    }

    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
    }
    let command = args[0] ? Commands.filter(c => !['mod', 'admin', 'management', 'giveaways'].includes(c.type)).find(c => c.command == args[0].toLowerCase() || c.aliases.find(a => a == args[0].toLowerCase())) : undefined;
    if (args[0] && command) {
      return message.channel.send(Embed({
        title: capitalize(command.command) + ' Command',
        fields: [
          { name: 'Description', value: command.description },
          { name: 'Aliases', value: command.aliases.map(a => prefix + a).join('\n').length < 1 ? 'None' : command.aliases.map(a => prefix + a).join('\n') },
          { name: 'Usage', value: prefix + command.usage },
          { name: 'Type', value: capitalize(command.type) }
        ]
      }))
    }

    if (config.Help_Menu_Type == 'categorized') {
      let help = Embed({
        title: lang.Help.HelpMenuTitle,
        fields: []
      })

      if (modules.general.enabled == true) help.embed.fields.push({ name: lang.Help.CategoryNames[3], value: `${prefix}help general`, inline: true });
      if (modules.tickets.enabled == true) help.embed.fields.push({ name: lang.Help.CategoryNames[4], value: `${prefix}help tickets`, inline: true });
      if (modules.coins.enabled == true) help.embed.fields.push({ name: lang.Help.CategoryNames[5], value: `${prefix}help coins`, inline: true });
      if (modules.exp.enabled == true) help.embed.fields.push({ name: lang.Help.CategoryNames[6], value: `${prefix}help xp`, inline: true });
      if (modules.other.enabled == true) help.embed.fields.push({ name: lang.Help.CategoryNames[7], value: `${prefix}help other`, inline: true });


      let embeds = {
        general: Embed({
          title: lang.Help.CategoryMenuTitles[3],
          description: general.replace(/{prefix}/g, prefix)
        }),
        tickets: Embed({
          title: lang.Help.CategoryMenuTitles[4],
          description: tickets.replace(/{prefix}/g, prefix)
        }),
        coins: Embed({
          title: lang.Help.CategoryMenuTitles[5],
          description: coins.replace(/{prefix}/g, prefix)
        }),
        exp: Embed({
          title: lang.Help.CategoryMenuTitles[6],
          description: exp.replace(/{prefix}/g, prefix)
        }),
        other: Embed({
          title: lang.Help.CategoryMenuTitles[7],
          description: other.replace(/{prefix}/g, prefix)
        }),
      }

      if (args.length == 0)
        message.channel.send(help).then(async msg => {
          if (modules.general.enabled == true) await msg.react('🙂');
          if (modules.tickets.enabled == true) await msg.react('🎟');
          if (modules.coins.enabled == true) await msg.react('💰');
          if (modules.exp.enabled == true) await msg.react('✨');
          if (modules.other.enabled == true) await msg.react('🗂');
        });

      const category = args[0] ? args[0].toLowerCase() : undefined;
      if (category) {
        if (category == 'general' && modules.general.enabled == true) return message.channel.send(embeds.general);
        if (category == 'tickets' && modules.tickets.enabled == true) return message.channel.send(embeds.tickets);
        if (category == 'coins' && modules.coins.enabled == true) return message.channel.send(embeds.coins);
        if (category == 'xp' && modules.exp.enabled == true) return message.channel.send(embeds.exp);
        if (category == 'other' && modules.other.enabled == true) return message.channel.send(embeds.other);
      }
    }
    if (config.Help_Menu_Type == 'normal') {
      let help = Embed({
        title: lang.Help.HelpMenuTitle,
        fields: []
      });

      if (modules.general.enabled == true) help.embed.fields.push({ name: lang.Help.CategoryNames[3], value: general.replace(/{prefix}/g, prefix) });
      if (modules.tickets.enabled == true) help.embed.fields.push({ name: lang.Help.CategoryNames[4], value: tickets.replace(/{prefix}/g, prefix) });
      if (modules.coins.enabled == true) help.embed.fields.push({ name: lang.Help.CategoryNames[5], value: coins.replace(/{prefix}/g, prefix) });
      if (modules.exp.enabled == true) help.embed.fields.push({ name: lang.Help.CategoryNames[6], value: exp.replace(/{prefix}/g, prefix) });
      if (modules.other.enabled == true) help.embed.fields.push({ name: lang.Help.CategoryNames[7], value: other.replace(/{prefix}/g, prefix) });
      if (help.embed.fields.length == 0) return;
      await message.channel.send(help);
    }
  },
  description: lang.Help.CommandDescriptions.Help,
  usage: 'help',
  aliases: []
}