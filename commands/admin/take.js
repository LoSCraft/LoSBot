const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'take',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Permissions.Staff_Commands.Take, message.guild);
        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Take)) return message.channel.send(Embed({ preset: 'nopermission' }));

        let msg = await message.channel.send(Embed({ title: lang.AdminModule.Commands.Take.Embeds.What.Title, description: `${Utils.getEmoji(1)} - Coins \n${Utils.getEmoji(2)} - XP \n${Utils.getEmoji(3)} - Role` }))
        await msg.react(Utils.getEmoji(1));
        await msg.react(Utils.getEmoji(2));
        await msg.react(Utils.getEmoji(3));

        Utils.waitForReaction([Utils.getEmoji(1), Utils.getEmoji(2), Utils.getEmoji(3)], message.author.id, msg).then(async reaction => {
            if (reaction.emoji.name == Utils.getEmoji(1) && (await Utils.variables.db.get.getModules('coins')).enabled == false) return message.channel.send(Embed({ preset: 'error', title: lang.AdminModule.Commands.Take.Errors.CoinsDisabled }));
            if (reaction.emoji.name == Utils.getEmoji(2) && (await Utils.variables.db.get.getModules('exp')).enabled == false) return message.channel.send(Embed({ preset: 'error', title: lang.AdminModule.Commands.Take.Embeds.What.XPDisabled }));
            let type;
            let response1;
            let response2;
            let roles;
            if (reaction.emoji.name == Utils.getEmoji(1)) type = 'coins';
            if (reaction.emoji.name == Utils.getEmoji(2)) type = 'experience';
            if (reaction.emoji.name == Utils.getEmoji(3)) type = 'roles';

            // Remove reactions
            msg.reactions.forEach(async reaction => {
                let users = await reaction.fetchUsers();
                users.forEach(user => reaction.remove(user));
            });

            // Ask first question
            if (type == 'roles') {
                msg.edit(Embed({ title: lang.AdminModule.Commands.Take.Embeds.Roles.Title, description: lang.AdminModule.Commands.Take.Embeds.Roles.Description }));
                response1 = await Utils.waitForResponse(message.author.id, message.channel);
                roles = []
                response1.mentions.roles.forEach(role => {
                    roles.push(role.id);
                })
                response1.content.split(' ').forEach((role, i) => {
                    let check = new RegExp(/([<@]|[>])/g);
                    if (!check.test(role)) {
                        let role = message.guild.roles.find(r => r.name == response1.content.split(' ')[i].replace(/_/g, ''));
                        if (!role) return message.channel.send(Embed({ preset: 'error', description: lang.AdminModule.Commands.Take.Errors.InvalidRole.replace(/{role}/g, response1.content.split(' ')[i]) }));
                        else roles.push(role.id);
                    }
                });
            } else {
                if (type == 'coins') msg.edit(Embed({ title: lang.AdminModule.Commands.Take.Embeds.Coins.Title, description: lang.AdminModule.Commands.Take.Embeds.Coins.Description }));
                if (type == 'experience') msg.edit(Embed({ title: lang.AdminModule.Commands.Take.Embeds.Exp.Title, description: lang.AdminModule.Commands.Take.Embeds.Exp.Description }))
                response1 = await Utils.waitForResponse(message.author.id, message.channel);
                if (!parseInt(response1.content)) return message.channel.send(Embed({ preset: 'error', description: lang.AdminModule.Commands.Take.Errors.NotNumber.replace(/{type}/g, type).replace(/{message}/g, answers[0]) }))
            }

            // Ask second question
            response1.delete();
            msg.edit(Embed({ title: lang.AdminModule.Commands.Take.Embeds.Who.Title.replace(/{type}/g, type), description: lang.AdminModule.Commands.Take.Embeds.Who.Description }))
            response2 = await Utils.waitForResponse(message.author.id, message.channel);
            if (!response2.mentions.users.first() && !response2.mentions.roles.first() && !response2.mentions.everyone == true && !response2.content.includes('all')) return message.channel.send(Embed({ preset: 'error', description: lang.AdminModule.Commands.Take.Errors.InvalidPerson }));

            response2.delete();
            msg.edit(Embed({ description: lang.AdminModule.Commands.Take.Completing }));

            // Figure out who's actually going to be getting stuff. This also prevents people from getting double coins or experience.
            let who = '';
            let users = [];
            response2.mentions.members.forEach(member => {
                if (member.user.bot) return;
                if (users.includes(member.user.id)) return
                else users.push(member.user.id);
            });
            response2.mentions.roles.forEach(role => role.members.forEach(member => {
                if (member.user.bot) return;
                if (users.includes(member.user.id)) return
                else users.push(member.user.id);
            }));
            if (response2.mentions.everyone || response2.content.toLowerCase().includes('all')) {
                message.guild.members.forEach(member => {
                    if (member.user.bot) return;
                    if (users.includes(member.user.id)) return;
                    else users.push(member.user.id);
                });
                who += lang.AdminModule.Commands.Take.AllMembers
            }
            if (users.length == 0) return message.channel.send(Embed({ preset: 'error', description: lang.AdminModule.Commands.Take.Errors.NoUsers }));
            who += users.map(user => message.guild.members.find(m => m.id == user)).join(", ");

            // Complete actual command
            users.forEach(async user => {
                const member = message.guild.member(user);
                if (type == 'roles') roles.forEach(r => {
                    if (message.guild.roles.find(role => role.id == r).calculatedPosition > message.member.highestRole.calculatedPosition) return message.channel.send(Embed({ preset: 'error', description: lang.AdminModule.Commands.Take.Errors.HigherRole[0] }));
                    if (message.guild.roles.find(role => role.id == r).calculatedPosition > message.guild.members.find(m => m.id == bot.user.id).highestRole.calculatedPosition) return message.channel.send(Embed({ preset: 'error', description: lang.AdminModule.Commands.Take.Errors.HigherRole[1] }));
                    message.guild.members.find(m => m.id == user).removeRole(r)
                });
                if (type == 'coins') await Utils.variables.db.update.coins.updateCoins(member, parseInt(response1.content), 'remove')
                if (type == 'experience') {
                    const xp = await Utils.variables.db.get.getExperience(member);
                    /*
                    let removexp = parseInt(response1.content);
                    let removelevel = 0;
                    while (removexp > 0) {
                        const levelBelow = xp.level - (removelevel - 1);
                        const xpNeeded = ~~((level * (175 * level) * 0.5)) - amt - xp;
                    }
                    console.log(xp.xp, response1.content)
                    console.log(calculateLevel(xp.xp - parseInt(response1.content)))

                    await Utils.variables.db.update.experience.updateExperience(u, xp.level - removelevel, xp.xp - removedxp);
                    */
                    await Utils.variables.db.update.experience.updateExperience(member, xp.level, parseInt(response1.content), 'remove');
                }
            });
            await msg.delete();
            // If you have lots of Discord members and you have given stuff to all/many members, it will only show how ever many can fit in a embed description.
            let desc = lang.AdminModule.Commands.Take.Embeds.Taken.Description.replace(/{type}/g, type).replace(/{users}/g, who.replace(/s+/g, ' '));
            if (type == 'experience') desc = lang.AdminModule.Commands.Take.Embeds.Taken.Description.replace(/{type}/g, "experience").replace(/{users}/g, who.replace(/s+/g, ' '));
            if (desc.length >= 2048) desc = desc.substring(0, 2000) + lang.AdminModule.Commands.Take.More
            await message.channel.send(Embed({ color: config.Success_Color, title: lang.AdminModule.Commands.Take.Embeds.Taken.Title.replace(/{type}/g, type.charAt(0).toUpperCase() + type.substring(1, type.length)), description: desc }));
        })
    },
    description: lang.Help.CommandDescriptions.Take,
    usage: 'take',
    aliases: []
}