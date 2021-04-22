const { readdirSync } = require('fs');
const { sep } = require('path');
const mainDirectory = './src/commands';
const allCategories = readdirSync(mainDirectory).filter(e => !e.startsWith('.') && !e.endsWith('.js'));

const { success, error } = require('log-symbols');
const { Collection } = require('discord.js');
const { getLevelCache } = require('../handlers/permissions');
const { validatePermissions } = require('./permissions');

module.exports.loadCommands = (client, counter = 0) => {
    client.commands = new Collection();
    client.aliases = new Collection();

    for(const categoryFolder of allCategories) {

        console.log(`Start loading ${categoryFolder.toUpperCase()}`);

        const commands = readdirSync(`${mainDirectory}${sep}${categoryFolder}${sep}`)
            .filter(files => files.endsWith('.js') && !files.startsWith('.'));

        for (const file of commands) {

            const cmd = require(`../commands/${categoryFolder}/${file}`);

            validateCommand(client, cmd, `src/commands/${categoryFolder}/${file}`);

            if (cmd.config.enabled) {
                client.commands.set(cmd.help.name, cmd);
                counter++;
                console.log(`${success} Loaded command ${counter}: ${cmd.help.name}.`);
            } else {
                console.log(`${error} ${cmd.help.name.toProperCase()} is currently disabled!`);
            }

        }

        console.log(`Done loading ${categoryFolder.toUpperCase()}\n`);

    }

};

module.exports.forceLoadCommand = (client, commandName, loaded = false) => {

    for(const categoryFolder of allCategories) {

        const commands = readdirSync(`${mainDirectory}${sep}${categoryFolder}${sep}`)
            .filter(files => files.endsWith('.js') && !files.startsWith('.'));

        if (commands.includes(commandName + '.js')) {

            const path = `../commands/${categoryFolder}/${commandName}.js`;

            delete require.cache[require.resolve(path)];
            const cmd = require(path);

            cmd.config.aliases.forEach(alias => {
                client.aliases.delete(alias);
            });

            if (cmd.config.enabled) {
                loaded = true;
                validateCommand(client, cmd, `src/commands/${categoryFolder}/${commandName}`);
                client.commands.set(cmd.help.name, cmd);
                return true;
            } else {
                return false;
            }

        }

    }

    if (!loaded) return undefined;

};

module.exports.forceUnloadCommand = (client, commandName) => {

    for(const categoryFolder of allCategories) {

        const commands = readdirSync(`${mainDirectory}${sep}${categoryFolder}${sep}`)
            .filter(files => files.endsWith('.js') && !files.startsWith('.'));

        if (commands.includes(commandName + '.js')) {
            const cmdPath = `../commands/${categoryFolder}/${commandName}.js`;
            const cmd = require(`../commands/${categoryFolder}/${commandName}.js`);
            cmd.config.aliases.forEach(alias => {
                client.aliases.delete(alias);
            });
            delete require.cache[require.resolve(cmdPath)];
            client.commands.delete(commandName);
        }

    }

};

const validateCommand = (client, cmd, origin) => {

    if (!origin.replace('.js', '').endsWith(cmd.help.name)) throw new Error(`\nInvalid command name, make sure your exports.help.name is the same as the file name without extension!\n    at ${origin}`);

    const levels = getLevelCache();

    if (levels[cmd.config.permLevel] === undefined) throw new Error(`Unsupported permission level\n    at ${origin}`);

    if (!cmd.config) throw new Error(`Missing config exports!\n\n    at ${origin}`);
    if (!cmd.help) throw new Error(`Missing help exports!\n\n    at ${origin}`);
    if (!cmd.args) throw new Error(`Missing args exports!\n\n    at ${origin}`);
    if (!cmd.args.optional) throw new Error(`Missing args.optional export, please export as an empty array if none apply here!\n\n    at ${origin}`);
    if (!cmd.args.required) throw new Error(`Missing args.required export, please export as an empty array if none apply here!\n\n    at ${origin}`);

    const badTypes = checkExports(cmd.config, cmd.help, cmd.args);

    if (badTypes.length) throw new Error(`Invalid command exports\n\n    at ${origin}\n\n    ${badTypes.join('\n    ')}\n\n`);

    validatePermissions(cmd.config.clientPermissions, cmd.help.name);
    validatePermissions(cmd.config.userPermissions, cmd.help.name);

    if (client.commands.get(cmd.help.name)) throw new Error(`Two or more commands have the same name: ${cmd.help.name}\n    at: ${origin}`);

    cmd.config.aliases.forEach(alias => {
        if (client.aliases.get(alias)) throw new Error(`Two commands or more commands have the same aliases: ${alias}\n    at: ${origin}`);
        client.aliases.set(alias, cmd.help.name);
    });

    return true;

};

