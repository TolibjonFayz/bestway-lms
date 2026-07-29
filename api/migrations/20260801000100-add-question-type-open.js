'use strict';

/* Open (essay) questions have no machine-checkable answer — they exist so a
   test can mix auto-graded items with ones that always need a teacher, which
   is exactly what the homework review screen has to display. */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TYPE \"enum_questions_type\" ADD VALUE IF NOT EXISTS 'open';",
    );
  },

  async down() {
    /* Postgres has no DROP VALUE for enums — 'open' stays defined even after
       this rollback, same as test_completed on coin_awards.reason. */
  },
};
