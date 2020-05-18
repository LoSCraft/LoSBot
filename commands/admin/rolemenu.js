const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'rolemenu',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Permissions.Staff_Commands.Rolemenu, message.guild);

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Rolemenu)) return message.channel.send(Embed({ preset: 'nopermission' }));
        if (args.length == 0) return message.channel.send(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
        let menu = config.Role_Menu.Menus[args[0]];
        if (!menu) return message.channel.send(Embed({ title: lang.AdminModule.Commands.Rolemenu.Embeds.InvalidMenu.Title, description: lang.AdminModule.Commands.Rolemenu.Embeds.InvalidMenu.Description, color: config.Error_Color }));

        let desc = menu['description'];
        let emojiroles = Object.keys(menu).filter(e => e !== 'description').map((e, i) => {
            if (desc) i += 1
            if (bot.emojis.find(emoji => emoji.id == e)) {
                let emoji = bot.emojis.find(emoji => emoji.id == e);
                return `<:${emoji.name}:${emoji.id}> **${Object.values(menu)[i]}**`
            } else return `${e} **${Object.values(menu)[i]}**`
        }).join('\n')

        message.channel.send(Embed({
            title: lang.AdminModule.Commands.Rolemenu.Embeds.Rolemenu.Title + args[0],
            description: (desc) ? desc.replace(/{emojiroles}/g, emojiroles) : emojiroles
        })).then(async msg => {
            Object.keys(menu).filter(e => e !== 'description').forEach(async (e, i) => {
                setTimeout(async function () {
                    await msg.react(e);
                }, i * 600);
            });
        });
    },
    description: lang.Help.CommandDescriptions.Rolemenu,
    usage: 'rolemenu <menu>',
    aliases: []
}
