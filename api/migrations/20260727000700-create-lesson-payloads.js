'use strict';

/* The four type-specific payload tables behind lesson_items. Video, test and
   speaking are 1:1 with their item (unique lesson_item_id); vocabulary is 1:N
   because one item holds a whole word list. */
module.exports = {
  async up(queryInterface, Sequelize) {
    const lessonItemRef = (unique) => ({
      type: Sequelize.INTEGER,
      allowNull: false,
      unique,
      references: { model: 'lesson_items', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    const stamps = {
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    };
    const id = {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    };

    await queryInterface.createTable('videos', {
      id,
      lesson_item_id: lessonItemRef(true),
      url: { type: Sequelize.STRING(1024), allowNull: false },
      duration_seconds: { type: Sequelize.INTEGER, allowNull: false },
      thumbnail_url: { type: Sequelize.STRING(1024), allowNull: true },
      ...stamps,
    });

    await queryInterface.createTable('vocab_words', {
      id,
      lesson_item_id: lessonItemRef(false),
      word_en: { type: Sequelize.STRING, allowNull: false },
      word_uz: { type: Sequelize.STRING, allowNull: false },
      transcription: { type: Sequelize.STRING, allowNull: true },
      example_en: { type: Sequelize.TEXT, allowNull: true },
      order_index: { type: Sequelize.INTEGER, allowNull: false },
      ...stamps,
    });
    await queryInterface.addIndex('vocab_words', ['lesson_item_id'], {
      name: 'vocab_words_lesson_item_idx',
    });

    await queryInterface.createTable('tests', {
      id,
      lesson_item_id: lessonItemRef(true),
      pass_score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 60,
      },
      time_limit_seconds: { type: Sequelize.INTEGER, allowNull: true },
      attempts_allowed: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      ...stamps,
    });

    await queryInterface.createTable('questions', {
      id,
      test_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tests', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      order_index: { type: Sequelize.INTEGER, allowNull: false },
      prompt: { type: Sequelize.TEXT, allowNull: false },
      points: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      ...stamps,
    });
    await queryInterface.addIndex('questions', ['test_id'], {
      name: 'questions_test_id_idx',
    });

    await queryInterface.createTable('question_options', {
      id,
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'questions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      order_index: { type: Sequelize.INTEGER, allowNull: false },
      text: { type: Sequelize.TEXT, allowNull: false },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ...stamps,
    });
    await queryInterface.addIndex('question_options', ['question_id'], {
      name: 'question_options_question_id_idx',
    });

    await queryInterface.createTable('speaking_tasks', {
      id,
      lesson_item_id: lessonItemRef(true),
      prompt: { type: Sequelize.TEXT, allowNull: false },
      part: { type: Sequelize.INTEGER, allowNull: true },
      prep_seconds: { type: Sequelize.INTEGER, allowNull: true },
      max_duration_seconds: { type: Sequelize.INTEGER, allowNull: true },
      ...stamps,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('speaking_tasks');
    await queryInterface.dropTable('question_options');
    await queryInterface.dropTable('questions');
    await queryInterface.dropTable('tests');
    await queryInterface.dropTable('vocab_words');
    await queryInterface.dropTable('videos');
  },
};
