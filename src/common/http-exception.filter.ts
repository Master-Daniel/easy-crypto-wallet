/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

interface FormattedError {
  field?: string; // Optional because some errors may not have a field
  message: string;
}

@Catch(BadRequestException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    let formattedErrors: FormattedError[] = [];

    if (Array.isArray(exceptionResponse.message)) {
      formattedErrors = exceptionResponse.message.map(
        (error: any) =>
          typeof error === 'object' && error?.constraints
            ? {
                field: error.property,
                message: Object.values(error.constraints).join(', '),
              }
            : { message: String(error) }, // Fallback for non-object messages
      );
    } else {
      formattedErrors = [{ message: String(exceptionResponse.message) }];
    }

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      errors: formattedErrors,
    });
  }
}
