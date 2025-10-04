'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('tour_executions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID korisnika koji izvršava turu'
      },
      tourId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID ture koja se izvršava'
      },
      purchaseTokenId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID purchase token-a (obavezno za kupljene ture)'
      },
      status: {
        type: Sequelize.ENUM('active', 'completed', 'abandoned'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'Status izvršavanja ture'
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Vreme početka izvršavanja ture'
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Vreme završetka izvršavanja ture'
      },
      lastActivity: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Poslednja aktivnost (update pozicije)'
      },
      startLatitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
        comment: 'Početna geografska širina'
      },
      startLongitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
        comment: 'Početna geografska dužina'
      },
      currentLatitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
        comment: 'Trenutna geografska širina'
      },
      currentLongitude: {
        type: Sequelize.DECIMAL(10, 7),
        allowNull: true,
        comment: 'Trenutna geografska dužina'
      },
      completedKeyPoints: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: '[]',
        comment: 'Lista ID-jeva kompletiranih ključnih tačaka sa vremenima'
      },
      totalDistance: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Ukupna pređena distanca u metrima'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Napomene o izvršavanju ture'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes
    await queryInterface.addIndex('tour_executions', ['userId']);
    await queryInterface.addIndex('tour_executions', ['tourId']);
    await queryInterface.addIndex('tour_executions', ['status']);
    await queryInterface.addIndex('tour_executions', ['startTime']);
    await queryInterface.addIndex('tour_executions', ['userId', 'tourId', 'startTime'], {
      name: 'unique_active_execution',
      unique: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('tour_executions');
  }
};
