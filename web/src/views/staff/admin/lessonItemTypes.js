import uz from '@/locales/uz'

/* Mirrors api/src/common/enums.ts ITEM_TYPES_BY_SUBJECT — the server is the
   real gate (LessonItemsService throws on a disallowed type), this just
   keeps the picker from offering a type the save would reject anyway. */
export const ITEM_TYPES_BY_SUBJECT = {
  ielts: ['video', 'vocabulary', 'test', 'speaking'],
  math: ['video', 'test'],
  science: ['video', 'test'],
}

export const ITEM_TYPE_META = {
  video: { label: uz.courseBuilder.videoItem, icon: 'play' },
  vocabulary: { label: uz.courseBuilder.vocabularyItem, icon: 'star' },
  test: { label: uz.courseBuilder.testItem, icon: 'edit' },
  speaking: { label: uz.courseBuilder.speakingItem, icon: 'mic' },
}

export function allowedTypesFor(subject) {
  return ITEM_TYPES_BY_SUBJECT[subject] ?? []
}
