'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Dodaj ID kolonu kao auto-increment
    await queryInterface.addColumn('Users', 'id', {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false
    });

    // 2. Popuni ID vrednosti za postojeće users
    await queryInterface.sequelize.query(`
      UPDATE "Users" SET id = nextval(pg_get_serial_sequence('"Users"', 'id'))
    `);

    // 3. Ukloni primary key sa username
    await queryInterface.removeConstraint('Users', 'Users_pkey');

    // 4. Dodaj primary key na id
    await queryInterface.addConstraint('Users', {
      fields: ['id'],
      type: 'primary key',
      name: 'Users_pkey'
    });

    // 5. Dodaj unique constraint na username
    await queryInterface.addConstraint('Users', {
      fields: ['username'],
      type: 'unique',
      name: 'Users_username_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback: vrati username kao primary key
    await queryInterface.removeConstraint('Users', 'Users_pkey');
    await queryInterface.removeConstraint('Users', 'Users_username_unique');
    
    await queryInterface.addConstraint('Users', {
      fields: ['username'],
      type: 'primary key',
      name: 'Users_pkey'
    });
    
    await queryInterface.removeColumn('Users', 'id');
  }
};