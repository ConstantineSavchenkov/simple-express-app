const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./models');
const routers = require('./routers');
const errorHandler = require('./middleware/errorHandler');
const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);
app.use(routers);
app.use(errorHandler);

module.exports = app;
