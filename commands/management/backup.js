const Utils = require('../../modules/utils.js');
const fs = require('fs');
const { Discord } = Utils;
function convertPermissions(number) {
    return new Discord.Permissions(number).toArray();
}
const lang = Utils.variables.lang;

module.exports = {
    name: 'backup',
    run: async (bot, message, args) => {
        const config = Utils.variables.config;
        if (args.length == 0 || !['save', 'restore'].includes(args[0].toLowerCase())) return message.channel.send(Utils.Embed({ preset: 'invalidargs', usage: 'backup <save|restore>' }));

        const Database = Utils.variables.db;
        if (args[0].toLowerCase() == 'save') {
            if (!Utils.hasPermission(message.member, config.Server_Backup_System.Save_Permission)) return message.channel.send(Utils.Embed({ preset: 'nopermission' }));
            message.channel.send('Backing up all server data...');
            const tickets = await Database.get.getTickets();
            const experience = await Database.get.getExperience();
            const coins = await Database.get.getCoins();
            const giveaways = await Database.get.getGiveaways();
            const data = {
                serverID: message.guild.id,
                roles: message.guild.roles
                    .filter(r => r.id !== message.guild.id)
                    .map(r => {
                        return {
                            id: r.id,
                            name: r.name,
                            hoisted: r.hoisted,
                            position: r.calculatedPosition,
                            color: r.color,
                            hexColor: r.hexColor,
                            mentionable: r.mentionable,
                            permissions: r.permissions,
                            hoisted: r.hoist
                        }
                    }),
                channels: message.guild.channels.map(c => {
                    return {
                        id: c.id,
                        name: c.name,
                        parent: c.parent ? c.parent.name : null,
                        type: c.type,
                        permissions: c.permissionOverwrites.map(p => {
                            return {
                                id: p.id,
                                type: p.type,
                                denied: convertPermissions(p.deny),
                                allowed: convertPermissions(p.allow)
                            }
                        })
                    }
                }),
                members: message.guild.members.map(m => {
                    return {
                        id: m.user.id,
                        username: m.user.username,
                        tag: m.user.tag,
                        roles: m.roles.map(r => {
                            return {
                                id: r.id,
                                name: r.name
                            }
                        })
                    }
                }),
                tickets: tickets,
                experience: experience,
                coins: coins,
                giveaways: giveaways
            }
            fs.exists('./server_backups', function (exists) {
                if (!exists) fs.mkdir('./server_backups', function (err) {
                    if (err) console.log(err);
                    create_backup();
                })
                else create_backup();
                async function create_backup() {
                    const file = './server_backups/' + Date.now() + '_server_backup.json';
                    fs.writeFile(file, JSON.stringify(data), function (err) { if (err) console.log(err); });
                    message.channel.send(Utils.Embed({ title: ':white_check_mark: Server backed up to ' + file + '' }));
                }
            })
        } else {
            if (!Utils.hasPermission(message.member, config.Server_Backup_System.Restore_Permission)) return Utils.Embed({ preset: 'nopermission' });
            // message.channel.send(Utils.Embed({ title: ':x: The feature to restore from backups is not complete yet. If you need data from a backup, open a ticket in our support server (https://corebot.dev/support).' }));
            message.delete();
            const latest = require('../../server_backups/'
                + fs.readdirSync('./server_backups/', function (err) {
                    if (err) console.log(err);
                })
                    .filter(f => !f.startsWith('restore_backup_'))
                    .reverse()[0]);
            if (!latest) return message.channel.send(Utils.Embed({ title: 'There are no existing backups', color: '#f52c2c' }))
            const typeMsg = await message.channel.send(Utils.Embed({ title: 'React with what you would like to restore', description: ':regional_indicator_r: **Roles**\n:regional_indicator_c: **Channels**\n' }));
            ['🇷', '🇨'].forEach(async (reaction, i) => {
                setTimeout(function () { typeMsg.react(reaction) }, 1000 * i);
            })
            const typeResponse = await Utils.waitForReaction(['🇷', '🇨'], message.author.id, typeMsg);
            const typeEmoji = typeResponse.emoji.name;
            typeMsg.delete();
            let type = '';
            if (typeEmoji == '🇷') type = 'roles';
            if (typeEmoji == '🇨') type = 'channels';

            const confirmMsg = await message.channel.send(Utils.Embed({ title: 'Confirmation', description: `This will reset **${type == 'all' ? 'everything' : 'all ' + type}**\n\nReact with :white_check_mark: to **confirm**\nReact with :x: to **cancel**` }));
            ['✅', '❌'].forEach(async (reaction, i) => {
                setTimeout(function () { confirmMsg.react(reaction) }, 1000 * i);
            })
            const confirmResponse = await Utils.waitForReaction(['✅', '❌'], message.author.id, confirmMsg);
            const confirmType = confirmResponse.emoji.name == '✅' ? true : false;
            confirmMsg.delete();
            if (!confirmType) {
                return message.channel.send(Utils.Embed({ title: 'Cancelled', color: '#e30f00' })).then(msg => msg.delete(5000));
            } else {
                message.channel.send(Utils.Embed({ title: 'Restoring roles...This should take approximately 30 seconds.' }));
                let logs = "";
                function log(text) {
                    const logText = `[${new Date().toLocaleString()}] ${text}`;
                    console.log(logText);
                    logs += logText + '\n';
                }
                // BACKUP INCASE OF SOMETHING BAD HAPPENING
                const tickets = await Database.get.getTickets();
                const experience = await Database.get.getExperience();
                const coins = await Database.get.getCoins();
                const giveaways = await Database.get.getGiveaways();
                const data = {
                    serverID: message.guild.id,
                    roles: message.guild.roles
                        .filter(r => r.id !== message.guild.id)
                        .map(r => {
                            return {
                                id: r.id,
                                name: r.name,
                                hoisted: r.hoisted,
                                position: r.calculatedPosition,
                                color: r.color,
                                hexColor: r.hexColor,
                                mentionable: r.mentionable,
                                permissions: r.permissions,
                                hoisted: r.hoist
                            }
                        }),
                    channels: message.guild.channels.map(c => {
                        return {
                            id: c.id,
                            name: c.name,
                            parent: c.parent ? c.parent.name : null,
                            type: c.type,
                            permissions: c.permissionOverwrites.map(p => {
                                return {
                                    id: p.id,
                                    type: p.type,
                                    denied: convertPermissions(p.deny),
                                    allowed: convertPermissions(p.allow)
                                }
                            })
                        }
                    }),
                    members: message.guild.members.map(m => {
                        return {
                            id: m.user.id,
                            username: m.user.username,
                            tag: m.user.tag,
                            roles: m.roles.map(r => {
                                return {
                                    id: r.id,
                                    name: r.name
                                }
                            })
                        }
                    }),
                    tickets: tickets,
                    experience: experience,
                    coins: coins,
                    giveaways: giveaways
                }
                const file = './server_backups/restore_backup_' + Date.now() + '_server_backup.json';
                fs.writeFile(file, JSON.stringify(data), function (err) { if (err) console.log(err); });
                log('Backed up current server data.');

                if (type == 'roles') {
                    log('Option chosen: roles');
                    const couldNotDelete = [];
                    message.guild.roles.forEach(async role => {
                        log('Deleting role: ' + role.name);
                        await role.delete()
                            .catch(err => {
                                couldNotDelete.push(role.id);
                                log('Could not delete ' + role.name);
                            });
                    })
                    setTimeout(function () {
                        log('Could not delete array: ' + JSON.stringify(couldNotDelete))
                        latest.roles.forEach(role => {
                            if (couldNotDelete.includes(role.id)) {
                                return log('Could not delete ' + role.name + ', so it will not be re-created.');
                            }
                            log('Creating role: ' + role.name);
                            message.guild.createRole({
                                name: role.name,
                                color: role.hexColor,
                                hoist: role.hoisted,
                                position: role.position,
                                permissions: role.permissions,
                                mentionable: role.mentionable
                            })
                                .catch(err => {
                                    log('Could not create ' + role.name);
                                })
                        })
                        setTimeout(function () {
                            log('Done.');
                            function done(url) {
                                message.channel.send(Utils.Embed({ title: 'Done', description: 'Here\'s a log of what happened: ' + (url ? url : '``Unable to create log, check console``') }));
                            }
                            Utils.paste(logs)
                                .then(result => {
                                    done(result);
                                })
                                .catch(err => {
                                    done();
                                })
                        }, 5000)
                    }, 5000)
                } else if (type == 'channels') {
                    log('Option chosen: channels');
                    const couldNotDelete = [];
                    message.guild.channels.forEach(async channel => {
                        log('Deleting channel: ' + channel.name);
                        await channel.delete()
                            .catch(err => {
                                couldNotDelete.push(channel.id);
                                log('Could not delete ' + channel.name);
                            });
                    })
                    setTimeout(function () {
                        log('Could not delete array: ' + JSON.stringify(couldNotDelete))
                        latest.channels.filter(c => c.type == 'category').concat(latest.channels.filter(c => c.type !== 'category'))
                            .forEach((channel, i) => {
                                if (couldNotDelete.includes(channel.id)) {
                                    return log('Could not delete ' + channel.name + ', so it will not be re-created.');
                                }
                                log('Creating channel: ' + channel.name);
                                message.guild.createChannel(channel.name, { type: channel.type })
                                    .catch(err => {
                                        console.log(err);
                                        log('Could not create ' + channel.name);
                                    })
                                    .then(ch => {
                                        if (channel.parent && ch && channel.type !== 'category') ch.setParent(Utils.findChannel(channel.parent, message.guild, 'category'));
                                    })
                            })
                        setTimeout(function () {
                            log('Done.');
                            function done(url) {
                                message.channel.send(Utils.Embed({ title: 'Done', description: 'Here\'s a log of what happened: ' + (url ? url : '``Unable to create log, check console``') }));
                            }
                            Utils.paste(logs)
                                .then(result => {
                                    done(result);
                                })
                                .catch(err => {
                                    done();
                                })
                        }, 5000)
                    }, 5000)
                }
            }
        }

    },
    description: lang.Help.CommandDescriptions.Backup,
    usage: 'backup',
    aliases: [
        'backupserver'
    ]
}