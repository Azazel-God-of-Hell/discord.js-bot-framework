exports.run = async ({ client, message, args, guildSettings }) => {
    
    // .js files/commands starting with '.' WONT be loaded, like this template

    // const tagExecutor = message.author.toString();

    /*  exports.config
        enabled: Is the command enabled globally?
        required: Can the command be disabled per server? Will check permission level accordingly
        aliases: Names/strings the command can also be called by
        permLevel: The permission level NAME required to execute the command
        cooldown: The cooldown between member calls. -1 to disable, 0 works, but it will still apply the 0 second cooldown
        clientPermissions: The permissions the client needs to execute the command
        userPermissions: The EXTRA discord permissions members need individually. Useful for moderation commands
    */

    /*  exports.help
        
        help.name: The name of the command

        help.category: The category of the command, commands will be separated/sorted
        by category in the "help" command

        help.shortDescription: A short description of the command

        help.longDescription: A long description of the command, only displayed when someone
        calls "help <command>". Provide a detailed description of what the command does and how to use it

        help.usage: Display how members/humans should be using the command
        <command> gets replaced by the respective command name in help

        help.examples: Provide some example of how to use the command 
        Think of required/available arguments/parametes/user input
        Try and show as much variety as possible

    */

    /* exports.args
        {
            // the index of the argument, 0 is the first user argument provided
            index: 0,
            name: '',
            // Available options
            options: [],
            // Are the options hard-set/coded or do they vary, like an ID
            flexible: true
        }
    */

};

exports.config = {
    enabled: null,
    required: null,
    aliases: [],
    permLevel: '',
    cooldown: -1,
    clientPermissions: [],
    userPermissions: []
};

exports.help = {
    name: '',
    category: '',
    shortDescription: '',
    longDescription: '',
    usage: '<command>',
    examples: []
};

exports.args = {

    required: [
        {
            index: 0,
            name: '',
            options: [],
            flexible: true
        }
    ],

    optional: [
        {
            index: 1,
            name: '',
            options: []
        }
    ]

};
