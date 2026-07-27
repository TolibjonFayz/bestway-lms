'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lesson_items', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      unit_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'units', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      /* Which payload table carries this item's content. Whether a given type
         is legal here depends on the course subject, which the database cannot
         express across three joins — LessonItemsService enforces it. */
      type: {
        type: Sequelize.ENUM('video', 'vocabulary', 'test', 'speaking'),
        allowNull: false,
      },
      order_index: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addConstraint('lesson_items', {
      fields: ['unit_id', 'order_index'],
      type: 'unique',
      name: 'lesson_items_unit_order_unique',
    });
    await queryInterface.addIndex('lesson_items', ['type'], {
      name: 'lesson_items_type_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('lesson_items');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_lesson_items_type";',
    );
  },
};
