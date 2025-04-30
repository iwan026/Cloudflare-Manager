const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
dialect: 'sqlite',
storage: 'database/database.sqlite',
logging: false,
});

const User = sequelize.define('User', {
chatId: {
type: DataTypes.INTEGER,
allowNull: false,
},
username: {
type: DataTypes.STRING,
allowNull: false,
},
role: {
type: DataTypes.STRING,
allowNull: false,
defaultValue: 'Basic',
}
});

const CloudflareAccount = sequelize.define('CloudflareAccount', {
userChatId: {
type: DataTypes.INTEGER,
allowNull: false,
},
domainName: {
type: DataTypes.STRING,
allowNull: false,
},
email: {
type: DataTypes.STRING,
allowNull: false,
validate: {
isEmail: true,
},
},
zoneId: {
type: DataTypes.STRING,
allowNull: false,
},
apiKey: {
type: DataTypes.STRING,
allowNull: false,
},
accountId: {
type: DataTypes.STRING,
allowNull: false,
},
workerName: {
type: DataTypes.STRING,
allowNull: true,
}
});

sequelize.sync()
.then(() => console.log('Database is ready!'))
.catch((error) => console.log('Setup database failed!', error));

module.exports = { User, CloudflareAccount };