const Role_Required = "Admin";
const Utils = require('../../modules/utils');
const fs = require('fs');
const lang = Utils.variables.lang;

module.exports = {
    name: 'reload',
    run: async (bot, message, args) => {
        if (!Utils.hasPermission(message.member, Utils.variables.config.Permissions.Bot_Management_Commands.Reload)) return message.channel.send(Utils.Embed({ preset: 'nopermission' }));

        const CommandHandler = require('../../modules/handlers/CommandHandler');
        const EventHandler = require('../../modules/handlers/EventHandler');

        function reloadCommands() {
            CommandHandler.commands.forEach(c => {
                try {
                    delete require.cache[require.resolve('../../commands/' + c.type + '/' + c.command + '.js')]
                } catch (err) {
                    // Command doesn't exist (it's an addon)
                }
            })
            CommandHandler.commands = [];
            CommandHandler.init(bot);
        }

        function reloadEvents() {
            EventHandler.events.forEach(e => {
                try {
                    bot.removeListener(e.name, e.call);
                    delete require.cache[require.resolve('../../events/' + e.name + '.js')];
                } catch (err) {
                    // Event doesn't exist (it's an addon)
                }
            })
            EventHandler.events = [];
            EventHandler.init(bot);
        }

        function reloadAddons() {
            fs.readdir("./addons/", (err, files) => {

                if (err) return console.log(err);
                files.forEach(addon => {
                    delete require.cache[require.resolve('../../addons/' + addon)];
                    require('../../addons/' + addon)(bot);
                    console.log(addon.split(".")[0] + " addon loaded.");
                })
            })
        }

        async function reloadConfig() {
            const updatedConfig = await require('../../modules/yml')('./config.yml');
            Utils.variables.set('config', updatedConfig);

            const updatedLang = await require('../../modules/yml')('./lang.yml');
            Utils.variables.set('config', updatedLang);
        }

        if (args.length == 0) {
            const msg = await message.channel.send(Utils.Embed({
                title: lang.ManagementModule.Commands.Reload.Bot[0]
            }))

            reloadCommands();
            reloadEvents();
            reloadAddons();

            msg.edit(Utils.Embed({
                color: Utils.variables.config.Success_Color,
                title: lang.ManagementModule.Commands.Reload.Bot[1]
            }))
        } else {
            const action = args[0].toLowerCase();

            if (action == 'addons') {
                const msg = await message.channel.send(Utils.Embed({
                    title: lang.ManagementModule.Commands.Reload.Addons[0]
                }))

                reloadAddons();

                msg.edit(Utils.Embed({
                    color: Utils.variables.config.Success_Color,
                    title: lang.ManagementModule.Commands.Reload.Addons[1]
                }))
            } else if (action == 'commands') {
                const msg = await message.channel.send(Utils.Embed({
                    title: lang.ManagementModule.Commands.Reload.Commands[0]
                }))

                reloadCommands();

                msg.edit(Utils.Embed({
                    color: Utils.variables.config.Success_Color,
                    title: lang.ManagementModule.Commands.Reload.Commands[1]
                }))
            } else if (action == 'events') {
                const msg = await message.channel.send(Utils.Embed({
                    title: lang.ManagementModule.Commands.Reload.Events[0]
                }))

                reloadEvents();

                msg.edit(Utils.Embed({
                    color: Utils.variables.config.Success_Color,
                    title: lang.ManagementModule.Commands.Reload.Events[1]
                }))
            } /*else if (action == 'config') {
                const msg = await message.channel.send(Utils.Embed({
                    title: lang.ManagementModule.Commands.Reload.Config[0]
                }))

                reloadConfig();

                msg.edit(Utils.Embed({
                    color: Utils.variables.config.Success_Color,
                    title: lang.ManagementModule.Commands.Reload.Config[1]
                }))
            } */else {
                message.channel.send(Utils.Embed({
                    preset: 'error',
                    description: lang.ManagementModule.Commands.Reload.Errors.UnknownAction.replace(/{action}/g, action)
                }))
            }
        }
    },
    description: lang.Help.CommandDescriptions.Reload,
    usage: 'reload [addons|commands|events|config]',
    aliases: []
}