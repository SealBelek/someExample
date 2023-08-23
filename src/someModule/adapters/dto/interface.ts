export const SOURCES = ['moleculer', 'kafka'] as const;
export type SourcesType = (typeof SOURCES)[number];

export const STATUSES = [
  'SUCCESS',
  'FAILED',
  'IN_PROGRESS',
  'ALREADY_EXISTS',
  'INVALID_PARENT',
] as const;
export type Statuses = (typeof STATUSES)[number];

export interface SomeMessage {
  source: SourcesType;
}
