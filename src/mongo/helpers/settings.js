const { guildModel } = require('../models/settings');
let settingsCache = {};

module.exports.getSettingsCache = async (guildID) => {

    let data = settingsCache[guildID];

    if (!data) {
        const guildSettings = await this.getSettings(guildID);
        settingsCache[guildID] = data = {
            prefix: guildSettings._prefix,
            permissions: guildSettings.permissions,
            channels: guildSettings.channels,
            disabled_cmds: guildSettings.disabled_cmds
        };
    }

    return data;

};

module.exports.deleteFromCache = (guildID, purge = false) => {
    if (settingsCache[guildID]) delete settingsCache[guildID];
    if (purge) settingsCache = {};
};

module.exports.getSettings = async (_guildID) => {

    let guildSettings;

    try {
        guildSettings = await guildModel.findOne({ _guildID });
        if (!guildSettings) {
            const newData = new guildModel({
                _guildID,
                _prefix: '!!'
            });
            guildSettings = await newData.save();
        }
    } catch(err) {
        console.log(err);
    }

    return guildSettings;

};
