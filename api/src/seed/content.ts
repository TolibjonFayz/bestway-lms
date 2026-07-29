import { CourseSubject, LessonItemType, QuestionType } from '@/common/enums';
import {
  Course,
  LessonItem,
  Question,
  QuestionOption,
  SpeakingTask,
  Test,
  Unit,
  Video,
  VocabWord,
} from '@/database/models';
import { LessonItemsService } from '@/modules/lessons/lesson-items.service';
import { buildMathTest } from './builders/math-test';
import { buildScienceTest } from './builders/science-test';
import { SeedQuestion } from './builders/question-types';
import { buildVocabularyTest } from './builders/vocabulary-test';
import { SEED_COURSES } from './data/curriculum';
import { IELTS_WORD_BANKS } from './data/ielts-vocabulary';
import { Rng } from './rng';

/** One seeded question plus whatever an answer sheet needs to fake a plausible
    right or wrong response for it, in a shape specific to its type. */
export interface SeededQuestion {
  id: number;
  type: QuestionType;
  points: number;
  /** multiple_choice / fill_blank (as option ids). */
  correctOptionId?: number;
  wrongOptionIds?: number[];
  /** fill_blank, as the literal text a student would type. */
  correctText?: string;
  wrongTexts?: string[];
  /** matching: every left option id with the right-hand text it pairs with. */
  pairs?: { leftOptionId: number; rightText: string }[];
}

/** A test item plus the ids an answer sheet needs to reference. */
export interface SeededTest {
  lessonItemId: number;
  questions: SeededQuestion[];
}

export interface SeededCourse {
  id: number;
  subject: CourseSubject;
  /** Lesson items in reading order across the whole course. */
  items: { id: number; type: LessonItemType; unitIndex: number }[];
  tests: Map<number, SeededTest>;
}

export async function seedCourses(
  lessonItems: LessonItemsService,
  rng: Rng,
  /* Course owners, in the order SEED_COURSES declares them. */
  teacherIds: (number | null)[] = [],
): Promise<SeededCourse[]> {
  const seeded: SeededCourse[] = [];

  for (const [courseIndex, courseSpec] of SEED_COURSES.entries()) {
    const course = await Course.create({
      name: courseSpec.name,
      subject: courseSpec.subject,
      description: courseSpec.description,
      coverUrl: null,
      teacherId: teacherIds[courseIndex] ?? null,
      active: true,
    } as Partial<Course> as Course);

    const items: SeededCourse['items'] = [];
    const tests = new Map<number, SeededTest>();

    for (const [unitIndex, unitSpec] of courseSpec.units.entries()) {
      const unit = await Unit.create({
        courseId: course.id,
        orderIndex: unitIndex + 1,
        title: unitSpec.title,
        /* Only the very first unit of a course starts open. */
        isLockedByDefault: unitIndex > 0,
      } as Partial<Unit> as Unit);

      let order = 1;

      /* Every create goes through LessonItemsService, so a vocabulary item in
         a maths unit would abort the seed instead of silently landing. */
      const videoItem = await lessonItems.create({
        unitId: unit.id,
        type: LessonItemType.Video,
        orderIndex: order++,
        title: unitSpec.videoTitle,
      });
      await Video.create({
        lessonItemId: videoItem.id,
        url: unitSpec.videoUrl,
        durationSeconds: unitSpec.videoDurationSeconds,
        thumbnailUrl: null,
        konspekt: unitSpec.konspekt ?? [],
      } as Partial<Video> as Video);
      items.push({ id: videoItem.id, type: LessonItemType.Video, unitIndex });

      if (unitSpec.vocabularyTitle) {
        const bank = IELTS_WORD_BANKS[unitIndex % IELTS_WORD_BANKS.length];
        const vocabItem = await lessonItems.create({
          unitId: unit.id,
          type: LessonItemType.Vocabulary,
          orderIndex: order++,
          title: unitSpec.vocabularyTitle,
        });
        await VocabWord.bulkCreate(
          bank.map(([wordEn, wordUz, transcription, exampleEn], index) => ({
            lessonItemId: vocabItem.id,
            wordEn,
            wordUz,
            transcription,
            exampleEn,
            orderIndex: index + 1,
          })) as unknown as VocabWord[],
        );
        items.push({ id: vocabItem.id, type: LessonItemType.Vocabulary, unitIndex });
      }

      const testItem = await lessonItems.create({
        unitId: unit.id,
        type: LessonItemType.Test,
        orderIndex: order++,
        title: unitSpec.testTitle,
      });
      const built = buildTest(courseSpec.subject, unitIndex, rng);
      tests.set(testItem.id, await writeTest(testItem.id, built, rng));
      items.push({ id: testItem.id, type: LessonItemType.Test, unitIndex });

      if (unitSpec.speakingTitle && unitSpec.speakingPrompt) {
        const speakingItem = await lessonItems.create({
          unitId: unit.id,
          type: LessonItemType.Speaking,
          orderIndex: order++,
          title: unitSpec.speakingTitle,
        });
        await SpeakingTask.create({
          lessonItemId: speakingItem.id,
          prompt: unitSpec.speakingPrompt,
          part: unitSpec.speakingPart ?? null,
          prepSeconds: unitSpec.speakingPart === 2 ? 60 : null,
          maxDurationSeconds: unitSpec.speakingPart === 2 ? 120 : 90,
        } as Partial<SpeakingTask> as SpeakingTask);
        items.push({ id: speakingItem.id, type: LessonItemType.Speaking, unitIndex });
      }
    }

    seeded.push({ id: course.id, subject: courseSpec.subject, items, tests });
  }

  return seeded;
}

