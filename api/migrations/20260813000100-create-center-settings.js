'use strict';

/* A single-row table: the centre has one set of settings, and a table keyed by
   a fixed id keeps that guarantee in the schema rather than in convention. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('center_settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
      },
      theme: {
        type: Sequelize.STRING(32),
        allowNull: false,
        defaultValue: 'bestway',
      },
      center_name: {
        type: Sequelize.STRING(120),
        allowNull: false,
        defaultValue: 'Best Way',
      },
      phone: {
        type: Sequelize.STRING(32),
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      /* Gamification amounts, so the centre can tune motivation without a
         deploy. Integers only — coins and points are never fractional. */
      coins_per_vocabulary: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 25,
      },
      coins_per_test: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.bulkInsert('center_settings', [
      {
        id: 1,
        theme: 'bestway',
        center_name: 'Best Way',
        phone: null,
        address: null,
        coins_per_vocabulary: 25,
        coins_per_test: 30,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('center_settings');
  },
};
