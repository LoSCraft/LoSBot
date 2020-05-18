const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.substr(1, string.length - 1);
}
module.exports = {
    name: 'module',
    run: async (bot, message, args) => {
        if (!Utils.hasPermission(message.member, config.Permissions.Bot_Management_Commands.Module)) return message.channel.send(Embed({ preset: 'nopermission' }));
        const Commands = require('../../modules/handlers/CommandHandler');
        const moduleNames = [...new Set(Commands.commands.map(c => c.type))];
        const modules = {};
        moduleNames.forEach(m => {
            modules[m.toLowerCase()] = Commands.commands.filter(c => c.type.toLowerCase() == m.toLowerCase()).map(c => c.command);
        })
        if (args.length == 0) {
            message.channel.send(Utils.Embed({
                title: lang.ManagementModule.Commands.Module.Embeds.List.Title,
                description: lang.ManagementModule.Commands.Module.Embeds.List.Description.replace(/{modules}/g, [...new Set(Commands.commands.map(c => '**' + capitalize(c.type) + '**'))].sort().join('\n')),
                footer: lang.ManagementModule.Commands.Module.Embeds.List.Footer.replace(/{prefix}/g, await Utils.variables.db.get.getPrefixes(message.guild.id))
            }))
        } else {
            const mod = modules[args[0].toLowerCase()];
            if (!mod) return message.channel.send(Embed({
                preset: 'error',
                description: lang.ManagementModule.Commands.Module.Errors.InvalidModule
            }))
            const moduleEnabled = (await Utils.variables.db.get.getModules(args[0].toLowerCase())).enabled;
            if (args.length == 1) {
                message.channel.send(Embed({
                    title: lang.ManagementModule.Commands.Module.Embeds.Module.Title.replace(/{module}/g, capitalize(args[0].toLowerCase())),
                    fields: [
                        {
                            name: lang.ManagementModule.Commands.Module.Embeds.Module.Fields[0],
                            value: moduleEnabled ? lang.ManagementModule.Commands.Module.Embeds.Module.Status[0] : lang.ManagementModule.Commands.Module.Embeds.Module.Status[1]
                        },
                        {
                            name: lang.ManagementModule.Commands.Module.Embeds.Module.Fields[1],
                            value: mod.join('\n')
                        }
                    ]
                }))
            } else {
                if (args[0].toLowerCase() == 'management') return message.channel.send(Embed({ preset: 'error', description: lang.ManagementModule.Commands.Module.Errors.StatusCantBeModified }))
                const onOrOff = args[1].toLowerCase();
                if (onOrOff !== "enable" && onOrOff !== "disable") return message.channel.send(Embed({ preset: 'error', description: lang.ManagementModule.Commands.Module.Errors.InvalidStatus }));
                const enabled = onOrOff == 'enable' ? true : false;
                const enabledText = enabled ? 'enabled' : 'disabled';
                await Utils.variables.db.update.modules.setModule(args[0].toLowerCase(), enabled);
                Commands.commands.forEach(cmd => {
                    if (cmd.type == args[0].toLowerCase()) {
                        Commands.commands.find(c => c.command == cmd.command).enabled = enabled;
                    }
                })
                message.channel.send(Embed({
                    title: lang.ManagementModule.Commands.Module.Embeds.EnabledDisabled.Title.replace(/{status}/g, capitalize(enabledText)),
                    description: lang.ManagementModule.Commands.Module.Embeds.EnabledDisabled.Description.replace(/{module}/g, capitalize(args[0].toLowerCase())).replace(/{status}/g, enabledText)
                }))
            }
        }
    },
    description: lang.Help.CommandDescriptions.Module,
    usage: 'module [module] [enable|disable]',
    aliases: []
}