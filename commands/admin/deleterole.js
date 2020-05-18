const Utils = require("../../modules/utils.js");
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'deleterole',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Permissions.Staff_Commands.Deleterole, message.guild);

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Deleterole)) return message.channel.send(Embed({ preset: 'nopermission' }));

        let toDelete = message.mentions.roles.first() || message.guild.roles.find(r => r.name == args.join(" "));

        if (!toDelete) return message.channel.send(Embed({ preset: 'error', description: lang.AdminModule.Commands.Deleterole.Errors.InvalidRole, usage: module.exports.usage }));

        let msg = await message.channel.send(Embed({ title: lang.AdminModule.Commands.Deleterole.Confirmation }));
        await msg.react('✅');
        await msg.react('❌');
        Utils.waitForReaction(['✅', '❌'], message.author.id, msg).then(reaction => {
            (reaction.emoji.name == '✅') ? message.channel.send(Embed({ title: lang.AdminModule.Commands.Deleterole.Deleted, color: config.Theme_Color })).then(async msg => await toDelete.delete()) : message.channel.send(Embed({ title: lang.AdminModule.Commands.Deleterole.Canceled, color: config.Error_Color }));
        })

    },
    description: lang.Help.CommandDescriptions.Deleterole,
    usage: 'deleterole <@role>',
    aliases: []
}