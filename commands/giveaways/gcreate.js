const Discord = require("discord.js");
const Utils = require("../../modules/utils.js")
const Embed = Utils.Embed;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const fs = require("fs");

module.exports = {
    name: 'gcreate',
    run: async (bot, message, args) => {
        let role = Utils.findRole(config.Giveaway_System.GCreate_Required_Rank, message.guild);
        if (!role) return message.channel.send(Embed({ preset: 'console' }));

        let questions = [lang.GiveawaySystem.Commands.Gcreate.Embeds.Setup.Questions[0], lang.GiveawaySystem.Commands.Gcreate.Embeds.Setup.Questions[1], lang.GiveawaySystem.Commands.Gcreate.Embeds.Setup.Questions[2], lang.GiveawaySystem.Commands.Gcreate.Embeds.Setup.Questions[3], lang.GiveawaySystem.Commands.Gcreate.Embeds.Setup.Questions[4]];
        let answers = [];

        const giveaways = await Utils.variables.db.get.getGiveaways();

        if (!Utils.hasPermission(message.member, config.Giveaway_System.GCreate_Required_Rank)) return message.channel.send(Embed({ preset: 'nopermission' }));
        if (giveaways.filter(g => !!g.ended).length > config.Giveaway_System.Max_Giveaways) return message.channel.send(Embed({ preset: 'error', description: lang.GiveawaySystem.Commands.Gcreate.Errors.MaxGiveawaysReached }));

        const time_pattern = /^(\d+((h|H)|(d|D)|(m|M)))+$/;
        let channel;
        let msgs = [];

        function askQuestion(i, ask = true) {
            const question = questions[i];

            if (ask) message.channel.send(Embed({ title: lang.GiveawaySystem.Commands.Gcreate.Embeds.Setup.Title.replace(/{pos}/g, `${i + 1}/5`), description: question })).then(ms => msgs.push(ms.id));
            Utils.waitForResponse(message.author.id, message.channel)
                .then(msg => {
                    msgs.push(msg.id);
                    if (['cancel', 'stop'].includes(msg.content.toLowerCase())) {
                        return message.channel.send(Embed({ color: config.Error_Color, title: lang.GiveawaySystem.Commands.Gcreate.GiveawayCanceled })).then(ms => msgs.push(ms.id));
                    } else if (i == 0 && !time_pattern.test(msg.content)) {
                        message.channel.send(Embed({ color: config.Error_Color, title: lang.GiveawaySystem.Commands.Gcreate.Errors.InvalidTime.Title, description: lang.GiveawaySystem.Commands.Gcreate.Errors.InvalidTime.Description })).then(ms => msgs.push(ms.id));
                        askQuestion(i, false);
                    } else if (i == 3 && (isNaN(msg.content) || parseInt(msg.content) < 1)) {
                        message.channel.send(Embed({ color: config.Error_Color, title: lang.GiveawaySystem.Commands.Gcreate.Errors.InvalidWinners.Title, description: lang.GiveawaySystem.Commands.Gcreate.Errors.InvalidWinners.Description })).then(ms => msgs.push(ms.id));
                        askQuestion(i, false);
                    } else if (i == 4) {
                        channel = (msg.content.toLowerCase() == 'here') ? msg.channel : msg.mentions.channels.first() || Utils.findChannel(msg.content, message.guild, 'text', false);
                        if (!channel) {
                            message.channel.send(Embed({ color: config.Error_Color, title: lang.GiveawaySystem.Commands.Gcreate.Errors.InvalidChannel.Title, description: lang.GiveawaySystem.Commands.Gcreate.Errors.InvalidChannel.Description })).then(ms => msgs.push(ms.id));
                            askQuestion(i, false);
                        } else {
                            finishGiveaway()
                        }
                    } else {
                        answers.push(msg.content);
                        if (i >= questions.length - 1) finishGiveaway();
                        else askQuestion(i + 1);
                    }
                })
        }
        askQuestion(0);

        function finishGiveaway() {
            msgs.forEach(async m => {
                (await message.channel.fetchMessage(m)).delete();
            });

            function getTimeElement(letter) {
                const find = answers[0].match(new RegExp(`\\d+${letter}`));
                return parseInt(find ? find[0] : 0);
            }
            const mins = getTimeElement("m");
            const hours = getTimeElement("h");
            const days = getTimeElement("d");

            let total = 0;
            total += mins * 60000;
            total += hours * 60 * 60000;
            total += days * 24 * 60 * 60000;
            const endAt = Date.now() + total;

            function timeDiff() {
                let d1 = new Date()
                let d2 = new Date(endAt)
                var msec = d2 - d1;
                let secs = Math.floor(msec / 1000);
                var mins = Math.floor(secs / 60);
                var hrs = Math.floor(mins / 60);
                var days = Math.floor(hrs / 24);
                let result = []

                secs = secs % 60
                mins = mins % 60;
                hrs = hrs % 24;
                days = days % 365;

                if (days !== 0) result.push(days + ' day(s)')
                if (hrs !== 0) result.push(hrs + ' hour(s)')
                if (mins !== 0) result.push(mins + ' minute(s)')
                if (secs !== 0) result.push(secs + ' second(s)')

                if (result.length == 1 && result[0].endsWith('second(s)')) {
                    return 'Less than ' + result[0]
                } else {
                    return 'About ' + result.join(" ");
                }
            }

            channel.send(Embed({
                title: `${answers[3]}x ${answers[1]}`,
                description: lang.GiveawaySystem.Commands.Gcreate.Embeds.Giveaway.Description
                    .replace(/{giveawaydesc}/g, answers[2])
                    .replace(/{emoji}/g, config.Giveaway_System.Emoji)
                    .replace(/{host}/g, message.author)
                    .replace(/{end}/g, (new Date(endAt)).toLocaleString())
                    .replace(/{winners}/g, answers[3])
                    .replace(/{timer}/g, timeDiff()),
                footer: lang.GiveawaySystem.Commands.Gcreate.Embeds.Giveaway.Footer,
                timestamp: endAt
            })).then(async msg => {
                msg.react(config.Giveaway_System.Emoji_Unicode)
                await Utils.variables.db.update.giveaways.addGiveaway({
                    messageID: msg.id,
                    name: answers[1],
                    channel: msg.channel.id,
                    guild: message.guild.id,
                    ended: false,
                    end: endAt,
                    winners: parseInt(answers[3]),
                    creator: message.author.id,
                    desc: answers[2]
                })
            });

            message.channel.send(Embed({ title: lang.GiveawaySystem.Commands.Gcreate.Embeds.GiveawayCreated.Title, description: lang.GiveawaySystem.Commands.Gcreate.Embeds.GiveawayCreated.Description, color: config.Success_Color }));
        }

    },
    description: 'Create a giveaway',
    usage: 'gcreate',
    aliases: [
        'giveawaycreate',
        'creategiveaway'
    ]
}