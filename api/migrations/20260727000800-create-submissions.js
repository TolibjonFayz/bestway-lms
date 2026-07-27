'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('submissions', {
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
      answers: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {},
      },
      /* Whole percents. auto_score is machine-marked, manual_score is the
         teacher's override and wins when both are present. */
      auto_score: { type: Sequelize.INTEGER, allowNull: true },
      manual_score: { type: Sequelize.INTEGER, allowNull: true },
      teacher_comment: { type: Sequelize.TEXT, allowNull: true },
      graded_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        /* Keep the grade if the teacher's account goes away. */
        onDelete: 'SET NULL',
      },
      status: {
        type: Sequelize.ENUM('draft', 'submitted', 'graded', 'returned'),
        allowNull: false,
        defaultValue: 'draft',
      },
      submitted_at: { type: Sequelize.DATE, allowNull: true },
      graded_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('submissions', ['student_id', 'lesson_item_id'], {
      name: 'submissions_student_item_idx',
    });
    /* The teacher's grading queue reads by status and arrival order. */
    await queryInterface.addIndex('submissions', ['status', 'submitted_at'], {
      name: 'submissions_status_submitted_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('submissions');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_submissions_status";',
    );
  },
};
