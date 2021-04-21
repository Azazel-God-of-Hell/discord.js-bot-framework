const { success } = require('log-symbols');
const { readdirSync } = require('fs');
const { sep } = require('path');

module.exports.loadListeners = async (client, counter = 0) => {
    console.log('\nStart initializing LISTENERS');
    const dir = './src/listeners';

    readdirSync(dir).filter(d => !d.startsWith('.') && !d.endsWith('.js'))
        .forEach(entry => {

            const listeners = readdirSync(`${dir}${sep}${entry}${sep}`)
                .filter(file => file.endsWith('.js') && !file.startsWith('.'));

            for (const file of listeners) {
                const eventName = file.split('.')[0];
                const event = require(`../listeners/${entry}/${file}`);
                client.on(eventName, event.bind(null, client));
                counter++;
                console.log(`${success} Loaded event ${counter}: ${eventName}`);
            }

        });

    console.log('Done initializing LISTENERS');
};
