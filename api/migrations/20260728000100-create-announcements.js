'use strict';

/* The dashboard's story strip. Per-student read tracking belongs with the full
   announcements feature (PLAN.md stage 3); until then the strip highlights by
   recency, so only the publish time is stored here. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('announcements', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: { type: Sequelize.STRING, allowNull: false },
      /* Name of an icon in the frontend's kit, not a URL — the strip draws
         glyphs on tinted circles, never uploaded images. */
      icon: { type: Sequelize.STRING(40), allowNull: false },
      tone: {
        type: Sequelize.ENUM('green', 'orange', 'sky', 'muted'),
        allowNull: false,
        defaultValue: 'green',
      },
      body: { type: Sequelize.TEXT, allowNull: true },
      order_index: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      published_at: { type: Sequelize.DATE, allowNull: false },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('announcements', ['active', 'order_index'], {
      name: 'announcements_active_order_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('announcements');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_announcements_tone";',
    );
  },
};
