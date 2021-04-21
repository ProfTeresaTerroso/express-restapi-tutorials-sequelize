const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sql11403738', 'sql11403738', '3yPUTQ7AzB', {
    host: 'sql11.freemysqlhosting.net',
    dialect: 'mysql'
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

const User = sequelize.define("user", {
    username: DataTypes.STRING,
    birthday: DataTypes.DATE
});

sequelize.sync()
    .then(() => {
        return User.create({
            username: 'janedoe',
            birthday: new Date(1980, 6, 20)
        });
    }).then(jane => {
        console.log(jane.toJSON());
    });

    // (async () => {
    //     await sequelize.sync();
    //     const jane = await User.create({
    //       username: 'janedoe',
    //       birthday: new Date(1980, 6, 20)
    //     });
    //     console.log(jane.toJSON());
    //   })();
