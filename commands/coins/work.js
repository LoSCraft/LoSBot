const Utils = require("../../modules/utils.js");
const Embed = Utils.Embed;
const Discord = Utils.Discord;
const config = Utils.variables.config;
const lang = Utils.variables.lang;
const applyCooldown = []
module.exports = {
    name: 'work',
    run: async (bot, message, args) => {
        let jobs = config.Coin_System.Jobs
        // Make sure all jobs are setup correctly
        let error = false
        /*Object.keys(jobs).forEach(job => {
            job = Object.values(jobs)[Object.keys(jobs).indexOf(job)];
            if (!job.Tiers || !Object.keys(job.Tiers)[0]) {
                console.log(`[ERROR | WORK.JS] All jobs must include tiers`);
                error = true
            }
            if (Object.values(job.Tiers).some((tier, i) => { (i !== 0 && !tier.requiredAmountOfWork) || !tier.hourlyPay })) {
                console.log('[ERROR | WORK.JS] All job tiers must have a requiredAmountOfWork and hourlyPay setting');
                error = true
            }
            if (job.shifts.some(shift => isNaN(shift) || !shift >= 1)) {
                console.log('[ERROR | WORK.JS] All shifts must be an integer greater than 1');
                error = true
            }
        });*/
        if (error) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Work.Errors.InvalidJobSetup }));

        let userJob = await Utils.variables.db.get.getJobs(message.member);

        // Tell to apply if no job and send help menu
        if (!args[0] && !userJob || (args[0] && args[0] == 'help')) {
            message.channel.send(Embed({ title: lang.CoinModule.Commands.Work.Embeds.Help.Title, description: lang.CoinModule.Commands.Work.Embeds.Help.Description.replace(/{prefix}/g, await Utils.variables.db.get.getPrefixes(message.guild.id)) }));
            if (!args[0] && !userJob) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Work.Errors.NoJob })).then(msg => msg.delete(2500));
        }

        // Work
        if (!args[0] && userJob) {

            let workTime = (new Date(Math.floor(userJob.nextWorkTime))).getTime();
            if (workTime > (new Date()).getTime()) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Work.Errors.WorkCooldown.replace(/{time}/g, Utils.getTimeDifference(workTime, new Date())) }));

            let job = Object.values(jobs)[Object.keys(jobs).indexOf(userJob.job)];
            let shift = job.shifts[Math.floor(Math.random() * job.shifts.length)];
            let pay = shift * job.Tiers[userJob.tier].hourlyPay;
            let randomWorkMessages = job.Tiers[userJob.tier].randomWorkMessages;
            let nextWorkTime = new Date()
            nextWorkTime.setHours(nextWorkTime.getHours() + config.Coin_System.Work_Cooldown);

            await Utils.variables.db.update.coins.setNextWorkTime(message.member, nextWorkTime.getTime())
            await Utils.variables.db.update.coins.setAmountOfTimesWorked(message.member, (await Utils.variables.db.get.getJobs(message.member)).amountOfTimesWorked + 1)
            await Utils.variables.db.update.coins.updateCoins(message.member, pay, 'add');
            message.channel.send(Embed({ color: config.Success_Color, title: lang.CoinModule.Commands.Work.Embeds.WorkComplete.Title, description: lang.CoinModule.Commands.Work.Embeds.WorkComplete.Description.replace(/{randommessages}/g, (randomWorkMessages) ? `${randomWorkMessages[Math.floor(Math.random() * randomWorkMessages.length)]}\n\n` : '').replace(/{shift}/g, shift).replace(/{pay}/g, pay).replace(/{time}/g, config.Coin_System.Work_Cooldown == 0 ? ' now ' : Utils.getTimeDifference(nextWorkTime, new Date())) }))


            if (job.Tiers[userJob.tier + 1]) {
                let requirements = job.Tiers[userJob.tier + 1].requirements;
                let promote = false;

                if (requirements.coins && parseInt(requirements.coins)) {
                    if (requirements.coins <= await Utils.variables.db.get.getCoins(message.member)) promote = true
                    else promote = false;
                }
                if (requirements.exp && parseInt(requirements.exp)) {
                    if (requirements.exp <= (await Utils.variables.db.get.getExperience(message.member)).xp) promote = true
                    else promote = false;
                }
                if (requirements.role && message.guild.roles.find(r => r.name == requirements.role || r.id == requirements.role)) {
                    if (message.member.roles.find(r => r.name == requirements.role || r.id == requirements.role)) promote = true
                    else promote = false;
                }
                if (requirements.timesWorked && parseInt(requirements.timesWorked)) {
                    if (requirements.timesWorked <= (await Utils.variables.db.get.getJobs(message.member)).amountOfTimesWorked) promote = true
                    else promote = false;
                }

                if (promote) {
                    await Utils.variables.db.update.coins.setUserJob(message.member, userJob.job, (userJob.tier + 1))
                    message.channel.send(Embed({ color: config.Success_Color, title: lang.CoinModule.Commands.Work.Embeds.Promotion.Title, description: lang.CoinModule.Commands.Work.Embeds.Promotion.Description.replace(/{tier}/g, job.Tiers[userJob.tier + 1].name).replace(/{pay}/g, Object.values(job.Tiers)[userJob.tier + 1].hourlyPay) }))
                }
            }


        } else if (args[0] == 'apply') {

            if (!applyCooldown.find(c => c.id == message.author.id)) {

                if (userJob) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Work.Errors.AlreadyHaveJob.replace(/{prefix}/g, await Utils.variables.db.get.getPrefixes(message.guild.id)) }));
                if (!args[1] || !Object.keys(jobs).find(j => j.toLowerCase() == args[1].toLowerCase())) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Work.Errors.InvalidJob.replace(/{prefix}/g, await Utils.variables.db.get.getPrefixes(message.guild.id)) }));


                let job = Object.values(jobs)[Object.keys(jobs).indexOf(Object.keys(jobs).find(j => j.toLowerCase() == args[1].toLowerCase()))]
                let requirements = job.Tiers[0].requirements;
                let passedRequirements = false;

                if (requirements) {
                    if (requirements.coins && parseInt(requirements.coins)) {
                        if (requirements.coins <= await Utils.variables.db.get.getCoins(message.member)) passedRequirements = true
                        else passedRequirements = false;
                    }
                    if (requirements.exp && parseInt(requirements.exp)) {
                        if (requirements.exp <= (await Utils.variables.db.get.getExperience(message.member)).xp) passedRequirements = true
                        else passedRequirements = false;
                    }
                    if (requirements.role && message.guild.roles.find(r => r.name == requirements.role || r.id == requirements.role)) {
                        if (message.member.roles.find(r => r.name == requirements.role || r.id == requirements.role)) passedRequirements = true
                        else passedRequirements = false;
                    }
                    if (requirements.timesWorked && parseInt(requirements.timesWorked)) {
                        if (requirements.timesWorked <= (await Utils.variables.db.get.getJobs(message.member)).amountOfTimesWorked) passedRequirements = true
                        else passedRequirements = false;
                    }
                }

                if (passedRequirements || !requirements) {
                    await Utils.variables.db.update.coins.setUserJob(message.member, Object.keys(jobs).find(j => j.toLowerCase() == args[1].toLowerCase()), 0);
                    message.channel.send(Embed({ color: config.Success_Color, title: lang.CoinModule.Commands.Work.Embeds.Applied.Title, description: lang.CoinModule.Commands.Work.Embeds.Applied.Description.replace(/{job}/g, job.Tiers[0].name).replace(/{workplace}/g, Object.keys(jobs).find(j => j.toLowerCase() == args[1].toLowerCase())) }))
                    applyCooldown.push({ id: message.author.id, date: new Date() });
                    setTimeout(() => {
                        applyCooldown.splice(applyCooldown.indexOf(applyCooldown.find(c => c.id == message.author.id)));
                    }, 86400 * 1000)
                } else {
                    message.channel.send(Embed({
                        preset: 'error',
                        description: lang.CoinModule.Commands.Work.Errors.FailedRequriements
                    }))
                }
            } else {
                let date = applyCooldown.find(c => c.id == message.author.id);
                message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Work.Errors.ApplyCooldown.replace(/{time}/g, Utils.getTimeDifference(date, new Date())) }))
            }

        } else if (args[0] == 'jobs' || args[0] == 'list') {
            return message.channel.send(Embed({
                title: lang.CoinModule.Commands.Work.Embeds.List.Title,
                description: Object.keys(jobs).map(job => {
                    let jobInfo = Object.values(jobs)[Object.keys(jobs).indexOf(job)].Tiers[0];
                    return lang.CoinModule.Commands.Work.Embeds.List.Format
                        .replace(/{jobname}/g, job)
                        .replace(/{pay}/g, jobInfo.hourlyPay)
                        .replace(/{req-coins}/g, jobInfo.requirements && jobInfo.requirements.coins ? jobInfo.requirements.coins : 'None')
                        .replace(/{req-exp}/g, jobInfo.requirements && jobInfo.requirements.exp ? jobInfo.requirements.exp : 'None')
                        .replace(/{req-role}/g, jobInfo.requirements && jobInfo.requirements.role ? jobInfo.requirements.role : 'None')
                        .replace(/{req-worked}/g, jobInfo.requirements && jobInfo.requirements.timesWorked ? jobInfo.requirements.timesWorked : 'None')
                }).join('\n\n')
            }))
        } else if (args[0] == 'quit' || args[0] == 'leave') {
            if (!userJob) return message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Work.Errors.NoJob }))

            let msg = await message.channel.send(Embed({ title: lang.CoinModule.Commands.Work.Embeds.Quit.Confirmation }));
            await msg.react('✅');
            await msg.react('❌');
            Utils.waitForReaction(['❌', '✅'], message.author.id, msg).then(reaction => {
                (reaction.emoji.name == '✅') ? message.channel.send(Embed({ color: config.Success_Color, title: lang.CoinModule.Commands.Work.Embeds.Quit.Left })).then(async msg => { await Utils.variables.db.update.coins.removeUserJob(message.member) }) : message.channel.send(Embed({ preset: 'error', description: lang.CoinModule.Commands.Work.Embeds.Quit.Cancel }));
            })
        }
    },
    description: lang.Help.CommandDescriptions.Work,
    usage: 'work [apply/jobs/quit]',
    aliases: ['job']
}