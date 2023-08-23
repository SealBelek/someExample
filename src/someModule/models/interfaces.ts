export const ENTITY_TYPES = [
  'COMPANY',
  'EMPLOYEE',
  'BUILDING',
  'APARTMENT',
  'RESIDENT',
  'REGISTRATION',
] as const;

export type Source = 'KAFKA' | 'MOLECULER';

interface SomeObject {
  source: Source;
}

export type Payload = SomeObject;
