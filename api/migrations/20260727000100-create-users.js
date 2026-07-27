'use strict';

/* users.group_id is added later (20260727000300) — users and groups reference
   each other, so the second FK has to wait until both tables exist. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      phone: { type: Sequelize.STRING(9), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      role: {
        type: Sequelize.ENUM('student', 'teacher', 'admin'),
        allowNull: false,
        defaultValue: 'student',
      },
      full_name: { type: Sequelize.STRING, allowNull: false },
      avatar_url: { type: Sequelize.STRING, allowNull: true },
      level: { type: Sequelize.ENUM('A1', 'A2', 'B1', 'B2'), allowNull: true },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('users', ['role'], { name: 'users_role_idx' });
    await queryInterface.addIndex('users', ['active'], {
      name: 'users_active_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_level";');
  },
};
