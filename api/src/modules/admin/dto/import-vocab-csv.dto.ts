import { IsString, MinLength } from 'class-validator';

export class ImportVocabCsvDto {
  /** Raw CSV text: "english,uzbek[,transcription[,example]]" per line. */
  @IsString({ message: 'csv matn boʻlishi kerak' })
  @MinLength(1, { message: 'csv boʻsh boʻlmasligi kerak' })
  csv!: string;
}
