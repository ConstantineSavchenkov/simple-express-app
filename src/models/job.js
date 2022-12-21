const Sequelize = require('sequelize');

module.exports.init = (connection)=>{
/**  contractor get paid for jobs by clients under a certain contract. */
  class Job extends Sequelize.Model {}
  Job.init(
      {
        description: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        price: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
        },
        paid: {
          type: Sequelize.BOOLEAN,
          default: false,
        },
        paymentDate: {
          type: Sequelize.DATE,
        },
      },
      {
        sequelize: connection,
        modelName: 'Job',
      },
  );
};

module.exports.associate = ({ models })=>{
  models.Job.belongsTo(models.Contract);
};
