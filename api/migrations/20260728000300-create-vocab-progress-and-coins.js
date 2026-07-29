'use strict';

/* Two tables the learning flow needs:

   vocab_word_progress — per-student mastery of a single word. A word climbs a
   level per correct answer and drops one per wrong answer; at MASTERED_LEVEL
   it counts as "yodlangan".

   coin_awards — the coin ledger. Coins were derived arithmetic until now
   (dashboard/scoring.ts); awarding them for real needs a record, and the
   unique index on (student, item, reason) is what makes an award idempotent —
   finishing the same lesson twice cannot pay twice. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vocab_word_progress', {
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
      vocab_word_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'vocab_words', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      /* 0 = yangi, 1–2 = oʻrganilmoqda, 3 = yodlangan. */
      level: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      correct_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      wrong_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      last_answered_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addConstraint('vocab_word_progress', {
      fields: ['student_id', 'vocab_word_id'],
      type: 'unique',
      name: 'vocab_word_progress_student_word_unique',
    });
    await queryInterface.addConstraint('vocab_word_progress', {
      fields: ['level'],
      type: 'check',
      name: 'vocab_word_progress_level_range',
      where: { level: { [Sequelize.Op.between]: [0, 3] } },
    });

    await queryInterface.createTable('coin_awards', {
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
      reason: {
        type: Sequelize.ENUM('video_completed', 'vocabulary_completed'),
        allowNull: false,
      },
      /* Whole coins, never a float. */
      amount: { type: Sequelize.INTEGER, allowNull: false },
      awarded_at: { type: Sequelize.DATE, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    /* The idempotency guarantee lives here, not in application logic: even a
       racing double-submit hits this index. */
    await queryInterface.addConstraint('coin_awards', {
      fields: ['student_id', 'lesson_item_id', 'reason'],
      type: 'unique',
      name: 'coin_awards_student_item_reason_unique',
    });
    await queryInterface.addIndex('coin_awards', ['student_id'], {
      name: 'coin_awards_student_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('coin_awards');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_coin_awards_reason";',
    );
    await queryInterface.dropTable('vocab_word_progress');
  },
};
