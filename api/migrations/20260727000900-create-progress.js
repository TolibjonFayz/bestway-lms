'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('progress', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      lesson_item_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'lesson_items', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      percent: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      completed_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    /* One row per student per item — this is what makes progress an upsert. */
    await queryInterface.addConstraint('progress', {
      fields: ['student_id', 'lesson_item_id'],
      type: 'unique',
      name: 'progress_student_item_unique',
    });
    await queryInterface.addConstraint('progress', {
      fields: ['percent'],
      type: 'check',
      name: 'progress_percent_range',
      where: { percent: { [Sequelize.Op.between]: [0, 100] } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('progress');
  },
};
