'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('groups', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      teacher_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        /* A group outlives the teacher's account; it just loses its owner. */
        onDelete: 'SET NULL',
      },
      schedule: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      branch: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('groups', ['teacher_id'], {
      name: 'groups_teacher_id_idx',
    });
    await queryInterface.addIndex('groups', ['branch'], {
      name: 'groups_branch_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('groups');
  },
};
