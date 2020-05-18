const Utils = require("../../modules/utils.js");
const lang = Utils.variables.lang;
const config = Utils.variables.config;
const Embed = Utils.Embed;

module.exports = {
    name: 'vote',
    run: async (bot, message, args) => {

        function getEmoji(number) {
            if (number == 1) return "\u0031\u20E3";
            if (number == 2) return "\u0032\u20E3";
            if (number == 3) return "\u0033\u20E3";
            if (number == 4) return "\u0034\u20E3";
            if (number == 5) return "\u0035\u20E3";
            if (number == 6) return "\u0036\u20E3";
            if (number == 7) return "\u0037\u20E3";
            if (number == 8) return "\u0038\u20E3";
            if (number == 9) return "\u0039\u20E3";
            if (number == 10) return "\uD83D\uDD1F";
        }
        let role = Utils.findRole(config.Permissions.Staff_Commands.Vote, message.guild);
        let channel = Utils.findChannel(config.Channels.Vote, message.guild);

        if (!role) return message.channel.send(Embed({ preset: 'console' }));
        if (!channel) return message.channel.send(Embed({ preset: 'console' }));
        if (!Utils.hasPermission(message.member, config.Permissions.Staff_Commands.Vote)) return message.channel.send(Embed({ preset: 'nopermission' }));

        let questions = [lang.AdminModule.Commands.Vote.Embeds.PollSetup.Questions[0], lang.AdminModule.Commands.Vote.Embeds.PollSetup.Questions[1], lang.AdminModule.Commands.Vote.Embeds.PollSetup.Questions[2], lang.AdminModule.Commands.Vote.Embeds.PollSetup.Questions[3]]
        let pollTitle;
        let pollDescription;
        let pollChoices;
        let pollEmojis;
        let msgs = [];

        for (i = 0; i < questions.length; i++) {
            let question = questions[i];
            let m = await message.channel.send(Embed({ title: lang.AdminModule.Commands.Vote.Embeds.PollSetup.Title.replace(/{pos}/g, (i + 1) + '/4'), description: question }));
            let msg = await Utils.waitForResponse(message.author.id, message.channel)
            msgs.push(m);
            msgs.push(msg);

            if (msg.content.toLowerCase() == 'cancel') return message.channel.send(Embed({ preset: 'error', description: lang.AdminModule.Commands.Vote.PollCanceled }));
            if (i == 0) pollTitle = msg.content;
            if (i == 1) pollDescription = msg.content;
            if (i == 2 && msg.content.toLowerCase() !== 'no') {
                pollEmojis = msg.content.replace(/\s+/g, '').split(',');
                break;
            }
            if (i == 3) pollChoices = msg.content;
            if (pollChoices > 10) {

                return message.channel.send(Embed({ preset: 'error', description: lang.AdminModule.Commands.Vote.Errors.MaxChoices }));
            }
        }

        msgs.forEach(m => m.delete());
        channel.send(Embed({ title: lang.AdminModule.Commands.Vote.Embeds.Poll.Title.replace(/{pollquestion}/g, pollTitle), description: pollDescription, timestamp: new Date(), footer: lang.AdminModule.Commands.Vote.Embeds.Poll.Footer.replace(/{tag}/g, message.author.tag) })).then(async msg => {
            if (!pollEmojis) for (i = 0; i < pollChoices; i++) {
                await msg.react(getEmoji(i + 1));
            } else pollEmojis.forEach(async emoji => {
                if ((new RegExp(/:[0-9]{18}>/g)).test(emoji)) emoji = emoji.substring(15,33);

                await msg.react(emoji).catch(error => {
                    if (error.code && error.code == 10014) message.channel.send(Embed({ preset: 'error', description: lang.AdminModule.Commands.Vote.Errors.CouldNotReact.replace(/{emoji}/g, emoji) }))
                    else {
                        message.channel.send(Embed({ preset: 'console'}))
                        console.log(error);
                    }
                })
            })
        });

        message.channel.send(Embed({ title: lang.AdminModule.Commands.Vote.Embeds.Posted.Title, description: lang.AdminModule.Commands.Vote.Embeds.Posted.Description, color: config.Success_Color }))
    },
    description: lang.Help.CommandDescriptions.Vote,
    usage: 'vote',
    aliases: [
        'poll'
    ]
}