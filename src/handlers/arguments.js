const { MessageEmbed } = require('discord.js');

module.exports.checkHasRequiredArgs = (prefix, message, cmd, args) => {

    if (!cmd.args || !cmd.args.required) return true;

    const inputErrorEmbed = new MessageEmbed()
    .setColor('RED');

    for(const arg of cmd.args.required) {
        if (!args[arg.index]) {
            inputErrorEmbed.addField(`**__Missing argument__** #${arg.index + 1} - ${arg.name.toProperCase()}`, `**Options:** \`${arg.options.join('`, `')}\``, true);
        } else if (!arg.flexible && !arg.options.includes(args[arg.index])) {
            inputErrorEmbed.setColor('ORANGE');
            inputErrorEmbed.addField(`**__Invalid argument__** #${arg.index + 1} - ${arg.name.toProperCase()}`, `**Options:** \`${arg.options.join('`, `')}\``, true);
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
            return hasNextArg = false;
        }

        const { index, name, options } = thisArg;

        embed.addField(`${type} #${index + 1} -> ${name}`, `\`\`\`${options.join(' \n')}\`\`\``, true);

        argIndex++;

    } while (hasNextArg);

    if (!embed.fields.length) embed.setDescription(`The command **\`${command.help.name}\`** doesn't have any required or optional [options / arguments](https://pastebin.com/DytkkJ0x)`);

};
