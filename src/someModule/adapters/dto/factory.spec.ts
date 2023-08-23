import { describe, expect, it, beforeEach } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { DTOFactory } from './factory';
import { SOURCES } from './interface';
import { ValidationError } from 'class-validator';

describe('DTOFactory', () => {
  let dtoFactory: DTOFactory;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [DTOFactory],
    }).compile();

    dtoFactory = moduleRef.get<DTOFactory>(DTOFactory);
  });

  describe('dto', () => {
    it('should return dto', async () => {
      const test = {
        source: SOURCES[0],
      };
      const dto = await dtoFactory.dto(test);

      expect(dto).toBeDefined();
    });

    it('should thorw error', async () => {
      const dto = dtoFactory.dto({});

      await expect(dto).rejects.toThrow(ValidationError);
    });
  });
});
