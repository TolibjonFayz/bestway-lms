'use strict';

/* "Which courses is this student taking" had no answer in the schema: groups
   carry no course, and the lessons screens switch between several courses for
   one student. A student↔course join is the honest model — the centre teaches
   IELTS, maths and science and a student may take more than one.

   courses.teacher_id lands here too: the course card shows a teacher, and the
   group's teacher is the wrong one to show for a course the group does not own. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('enrollments', {
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
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      enrolled_at: { type: Sequelize.DATE, allowNull: false },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addConstraint('enrollments', {
      fields: ['student_id', 'course_id'],
      type: 'unique',
      name: 'enrollments_student_course_unique',
    });

    await queryInterface.addColumn('courses', 'teacher_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('courses', 'teacher_id');
    await queryInterface.dropTable('enrollments');
  },
};
