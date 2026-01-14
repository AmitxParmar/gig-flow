import { type ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { type Request, type Response, type NextFunction } from 'express';
import { HttpBadRequestError } from '@/lib/errors';
import logger from '@/lib/logger';

export default class RequestValidator {
  static validate = <T>(
    classInstance: ClassConstructor<T>,
    source: 'body' | 'query' | 'params' = 'body'
  ) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
      const validationErrorText = 'Request validation failed!';
      try {
        const convertedObject = plainToInstance(classInstance, req[source]);
        const errors = await validate(
          convertedObject as Record<string, unknown>
        );
        if (!errors.length) {
          // Assign converted object back to request to persist type transformations
          if (source === 'body') {
            req.body = convertedObject;
          } else {
            // For query and params, properties might be read-only (getters), so we mutate the object
            const target = req[source];
            if (target && typeof target === 'object') {
              Object.keys(target).forEach((key) => delete target[key]);
              Object.assign(target, convertedObject);
            }
          }
          next();
          return;
        }
        const rawErrors: string[] = [
          ...new Set([
            ...errors.flatMap((error) =>
              Object.values(error.constraints ?? [])
            ),
          ]),
        ];
        logger.error(rawErrors);
        next(new HttpBadRequestError(validationErrorText, rawErrors));
      } catch (e) {
        logger.error(e);
        next(new HttpBadRequestError(validationErrorText, [e.message]));
      }
    };
  };
}
