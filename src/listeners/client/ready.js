const mongo = require('../../mongo/connection');
const { startedAt } = require('../../main');
module.exports = async client => {

    let i = 0;
    const activities = [ `${client.aliases.size} aliases`, `${client.commands.size} commands`];
    setInterval(() => {
        client.user.setActivity(`!!help | ${activities[i++ % activities.length]}`, { type: 'STREAMING', url: 'https://twitch.tv/name/' });
    }, 1000 * 60 * 5);

    await mongo();

    console.log(`\n\nFinished initializing after ${Date.now() - startedAt} ms!\nLogged in as: ${client.user.tag}\nReady to serve ${client.users.cache.size} users across ${client.guilds.cache.size} servers!\n`);

};
