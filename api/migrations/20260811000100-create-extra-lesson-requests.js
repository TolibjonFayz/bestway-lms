'use strict';

const STATUSES = ['yuborildi', 'korib_chiqilmoqda', 'tasdiqlandi', 'rad_etildi'];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('extra_lesson_requests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      /* The unit they struggled with, when the request is about one. Null for
         a free-text topic. */
      unit_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'units', key: 'id' },
        onDelete: 'SET NULL',
      },
      topic: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      /* Free text rather than a timestamp — students write things like
         "shanba kunlari kechqurun", which no picker would capture. */
      preferred_time: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM(...STATUSES),
        allowNull: false,
        defaultValue: 'yuborildi',
      },
      teacher_note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      answered_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      answered_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    /* Both list views read by owner and newest-first. */
    await queryInterface.addIndex('extra_lesson_requests', ['student_id', 'created_at']);
    await queryInterface.addIndex('extra_lesson_requests', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('extra_lesson_requests');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_extra_lesson_requests_status";',
    );
  },
};
