const Sequelize = require('sequelize');

module.exports.init = (connection)=>{
/** A profile can be either a `client` or a `contractor`.
clients create contracts with contractors. contractor does jobs
for clients and get paid. */
  class Profile extends Sequelize.Model {}
  Profile.init(
      {
        firstName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        lastName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        profession: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        balance: {
          type: Sequelize.DECIMAL(12, 2),
        },
        type: {
          type: Sequelize.ENUM('client', 'contractor'),
        },
      },
      {
        sequelize: connection,
        modelName: 'Profile',
      },
  );
};

module.exports.associate = ({ models })=>{
  models.Profile.hasMany(models.Contract, { as: 'Contractor',
    foreignKey: 'ContractorId' });
  models.Profile.hasMany(models.Contract, { as: 'Client',
    foreignKey: 'ClientId' });
};
