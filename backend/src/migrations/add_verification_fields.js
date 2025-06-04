export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Users', 'isVerified', {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('Users', 'isVerified');
} 