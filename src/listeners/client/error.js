const { err } = require('log-symbols');
module.exports = async (client, error) => {
  console.log(`${err} Discord.js ERROR: \n${JSON.stringify(error)}`);
};
