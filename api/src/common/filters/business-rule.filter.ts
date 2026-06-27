import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessRuleViolationException } from '../exceptions/business-rule.exception';

@Catch(BusinessRuleViolationException)
export class BusinessRuleFilter implements ExceptionFilter {
  catch(exception: BusinessRuleViolationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = HttpStatus.UNPROCESSABLE_ENTITY; // 422 - Standard pour les erreurs métier

    response.status(status).json({
      statusCode: status,
      error: 'Business Rule Violation',
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
