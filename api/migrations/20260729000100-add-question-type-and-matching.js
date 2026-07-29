'use strict';

/* Three question types share the questions/question_options tables:
   multiple_choice and fill_blank both use options (text + is_correct) —
   fill_blank differs only in how the client renders and grades them (free
   text compared against the correct option's text, not an id). matching
   reuses the same options as pairs: text is the left term, match_text the
   right term it must be paired with. explanation backs the result screen's
   expandable "Toʻgʻri javob" line. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('questions', 'type', {
      type: Sequelize.ENUM('multiple_choice', 'fill_blank', 'matching'),
      allowNull: false,
      defaultValue: 'multiple_choice',
    });
    await queryInterface.addColumn('questions', 'explanation', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('question_options', 'match_text', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    /* Postgres enum values cannot be added inside a normal DDL batch on older
       servers, but PG 12+ allows it as long as the value is not used in the
       same transaction — safe here since nothing reads it until this
       migration has committed. */
    await queryInterface.sequelize.query(
      "ALTER TYPE \"enum_coin_awards_reason\" ADD VALUE IF NOT EXISTS 'test_completed';",
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('question_options', 'match_text');
    await queryInterface.removeColumn('questions', 'explanation');
    await queryInterface.removeColumn('questions', 'type');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_questions_type";',
    );
    /* Postgres has no DROP VALUE for enums — 'test_completed' stays defined
       on enum_coin_awards_reason even after this rollback. */
  },
};
