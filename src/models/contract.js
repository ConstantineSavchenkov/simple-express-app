const Sequelize = require('sequelize');

module.exports.statuses = {
  New: 'new',
  InProgress: 'in_progress',
  Terminated: 'terminated',
};

module.exports.init = (connection)=>{
/**  A contract between and client and a contractor.
contracts are considered active only when in status `in_progress`
Contracts group jobs within them. */
  class Contract extends Sequelize.Model {}
  Contract.init(
      {
        terms: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM(
              module.exports.statuses.New,
              module.exports.statuses.InProgress,
              module.exports.statuses.Terminated),
        },
      },
      {
        sequelize: connection,
        modelName: 'Contract',
      },
  );
};

module.exports.associate = ({ models })=>{
  models.Contract.belongsTo(models.Profile, { as: 'Contractor' });
  models.Contract.belongsTo(models.Profile, { as: 'Client' });
  models.Contract.hasMany(models.Job);
};


