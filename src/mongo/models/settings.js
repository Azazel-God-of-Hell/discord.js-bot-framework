const mongoose = require('mongoose');

const settingSchema = mongoose.Schema({
    _guildID: { type: String, required: true },
    _prefix: { type: String, required: true, default: '!!' },
    permissions: {
        helper_role: { type: String, default: '' },
        mod_role: { type: String, default: '' },
        admin_role: { type: String, default: '' },
        permission_notice: { type: Boolean, default: true }
    },
    channels: {
        mod_log_channel: { type: String, default: '' },
        restrict_cmds_channel: { type: String, default: '' }
    },
    disabled_cmds: { type: Array, default: [] }
});

const guildModel = mongoose.model('settings', settingSchema);
module.exports.guildModel = guildModel;
