const { MessageEmbed } = require('discord.js');

module.exports.checkHasRequiredArgs = (prefix, message, cmd, args) => {

    if (!cmd.args || !cmd.args.required) return true;

    const inputErrorEmbed = new MessageEmbed()
    .setColor('RED');

    if (cmd.args) {

        if (cmd.args.required) {
            for(const arg of cmd.args.required) {
                if (!args[arg.index]) {
                    inputErrorEmbed.addField(`**__Missing REQUIRED argument__** #${arg.index + 1} - ${arg.name.toProperCase()}`, `**Options:** \`${arg.options.join('`, `')}\``, true);
                } else if (!arg.flexible && !arg.options.includes(args[arg.index])) {
                    inputErrorEmbed.setColor('ORANGE');
                    inputErrorEmbed.addField(`**__Invalid REQUIRED argument__** #${arg.index + 1} - ${arg.name.toProperCase()}`, `**Options:** \`${arg.options.join('`, `')}\``, true);
                }
            }
        }

        if (cmd.args.optional) {
            for(const arg of cmd.args.optional.filter(a => a.flexible == false)) {
                if (args[arg.index] && !arg.options.includes(args[arg.index])) {
                    inputErrorEmbed.addField(`**__Invalid OPTIONAL argument__** #${arg.index + 1} - ${arg.name.toProperCase()}`, `**Options:** \`${arg.options.join('`, `')}\``, true);
                }
            }
        }

    }

    if (inputErrorEmbed.fields && inputErrorEmbed.fields.length >= 1) {
        inputErrorEmbed.setDescription(`**${message.author.toString()}, there ${inputErrorEmbed.fields.length == 1 ? 'is a problem' : 'are some problems'} with your provided [arguments / options](https://pastebin.com/DytkkJ0x)!**\n\nType **\`${prefix}help ${cmd.help.name}\`** for more information!`);
        if (cmd.help.examples[0]) inputErrorEmbed.addField('Correct usage example:', `**\`\`\`${prefix}${cmd.help.examples[0]}\`\`\`**`, false);
        message.channel.send(inputErrorEmbed);
        return false;
    }

    return true;

};

module.exports.getArgs = (command, embed) => {

    let argIndex = 0;
    let hasNextArg = true;
    let thisArg = undefined;
    let type;

    do {

        if (command.args && command.args.required) {
            thisArg = command.args.required.find(arg => arg.index == argIndex);
            type = 'Required';
        }

        if (!thisArg && command.args && command.args.optional) {
            thisArg = command.args.optional.find(arg => arg.index == argIndex);
            type = 'Optional';
        }

        if (thisArg == undefined) {
            hasNextArg = false;
            break;
        }

        const { index, name, options } = thisArg;

        embed.addField(`${type} #${index + 1} -> ${name}`, `\`\`\`${options.join(' \n')}\`\`\``, true);

        argIndex++;

    } while (hasNextArg);

    if (command.args && command.args.flags && command.args.flags.length >= 1) {
        if (embed.fields.length) embed.addField('\u200b', '\u200b', false);
        embed.addField('Command Flags', `${
            command.args.flags
            .filter() // Handle permlevel O:
            .map(f => `\`${f.flag}\` **=>** ${f.result}`)
            .join('\n')
        }`, true);
    }

    if (!embed.fields.length) embed.setDescription(`The command **\`${command.help.name}\`** doesn't have any required or optional [options / arguments](https://pastebin.com/DytkkJ0x)`);

};
