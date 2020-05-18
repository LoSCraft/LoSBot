const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");
const Commands = require('../../modules/handlers/CommandHandler').commands;
let moderation = "";
let admin = "";
let management = "";

async function setUpHelp() {
    moderation = "";
    admin = "";
    management = "";
    Commands.forEach(async command => {
        if (await Utils.variables.db.get.getCommands(command.command) && (await Utils.variables.db.get.getCommands(command.command)).enabled == false) return;
        if (command.type == "mod") {
            moderation += `**{prefix}${command.command}** - ${command.description}\n`
        } else if (command.type == "admin" || command.type == "giveaways") {
            admin += `**{prefix}${command.command}** - ${command.description}\n`
        } else if (command.type == 'management' || command.type == 'utils') {
            management += `**{prefix}${command.command}** - ${command.description}\n`
        }
    })
}
module.exports = {
    name: 'staffhelp',
    run: async (bot, message, args) => {
        await setUpHelp();
        let role = Utils.findRole(config.Permissions.Staff_Commands.Staffhelp, message.guild);
        const prefix = await Utils.variables.db.get.getPrefixes(message.guild.id);
        let modules = {
            mod: await Utils.variables.db.get.getModules('mod'),
            admin: await Utils.variables.db.get.getModules('admin'),
            management: await Utils.variables.db.get.getModules('management')
        }

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Staffhelp)) return message.channel.send(Embed({ preset: 'nopermission' }));

        function capitalize(str) {
            return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
        }
        let command = args[0] ? Commands.filter(c => !['general', 'tickets', 'coins', 'exp', 'other'].includes(c.type)).find(c => c.command == args[0].toLowerCase() || c.aliases.find(a => a == args[0].toLowerCase())) : undefined;
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
        if (config.Help_Menu_Type.toLowerCase() == 'categorized') {
            let staff = Embed({
                title: lang.Help.StaffHelpMenuTitle,
                fields: []
            })

            if (modules.mod.enabled == true) staff.embed.fields.push({ name: lang.Help.CategoryNames[0], value: `${prefix}help moderation`, inline: true })
            if (modules.admin.enabled == true) staff.embed.fields.push({ name: lang.Help.CategoryNames[1], value: `${prefix}help admin`, inline: true })
            if (modules.management.enabled == true) staff.embed.fields.push({ name: lang.Help.CategoryNames[2], value: `${prefix}help management`, inline: true })
            if (staff.embed.fields.length == 0) return;

            let embeds = {
                mod: Embed({
                    title: lang.Help.CategoryMenuTitles[0],
                    description: moderation.replace(/{prefix}/g, prefix)
                }),
                admin: Embed({
                    title: lang.Help.CategoryMenuTitles[1],
                    description: admin.replace(/{prefix}/g, prefix)
                }),
                management: Embed({
                    title: lang.Help.CategoryMenuTitles[2],
                    description: management.replace(/{prefix}/g, prefix)
                })
            }

            if (args.length == 0) {
                message.channel.send(staff).then(async msg => {
                    if (modules.mod.enabled == true) await msg.react('👮');
                    if (modules.admin.enabled == true) await msg.react('🛠');
                    if (modules.management.enabled == true) await msg.react('🖥');
                });
            }

            const category = args[0] ? args[0].toLowerCase() : undefined;
            if (category) {
                if (category == 'moderation' && modules.mod.enabled == true) return message.channel.send(embeds.mod);
                if (category == 'admin' && modules.admin.enabled == true) return message.channel.send(embeds.admin);
                if (category == 'management' && modules.management.enabled == true) return message.channel.send(embeds.management);
            }
        }
        if (config.Help_Menu_Type.toLowerCase() == 'normal') {
            let staff = Embed({
                title: lang.Help.StaffHelpMenuTitle,
                fields: []
            });

            if (modules.mod.enabled == true) staff.embed.fields.push({ name: lang.Help.CategoryNames[0], value: moderation.replace(/{prefix}/g, prefix) });
            if (modules.admin.enabled == true) staff.embed.fields.push({ name: lang.Help.CategoryNames[1], value: admin.replace(/{prefix}/g, prefix) });
            if (modules.management.enabled == true) staff.embed.fields.push({ name: lang.Help.CategoryNames[2], value: management.replace(/{prefix}/g, prefix) });
            if (staff.embed.fields.length == 0) return;
            await message.channel.send(staff);
        }
    },
    description: lang.Help.CommandDescriptions.Staffhelp,
    usage: 'staffhelp',
    aliases: [
        'shelp'
    ]
}