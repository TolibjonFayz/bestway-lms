'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('attendance', {
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
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'groups', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      /* DATEONLY, not a timestamp: a lesson belongs to a calendar day in
         Asia/Tashkent and must not drift across the UTC boundary. */
      date: { type: Sequelize.DATEONLY, allowNull: false },
      status: {
        type: Sequelize.ENUM('kelgan', 'kelmagan', 'kechikkan', 'sababli'),
        allowNull: false,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addConstraint('attendance', {
      fields: ['student_id', 'group_id', 'date'],
      type: 'unique',
      name: 'attendance_student_group_date_unique',
    });
    /* The monthly register reads a whole group by date range. */
    await queryInterface.addIndex('attendance', ['group_id', 'date'], {
      name: 'attendance_group_date_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('attendance');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_attendance_status";',
    );
  },
};
