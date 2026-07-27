'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      /* SHA-256 hex digest, never the token itself — a database dump must not
         hand out live sessions. */
      token_hash: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
      },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      revoked_at: { type: Sequelize.DATE, allowNull: true },
      user_agent: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('refresh_tokens', ['user_id'], {
      name: 'refresh_tokens_user_id_idx',
    });
    /* Sweeping expired rows scans this. */
    await queryInterface.addIndex('refresh_tokens', ['expires_at'], {
      name: 'refresh_tokens_expires_at_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('refresh_tokens');
  },
};
