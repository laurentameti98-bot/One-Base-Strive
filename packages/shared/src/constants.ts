export const UserRole = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const ErrorCode = {
  AUTH_INVALID: 'AUTH_INVALID',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const ActivityType = {
  NOTE: 'note',
  CALL: 'call',
  MEETING: 'meeting',
} as const;

export type ActivityType = (typeof ActivityType)[keyof typeof ActivityType];

export const DEFAULT_CURRENCY = 'EUR';
