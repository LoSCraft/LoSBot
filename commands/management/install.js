const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");

module.exports = {
    name: 'install',
    run: async (bot, message, args) => {

        message.delete();
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send(Embed({ preset: 'nopermission' }));

        let msg = await message.channel.send(Embed({ preset: 'error', description: "This command will create many channels and roles. Are you sure you would like to continue?" }))
        await msg.react('✅');
        await msg.react('❌');

        await Utils.waitForReaction(['✅', '❌'], message.author.id, msg).then(async reaction => {
            if (reaction.name == '❌') return message.channel.send(Embed({ preset: 'error', description: 'Installation canceled.' }));
        })


        await message.guild.createChannel("Staff", { type: "category" }).then(async category => {
            ["logs", "reports", "transcripts"].forEach(async name => {
                await message.guild.createChannel(name, { type: "text", parent: category });
            })
        });

        await message.guild.createChannel("Applications", { type: "category" });
        await message.guild.createChannel("Tickets", { type: "category" });

        await message.guild.createChannel("Important", { type: "category" }).then(async category => {
            ["announcements", "updates", "welcome", "giveaways", "polls"].forEach(async name => {
                await message.guild.createChannel(name, { type: "text", parent: category });
            })
        });

        await message.guild.createChannel("Main", { type: "category" }).then(async category => {
            ["main", "botspam", "suggestions", "bug-reports"].forEach(async name => {
                await message.guild.createChannel(name, { type: "text", parent: category });
            })
        });

        ['Owner', 'Admin', 'Mod', 'Helper', 'Staff', 'Cooldown Bypass', 'Support Team', 'vip', 'mvp', 'mvp+', 'Muted', 'Blacklisted', 'Member'].forEach(async n => {
            await message.guild.createRole({
                name: n
            })
        })

        let installchannel = Utils.findChannel('logs', message.guild);
        if (installchannel) installchannel.send(Embed({
            thumbnail: 'https://cdn.discordapp.com/avatars/622426860709740546/a1a49edbc91cff702f513fcbdf0baeba.webp?size=256',
            title: 'CoreBot Installation Complete',
            description: '**Thank you for installing corebot!** \nThe following channels have been created \n \n**Tickets**\n\n **Important** \n`#announcements #updates #welcome` \n**Main** \n`#main #bot-spam #suggestions #bug-report` \n**Staff** \n`#staff-chat #logs #ticket-logs` \n \nThe folling roles have been created\n`Member, Muted, Blacklisted, Vip, Mvp, Mvp+, Cooldown Bypass, Support Team, Staff, Helper, Mod, Admin, Owner`\n \n**Installed by** \n' + message.author + '\n\nIf you have any issues, please contact us on our discord server.'
        }));
        fs.unlink("./commands/install.js", function (err) { if (err) console.log(err) });
    },
    description: lang.Help.CommandDescriptions.Install,
    usage: 'install',
    aliases: [
        'setup'
    ]
}