const { getSettingsCache } = require('../../mongo/helpers/settings');
const { checkPermissionLevel, getLevelCache, checkDiscordPermissions } = require('../../handlers/permissions');
const { checkHasRequiredArgs } = require('../../handlers/arguments');
const { specialPermissions } = require('../../handlers/permissions');
let cmdCooldown = [];
const Discord = require('discord.js');

module.exports = async (client, message) => {

    if (
        message.author.bot
        || !message.guild
        || !message.channel.permissionsFor(client.user.id)
        || !message.channel.permissionsFor(client.user.id).has('SEND_MESSAGES')
    ) return;

    const tagExecutor = message.author.toString();

    let guildSettings;
    try {
        guildSettings = await getSettingsCache(message.guild.id);
    } catch(err) {
        return console.log(err);
    }
    const { prefix } = guildSettings;

    const prefixMention = new RegExp(`^<@!?${client.user.id}>( |)$`);
    if (message.content.match(prefixMention)) {
        return client.send('no', message, `my prefix here is \`${guildSettings.prefix}\`!`);
    }

    if (!message.content.startsWith(prefix)) return;

    const inputArray = message.content.slice(prefix.length).trim().split(/ +/g);
    const args = inputArray.filter(arg => !arg.startsWith('--'));
    args.flags = inputArray.filter(arg => arg.startsWith('--'));
    const command = args.shift().toLowerCase();
    if (!message.member) await message.guild.members.fetch(message.author);
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
    if (!cmd) return;

    if (!message.channel.permissionsFor(client.user.id).has('EMBED_LINKS')) {
        return client.send('no', message, 'can\'t execute command because I lack the `Embed Links` permission in this channel!');
    }

    const perms = await checkPermissionLevel(message, cmd);
    const { permissionLevel, permissionName } = perms;

    if (!perms.willPass && guildSettings.permissions.permission_notice) {
        const levelCache = getLevelCache();
        const noPermissionEmbed = new Discord.MessageEmbed()
        .setTitle('You do not have permission to use this command!')
        .setColor('RED')
        .setDescription(`Your permission level is ${permissionLevel} (${permissionName})\nThis command requires level ${levelCache[cmd.config.permLevel]} (${cmd.config.permLevel})`);
        return message.channel.send(noPermissionEmbed).then(msg => msg.delete({ timeout: 3500 }));
    }

    const cmdSpecificPerms = checkDiscordPermissions(client, message, cmd);
    if (!cmdSpecificPerms.willPass) {

        const cmdPermsEmbed = new Discord.MessageEmbed()
        .setColor('RED')
        .setDescription(`**${message.author.tag}**, the command can't be executed because of missing permissions in ${message.channel.toString()}!`)
        .setTimestamp();

        const missingBotPerms = cmdSpecificPerms.missingBotPermissions;
        const missingUserPerms = cmdSpecificPerms.missingUserPermissions;

        if (typeof missingBotPerms !== 'boolean') {
            cmdPermsEmbed.addField(`I lack the required permission${missingBotPerms.length === 1 ? '' : 's'}:`, `${missingBotPerms.join('\n').replace(/_/g, ' ').toProperCase()}`, true);
        }

        if (typeof missingUserPerms !== 'boolean') {
            cmdPermsEmbed.addField(`You lack the required permission${missingUserPerms.length === 1 ? '' : 's'}`, `${missingUserPerms.join('\n').replace(/_/g, ' ').toProperCase()}`, true);
        }

        return message.channel.send(cmdPermsEmbed);
    }

    if (guildSettings.disabled_cmds.find(v => v === cmd.help.name)) return message.channel.send(`${client.extras.noIcon} ${tagExecutor}, the server admins have disabled that command!`);

    if (!checkHasRequiredArgs(prefix, message, cmd, args)) return;

    const cdString = `${message.author.id}-${message.guild.id}-${cmd.help.name}-${Date.now() + (cmd.config.cooldown * 1000)}`;
    if (cmd.config.cooldown > 0) {
        const userString = cmdCooldown.find(string => string.startsWith(`${message.author.id}-${message.guild.id}-${cmd.help.name}`));
        if (userString) {
            const cdExpires = userString.slice(userString.length - 13, userString.length);
            return message.channel.send(`${tagExecutor}, you can use \`${cmd.help.name}\` again in ${Math.round((cdExpires - Date.now()) / 1000) === 1 ? '1 second!' : `${Math.round((cdExpires - Date.now()) / 1000)} seconds!`}`);
        }
    }

    console.log(`${permissionName} ${message.author.tag} ran command ${cmd.help.name}`);

    cmd.run({
        client,
        message,
        args,
        guildSettings
    });

    if (!specialPermissions.developers.includes(message.author.id) && cmd.config.cooldown > 0) {
        cmdCooldown.push(cdString);
        setTimeout(() => {
            cmdCooldown = cmdCooldown.filter((string) => {
                return string !== cdString;
            });
        }, cmd.config.cooldown * 1000);
    }
};
