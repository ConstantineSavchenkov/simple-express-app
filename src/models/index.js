const Sequelize = require('sequelize');
const sequelize = process.env.NODE_ENV === 'test'?
new Sequelize('sqlite::memory:') : new Sequelize({
  dialect: 'sqlite',
  storage: '../../db/database.sqlite3',
});
const fs = require('fs');
const subs = fs.readdirSync(__dirname);

subs.forEach((modelFileName) => {
  if (modelFileName !== 'index.js') {
    const model = require('./'+modelFileName);
    model.init(sequelize);
  }
});

subs.forEach((modelFileName) => {
  if (modelFileName !== 'index.js') {
    const model = require('./'+modelFileName);
    model.associate(sequelize);
  }
});

module.exports = sequelize;

