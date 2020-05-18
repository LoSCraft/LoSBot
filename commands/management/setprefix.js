const Utils = require("../../modules/utils.js");
const lang = Utils.variables.lang;
const config = Utils.variables.config;
const Embed = Utils.Embed;

module.exports = {
    name: 'setprefix',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Permissions.Bot_Management_Commands.Set_Prefix, message.guild)

        if (!role) return message.channel.send(Embed({ preset: 'conosle' }))
        if (!Utils.hasPermission(message.member, config.Permissions.Bot_Management_Commands.Set_Prefix)) return message.channel.send(Embed({ preset: 'nopermission' }));
        if (args.length == 0) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));

        Utils.variables.db.update.prefixes.updatePrefix(message.guild.id, args[0]);
        await message.channel.send(Embed({ title: lang.ManagementModule.Commands.Setprefix.Title, description: lang.ManagementModule.Commands.Setprefix.Description.replace(/{prefix}/g, args[0]), color: config.Success_Color }));
    },
    description: lang.Help.CommandDescriptions.Setprefix,
    usage: 'setprefix <prefix>',
    aliases: []
}