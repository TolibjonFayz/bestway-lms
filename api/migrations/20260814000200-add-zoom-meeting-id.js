'use strict';

/* Needed to mint a ZAK "start as host" link on demand (see ZoomService) — the
   join_url alone doesn't carry a bare meeting id. Backfilled from existing
   join_urls (…/j/{id}?…) so groups set up before this migration don't need
   their meeting recreated. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('groups', 'zoom_meeting_id', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`
      UPDATE groups
      SET zoom_meeting_id = (regexp_match(zoom_join_url, '/j/(\\d+)'))[1]::bigint
      WHERE zoom_join_url ~ '/j/(\\d+)'
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('groups', 'zoom_meeting_id');
  },
};