function buildTest(
  subject: CourseSubject,
  unitIndex: number,
  rng: Rng,
): SeedQuestion[] {
  if (subject === CourseSubject.Ielts) {
    return buildVocabularyTest(
      IELTS_WORD_BANKS[unitIndex % IELTS_WORD_BANKS.length],
      rng,
    );
  }
  if (subject === CourseSubject.Math) return buildMathTest(unitIndex, rng);
  return buildScienceTest(unitIndex);
}

async function writeTest(
  lessonItemId: number,
  questions: SeedQuestion[],
  rng: Rng,
): Promise<SeededTest> {
  const test = await Test.create({
    lessonItemId,
    passScore: 60,
    timeLimitSeconds: 900,
    attemptsAllowed: 2,
  } as Partial<Test> as Test);

  const recorded: SeededQuestion[] = [];

  for (const [index, spec] of questions.entries()) {
    const question = await Question.create({
      testId: test.id,
      type: spec.type,
      orderIndex: index + 1,
      prompt: spec.prompt,
      explanation: spec.explanation ?? null,
      points: 1,
    } as Partial<Question> as Question);

    /* Matching keeps its pairs in a fixed order — order carries no answer
       information there, since left and right are shown decorrelated at
       serve time. Multiple choice and fill_blank shuffle so the correct
       answer is not always first. */
    const ordered =
      spec.type === QuestionType.Matching ? spec.options : rng.shuffle(spec.options);
    const options = await QuestionOption.bulkCreate(
      ordered.map((option, optionIndex) => ({
        questionId: question.id,
        orderIndex: optionIndex + 1,
        text: option.text,
        isCorrect: option.isCorrect,
        matchText: option.matchText ?? null,
      })) as unknown as QuestionOption[],
      { returning: true },
    );

    if (spec.type === QuestionType.Matching) {
      recorded.push({
        id: question.id,
        type: spec.type,
        points: question.points,
        pairs: options.map((o) => ({
          leftOptionId: o.id,
          rightText: o.matchText!,
        })),
      });
      continue;
    }

    /* No options at all — nothing for an answer sheet to reference, and
       nothing for the auto-grader to check. */
    if (spec.type === QuestionType.Open) {
      recorded.push({ id: question.id, type: spec.type, points: question.points });
      continue;
    }

    const correct = options.find((option) => option.isCorrect);
    if (!correct) {
      throw new Error(`Question ${question.id} has no correct option`);
    }
    const wrong = options.filter((o) => !o.isCorrect);
    recorded.push({
      id: question.id,
      type: spec.type,
      points: question.points,
      correctOptionId: correct.id,
      wrongOptionIds: wrong.map((o) => o.id),
      correctText: correct.text,
      wrongTexts: wrong.map((o) => o.text),
    });
  }

  return { lessonItemId, questions: recorded };
}
