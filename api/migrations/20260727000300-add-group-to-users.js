'use strict';

/* Closes the users ↔ groups cycle now that both tables exist. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'group_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'groups', key: 'id' },
      onUpdate: 'CASCADE',
      /* Deleting a group must never delete its students. */
      onDelete: 'SET NULL',
    });

    await queryInterface.addIndex('users', ['group_id'], {
      name: 'users_group_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'group_id');
  },
};
