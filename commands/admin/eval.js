const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'eval',
    run: async (bot, message, args) => {
        if (!config.Permissions.Bot_Management_Commands.Eval.includes(message.author.id)) return;
        message.delete()
        const code = args.join(" ");
        const embed = new Discord.RichEmbed()
            .setTitle("Evaluate")
            .addField("Input", '```js\n' + code + '```', true)
        try {
            let { res, type, name } = handle(await eval('(async () => { ' + code + ' })()'))
            embed.addField("Output", '```js\n' + res.replace(bot.token, "") + '```', true)
                .addField("Type", '```' + type + '```')
                .setColor(config.Theme_Color)
            name && embed.addField("Constructor Name", '```' + name + '```', true)
        } catch (err) {
            embed.addField("Error", '```' + err + '```', true).setColor(config.Error_Color)
            if (err.name) embed.addField("Type", '```' + err.name.replace(/(.[^A-Z\s]+)([A-Z])/g, '$1 $2') + '```')
        }
        message.channel.send(embed)

        function getType(obj) {
            return ({})
                .toString.call(obj)
                .match(/\s([a-z]+)/i)[1]
        }
        function handle(res) {
            let name = res && res.constructor
            name = name ? name.name : ""
            let type = getType(res)
            if (typeof res !== "string")
                res = require('util').inspect(res, { depth: 0 });
            return {
                res: `${res}`.slice(0, 1000),
                type: type,
                name: name !== type && name
            }
        }
    },
    description: lang.Help.CommandDescriptions.Eval,
    usage: 'eval <code>',
    aliases: []
}