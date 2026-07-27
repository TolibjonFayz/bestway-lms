'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('units', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      order_index: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      is_locked_by_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    /* Two units cannot claim the same slot in a course's roadmap. */
    await queryInterface.addConstraint('units', {
      fields: ['course_id', 'order_index'],
      type: 'unique',
      name: 'units_course_order_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('units');
  },
};
