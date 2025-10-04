'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'currentLatitude', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true,
      validate: {
        min: -90,
        max: 90
      }
    });

    await queryInterface.addColumn('Users', 'currentLongitude', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true,
      validate: {
        min: -180,
        max: 180
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'currentLatitude');
    await queryInterface.removeColumn('Users', 'currentLongitude');
  }
};
