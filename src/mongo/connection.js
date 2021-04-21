const { connect, connection } = require('mongoose');

// const link = `mongodb+srv://${username}:${password}@${host}/${name}`;

module.exports = async () => {
    await connect(process.env.MONGO_LINK, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }).catch(error => console.log(error));
    return connect;
};

connection.once('open', () => {
    console.log('\n\nConnected to MongoDB!');
});

connection.on('error', console.error.bind(console, 'MongoDB Connection Error:'));
