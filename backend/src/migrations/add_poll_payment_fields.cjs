'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Polls', 'poll_fee', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false
    });

    await queryInterface.addColumn('Polls', 'reward_pool', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false
    });

    await queryInterface.addColumn('Polls', 'reward_per_voter', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00,
      allowNull: false
    });

    await queryInterface.addColumn('Polls', 'max_rewarded_voters', {
      type: Sequelize.INTEGER,
      defaultValue: 50,
      allowNull: false
    });

    await queryInterface.addColumn('Polls', 'demographic_filters', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.addColumn('Polls', 'views_count', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });

    await queryInterface.addColumn('Polls', 'shares_count', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Polls', 'poll_fee');
    await queryInterface.removeColumn('Polls', 'reward_pool');
    await queryInterface.removeColumn('Polls', 'reward_per_voter');
    await queryInterface.removeColumn('Polls', 'max_rewarded_voters');
    await queryInterface.removeColumn('Polls', 'demographic_filters');
    await queryInterface.removeColumn('Polls', 'views_count');
    await queryInterface.removeColumn('Polls', 'shares_count');
  }
}; 