const Utils = require("../../modules/utils.js");
const Discord = Utils.Discord;
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;

module.exports = {
    name: 'announce',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Permissions.Staff_Commands.Announce, message.guild)
        let questions = [lang.AdminModule.Commands.Announce.Questions[0], lang.AdminModule.Commands.Announce.Questions[1], lang.AdminModule.Commands.Announce.Questions[2], lang.AdminModule.Commands.Announce.Questions[3]]
        let channel;
        let title;
        let announcement;
        let toTag = [];
        let msgIDs = [];

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Announce)) return message.channel.send(Embed({ preset: 'nopermission' }))

        const askQuestion = async (i, ask = true) => {
            const question = questions[i];
            if (ask) await message.channel.send(Embed({ title: lang.AdminModule.Commands.Announce.AnnouncementSetup.replace(/{pos}/g, (i + 1) + '/4'), description: question })).then(msg => msgIDs.push(msg.id));

            await Utils.waitForResponse(message.author.id, message.channel)
                .then(response => {
                    msgIDs.push(response.id);
                    if (response.content.toLowerCase() === "cancel") return message.channel.send(Embed({ description: lang.AdminModule.Commands.Announce.SetupCanceled }))
                    if (i == 0) title = response.content;
                    if (i == 1) announcement = response.content;
                    if (i == 2 && response.mentions.channels.first()) channel = response.mentions.channels.first();
                    if (i == 2 && !response.mentions.channels.first()) {
                        message.channel.send(Embed({ color: config.Error_Color, title: 'Invalid Channel', description: 'Please mention a channel' })).then(msg => msg.delete(2500));
                        return askQuestion(i, false);
                    }
                    if (i == 3) {
                        if (response.content.toLowerCase() == 'everyone') toTag = '@everyone';
                        if (!!response.mentions.roles.first()) toTag = response.mentions.roles.map(r => r.id);
                        if (response.content.toLowerCase().replace(/\s+/g, '').split(',').some(rolename => !!response.guild.roles.find(r => r.name.toLowerCase() == rolename))) response.content.toLowerCase().replace(/\s+/g, '').split(',').forEach(c => {
                            if (response.guild.roles.find(r => r.name.toLowerCase() == c)) {
                                toTag.push((response.guild.roles.find(r => r.name.toLowerCase() == c)).id)
                            }
                        })
                        if (typeof toTag == 'object' && toTag.length < 1) toTag == undefined
                    }

                    if (i >= questions.length - 1) finishAnnouncement();
                    else askQuestion(++i);
                })
        }

        askQuestion(0)

        const finishAnnouncement = () => {
            if (toTag && typeof toTag == 'string') channel.send(toTag);
            if (toTag && typeof toTag == 'object') channel.send(toTag.map(id => '<@&' + id + '>').join(', '));

            channel.send(Utils.setupEmbed({
                configPath: config.Announcements.Embed_Settings, color: config.Theme_Color, title: title, description: announcement, variables: [
                    { searchFor: /{userPFP}/g, replaceWith: message.author.displayAvatarURL },
                    { searchFor: /{botPFP}/g, replaceWith: bot.user.displayAvatarURL }
                ]
            }));
            msgIDs.forEach(async id => (await message.channel.fetchMessage(id)).delete());
            message.channel.send(Embed({ title: lang.AdminModule.Commands.Announce.Embeds.Posted.Title, description: lang.AdminModule.Commands.Announce.Embeds.Posted.Description }))
        }
    },
    description: lang.Help.CommandDescriptions.Announce,
    usage: 'announce',
    aliases: [
        'announcement'
    ]
}