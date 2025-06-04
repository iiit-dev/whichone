'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add all the missing demographic and analytics fields
    await queryInterface.addColumn('Users', 'age', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'gender', {
      type: Sequelize.ENUM('male', 'female', 'non-binary', 'prefer-not-to-say'),
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'location', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'country', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'occupation', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'education_level', {
      type: Sequelize.ENUM('high-school', 'bachelor', 'master', 'phd', 'other'),
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'income_range', {
      type: Sequelize.ENUM('under-25k', '25k-50k', '50k-75k', '75k-100k', 'over-100k'),
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'interests', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'total_votes_cast', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('Users', 'total_polls_created', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('Users', 'total_earnings', {
      type: Sequelize.DECIMAL(10, 2),
      defaultValue: 0.00
    });

    await queryInterface.addColumn('Users', 'reputation_score', {
      type: Sequelize.DECIMAL(5, 2),
      defaultValue: 5.00
    });

    await queryInterface.addColumn('Users', 'last_active', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    // Remove all the added columns in reverse order
    await queryInterface.removeColumn('Users', 'last_active');
    await queryInterface.removeColumn('Users', 'reputation_score');
    await queryInterface.removeColumn('Users', 'total_earnings');
    await queryInterface.removeColumn('Users', 'total_polls_created');
    await queryInterface.removeColumn('Users', 'total_votes_cast');
    await queryInterface.removeColumn('Users', 'interests');
    await queryInterface.removeColumn('Users', 'income_range');
    await queryInterface.removeColumn('Users', 'education_level');
    await queryInterface.removeColumn('Users', 'occupation');
    await queryInterface.removeColumn('Users', 'country');
    await queryInterface.removeColumn('Users', 'location');
    await queryInterface.removeColumn('Users', 'gender');
    await queryInterface.removeColumn('Users', 'age');
  }
}; 