const checkExports = (config, help, args, wrongTypes = []) => {

    Object.entries(config).forEach(([key, value]) => {
        if (!configTypes[key]) wrongTypes.push(`config.${key} -> property is not supported`);
        if (configTypes[key] === 'array') Array.isArray(value) ? true : wrongTypes.push(`config.${key} -> expected an array, received ${typeof value}`);
        else if (typeof value != configTypes[key]) wrongTypes.push(`config.${key} -> expected ${configTypes[key]}, received ${typeof value}`);
    });

    Object.entries(configTypes).forEach(entry => {
        if (config[entry[0]] == undefined) wrongTypes.push(`You are missing the config property => config.${entry[0]}`);
    });

    Object.entries(help).forEach(([key, value]) => {
        if (!helpTypes[key]) wrongTypes.push(`help.${key} -> property is not supported`);
        else if (helpTypes[key] === 'array') Array.isArray(value) ? true : wrongTypes.push(`help.${key} -> expected an array, received ${typeof value}`);
        else if (typeof value != helpTypes[key]) wrongTypes.push(`help.${key} -> expected ${helpTypes[key]}, received ${typeof value}`);
        else if (typeof value === 'string' && value.length < 1) wrongTypes.push(`help.${key} -> expected at least 1 character, received none`);
    });

    Object.entries(helpTypes).forEach(entry => {
        if (help[entry[0]] == undefined) wrongTypes.push(`You are missing the help property => help.${entry[0]}`);
    });

    let i = 0;

    if (args && args.required) {

        Object.entries(args.required).forEach(obj => {
            Object.entries(obj[1]).forEach(([key, value]) => {
                if (!argTypes[key]) wrongTypes.push(`args.required[${i}].${key} -> property is not supported`);
                else if (argTypes[key] === 'array') Array.isArray(value) ? true : wrongTypes.push(`args.required[${i}].${key} -> expected an array, received ${typeof value}`);
                else if (typeof value != argTypes[key]) wrongTypes.push(`args.required[${i}].${key} -> expected ${argTypes[key]}, received ${typeof value}`);
                else if (typeof value === 'string' && value.length < 1) wrongTypes.push(`args.required[${i}].${key} -> expected at least 1 character, received none`);
            });
            Object.entries(argTypes).forEach(entry => {
                if (obj[1][entry[0]] == undefined) wrongTypes.push(`args.required[${i}] => missing property => ${entry[0]}!`);
            });
            if (!obj[1].flexible && (obj[1].options == undefined || !obj[1].options.length)) wrongTypes.push(`args.required[${i}].flexible = false, yet there are no supported options!`);
            i++;
        });

    }

    i = 0;

    if (args && args.optional) {
        Object.entries(args.optional).forEach(obj => {
            Object.entries(obj[1]).forEach(([key, value]) => {
                if (!argTypes[key]) wrongTypes.push(`args.required[${i}].${key} -> property is not supported`);
                else if (argTypes[key] === 'array') Array.isArray(value) ? true : wrongTypes.push(`args.required[${i}].${key} -> expected an array, received ${typeof value}`);
                else if (typeof value != argTypes[key]) wrongTypes.push(`args.required[${i}].${key} -> expected ${argTypes[key]}, received ${typeof value}`);
                else if (typeof value === 'string' && value.length < 1) wrongTypes.push(`args.required[${i}].${key} -> expected at least 1 character, received none`);
            });
            Object.entries(argTypes).forEach(entry => {
                if (entry[0] != 'flexible' && obj[1][entry[0]] == undefined) wrongTypes.push(`args.optional[${i}] => missing property => ${entry[0]}!`);
            });
            i++;
        });
    }

    return wrongTypes.length ? wrongTypes : true;

};

const configTypes = {
    enabled: 'boolean',
    required: 'boolean',
    aliases: 'array',
    permLevel: 'string',
    cooldown: 'number',
    clientPermissions: 'array',
    userPermissions: 'array'
};

const helpTypes = {
    name: 'string',
    category: 'string',
    shortDescription: 'string',
    longDescription: 'string',
    usage: 'string',
    examples: 'array'
};

const argTypes = {
    index: 'number',
    name: 'string',
    options: 'array',
    flexible: 'boolean'
};
