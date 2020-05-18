const Discord = require('discord.js');
const Utils = require('../../modules/utils.js');
const lang = Utils.variables.lang;

module.exports = {
    name: 'apply',
    run: async (bot, message, args) => {
        if (!Utils.hasPermission(message.member, Utils.variables.config.Permissions.User_Commands.Apply)) return message.channel.send(Embed({ preset: 'nopermission' }));
        const settings = Utils.variables.config.Applications;
        const reviewerRole = Utils.findRole(settings.Reviewer_Role, message.guild);
        const parent = Utils.findChannel(settings.Category, message.guild, 'category');
        if (!reviewerRole || !parent) return message.channel.send(Embed({ preset: 'console' }));

        message.guild.createChannel(settings.Channel_Format.replace(/%username%/g, message.author.username).replace(/%id%/g, message.author.id).replace(/%tag%/g, message.author.tag), {
            type: 'text',
            parent: parent,
            permissionOverwrites: [
                {
                    id: message.author.id,
                    allow: ['READ_MESSAGES', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                },
                {
                    id: reviewerRole.id,
                    allow: ['READ_MESSAGES', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                },
                {
                    id: message.guild.id,
                    deny: ['READ_MESSAGES', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
                }
            ]
        }).then(async channel => {

            message.channel.send(Utils.Embed({ title: lang.Other.OtherCommands.Apply.Embeds.Created.Title, description: lang.Other.OtherCommands.Apply.Embeds.Created.Description.replace(/{channel}/g, channel) }));

            channel.send(Utils.Embed({ title: settings.New_Embed.Title, description: settings.New_Embed.Description.replace(/%ping%/g, '<@' + message.author.id + '>') }));

            if (settings.Mention_Reviewer_Role) channel.send('<@&' + reviewerRole.id + '>');

            const Positions = settings.Positions;
            const Position_Keys = Object.keys(Positions);

            channel.send(Utils.Embed({ title: settings.Position_Embed.Title, description: settings.Position_Embed.Description.replace(/%positions%/g, Position_Keys.join(', ')) }));

            async function done(positionChosen) {
                if (!positionChosen) return channel.send(Utils.Embed());
                const position = Positions[positionChosen];
                channel.setTopic(`User: ${message.author.tag}\nUser ID: ${message.author.id}\nApplying for: ${positionChosen}`);

                const answers = [];

                for (let i = 0; i < position.Questions.length; i++) {
                    const question = position.Questions[i];
                    const text = typeof question == 'object' ? question.Question : question;
                    channel.send(Utils.Embed({ description: text }));
                    async function waitForResponse() {
                        await Utils.waitForResponse(message.author.id, channel)
                            .then(async response => {
                                if (typeof question == 'object' && question.RegExp) {
                                    if (!new RegExp(question.RegExp).test(response.content)) {
                                        channel.send(Utils.Embed({ title: question.Failed_RegExp || lang.Other.OtherCommands.Apply.Errors.FailedRegExp, color: Utils.variables.config.Error_Color }));
                                        await waitForResponse();
                                    } else answers.push(response.content);
                                } else answers.push(response.content);
                            });
                    }
                    await waitForResponse();
                }

                if (settings.Delete_Embeds_And_Send_Answers) channel.bulkDelete(100);

                channel.send(Utils.Embed({ title: settings.Application_Complete.Title, description: settings.Application_Complete.Description, color: Utils.variables.config.Success_Color }))
                    .then(async msg => {
                        await msg.react("✅");
                        await msg.react("❌");
                        await msg.react("🗑️")
                    });

                if (settings.Delete_Embeds_And_Send_Answers) {
                    let embed = Utils.Embed({ title: lang.Other.OtherCommands.Apply.Embeds.Answers.Title, fields: [{ name: lang.Other.OtherCommands.Apply.Embeds.Answers.Field, value: `${message.member} (${message.author.id})` }] });
                    answers.forEach((answer, i) => {
                        if (answer.length >= 1024) {
                            embed.embed.fields.push({ name: position.Questions.map(q => q.Question || q)[i], value: answer.substring(0, 1000) + '-' });
                            embed.embed.fields.push({ name: '\u200B', value: '-' + answer.substring(1000) });
                        } else embed.embed.fields.push({ name: position.Questions.map(q => q.Question || q)[i], value: answer });
                    })
                    channel.send(embed);
                    if (Utils.variables.config.Applications.Logs.Enabled) {
                        const Haste = await Utils.paste(`Applicant: ${message.author.tag} (${message.author.id})\nFinished At: ${new Date().toLocaleString()}\n\nAnswers:\n\n${answers.map((ans, i) => `Question:\n${position.Questions.map(q => q.Question || q)[i]}\n\nAnswer:\n${ans}`).join('\n\n')}`, Utils.variables.config.Applications.Logs.Paste_Site);
                        const channel = Utils.findChannel(Utils.variables.config.Applications.Logs.Channel, message.guild);
                        if (channel) channel.send(Utils.Embed({ title: lang.Other.OtherCommands.Apply.Embeds.ApplicationLog.Title, url: Haste, description: lang.Other.OtherCommands.Apply.Embeds.ApplicationLog.Description, fields: [{ name: lang.Other.OtherCommands.Apply.Embeds.ApplicationLog.Field, value: `${message.member} (${message.author.id})` }] }))
                    }
                }
            }
            async function getPosition() {
                Utils.waitForResponse(message.author.id, channel)
                    .then((response) => {
                        if (!Position_Keys.map(p => p.toLowerCase()).includes(response.content.toLowerCase())) {
                            channel.send(Utils.Embed({ color: Utils.variables.config.Error_Color, title: lang.Other.OtherCommands.Apply.Errors.InvalidPosition }));
                            return getPosition();
                        }
                        done(Position_Keys.find(p => p.toLowerCase() == response.content.toLowerCase()));
                    })
            }
            getPosition();
        })
    },
    description: lang.Help.CommandDescriptions.Apply,
    usage: 'apply',
    aliases: [
        'application'
    ]
}