import { CourseSubject, LessonItemType } from '@/common/enums';
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

/** A test item plus the ids an answer sheet needs to reference. */
export interface SeededTest {
  lessonItemId: number;
  questions: { id: number; correctOptionId: number; wrongOptionIds: number[] }[];
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
): Promise<SeededCourse[]> {
  const seeded: SeededCourse[] = [];

  for (const courseSpec of SEED_COURSES) {
    const course = await Course.create({
      name: courseSpec.name,
      subject: courseSpec.subject,
      description: courseSpec.description,
      coverUrl: null,
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

  const recorded: SeededTest['questions'] = [];

  for (const [index, spec] of questions.entries()) {
    const question = await Question.create({
      testId: test.id,
      orderIndex: index + 1,
      prompt: spec.prompt,
      points: 1,
    } as Partial<Question> as Question);

    /* The correct answer must not always be option A. */
    const shuffled = rng.shuffle(spec.options);
    const options = await QuestionOption.bulkCreate(
      shuffled.map((option, optionIndex) => ({
        questionId: question.id,
        orderIndex: optionIndex + 1,
        text: option.text,
        isCorrect: option.isCorrect,
      })) as unknown as QuestionOption[],
      { returning: true },
    );

    const correct = options.find((option) => option.isCorrect);
    if (!correct) {
      throw new Error(`Question ${question.id} has no correct option`);
    }
    recorded.push({
      id: question.id,
      correctOptionId: correct.id,
      wrongOptionIds: options.filter((o) => !o.isCorrect).map((o) => o.id),
    });
  }

  return { lessonItemId, questions: recorded };
}
