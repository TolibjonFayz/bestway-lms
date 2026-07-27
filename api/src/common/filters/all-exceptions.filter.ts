import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ValidationError as SequelizeValidationError, UniqueConstraintError } from 'sequelize';

/** The one error shape the frontend can rely on. */
interface ErrorBody {
  statusCode: number;
  error: string;
  message: string;
  /** Per-field problems, present only for validation failures. */
  details?: { field: string; message: string }[];
  path: string;
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();

    const { status, error, message, details } = this.describe(exception);

    /* 5xx means we broke something — keep the stack. 4xx is the client's
       problem and would only be noise at error level. */
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} → ${status}: ${message}`);
    }

    const body: ErrorBody = {
      statusCode: status,
      error,
      message,
      ...(details?.length ? { details } : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    };
    response.status(status).json(body);
  }

  private describe(exception: unknown): {
    status: number;
    error: string;
    message: string;
    details?: { field: string; message: string }[];
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        return { status, error: exception.name, message: payload };
      }

      const record = payload as Record<string, unknown>;
      const raw = record.message;

      /* ValidationPipe hands us an array of strings; flatten it into the
         details list and keep `message` a single readable sentence. */
      if (Array.isArray(raw)) {
        return {
          status,
          error: String(record.error ?? exception.name),
          message: 'Yuborilgan maʼlumotlar notoʻgʻri',
          details: raw.map((entry) => this.splitFieldMessage(String(entry))),
        };
      }

      return {
        status,
        error: String(record.error ?? exception.name),
        message: String(raw ?? exception.message),
      };
    }

    if (exception instanceof UniqueConstraintError) {
      return {
        status: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: 'Bu maʼlumot allaqachon mavjud',
        details: exception.errors.map((e) => ({
          field: e.path ?? 'unknown',
          message: e.message,
        })),
      };
    }

    if (exception instanceof SequelizeValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: 'Yuborilgan maʼlumotlar notoʻgʻri',
        details: exception.errors.map((e) => ({
          field: e.path ?? 'unknown',
          message: e.message,
        })),
      };
    }

    /* Anything unrecognised is a bug on our side; never leak its text. */
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Serverda kutilmagan xatolik yuz berdi',
    };
  }

  /* class-validator produces "phone must be …"; recover the field name so the
     frontend can attach the message to the right input. */
  private splitFieldMessage(entry: string): { field: string; message: string } {
    const field = entry.split(' ')[0] ?? 'unknown';
    return { field, message: entry };
  }
}
