const { success } = require('log-symbols');
const { getSettings } = require('../../mongo/helpers/settings');

module.exports = async (client, guild) => {
    console.log(`${success} [${guild.name}]  added the bot. Members: ${guild.members.cache.size}`);
    await getSettings(guild.id);
};
