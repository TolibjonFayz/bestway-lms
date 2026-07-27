'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('courses', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      /* Drives which lesson item types the course's units may hold. */
      subject: {
        type: Sequelize.ENUM('ielts', 'math', 'science'),
        allowNull: false,
      },
      description: { type: Sequelize.TEXT, allowNull: true },
      cover_url: { type: Sequelize.STRING, allowNull: true },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('courses', ['subject'], {
      name: 'courses_subject_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('courses');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_courses_subject";',
    );
  },
};
