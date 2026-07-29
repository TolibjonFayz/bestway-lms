'use strict';

/* The player's collapsible "Konspekt" section had nowhere to live. Bullets are
   stored as plain strings rather than markup: they are rendered as text, so a
   teacher writing notes can never inject HTML into a student's page. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('videos', 'konspekt', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [],
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('videos', 'konspekt');
  },
};
