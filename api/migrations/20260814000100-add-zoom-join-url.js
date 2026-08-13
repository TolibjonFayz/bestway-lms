'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /* One recurring-meeting link per group: the teacher creates it once in
       Zoom and it stays valid for every lesson, so nothing has to be updated
       between sessions. */
    await queryInterface.addColumn('groups', 'zoom_join_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('groups', 'zoom_join_url');
  },
};
