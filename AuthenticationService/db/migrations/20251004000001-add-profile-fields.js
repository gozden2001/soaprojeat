'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new profile fields to Users table
    await queryInterface.addColumn('Users', 'biography', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'motto', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'profileImage', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Update existing users to have role 'turista' instead of 'user'
    await queryInterface.sequelize.query(`
      UPDATE "Users" 
      SET role = 'turista' 
      WHERE role = 'user';
    `);

    // Add constraint for role validation
    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'turista',
      validate: {
        isIn: [['administrator', 'vodic', 'turista']]
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the added columns
    await queryInterface.removeColumn('Users', 'biography');
    await queryInterface.removeColumn('Users', 'motto');
    await queryInterface.removeColumn('Users', 'profileImage');

    // Revert role changes
    await queryInterface.sequelize.query(`
      UPDATE "Users" 
      SET role = 'user' 
      WHERE role = 'turista';
    `);

    await queryInterface.changeColumn('Users', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'user',
    });
  }
};