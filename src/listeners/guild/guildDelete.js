const { error } = require('log-symbols');
const { getSettings, deleteFromCache } = require('../../mongo/helpers/settings');

module.exports = async (client, guild) => {
  if (!guild.available) return;
  console.log(`${error} [${guild.name}] removed the bot.`);
  await (await getSettings(guild.id)).delete();
  deleteFromCache(guild.id);
};
