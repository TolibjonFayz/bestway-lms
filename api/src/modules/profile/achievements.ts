/** Static catalog — a fixed, hand-picked set of milestones rather than an
    admin-editable table, since nothing in this stage needs to add or retire
    one without a code change. Earned/locked is computed fresh from real
    progress/submission/vocabulary data on every read (see profile.service),
    not stored — there is nothing to award or reverse, only to observe. */
export interface AchievementDefinition {
  id: string;
  icon: string;
  tone: 'orange' | 'green' | 'amber';
}

export const ACHIEVEMENT_CATALOG: readonly AchievementDefinition[] = [
  { id: 'streak_7', icon: 'flame', tone: 'orange' },
  { id: 'first_100', icon: 'star', tone: 'green' },
  { id: 'vocab_50', icon: 'book-open', tone: 'amber' },
  { id: 'tests_10', icon: 'file-check', tone: 'green' },
  { id: 'ielts_mock', icon: 'graduation-cap', tone: 'orange' },
];
